import client from './client'

const dmrAPI = {
  // Basic CRUD operations
  list: (params = {}) => client.get('/documents/dmrs/', { params }),
  get: (id) => client.get(`/documents/dmrs/${id}/`),
  create: (data) => client.post('/documents/dmrs/', data),
  update: (id, data) => client.patch(`/documents/dmrs/${id}/`, data),
  delete: (id) => client.delete(`/documents/dmrs/${id}/`),

  // DMR-specific actions
  addDocument: (id, data) => client.post(`/documents/dmrs/${id}/add_document/`, data),
  removeDocument: (id, data) => client.post(`/documents/dmrs/${id}/remove_document/`, data),
  activate: (id) => client.post(`/documents/dmrs/${id}/activate/`),
  completenessCheck: (id) => client.get(`/documents/dmrs/${id}/completeness_check/`),
}

export default dmrAPI
