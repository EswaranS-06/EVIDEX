from django.core.cache import cache
from django.http import HttpResponse


class SelectiveCacheMiddleware:
    """Middleware that selectively caches GET responses for specific API paths.

    * Caches GET responses for /api/owasp/* and /api/vulnerabilities/* paths only.
    * Reports, Findings, and Evidence APIs bypass the cache entirely.
    * PUT/PATCH/POST/DELETE requests invalidate the cache for that specific path.
    * Subsequent GETs for cached paths return immediate responses from cache.
    """

    # Paths that should be cached
    CACHEABLE_PATHS = [
        '/api/owasp/',
        '/api/vulnerabilities/',
    ]

    # Methods that invalidate cache
    INVALIDATE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

    def __init__(self, get_response):
        self.get_response = get_response

    def _is_cacheable_path(self, path):
        """Check if the request path should be cached."""
        return any(path.startswith(prefix) for prefix in self.CACHEABLE_PATHS)

    def __call__(self, request):
        path = request.get_full_path()
        is_cacheable = self._is_cacheable_path(path)

        # Clear cache for invalidating methods on cacheable paths
        if is_cacheable and request.method in self.INVALIDATE_METHODS:
            cache.delete(path)
            return self.get_response(request)

        # Try to serve from cache for GET requests on cacheable paths
        if is_cacheable and request.method == 'GET':
            cached = cache.get(path)
            if cached is not None:
                # reconstruct HttpResponse from stored data
                headers = cached.get('headers', {}).copy()
                # extract Content-Type since it's passed separately
                content_type = headers.pop('Content-Type', None)
                return HttpResponse(
                    content=cached['content'],
                    status=cached['status'],
                    headers=headers,
                    content_type=content_type,
                )

        # Process the request normally
        response = self.get_response(request)

        # Cache successful GET responses on cacheable paths
        if (is_cacheable and
            request.method == 'GET' and
            response.status_code == 200):
            cache.set(
                path,
                {
                    'content': response.content,
                    'status': response.status_code,
                    'headers': dict(response.items()),
                    'content_type': response.get('Content-Type'),
                },
                timeout=300,  # 5 minutes
            )

        return response
