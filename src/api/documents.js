import client from './client'

const documentsAPI = {
  // Basic CRUD operations
  list: (params = {}) => client.get('/documents/', { params }),
  get: (id) => client.get(`/documents/${id}/`),
  create: (data) => client.post('/documents/', data),
  update: (id, data) => client.patch(`/documents/${id}/`, data),
  delete: (id) => client.delete(`/documents/${id}/`),

  // State transitions with e-signature
  checkout: (id, data) => client.post(`/documents/${id}/checkout/`, data),
  checkin: (id, data) => client.post(`/documents/${id}/checkin/`, data),
  submitForReview: (id, data) => client.post(`/documents/${id}/submit_for_review/`, data),
  approve: (id, data) => client.post(`/documents/${id}/approve/`, data),
  reject: (id, data) => client.post(`/documents/${id}/reject/`, data),
  makeEffective: (id, data) => client.post(`/documents/${id}/make_effective/`, data),
  makeObsolete: (id, data) => client.post(`/documents/${id}/obsolete/`, data),
  archive: (id, data) => client.post(`/documents/${id}/archive/`, data),

  // Content management
  updateContent: (id, data) => client.patch(`/documents/${id}/`, data),

  // Metadata
  auditTrail: (id) => client.get(`/documents/${id}/audit_trail/`),
  relatedDocuments: (id) => client.get(`/documents/${id}/related_documents/`),
}

export default documentsAPI
