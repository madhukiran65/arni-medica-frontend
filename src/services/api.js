import axios from 'axios';

const API_BASE = 'https://web-production-4b02.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/ai/dashboard/'),
  getKPIs: () => api.get('/ai/kpis/'),
  getEnhancedDashboard: () => api.get('/ai/enhanced-dashboard/'),
  getRecommendations: () => api.get('/ai/recommendations/'),
  getTrends: () => api.get('/ai/trends/quality/'),
};

export const documentsAPI = {
  getAll: (params) => api.get('/documents/documents/', { params }),
  get: (id) => api.get(`/documents/documents/${id}/`),
  create: (data) => api.post('/documents/documents/', data),
  update: (id, data) => api.patch(`/documents/documents/${id}/`, data),
  getInfocards: (params) => api.get('/documents/infocards/', { params }),
  checkout: (id, data) => api.post(`/documents/documents/${id}/checkout/`, data),
  checkin: (id, data) => api.post(`/documents/documents/${id}/checkin/`, data),
  approve: (id, data) => api.post(`/documents/documents/${id}/approve/`, data),
  lock: (id, data) => api.post(`/documents/documents/${id}/lock/`, data),
  unlock: (id) => api.post(`/documents/documents/${id}/unlock/`),
  lifecycleTransition: (id, data) => api.post(`/documents/documents/${id}/lifecycle_transition/`, data),
  uploadFile: (id, formData) => api.post(`/documents/documents/${id}/upload_file/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getVersions: (id) => api.get(`/documents/documents/${id}/versions/`),
  getSnapshots: (id) => api.get(`/documents/documents/${id}/snapshots/`),
  getApprovers: (id) => api.get(`/documents/documents/${id}/approvers/`),
  getAuditTrail: (id) => api.get(`/documents/documents/${id}/audit_trail/`),
  getStats: () => api.get('/documents/documents/document_stats/'),
  pendingReview: () => api.get('/documents/documents/pending_review/'),
  myCheckouts: () => api.get('/documents/documents/my_checkouts/'),
  bulkRelease: (data) => api.post('/documents/documents/bulk_release/', data),
  // Content editing (TipTap rich text editor)
  getContent: (id) => api.get(`/documents/documents/${id}/content/`),
  saveContent: (id, data) => api.put(`/documents/documents/${id}/content/`, data),
  // Comments (inline review)
  getComments: (id, params) => api.get(`/documents/documents/${id}/comments/`, { params }),
  createComment: (id, data) => api.post(`/documents/documents/${id}/comments/`, data),
  resolveComment: (id, commentId, data) => api.patch(`/documents/documents/${id}/comments/${commentId}/resolve/`, data),
  // Suggestions / Track Changes
  getSuggestions: (id, params) => api.get(`/documents/documents/${id}/suggestions/`, { params }),
  createSuggestion: (id, data) => api.post(`/documents/documents/${id}/suggestions/`, data),
  acceptSuggestion: (id, suggestionId) => api.post(`/documents/documents/${id}/suggestions/${suggestionId}/accept/`),
  rejectSuggestion: (id, suggestionId) => api.post(`/documents/documents/${id}/suggestions/${suggestionId}/reject/`),
  bulkAcceptSuggestions: (id) => api.post(`/documents/documents/${id}/suggestions/bulk-accept/`),
  // Export
  exportDocument: (id, format) => api.get(`/documents/documents/${id}/export/${format}/`, { responseType: 'blob' }),
  // Related Documents (cross-links between documents)
  getRelatedDocs: (id) => api.get(`/documents/documents/${id}/related_documents/`),
  addRelatedDoc: (id, data) => api.post(`/documents/documents/${id}/add_related_document/`, data),
  removeRelatedDoc: (id, relatedId) => api.delete(`/documents/documents/${id}/remove_related_document/${relatedId}/`),
  reject: (id, data) => api.post(`/documents/documents/${id}/reject/`, data),
  // Change Orders
  getChangeOrders: (params) => api.get('/documents/change-orders/', { params }),
  getChangeOrder: (id) => api.get(`/documents/change-orders/${id}/`),
  createChangeOrder: (data) => api.post('/documents/change-orders/', data),
  approveChangeOrder: (id, data) => api.post(`/documents/change-orders/${id}/approve/`, data),
  rejectChangeOrder: (id, data) => api.post(`/documents/change-orders/${id}/reject/`, data),

  // === Enhanced Lifecycle Endpoints ===
  submitForReview: (id) => api.post(`/documents/documents/${id}/submit_for_review/`),
  finalApprove: (id, data) => api.post(`/documents/documents/${id}/final_approve/`, data),
  makeEffective: (id) => api.post(`/documents/documents/${id}/make_effective/`),
  cancelDocument: (id, data) => api.post(`/documents/documents/${id}/cancel_document/`, data),
  supersede: (id, data) => api.post(`/documents/documents/${id}/supersede/`, data),
  makeObsolete: (id) => api.post(`/documents/documents/${id}/make_obsolete/`),
  archiveDocument: (id) => api.post(`/documents/documents/${id}/archive_document/`),
  initiateRevision: (id) => api.post(`/documents/documents/${id}/initiate_revision/`),
  getAvailableTransitions: (id) => api.get(`/documents/documents/${id}/available_transitions/`),
  getTrainingStatus: (id) => api.get(`/documents/documents/${id}/training_status/`),
  acknowledgeDocument: (id, data) => api.post(`/documents/documents/${id}/acknowledge/`, data),
  // Collaborators
  getCollaborators: (id) => api.get(`/documents/documents/${id}/collaborators_list/`),
  addCollaborator: (id, data) => api.post(`/documents/documents/${id}/collaborators_list/`, data),
  updateCollaborator: (id, collabId, data) => api.patch(`/documents/documents/${id}/collaborators_list/${collabId}/`, data),
  removeCollaborator: (id, collabId) => api.delete(`/documents/documents/${id}/remove_collaborator/${collabId}/`),
};

// === New Document Sub-Module APIs (Perplexity Improvements) ===

export const documentRelationshipsAPI = {
  getAll: (params) => api.get('/documents/relationships/', { params }),
  get: (id) => api.get(`/documents/relationships/${id}/`),
  create: (data) => api.post('/documents/relationships/', data),
  update: (id, data) => api.patch(`/documents/relationships/${id}/`, data),
  delete: (id) => api.delete(`/documents/relationships/${id}/`),
  byDocument: (docId) => api.get(`/documents/relationships/by-document/${docId}/`),
};

export const controlledCopiesAPI = {
  getAll: (params) => api.get('/documents/controlled-copies/', { params }),
  get: (id) => api.get(`/documents/controlled-copies/${id}/`),
  create: (data) => api.post('/documents/controlled-copies/', data),
  update: (id, data) => api.patch(`/documents/controlled-copies/${id}/`, data),
  delete: (id) => api.delete(`/documents/controlled-copies/${id}/`),
  recallAll: (docId) => api.post(`/documents/controlled-copies/${docId}/recall_all/`),
};

export const workflowStepsAPI = {
  getAll: (params) => api.get('/documents/workflow-steps/', { params }),
  get: (id) => api.get(`/documents/workflow-steps/${id}/`),
  create: (data) => api.post('/documents/workflow-steps/', data),
  update: (id, data) => api.patch(`/documents/workflow-steps/${id}/`, data),
  delete: (id) => api.delete(`/documents/workflow-steps/${id}/`),
  byDocument: (docId) => api.get(`/documents/workflow-steps/by-document/${docId}/`),
};

export const periodicReviewsAPI = {
  getAll: (params) => api.get('/documents/periodic-reviews/', { params }),
  get: (id) => api.get(`/documents/periodic-reviews/${id}/`),
  create: (data) => api.post('/documents/periodic-reviews/', data),
  update: (id, data) => api.patch(`/documents/periodic-reviews/${id}/`, data),
  delete: (id) => api.delete(`/documents/periodic-reviews/${id}/`),
  overdue: () => api.get('/documents/periodic-reviews/overdue/'),
  triggerReviews: () => api.post('/documents/periodic-reviews/trigger_reviews/'),
};

export const documentAccessLogsAPI = {
  getAll: (params) => api.get('/documents/access-logs/', { params }),
  get: (id) => api.get(`/documents/access-logs/${id}/`),
  byDocument: (docId) => api.get(`/documents/access-logs/by-document/${docId}/`),
  myAccess: () => api.get('/documents/access-logs/my_access/'),
};

export const capaAPI = {
  getAll: (params) => api.get('/capa/capas/', { params }),
  get: (id) => api.get(`/capa/capas/${id}/`),
  create: (data) => api.post('/capa/capas/', data),
  update: (id, data) => api.patch(`/capa/capas/${id}/`, data),
  phaseTransition: (id, data) => api.post(`/capa/capas/${id}/phase_transition/`, data),
  updateRiskMatrix: (id, data) => api.post(`/capa/capas/${id}/update_risk_matrix/`, data),
  updateFiveW: (id, data) => api.post(`/capa/capas/${id}/update_five_w/`, data),
  requestExtension: (id, data) => api.post(`/capa/capas/${id}/request_extension/`, data),
  verifyEffectiveness: (id, data) => api.post(`/capa/capas/${id}/verify_effectiveness/`, data),
  getApprovals: (id) => api.get(`/capa/capas/${id}/approvals/`),
  respondApproval: (id, data) => api.post(`/capa/capas/${id}/respond_approval/`, data),
  getDocuments: (id) => api.get(`/capa/capas/${id}/documents/`),
  addDocument: (id, formData) => api.post(`/capa/capas/${id}/add_document/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getComments: (id) => api.get(`/capa/capas/${id}/comments/`),
  addComment: (id, data) => api.post(`/capa/capas/${id}/comments/`, data),
  capaStats: () => api.get('/capa/capas/capa_stats/'),
  overdue: () => api.get('/capa/capas/overdue/'),
  timeline: (id) => api.get(`/capa/capas/${id}/timeline/`),
  getDashboardTrends: () => api.get('/capa/capas/dashboard_trends/'),
};

export const complaintsAPI = {
  getAll: (params) => api.get('/complaints/complaints/', { params }),
  get: (id) => api.get(`/complaints/complaints/${id}/`),
  create: (data) => api.post('/complaints/complaints/', data),
  update: (id, data) => api.patch(`/complaints/complaints/${id}/`, data),
  determineReportability: (id, data) => api.post(`/complaints/complaints/${id}/determine_reportability/`, data),
  submitMDR: (id, data) => api.post(`/complaints/complaints/${id}/submit_mdr/`, data),
  complaintStats: () => api.get('/complaints/complaints/complaint_stats/'),
  reportable: () => api.get('/complaints/complaints/reportable/'),
  mdrDashboard: () => api.get('/complaints/complaints/mdr_dashboard/'),
  createLinkedCapa: (id) => api.post(`/complaints/complaints/${id}/create_linked_capa/`),
  timeline: (id) => api.get(`/complaints/complaints/${id}/timeline/`),
  close: (id, data) => api.post(`/complaints/complaints/${id}/close/`, data),
  // PMS Endpoints
  pmsPlans: {
    getAll: (params) => api.get('/complaints/pms-plans/', { params }),
    get: (id) => api.get(`/complaints/pms-plans/${id}/`),
    create: (data) => api.post('/complaints/pms-plans/', data),
    update: (id, data) => api.patch(`/complaints/pms-plans/${id}/`, data),
    delete: (id) => api.delete(`/complaints/pms-plans/${id}/`),
  },
  trendAnalyses: {
    getAll: (params) => api.get('/complaints/trend-analyses/', { params }),
    get: (id) => api.get(`/complaints/trend-analyses/${id}/`),
    create: (data) => api.post('/complaints/trend-analyses/', data),
    update: (id, data) => api.patch(`/complaints/trend-analyses/${id}/`, data),
    delete: (id) => api.delete(`/complaints/trend-analyses/${id}/`),
  },
  vigilanceReports: {
    getAll: (params) => api.get('/complaints/vigilance-reports/', { params }),
    get: (id) => api.get(`/complaints/vigilance-reports/${id}/`),
    create: (data) => api.post('/complaints/vigilance-reports/', data),
    update: (id, data) => api.patch(`/complaints/vigilance-reports/${id}/`, data),
    delete: (id) => api.delete(`/complaints/vigilance-reports/${id}/`),
  },
  literatureReviews: {
    getAll: (params) => api.get('/complaints/literature-reviews/', { params }),
    get: (id) => api.get(`/complaints/literature-reviews/${id}/`),
    create: (data) => api.post('/complaints/literature-reviews/', data),
    update: (id, data) => api.patch(`/complaints/literature-reviews/${id}/`, data),
    delete: (id) => api.delete(`/complaints/literature-reviews/${id}/`),
  },
  safetySignals: {
    getAll: (params) => api.get('/complaints/safety-signals/', { params }),
    get: (id) => api.get(`/complaints/safety-signals/${id}/`),
    create: (data) => api.post('/complaints/safety-signals/', data),
    update: (id, data) => api.patch(`/complaints/safety-signals/${id}/`, data),
    delete: (id) => api.delete(`/complaints/safety-signals/${id}/`),
  },
};

export const deviationsAPI = {
  getAll: (params) => api.get('/deviations/deviations/', { params }),
  get: (id) => api.get(`/deviations/deviations/${id}/`),
  create: (data) => api.post('/deviations/deviations/', data),
  update: (id, data) => api.patch(`/deviations/deviations/${id}/`, data),
  stageTransition: (id, data) => api.post(`/deviations/deviations/${id}/stage_transition/`, data),
  deviationStats: () => api.get('/deviations/deviations/deviation_stats/'),
  overdue: () => api.get('/deviations/deviations/overdue/'),
  autoCreateCapa: (id) => api.post(`/deviations/deviations/${id}/auto_create_capa/`),
  timeline: (id) => api.get(`/deviations/deviations/${id}/timeline/`),
};

export const trainingAPI = {
  // Courses
  getCourses: (params) => api.get('/training/courses/', { params }),
  getCourse: (id) => api.get(`/training/courses/${id}/`),
  createCourse: (data) => api.post('/training/courses/', data),
  updateCourse: (id, data) => api.patch(`/training/courses/${id}/`, data),
  publishCourse: (id) => api.post(`/training/courses/${id}/publish/`),
  archiveCourse: (id) => api.post(`/training/courses/${id}/archive/`),
  assignUsers: (id, data) => api.post(`/training/courses/${id}/assign_users/`, data),
  autoAssign: (id, data) => api.post(`/training/courses/${id}/auto_assign/`, data),
  courseStats: (id) => api.get(`/training/courses/${id}/course_stats/`),
  courseAssessment: (id) => api.get(`/training/courses/${id}/assessment/`),

  // Assignments
  getAssignments: (params) => api.get('/training/assignments/', { params }),
  getAssignment: (id) => api.get(`/training/assignments/${id}/`),
  createAssignment: (data) => api.post('/training/assignments/', data),
  updateAssignment: (id, data) => api.patch(`/training/assignments/${id}/`, data),
  completeAssignment: (id, data) => api.post(`/training/assignments/${id}/complete/`, data),
  submitAssessment: (id, data) => api.post(`/training/assignments/${id}/submit_assessment/`, data),
  myTraining: () => api.get('/training/assignments/my_training/'),
  overdueTraining: () => api.get('/training/assignments/overdue/'),
  bulkAssign: (data) => api.post('/training/assignments/bulk_assign/', data),

  // Plans
  getPlans: (params) => api.get('/training/plans/', { params }),
  getPlan: (id) => api.get(`/training/plans/${id}/`),

  // Job Functions
  getJobFunctions: (params) => api.get('/training/job-functions/', { params }),
  getJobFunction: (id) => api.get(`/training/job-functions/${id}/`),
  jobFunctionUsers: (id) => api.get(`/training/job-functions/${id}/users/`),
  jobFunctionRequiredCourses: (id) => api.get(`/training/job-functions/${id}/required_courses/`),

  // Competencies
  getCompetencies: (params) => api.get('/training/competencies/', { params }),
  getCompetency: (id) => api.get(`/training/competencies/${id}/`),

  // Dashboard & Compliance
  getDashboard: () => api.get('/training/dashboard/'),
  getCompliance: () => api.get('/training/compliance/'),
  getComplianceByDepartment: () => api.get('/training/compliance/by_department/'),
};

export const workflowsAPI = {
  getDefinitions: (params) => api.get('/workflows/definitions/', { params }),
  getDefinition: (id) => api.get(`/workflows/definitions/${id}/`),
  getRecords: (params) => api.get('/workflows/records/', { params }),
  getRecord: (id) => api.get(`/workflows/records/${id}/`),
  // Key endpoint: get workflow state for any record by model_type + object_id
  getByRecord: (modelType, objectId) => api.get('/workflows/records/by-record/', {
    params: { model_type: modelType, object_id: objectId }
  }),
  transition: (recordId, data) => api.post(`/workflows/records/${recordId}/transition/`, data),
  getValidTransitions: (recordId) => api.get(`/workflows/records/${recordId}/valid-next-states/`),
  getApprovalStatus: (recordId) => api.get(`/workflows/records/${recordId}/approval-status/`),
  getHistory: (recordId) => api.get(`/workflows/records/${recordId}/history/`),
  addApprover: (recordId, data) => api.post(`/workflows/records/${recordId}/add-approver/`, data),
  extendDeadline: (recordId, data) => api.post(`/workflows/records/${recordId}/extend-deadline/`, data),
  // Approvals
  getPendingActions: () => api.get('/workflows/pending-actions/'),
  getApprovals: (params) => api.get('/workflows/approvals/', { params }),
  respondApproval: (id, data) => api.post(`/workflows/approvals/${id}/respond/`, data),
  // Delegations
  getDelegations: () => api.get('/workflows/delegations/'),
  createDelegation: (data) => api.post('/workflows/delegations/', data),
};

export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers/suppliers/', { params }),
  get: (id) => api.get(`/suppliers/suppliers/${id}/`),
  create: (data) => api.post('/suppliers/suppliers/', data),
  update: (id, data) => api.patch(`/suppliers/suppliers/${id}/`, data),
  stats: () => api.get('/suppliers/suppliers/supplier_stats/'),
  pendingQualification: () => api.get('/suppliers/suppliers/pending_qualification/'),
  dueForRequalification: () => api.get('/suppliers/suppliers/due_for_requalification/'),
  qualify: (id, data) => api.post(`/suppliers/suppliers/${id}/qualify/`, data),
  suspend: (id, data) => api.post(`/suppliers/suppliers/${id}/suspend/`, data),
  disqualify: (id, data) => api.post(`/suppliers/suppliers/${id}/disqualify/`, data),
  timeline: (id) => api.get(`/suppliers/suppliers/${id}/timeline/`),
  documents: (id) => api.get(`/suppliers/suppliers/${id}/documents/`),
  getEvaluations: (params) => api.get('/suppliers/evaluations/', { params }),
  createEvaluation: (data) => api.post('/suppliers/evaluations/', data),
  completeEvaluation: (id, data) => api.post(`/suppliers/evaluations/${id}/complete/`, data),
};

export const changeControlsAPI = {
  getAll: (params) => api.get('/change-controls/change-controls/', { params }),
  get: (id) => api.get(`/change-controls/change-controls/${id}/`),
  create: (data) => api.post('/change-controls/change-controls/', data),
  update: (id, data) => api.patch(`/change-controls/change-controls/${id}/`, data),
  stageTransition: (id, data) => api.post(`/change-controls/change-controls/${id}/stage_transition/`, data),
  stats: () => api.get('/change-controls/change-controls/change_control_stats/'),
  overdue: () => api.get('/change-controls/change-controls/overdue/'),
  impactSummary: (id) => api.get(`/change-controls/change-controls/${id}/impact_summary/`),
  timeline: (id) => api.get(`/change-controls/change-controls/${id}/timeline/`),
};

export const auditsAPI = {
  getAll: (params) => api.get('/audits/audit-plans/', { params }),
  get: (id) => api.get(`/audits/audit-plans/${id}/`),
  create: (data) => api.post('/audits/audit-plans/', data),
  update: (id, data) => api.patch(`/audits/audit-plans/${id}/`, data),
  stats: () => api.get('/audits/audit-plans/audit_stats/'),
  start: (id) => api.post(`/audits/audit-plans/${id}/start/`),
  complete: (id, data) => api.post(`/audits/audit-plans/${id}/complete/`, data),
  addFinding: (id, data) => api.post(`/audits/audit-plans/${id}/add_finding/`, data),
  timeline: (id) => api.get(`/audits/audit-plans/${id}/timeline/`),
  getFindings: (params) => api.get('/audits/audit-findings/', { params }),
  getFinding: (id) => api.get(`/audits/audit-findings/${id}/`),
  linkCapa: (id, data) => api.post(`/audits/audit-findings/${id}/link_capa/`, data),
  resolveFinding: (id) => api.post(`/audits/audit-findings/${id}/resolve/`),
  closeFinding: (id) => api.post(`/audits/audit-findings/${id}/close/`),
};

export const formsAPI = {
  getTemplates: (params) => api.get('/forms/templates/', { params }),
  getTemplate: (id) => api.get(`/forms/templates/${id}/`),
  createTemplate: (data) => api.post('/forms/templates/', data),
  updateTemplate: (id, data) => api.patch(`/forms/templates/${id}/`, data),
  publishTemplate: (id) => api.post(`/forms/templates/${id}/publish/`),
  duplicateTemplate: (id) => api.post(`/forms/templates/${id}/duplicate/`),
  previewTemplate: (id) => api.get(`/forms/templates/${id}/preview/`),
  formStats: () => api.get('/forms/templates/form_stats/'),
  getSections: (params) => api.get('/forms/sections/', { params }),
  getQuestions: (params) => api.get('/forms/questions/', { params }),
  getInstances: (params) => api.get('/forms/instances/', { params }),
  getInstance: (id) => api.get(`/forms/instances/${id}/`),
  submitResponse: (id, data) => api.post(`/forms/instances/${id}/submit/`, data),
  exportResponse: (id) => api.post(`/forms/instances/${id}/export/`),
  createInstance: (data) => api.post('/forms/instances/', data),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/audit-logs/notifications/', { params }),
  markAsRead: (id) => api.post(`/audit-logs/notifications/${id}/mark_as_read/`),
  markAllAsRead: () => api.post('/audit-logs/notifications/mark_all_as_read/'),
  unreadCount: () => api.get('/audit-logs/notifications/unread_count/'),
  sendTestEmail: (data) => api.post('/audit-logs/test-email/', data),
};

export const auditLogsAPI = {
  get: (entityType, entityId) => api.get('/audit-logs/', {
    params: { entity_type: entityType, entity_id: entityId }
  }),
};

export const usersAPI = {
  getAll: (params) => api.get('/users/profiles/', { params }),
  get: (id) => api.get(`/users/profiles/${id}/`),
  create: (data) => api.post('/users/profiles/register/', data),
  update: (id, data) => api.patch(`/users/profiles/${id}/`, data),
  toggleActive: (id) => api.post(`/users/profiles/${id}/toggle_active/`),
  resetPassword: (id, data) => api.post(`/users/profiles/${id}/reset_password/`, data),
  updateRoles: (id, data) => api.post(`/users/profiles/${id}/update_roles/`, data),
  dashboardStats: () => api.get('/users/profiles/dashboard_stats/'),
};

export const departmentsAPI = {
  getAll: (params) => api.get('/users/departments/', { params }),
  get: (id) => api.get(`/users/departments/${id}/`),
  create: (data) => api.post('/users/departments/', data),
  update: (id, data) => api.patch(`/users/departments/${id}/`, data),
  delete: (id) => api.delete(`/users/departments/${id}/`),
};

export const rolesAPI = {
  getAll: (params) => api.get('/users/roles/', { params }),
  get: (id) => api.get(`/users/roles/${id}/`),
  create: (data) => api.post('/users/roles/', data),
  update: (id, data) => api.patch(`/users/roles/${id}/`, data),
  delete: (id) => api.delete(`/users/roles/${id}/`),
};

export const sitesAPI = {
  getAll: (params) => api.get('/users/sites/', { params }),
  get: (id) => api.get(`/users/sites/${id}/`),
  create: (data) => api.post('/users/sites/', data),
  update: (id, data) => api.patch(`/users/sites/${id}/`, data),
  delete: (id) => api.delete(`/users/sites/${id}/`),
};

export const productLinesAPI = {
  getAll: (params) => api.get('/users/product-lines/', { params }),
  get: (id) => api.get(`/users/product-lines/${id}/`),
  create: (data) => api.post('/users/product-lines/', data),
  update: (id, data) => api.patch(`/users/product-lines/${id}/`, data),
  delete: (id) => api.delete(`/users/product-lines/${id}/`),
};

export const riskManagementAPI = {
  hazards: {
    getAll: (params) => api.get('/risk-management/hazards/', { params }),
    get: (id) => api.get(`/risk-management/hazards/${id}/`),
    create: (data) => api.post('/risk-management/hazards/', data),
    update: (id, data) => api.patch(`/risk-management/hazards/${id}/`, data),
    delete: (id) => api.delete(`/risk-management/hazards/${id}/`),
  },
  riskAssessments: {
    getAll: (params) => api.get('/risk-management/assessments/', { params }),
    get: (id) => api.get(`/risk-management/assessments/${id}/`),
    create: (data) => api.post('/risk-management/assessments/', data),
    update: (id, data) => api.patch(`/risk-management/assessments/${id}/`, data),
    delete: (id) => api.delete(`/risk-management/assessments/${id}/`),
  },
  fmeaWorksheets: {
    getAll: (params) => api.get('/risk-management/fmea-worksheets/', { params }),
    get: (id) => api.get(`/risk-management/fmea-worksheets/${id}/`),
    create: (data) => api.post('/risk-management/fmea-worksheets/', data),
    update: (id, data) => api.patch(`/risk-management/fmea-worksheets/${id}/`, data),
    delete: (id) => api.delete(`/risk-management/fmea-worksheets/${id}/`),
  },
  riskReports: {
    getAll: (params) => api.get('/risk-management/reports/', { params }),
    get: (id) => api.get(`/risk-management/reports/${id}/`),
    create: (data) => api.post('/risk-management/reports/', data),
    update: (id, data) => api.patch(`/risk-management/reports/${id}/`, data),
    delete: (id) => api.delete(`/risk-management/reports/${id}/`),
  },
  dashboard: () => api.get('/risk-management/reports/dashboard_metrics/'),
};

export const designControlsAPI = {
  projects: {
    getAll: (params) => api.get('/design-controls/projects/', { params }),
    get: (id) => api.get(`/design-controls/projects/${id}/`),
    create: (data) => api.post('/design-controls/projects/', data),
    update: (id, data) => api.patch(`/design-controls/projects/${id}/`, data),
    delete: (id) => api.delete(`/design-controls/projects/${id}/`),
  },
  userNeeds: {
    getAll: (params) => api.get('/design-controls/user-needs/', { params }),
    get: (id) => api.get(`/design-controls/user-needs/${id}/`),
    create: (data) => api.post('/design-controls/user-needs/', data),
    update: (id, data) => api.patch(`/design-controls/user-needs/${id}/`, data),
    delete: (id) => api.delete(`/design-controls/user-needs/${id}/`),
  },
  designInputs: {
    getAll: (params) => api.get('/design-controls/design-inputs/', { params }),
    get: (id) => api.get(`/design-controls/design-inputs/${id}/`),
    create: (data) => api.post('/design-controls/design-inputs/', data),
    update: (id, data) => api.patch(`/design-controls/design-inputs/${id}/`, data),
    delete: (id) => api.delete(`/design-controls/design-inputs/${id}/`),
  },
  designOutputs: {
    getAll: (params) => api.get('/design-controls/design-outputs/', { params }),
    get: (id) => api.get(`/design-controls/design-outputs/${id}/`),
    create: (data) => api.post('/design-controls/design-outputs/', data),
    update: (id, data) => api.patch(`/design-controls/design-outputs/${id}/`, data),
    delete: (id) => api.delete(`/design-controls/design-outputs/${id}/`),
  },
  vvProtocols: {
    getAll: (params) => api.get('/design-controls/vv-protocols/', { params }),
    get: (id) => api.get(`/design-controls/vv-protocols/${id}/`),
    create: (data) => api.post('/design-controls/vv-protocols/', data),
    update: (id, data) => api.patch(`/design-controls/vv-protocols/${id}/`, data),
    delete: (id) => api.delete(`/design-controls/vv-protocols/${id}/`),
  },
  designReviews: {
    getAll: (params) => api.get('/design-controls/design-reviews/', { params }),
    get: (id) => api.get(`/design-controls/design-reviews/${id}/`),
    create: (data) => api.post('/design-controls/design-reviews/', data),
    update: (id, data) => api.patch(`/design-controls/design-reviews/${id}/`, data),
    delete: (id) => api.delete(`/design-controls/design-reviews/${id}/`),
  },
  traceability: () => api.get('/design-controls/traceability-links/'),
};

export const equipmentAPI = {
  equipment: {
    getAll: (params) => api.get('/equipment/equipment/', { params }),
    get: (id) => api.get(`/equipment/equipment/${id}/`),
    create: (data) => api.post('/equipment/equipment/', data),
    update: (id, data) => api.patch(`/equipment/equipment/${id}/`, data),
    delete: (id) => api.delete(`/equipment/equipment/${id}/`),
  },
  calibrationRecords: {
    getAll: (params) => api.get('/equipment/calibration-records/', { params }),
    get: (id) => api.get(`/equipment/calibration-records/${id}/`),
    create: (data) => api.post('/equipment/calibration-records/', data),
    update: (id, data) => api.patch(`/equipment/calibration-records/${id}/`, data),
    delete: (id) => api.delete(`/equipment/calibration-records/${id}/`),
  },
  maintenanceRecords: {
    getAll: (params) => api.get('/equipment/maintenance-records/', { params }),
    get: (id) => api.get(`/equipment/maintenance-records/${id}/`),
    create: (data) => api.post('/equipment/maintenance-records/', data),
    update: (id, data) => api.patch(`/equipment/maintenance-records/${id}/`, data),
    delete: (id) => api.delete(`/equipment/maintenance-records/${id}/`),
  },
  qualifications: {
    getAll: (params) => api.get('/equipment/qualifications/', { params }),
    get: (id) => api.get(`/equipment/qualifications/${id}/`),
    create: (data) => api.post('/equipment/qualifications/', data),
    update: (id, data) => api.patch(`/equipment/qualifications/${id}/`, data),
    delete: (id) => api.delete(`/equipment/qualifications/${id}/`),
  },
};

export const batchRecordsAPI = {
  masterBatchRecords: {
    getAll: (params) => api.get('/batch-records/master-batch-records/', { params }),
    get: (id) => api.get(`/batch-records/master-batch-records/${id}/`),
    create: (data) => api.post('/batch-records/master-batch-records/', data),
    update: (id, data) => api.patch(`/batch-records/master-batch-records/${id}/`, data),
    delete: (id) => api.delete(`/batch-records/master-batch-records/${id}/`),
  },
  batchRecords: {
    getAll: (params) => api.get('/batch-records/batch-records/', { params }),
    get: (id) => api.get(`/batch-records/batch-records/${id}/`),
    create: (data) => api.post('/batch-records/batch-records/', data),
    update: (id, data) => api.patch(`/batch-records/batch-records/${id}/`, data),
    delete: (id) => api.delete(`/batch-records/batch-records/${id}/`),
  },
  batchDeviations: {
    getAll: (params) => api.get('/batch-records/batch-deviations/', { params }),
    get: (id) => api.get(`/batch-records/batch-deviations/${id}/`),
    create: (data) => api.post('/batch-records/batch-deviations/', data),
    update: (id, data) => api.patch(`/batch-records/batch-deviations/${id}/`, data),
    delete: (id) => api.delete(`/batch-records/batch-deviations/${id}/`),
  },
};

export const validationAPI = {
  plans: {
    getAll: (params) => api.get('/validation/plans/', { params }),
    get: (id) => api.get(`/validation/plans/${id}/`),
    create: (data) => api.post('/validation/plans/', data),
    update: (id, data) => api.patch(`/validation/plans/${id}/`, data),
    delete: (id) => api.delete(`/validation/plans/${id}/`),
  },
  protocols: {
    getAll: (params) => api.get('/validation/validation-protocols/', { params }),
    get: (id) => api.get(`/validation/validation-protocols/${id}/`),
    create: (data) => api.post('/validation/validation-protocols/', data),
    update: (id, data) => api.patch(`/validation/validation-protocols/${id}/`, data),
    delete: (id) => api.delete(`/validation/validation-protocols/${id}/`),
  },
  testCases: {
    getAll: (params) => api.get('/validation/test-cases/', { params }),
    get: (id) => api.get(`/validation/test-cases/${id}/`),
    create: (data) => api.post('/validation/test-cases/', data),
    update: (id, data) => api.patch(`/validation/test-cases/${id}/`, data),
    delete: (id) => api.delete(`/validation/test-cases/${id}/`),
  },
  rtmEntries: {
    getAll: (params) => api.get('/validation/rtm-entries/', { params }),
    get: (id) => api.get(`/validation/rtm-entries/${id}/`),
    create: (data) => api.post('/validation/rtm-entries/', data),
    update: (id, data) => api.patch(`/validation/rtm-entries/${id}/`, data),
    delete: (id) => api.delete(`/validation/rtm-entries/${id}/`),
  },
  summaryReports: {
    getAll: (params) => api.get('/validation/summary-reports/', { params }),
    get: (id) => api.get(`/validation/summary-reports/${id}/`),
    create: (data) => api.post('/validation/summary-reports/', data),
    update: (id, data) => api.patch(`/validation/summary-reports/${id}/`, data),
    delete: (id) => api.delete(`/validation/summary-reports/${id}/`),
  },
};

export const feedbackAPI = {
  getAll: (params) => api.get('/feedback/tickets/', { params }),
  get: (id) => api.get(`/feedback/tickets/${id}/`),
  create: (data) => api.post('/feedback/tickets/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyTickets: () => api.get('/feedback/tickets/my_tickets/'),
  assign: (id, data) => api.post(`/feedback/tickets/${id}/assign/`, data),
  resolve: (id, data) => api.post(`/feedback/tickets/${id}/resolve/`, data),
  close: (id, data) => api.post(`/feedback/tickets/${id}/close/`, data),
  getStats: () => api.get('/feedback/tickets/stats/'),
};

export const managementReviewAPI = {
  metrics: {
    getAll: (params) => api.get('/management-review/quality-metrics/', { params }),
    get: (id) => api.get(`/management-review/quality-metrics/${id}/`),
    create: (data) => api.post('/management-review/quality-metrics/', data),
    update: (id, data) => api.patch(`/management-review/quality-metrics/${id}/`, data),
    delete: (id) => api.delete(`/management-review/quality-metrics/${id}/`),
  },
  objectives: {
    getAll: (params) => api.get('/management-review/quality-objectives/', { params }),
    get: (id) => api.get(`/management-review/quality-objectives/${id}/`),
    create: (data) => api.post('/management-review/quality-objectives/', data),
    update: (id, data) => api.patch(`/management-review/quality-objectives/${id}/`, data),
    delete: (id) => api.delete(`/management-review/quality-objectives/${id}/`),
  },
  meetings: {
    getAll: (params) => api.get('/management-review/meetings/', { params }),
    get: (id) => api.get(`/management-review/meetings/${id}/`),
    create: (data) => api.post('/management-review/meetings/', data),
    update: (id, data) => api.patch(`/management-review/meetings/${id}/`, data),
    delete: (id) => api.delete(`/management-review/meetings/${id}/`),
  },
  actions: {
    getAll: (params) => api.get('/management-review/actions/', { params }),
    get: (id) => api.get(`/management-review/actions/${id}/`),
    create: (data) => api.post('/management-review/actions/', data),
    update: (id, data) => api.patch(`/management-review/actions/${id}/`, data),
    delete: (id) => api.delete(`/management-review/actions/${id}/`),
  },
  dashboard: () => api.get('/management-review/dashboard/'),
  reports: {
    getAll: (params) => api.get('/management-review/reports/', { params }),
    get: (id) => api.get(`/management-review/reports/${id}/`),
    create: (data) => api.post('/management-review/reports/', data),
    update: (id, data) => api.patch(`/management-review/reports/${id}/`, data),
    delete: (id) => api.delete(`/management-review/reports/${id}/`),
  },
};

export default api;
