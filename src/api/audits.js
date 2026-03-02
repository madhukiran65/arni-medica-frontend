import client from './client'

const auditsAPI = {
  // ── Audits ─────────────────────────────────────────────────────────
  list: (params = {}) => client.get('/audits/', { params }),
  get: (id) => client.get(`/audits/${id}/`),
  create: (data) => client.post('/audits/', data),
  update: (id, data) => client.patch(`/audits/${id}/`, data),
  delete: (id) => client.delete(`/audits/${id}/`),

  // ── Audit Stage Transitions ────────────────────────────────────────
  stageTransition: (id, data) => client.post(`/audits/${id}/stage_transition/`, data),
  allowedTransitions: (id) => client.get(`/audits/${id}/allowed_transitions/`),
  close: (id, data) => client.post(`/audits/${id}/close/`, data),
  cancel: (id, data) => client.post(`/audits/${id}/cancel/`, data),

  // ── Audit Team ─────────────────────────────────────────────────────
  getTeam: (id) => client.get(`/audits/${id}/team/`),
  addTeamMember: (id, userId) => client.post(`/audits/${id}/team/`, { user_id: userId }),

  // ── Checklists ─────────────────────────────────────────────────────
  getChecklists: (id) => client.get(`/audits/${id}/checklists/`),
  createChecklist: (id, data) => client.post(`/audits/${id}/checklists/`, data),
  getChecklistDetail: (checklistId) => client.get(`/audit-checklists/${checklistId}/`),
  updateChecklist: (checklistId, data) => client.patch(`/audit-checklists/${checklistId}/`, data),
  deleteChecklist: (checklistId) => client.delete(`/audit-checklists/${checklistId}/`),

  // ── Checklist Items ────────────────────────────────────────────────
  getChecklistItems: (checklistId) => client.get(`/audit-checklist-items/?checklist=${checklistId}`),
  getChecklistItem: (itemId) => client.get(`/audit-checklist-items/${itemId}/`),
  updateChecklistItem: (itemId, data) => client.patch(`/audit-checklist-items/${itemId}/`, data),
  respondToChecklistItem: (itemId, data) => client.patch(`/audit-checklist-items/${itemId}/`, data),

  // ── Findings ───────────────────────────────────────────────────────
  listFindings: (params = {}) => client.get('/audit-findings/', { params }),
  getFinding: (id) => client.get(`/audit-findings/${id}/`),
  createFinding: (data) => client.post('/audit-findings/', data),
  updateFinding: (id, data) => client.patch(`/audit-findings/${id}/`, data),
  deleteFinding: (id) => client.delete(`/audit-findings/${id}/`),

  // ── Finding Stage Transitions ──────────────────────────────────────
  findingStageTransition: (id, data) => client.post(`/audit-findings/${id}/stage_transition/`, data),
  findingAllowedTransitions: (id) => client.get(`/audit-findings/${id}/allowed_transitions/`),
  initiateCapa: (id, data) => client.post(`/audit-findings/${id}/initiate_capa/`, data),
  closeFinding: (id, data) => client.post(`/audit-findings/${id}/close/`, data),

  // ── Attachments ────────────────────────────────────────────────────
  getAttachments: (id) => client.get(`/audits/${id}/attachments/`),
  uploadAttachment: (id, file, description) => {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    return client.post(`/audits/${id}/attachments/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteAttachment: (attachmentId) => client.delete(`/audit-attachments/${attachmentId}/`),

  // ── Comments ───────────────────────────────────────────────────────
  getComments: (id) => client.get(`/audits/${id}/comments/`),
  addComment: (id, data) => client.post(`/audits/${id}/comments/`, data),

  // ── Audit Trail ────────────────────────────────────────────────────
  getAuditTrail: (id) => client.get(`/audits/${id}/audit_trail/`),

  // ── Dashboard & Stats ──────────────────────────────────────────────
  getDashboard: () => client.get('/audits/dashboard/'),
  stats: () => client.get('/audits/dashboard/'),
}

export default auditsAPI
