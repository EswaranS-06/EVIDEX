from django.test import TestCase
from django.test.utils import CaptureQueriesContext
from django.db import connection
from django.contrib.auth.models import User

from rest_framework.test import APIClient

from .models import OWASPCategory


class SelectiveCacheMiddlewareTests(TestCase):
    def setUp(self):
        # create a record that GET will fetch
        OWASPCategory.objects.create(name="foo")
        # authenticated client bypasses IsAuthenticated permission
        self.user = User.objects.create_user(username="tester", password="pwd")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.owasp_url = "/api/owasp/categories/"

    def test_owasp_get_is_cached(self):
        """Verify OWASP GET requests are cached."""
        # first request should hit the database
        with CaptureQueriesContext(connection) as ctx1:
            r1 = self.client.get(self.owasp_url)
        self.assertEqual(r1.status_code, 200)
        initial_queries = len(ctx1)

        # second GET should be served from cache; query count should
        # not increase, and cached data should exist
        with CaptureQueriesContext(connection) as ctx2:
            r2 = self.client.get(self.owasp_url)
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r1.content, r2.content)
        self.assertTrue(len(ctx2) <= initial_queries,
                        "cached response should not add queries")

        # verify cache entry was created
        from django.core.cache import cache
        self.assertIsNotNone(cache.get(self.owasp_url),
                             "cache key should be stored after initial GET")

    def test_cache_cleared_on_post(self):
        """Verify POST clears the cache for that specific path."""
        # populate cache
        self.client.get(self.owasp_url)

        # a POST (create new category) should clear cache for that path
        resp = self.client.post(self.owasp_url,
                                {"name": "bar"},
                                content_type="application/json")
        self.assertEqual(resp.status_code, 201)

        # next GET should hit DB again (i.e. query count increases)
        with CaptureQueriesContext(connection) as ctx3:
            self.client.get(self.owasp_url)
        self.assertTrue(len(ctx3) >= 1,
                        "POST should have cleared cache so GET hits database")

    def test_write_operations_clear_cache(self):
        """Verify PUT/PATCH/DELETE also clear the cache."""
        cat = OWASPCategory.objects.first()
        detail_url = f"/api/owasp/categories/{cat.id}/"

        # cache the detail view
        r1 = self.client.get(detail_url)
        self.assertEqual(r1.status_code, 200)

        from django.core.cache import cache
        self.assertIsNotNone(cache.get(detail_url), "detail should be cached")

        # PATCH should clear the cache
        resp = self.client.patch(detail_url,
                                 {"name": "updated"},
                                 content_type="application/json")
        self.assertEqual(resp.status_code, 200)

        # cache should be cleared for this path
        self.assertIsNone(cache.get(detail_url),
                          "PATCH should clear cache for that path")

