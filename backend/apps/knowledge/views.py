from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

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
    permission_classes = [IsAuthenticated]
class OWASPVulnerabilityListCreateView(generics.ListCreateAPIView):
    queryset = OWASPVulnerability.objects.all()
    serializer_class = OWASPVulnerabilitySerializer
    permission_classes = [IsAuthenticated]


class OWASPVulnerabilityDetailView(generics.RetrieveAPIView):
    queryset = OWASPVulnerability.objects.all()
    serializer_class = OWASPVulnerabilitySerializer
    permission_classes = [IsAuthenticated]
class VulnerabilityVariantListCreateView(generics.ListCreateAPIView):
    queryset = VulnerabilityVariant.objects.all()
    serializer_class = VulnerabilityVariantSerializer
    permission_classes = [IsAuthenticated]


class VariantsByVulnerabilityView(generics.ListAPIView):
    serializer_class = VulnerabilityVariantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        vuln_id = self.kwargs["vuln_id"]
        return VulnerabilityVariant.objects.filter(
            owasp_vulnerability_id=vuln_id
        )
class OWASPCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OWASPCategory.objects.all()
    serializer_class = OWASPCategorySerializer
    permission_classes = [IsAuthenticated]


class VulnerabilityVariantDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VulnerabilityVariant.objects.all()
    serializer_class = VulnerabilityVariantSerializer
    permission_classes = [IsAuthenticated]


class VulnerabilityDefinitionListCreateView(generics.ListCreateAPIView):
    queryset = VulnerabilityDefinition.objects.all()
    serializer_class = VulnerabilityDefinitionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class VulnerabilityDefinitionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VulnerabilityDefinition.objects.all()
    serializer_class = VulnerabilityDefinitionSerializer
    permission_classes = [IsAuthenticated]
