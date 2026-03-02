import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  User,
  Clock,
  MessageSquare,
  ChevronRight,
  X,
  Send,
  Shield,
  Target,
  MapPin,
  Users,
  HelpCircle,
  FileText,
  CheckCircle2,
  Circle,
  Upload,
  Download,
  Zap,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { capaAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ElectronicSignature from '../components/ElectronicSignature';

const PHASES = [
  { id: 'investigation', label: 'Investigation', order: 1 },
  { id: 'root_cause', label: 'Root Cause', order: 2 },
  { id: 'risk_affirmation', label: 'Risk Assessment', order: 3 },
  { id: 'capa_plan', label: 'CAPA Plan', order: 4 },
  { id: 'implementation', label: 'Implementation', order: 5 },
  { id: 'effectiveness', label: 'Effectiveness', order: 6 },
  { id: 'closure', label: 'Closure', order: 7 },
];

const PRIORITY_CONFIG = {
  critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  low: { color: 'bg-blue-100 text-blue-800', label: 'Low' },
};

const getRiskColor = (rpn) => {
  if (rpn < 50) return 'bg-green-500';
  if (rpn < 100) return 'bg-yellow-500';
  if (rpn < 200) return 'bg-orange-500';
  return 'bg-red-500';
};

export default function CAPADetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [capa, setCapa] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [nextPhase, setNextPhase] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingPhase, setSubmittingPhase] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingW, setEditingW] = useState(null);
  const [extensionReason, setExtensionReason] = useState('');
  const [extensionDate, setExtensionDate] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentPhase, setDocumentPhase] = useState('');
  const [showEffectivenessModal, setShowEffectivenessModal] = useState(false);
  const [effectivenessResult, setEffectivenessResult] = useState('effective');
  const [effectivenessEvidence, setEffectivenessEvidence] = useState('');
  const [submittingEffectiveness, setSubmittingEffectiveness] = useState(false);
  const [showEffectivenessSignature, setShowEffectivenessSignature] = useState(false);

  useEffect(() => {
    fetchCAPA();
  }, [id]);

  const fetchCAPA = async () => {
    try {
      setLoading(true);
      const data = await capaAPI.get(id);
      setCapa(data.data);
      await fetchTimeline();
    } catch (error) {
      console.error('Failed to fetch CAPA:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const timelineData = await capaAPI.timeline(id);
      setTimeline(timelineData.data || []);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    }
  };

  const handlePhaseTransition = async () => {
    if (!nextPhase) return;
    try {
      setSubmittingPhase(true);
      await capaAPI.phaseTransition(id, { new_phase: nextPhase });
      await fetchCAPA();
      setShowPhaseModal(false);
      setNextPhase('');
    } catch (error) {
      alert(error?.response?.data?.error || 'Failed to transition phase');
    } finally {
      setSubmittingPhase(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setSubmittingComment(true);
      await capaAPI.addComment(id, { comment: newComment, phase: capa.current_phase });
      setNewComment('');
      await fetchCAPA();
      await fetchTimeline();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleRequestExtension = async () => {
    if (!extensionReason || !extensionDate) return;
    try {
      await capaAPI.requestExtension(id, {
        extension_reason: extensionReason,
        extension_new_due_date: extensionDate,
      });
      await fetchCAPA();
      setShowExtensionModal(false);
      setExtensionReason('');
      setExtensionDate('');
    } catch (error) {
      alert('Failed to request extension');
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile || !documentTitle) return;
    try {
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('title', documentTitle);
      formData.append('phase', documentPhase || capa.current_phase);
      formData.append('document_type', 'other');

      await capaAPI.addDocument(id, formData);
      await fetchCAPA();
      setShowDocumentModal(false);
      setDocumentFile(null);
      setDocumentTitle('');
      setDocumentPhase('');
    } catch (error) {
      alert('Failed to upload document');
    }
  };

  const handleUpdateW = async (field, value) => {
    try {
      await capaAPI.updateFiveW(id, { [field]: value });
      await fetchCAPA();
      setEditingW(null);
    } catch (error) {
      alert('Failed to update field');
    }
  };

  const handleVerifyEffectiveness = async (sigData) => {
    try {
      setSubmittingEffectiveness(true);
      await capaAPI.verifyEffectiveness(id, {
        effectiveness_result: effectivenessResult,
        effectiveness_evidence: effectivenessEvidence,
        password: sigData.password,
      });
      await fetchCAPA();
      setShowEffectivenessModal(false);
      setShowEffectivenessSignature(false);
      setEffectivenessResult('effective');
      setEffectivenessEvidence('');
    } catch (error) {
      alert(error?.response?.data?.error || 'Failed to verify effectiveness');
    } finally {
      setSubmittingEffectiveness(false);
    }
  };

  const daysOpen = capa ? Math.floor((new Date() - new Date(capa.created_at)) / (1000 * 60 * 60 * 24)) : 0;
  const daysToTarget = capa && capa.target_completion_date
    ? Math.floor((new Date(capa.target_completion_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const isOverdue = daysToTarget !== null && daysToTarget < 0;
  const rpn = capa ? capa.risk_severity * capa.risk_occurrence * capa.risk_detection : 0;
  const completedWs = capa
    ? [capa.what_happened, capa.when_happened, capa.where_happened, capa.who_affected, capa.why_happened].filter(Boolean).length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!capa) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-600">CAPA not found</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/capa" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-mono">
                  {capa.capa_id}
                </span>
                <StatusBadge status={capa.current_phase} label={PHASES.find(p => p.id === capa.current_phase)?.label} />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_CONFIG[capa.priority]?.color}`}>
                  {PRIORITY_CONFIG[capa.priority]?.label}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{capa.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPhaseModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                Advance Phase
              </button>
              <button
                onClick={() => setShowExtensionModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Request Extension
              </button>
              <button
                onClick={() => setShowDocumentModal(true)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Add Document
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition font-medium flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: '5w', label: '5W Analysis' },
              { id: 'risk', label: 'Risk Matrix' },
              { id: 'effectiveness', label: 'Effectiveness' },
              { id: 'documents', label: 'Documents' },
              { id: 'activity', label: 'Activity' },
              { id: 'approvals', label: 'Approvals' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-4 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-4">
                <InfoCard label="Source" value={capa.source?.replace(/_/g, ' ').toUpperCase()} icon={<AlertTriangle />} />
                <InfoCard label="Type" value={capa.capa_type?.replace(/_/g, ' ').toUpperCase()} icon={<FileText />} />
                <InfoCard label="Priority" value={PRIORITY_CONFIG[capa.priority]?.label} icon={<Shield />} />
                <InfoCard label="Category" value={capa.category?.replace(/_/g, ' ').toUpperCase()} icon={<Target />} />
                <InfoCard label="Department" value={capa.department_name || '-'} icon={<Users />} />
                <InfoCard label="Assigned To" value={capa.assigned_to_username || '-'} icon={<User />} />
                <InfoCard label="Coordinator" value={capa.coordinator_username || '-'} icon={<User />} />
                <InfoCard label="Phase" value={PHASES.find(p => p.id === capa.current_phase)?.label} icon={<Zap />} />
                <InfoCard
                  label="Target Date"
                  value={capa.target_completion_date ? new Date(capa.target_completion_date).toLocaleDateString() : '-'}
                  icon={<Calendar />}
                />
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
                <p className="text-slate-700">{capa.description || 'No description provided'}</p>
              </div>

              {/* Root Cause Section */}
              {(capa.root_cause || capa.root_cause_analysis_method) && (
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Root Cause Analysis</h3>
                  <div className="space-y-4">
                    {capa.root_cause_analysis_method && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Method</label>
                        <p className="text-slate-900">{capa.root_cause_analysis_method}</p>
                      </div>
                    )}
                    {capa.root_cause && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Root Cause</label>
                        <p className="text-slate-900">{capa.root_cause}</p>
                      </div>
                    )}
                    {capa.contributing_factors?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Contributing Factors</label>
                        <ul className="list-disc list-inside text-slate-900">
                          {capa.contributing_factors.map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {capa.root_cause_verified && (
                      <div className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified by {capa.root_cause_verified_by_username || 'unknown'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Planned Actions */}
              {capa.planned_actions?.length > 0 && (
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Planned Actions</h3>
                  <div className="space-y-3">
                    {capa.planned_actions.map((action, idx) => (
                      <div key={idx} className="flex gap-3">
                        <input type="checkbox" className="mt-1" defaultChecked={action.completed} />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{action.description || 'Action'}</p>
                          {action.owner && <p className="text-sm text-slate-600">Owner: {action.owner}</p>}
                          {action.due_date && <p className="text-sm text-slate-600">Due: {new Date(action.due_date).toLocaleDateString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Implementation */}
              {capa.implementation_notes && (
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Implementation Notes</h3>
                  <p className="text-slate-700">{capa.implementation_notes}</p>
                </div>
              )}

              {/* Effectiveness */}
              {(capa.effectiveness_result || capa.effectiveness_criteria) && (
                <div className={`rounded-lg p-6 border ${
                  capa.effectiveness_result === 'effective' ? 'bg-emerald-50 border-emerald-200' :
                  capa.effectiveness_result === 'partially_effective' ? 'bg-yellow-50 border-yellow-200' :
                  capa.effectiveness_result === 'not_effective' ? 'bg-red-50 border-red-200' :
                  'bg-white border-slate-200'
                }`}>
                  <h3 className="font-semibold text-slate-900 mb-3">Effectiveness Verification</h3>
                  {capa.effectiveness_criteria && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-slate-600">Criteria</label>
                      <p className="text-slate-900">{capa.effectiveness_criteria}</p>
                    </div>
                  )}
                  {capa.effectiveness_result && (
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white border">
                      {capa.effectiveness_result.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="col-span-1 space-y-4">
              <div className="bg-white rounded-lg p-6 border border-slate-200 sticky top-24">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <StatItem label="Days Open" value={daysOpen} />
                  <StatItem label="Days to Target" value={daysToTarget} highlight={isOverdue} />
                  {capa.has_extension && <StatItem label="Extension Status" value={capa.extension_approval_status} />}
                  {capa.is_recurring && <StatItem label="Recurrence Count" value={capa.recurrence_count} />}
                </div>
              </div>

              {/* Phase Progress */}
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Phase Progress</h3>
                <div className="space-y-3">
                  {PHASES.map((phase, idx) => {
                    const isActive = phase.id === capa.current_phase;
                    const isCompleted = PHASES.findIndex(p => p.id === capa.current_phase) > idx;
                    return (
                      <div key={phase.id} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          isCompleted ? 'bg-emerald-600' : isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : phase.order}
                        </div>
                        <span className={isActive ? 'font-semibold text-emerald-600' : 'text-slate-600'}>
                          {phase.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5W Analysis Tab */}
        {activeTab === '5w' && (
          <div>
            <div className="mb-6 p-4 bg-slate-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">5W Analysis Progress</p>
                  <p className="text-sm text-slate-600">{completedWs} of 5 questions answered</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-emerald-600">
                  {Math.round(completedWs / 5 * 100)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <WCard
                title="What Happened?"
                color="bg-blue-50 border-blue-200"
                value={capa.what_happened}
                field="what_happened"
                editing={editingW === 'what_happened'}
                onEdit={() => setEditingW('what_happened')}
                onSave={(val) => handleUpdateW('what_happened', val)}
              />
              <WCard
                title="When Did It Happen?"
                color="bg-green-50 border-green-200"
                value={capa.when_happened ? new Date(capa.when_happened).toLocaleString() : ''}
                field="when_happened"
                editing={editingW === 'when_happened'}
                onEdit={() => setEditingW('when_happened')}
                onSave={(val) => handleUpdateW('when_happened', val)}
                type="datetime"
              />
              <WCard
                title="Where Did It Happen?"
                color="bg-orange-50 border-orange-200"
                value={capa.where_happened}
                field="where_happened"
                editing={editingW === 'where_happened'}
                onEdit={() => setEditingW('where_happened')}
                onSave={(val) => handleUpdateW('where_happened', val)}
              />
              <WCard
                title="Who Was Affected?"
                color="bg-purple-50 border-purple-200"
                value={capa.who_affected}
                field="who_affected"
                editing={editingW === 'who_affected'}
                onEdit={() => setEditingW('who_affected')}
                onSave={(val) => handleUpdateW('who_affected', val)}
              />
              <WCard
                title="Why Did It Happen?"
                color="bg-red-50 border-red-200"
                value={capa.why_happened}
                field="why_happened"
                editing={editingW === 'why_happened'}
                onEdit={() => setEditingW('why_happened')}
                onSave={(val) => handleUpdateW('why_happened', val)}
              />
              <WCard
                title="How Was It Discovered?"
                color="bg-teal-50 border-teal-200"
                value={capa.how_discovered}
                field="how_discovered"
                editing={editingW === 'how_discovered'}
                onEdit={() => setEditingW('how_discovered')}
                onSave={(val) => handleUpdateW('how_discovered', val)}
              />
            </div>
          </div>
        )}

        {/* Risk Matrix Tab */}
        {activeTab === 'risk' && (
          <div className="bg-white rounded-lg p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-8">Risk Assessment Matrix</h2>

            <div className="grid grid-cols-2 gap-12 mb-8">
              {/* Matrix Grid */}
              <div>
                <div className="mb-4">
                  <div className="text-sm font-semibold text-slate-600 mb-4">Severity vs Occurrence</div>
                  <div className="flex gap-1">
                    <div className="w-12 flex flex-col gap-1">
                      {[5, 4, 3, 2, 1].map(s => (
                        <div key={s} className="w-12 h-12 flex items-center justify-center font-bold text-slate-700">
                          {s}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map(severity => (
                        <div key={severity} className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map(occurrence => {
                            const cellRpn = severity * occurrence * capa.risk_detection;
                            const isCurrent = capa.risk_severity === severity && capa.risk_occurrence === occurrence;
                            return (
                              <div
                                key={`${severity}-${occurrence}`}
                                className={`w-12 h-12 rounded flex items-center justify-center font-bold text-xs text-white cursor-pointer transition ${getRiskColor(cellRpn)} ${
                                  isCurrent ? 'ring-4 ring-slate-900 scale-110' : ''
                                }`}
                                title={`RPN: ${cellRpn}`}
                              >
                                {cellRpn}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      <div className="flex gap-1 mt-4">
                        {[1, 2, 3, 4, 5].map(o => (
                          <div key={o} className="w-12 h-12 flex items-center justify-center font-bold text-slate-700">
                            {o}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Severity: {capa.risk_severity}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={capa.risk_severity}
                    onChange={(e) => capaAPI.updateRiskMatrix(id, { risk_severity: parseInt(e.target.value), risk_occurrence: capa.risk_occurrence, risk_detection: capa.risk_detection }).then(() => fetchCAPA())}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Occurrence: {capa.risk_occurrence}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={capa.risk_occurrence}
                    onChange={(e) => capaAPI.updateRiskMatrix(id, { risk_severity: capa.risk_severity, risk_occurrence: parseInt(e.target.value), risk_detection: capa.risk_detection }).then(() => fetchCAPA())}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Detection: {capa.risk_detection}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={capa.risk_detection}
                    onChange={(e) => capaAPI.updateRiskMatrix(id, { risk_severity: capa.risk_severity, risk_occurrence: capa.risk_occurrence, risk_detection: parseInt(e.target.value) }).then(() => fetchCAPA())}
                    className="w-full"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">RPN (Risk Priority Number)</p>
                  <div className={`text-3xl font-bold ${getRiskColor(rpn)} text-white rounded-lg p-4 text-center`}>
                    {rpn}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 text-center">
                    {rpn < 50 ? 'Acceptable' : rpn < 100 ? 'Tolerable' : 'Unacceptable'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Effectiveness Tab */}
        {activeTab === 'effectiveness' && (
          <div className="space-y-6">
            <div className={`rounded-lg p-6 border ${
              capa.effectiveness_result === 'effective' ? 'bg-emerald-50 border-emerald-200' :
              capa.effectiveness_result === 'partially_effective' ? 'bg-yellow-50 border-yellow-200' :
              capa.effectiveness_result === 'not_effective' ? 'bg-red-50 border-red-200' :
              'bg-white border-slate-200'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Effectiveness Verification</h2>
                  <p className="text-sm text-slate-600">Verify that the corrective action has been effective in resolving the issue.</p>
                </div>
                {capa.current_phase === 'effectiveness' || capa.current_phase === 'closure' ? (
                  <button
                    onClick={() => {
                      setEffectivenessResult(capa.effectiveness_result || 'effective');
                      setEffectivenessEvidence(capa.effectiveness_evidence || '');
                      setShowEffectivenessModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 whitespace-nowrap"
                  >
                    <Lock className="w-4 h-4" />
                    Verify Effectiveness
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-2 block">Effectiveness Check Date</label>
                  <p className="text-slate-900">
                    {capa.effectiveness_check_date
                      ? new Date(capa.effectiveness_check_date).toLocaleString()
                      : 'Not scheduled'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-2 block">Status</label>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      capa.effectiveness_result === 'effective' ? 'bg-emerald-100 text-emerald-800' :
                      capa.effectiveness_result === 'partially_effective' ? 'bg-yellow-100 text-yellow-800' :
                      capa.effectiveness_result === 'not_effective' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {capa.effectiveness_result?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    {capa.is_effectiveness_overdue && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        OVERDUE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {capa.effectiveness_criteria && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-slate-600 mb-2 block">Effectiveness Criteria</label>
                  <p className="text-slate-900 p-4 bg-white bg-opacity-50 rounded border border-slate-200">
                    {capa.effectiveness_criteria}
                  </p>
                </div>
              )}

              {capa.effectiveness_evidence && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-slate-600 mb-2 block">Verification Evidence</label>
                  <p className="text-slate-900 p-4 bg-white bg-opacity-50 rounded border border-slate-200">
                    {capa.effectiveness_evidence}
                  </p>
                </div>
              )}

              {capa.effectiveness_verified_by && (
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Verified By:</span>
                    <span className="text-slate-900 font-medium">{capa.effectiveness_verified_by_name}</span>
                  </div>
                  {capa.effectiveness_verified_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Verified On:</span>
                      <span className="text-slate-900 font-medium">
                        {new Date(capa.effectiveness_verified_date).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {capa.effectiveness_result === 'not_effective' && capa.current_phase !== 'reopened' && (
                <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 mb-3">
                    The effectiveness verification determined that the CAPA action was not effective.
                  </p>
                  <Link
                    to="/capa/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Create New CAPA
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {capa.documents && capa.documents.length > 0 ? (
              <div className="space-y-4">
                {capa.documents.map(doc => (
                  <div key={doc.id} className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{doc.title}</p>
                        <p className="text-xs text-slate-500">
                          {doc.phase} • Uploaded by {doc.uploaded_by_username} • {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a href={doc.file} download className="p-2 hover:bg-slate-100 rounded-lg transition">
                      <Download className="w-5 h-5 text-slate-600" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-500">
                No documents uploaded yet
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((event, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200 flex gap-4">
                    <div className="w-1 bg-emerald-600 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-slate-900">
                          {event.type === 'comment' ? 'Comment' : event.type === 'document' ? 'Document' : event.type === 'approval' ? 'Approval' : 'Update'}
                        </p>
                        <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                      <p className="text-slate-700">{event.description}</p>
                      <p className="text-xs text-slate-600 mt-1">By {event.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-500">
                No activity yet
              </div>
            )}

            {/* Add Comment */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Add Comment</h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts, findings, or next steps..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-4"
                rows={4}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            {capa.approvals && capa.approvals.length > 0 ? (
              capa.approvals.map(approval => (
                <div key={approval.id} className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{approval.approval_tier}</p>
                      <p className="text-sm text-slate-600">Phase: {approval.phase}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      approval.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      approval.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {approval.status.toUpperCase()}
                    </span>
                  </div>
                  {approval.comments && <p className="text-slate-700 mb-2">{approval.comments}</p>}
                  {approval.approver_username && (
                    <p className="text-xs text-slate-600">By {approval.approver_username} • {new Date(approval.responded_at).toLocaleString()}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-500">
                No approvals for this CAPA
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showPhaseModal && (
        <Modal onClose={() => setShowPhaseModal(false)} title="Advance Phase">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Phase</label>
              <p className="px-3 py-2 bg-slate-50 rounded-lg">{PHASES.find(p => p.id === capa.current_phase)?.label}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Next Phase</label>
              <select
                value={nextPhase}
                onChange={(e) => setNextPhase(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select phase</option>
                {PHASES.filter(p => PHASES.findIndex(x => x.id === p.id) > PHASES.findIndex(x => x.id === capa.current_phase)).map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowPhaseModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handlePhaseTransition}
                disabled={!nextPhase || submittingPhase}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {submittingPhase ? 'Processing...' : 'Advance'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showExtensionModal && (
        <Modal onClose={() => setShowExtensionModal(false)} title="Request Extension">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
              <textarea
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">New Due Date</label>
              <input
                type="date"
                value={extensionDate}
                onChange={(e) => setExtensionDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowExtensionModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleRequestExtension}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Request
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showDocumentModal && (
        <Modal onClose={() => setShowDocumentModal(false)} title="Upload Document">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phase</label>
              <select
                value={documentPhase}
                onChange={(e) => setDocumentPhase(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Current Phase</option>
                {PHASES.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">File</label>
              <input
                type="file"
                onChange={(e) => setDocumentFile(e.target.files?.[0])}
                className="w-full"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowDocumentModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Upload
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showEffectivenessModal && (
        <Modal onClose={() => setShowEffectivenessModal(false)} title="Verify Effectiveness">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Effectiveness Result</label>
              <select
                value={effectivenessResult}
                onChange={(e) => setEffectivenessResult(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="effective">Effective</option>
                <option value="partially_effective">Partially Effective</option>
                <option value="not_effective">Not Effective</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Verification Evidence</label>
              <textarea
                value={effectivenessEvidence}
                onChange={(e) => setEffectivenessEvidence(e.target.value)}
                placeholder="Document the evidence supporting this effectiveness result..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowEffectivenessModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => setShowEffectivenessSignature(true)}
                disabled={submittingEffectiveness}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {submittingEffectiveness ? 'Processing...' : 'Verify with Signature'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showEffectivenessSignature && (
        <ElectronicSignature
          action="Verify Effectiveness"
          meaning={`I verify the effectiveness of CAPA ${capa.capa_id}: ${effectivenessResult.replace(/_/g, ' ')}`}
          onSign={handleVerifyEffectiveness}
          onCancel={() => setShowEffectivenessSignature(false)}
          isOpen={showEffectivenessSignature}
        />
      )}
    </div>
  );
}

/* Helper Components */
function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-emerald-600">{icon}</span>
        <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
      </div>
      <p className="text-slate-900 font-medium">{value || '-'}</p>
    </div>
  );
}

function StatItem({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`font-bold ${highlight ? 'text-red-600' : 'text-slate-900'}`}>
        {value === null ? '-' : value}
      </p>
    </div>
  );
}

function WCard({ title, color, value, field, editing, onEdit, onSave, type = 'text' }) {
  const [editValue, setEditValue] = useState(value);

  return (
    <div className={`rounded-lg p-6 border ${color}`}>
      <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>
      {!editing ? (
        <>
          <p className="text-slate-700 mb-3 min-h-12">{value || 'Not filled'}</p>
          <button onClick={onEdit} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            Edit
          </button>
        </>
      ) : (
        <div className="space-y-2">
          {type === 'datetime' ? (
            <input
              type="datetime-local"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          ) : (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
              rows={3}
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onSave(editValue)}
              className="flex-1 px-3 py-1 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditValue(value)}
              className="flex-1 px-3 py-1 bg-slate-300 text-slate-900 rounded text-sm font-medium hover:bg-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
