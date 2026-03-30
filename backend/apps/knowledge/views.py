from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .permissions.knowledge_permissions import KnowledgePermission

from .models import (
    OWASPCategory,
    OWASPVulnerability,
    VulnerabilityVariant,
    VulnerabilityDefinition,
)
from .serializers import (
    OWASPCategorySerializer,
    OWASPVulnerabilitySerializer,
    VulnerabilityVariantSerializer,
    VulnerabilityDefinitionSerializer,
)


class OWASPCategoryListCreateView(generics.ListCreateAPIView):
    queryset = OWASPCategory.objects.all()
    serializer_class = OWASPCategorySerializer
    permission_classes = [IsAuthenticated, KnowledgePermission]
class OWASPVulnerabilityListCreateView(generics.ListCreateAPIView):
    queryset = OWASPVulnerability.objects.all()
    serializer_class = OWASPVulnerabilitySerializer
    permission_classes = [IsAuthenticated, KnowledgePermission]


class OWASPVulnerabilityDetailView(generics.RetrieveAPIView):
    queryset = OWASPVulnerability.objects.all()
    serializer_class = OWASPVulnerabilitySerializer
    permission_classes = [IsAuthenticated, KnowledgePermission]
class VulnerabilityVariantListCreateView(generics.ListCreateAPIView):
    queryset = VulnerabilityVariant.objects.all()
    serializer_class = VulnerabilityVariantSerializer
    permission_classes = [IsAuthenticated, KnowledgePermission]


class VariantsByVulnerabilityView(generics.ListAPIView):
    serializer_class = VulnerabilityVariantSerializer
    permission_classes = [IsAuthenticated, KnowledgePermission]

    def get_queryset(self):
        vuln_id = self.kwargs["vuln_id"]
        return VulnerabilityVariant.objects.filter(
            owasp_vulnerability_id=vuln_id
        )
class OWASPCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OWASPCategory.objects.all()
    serializer_class = OWASPCategorySerializer
    permission_classes = [IsAuthenticated, KnowledgePermission]


class VulnerabilityVariantDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VulnerabilityVariant.objects.all()
    serializer_class = VulnerabilityVariantSerializer
    permission_classes = [IsAuthenticated, KnowledgePermission]


class VulnerabilityDefinitionListCreateView(generics.ListCreateAPIView):
    queryset = VulnerabilityDefinition.objects.all()
    serializer_class = VulnerabilityDefinitionSerializer
    permission_classes = [IsAuthenticated, KnowledgePermission]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class VulnerabilityDefinitionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VulnerabilityDefinition.objects.all()
    serializer_class = VulnerabilityDefinitionSerializer
    permission_classes = [IsAuthenticated, KnowledgePermission]

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)[:50]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"status": "success"})
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class NotificationClearView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        Notification.objects.filter(user=request.user).delete()
        return Response({"status": "success", "message": "All notifications cleared"})
