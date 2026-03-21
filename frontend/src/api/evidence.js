import api from './axios';

export const getEvidence = async (findingId) => {
    const response = await api.get(`/api/findings/${findingId}/evidences/`);
    return response.data;
};

export const uploadEvidence = async (findingId, formData) => {
    const response = await api.post(`/api/findings/${findingId}/evidences/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteEvidence = async (evidenceId) => {
    await api.delete(`/api/evidences/${evidenceId}/`);
};

export const reorderEvidence = async (findingId, orderData) => {
    const response = await api.put(`/api/findings/${findingId}/evidences/reorder/`, { order: orderData });
    return response.data;
};
