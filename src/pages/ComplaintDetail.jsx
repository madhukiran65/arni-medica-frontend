import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, AlertCircle, FileWarning, Shield, Calendar,
  User, Package, ClipboardList, Loader, Plus, MessageSquare,
  CheckCircle, AlertTriangle, Zap, Clock, CheckCircle2
} from 'lucide-react';
import { complaintsAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeline, setTimeline] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        const [complaintRes, timelineRes] = await Promise.all([
          complaintsAPI.get(id),
          complaintsAPI.timeline(id)
        ]);
        setComplaint(complaintRes.data || complaintRes);
        setTimeline(timelineRes.data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load complaint details');
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleCreateCapa = async () => {
    if (!window.confirm('Create a new CAPA for this complaint?')) return;
    try {
      setUpdating(true);
      const res = await complaintsAPI.createLinkedCapa(id);
      alert(`CAPA created: ${res.data.capa_id}`);
      const updatedComplaint = await complaintsAPI.get(id);
      setComplaint(updatedComplaint.data || updatedComplaint);
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to create CAPA');
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = async () => {
    const summary = prompt('Enter resolution summary:');
    if (!summary) return;
    try {
      setUpdating(true);
      const res = await complaintsAPI.close(id, { resolution_summary: summary });
      setComplaint(res.data || res);
      alert('Complaint closed successfully');
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to close complaint');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/complaints" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Complaints
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-semibold text-red-900 mb-1">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'investigation', label: 'Investigation' },
    { id: 'mdr', label: 'FDA MDR' },
    { id: 'mdr_reporting', label: 'MDR Reporting' },
    { id: 'activity', label: 'Activity' },
  ];

  const isReportable = complaint.is_reportable_to_fda;
  const reportabilityColor = isReportable ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  const severityColors = {
    critical: 'bg-red-100 text-red-800',
    major: 'bg-orange-100 text-orange-800',
    minor: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Link to="/complaints" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft size={20} />
                <span className="text-sm">Complaints</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <span className="font-mono text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {complaint.complaint_id}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={complaint.status} />
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[complaint.severity] || 'bg-slate-100'}`}>
                {complaint.severity_display || complaint.severity}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${reportabilityColor}`}>
                {isReportable ? 'FDA Reportable' : 'Not Reportable'}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{complaint.title}</h1>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2">
          {!complaint.capa && (
            <button
              onClick={handleCreateCapa}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> Create CAPA
            </button>
          )}
          {complaint.status !== 'closed' && (
            <button
              onClick={handleClose}
              disabled={updating}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle size={16} /> Close Complaint
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <InfoCard icon={Shield} label="Status" value={complaint.status_display} />
                <InfoCard icon={AlertTriangle} label="Severity" value={complaint.severity_display} />
                <InfoCard icon={Zap} label="Priority" value={complaint.priority_display} />
                <InfoCard icon={FileWarning} label="Category" value={complaint.category_display} />
                <InfoCard icon={User} label="Complainant Type" value={complaint.complainant_type_display} />
                <InfoCard icon={Package} label="Product" value={complaint.product_name} />
                <InfoCard icon={Package} label="Batch/Lot" value={complaint.product_lot_number || '—'} />
                <InfoCard icon={User} label="Department" value={complaint.department_name || '—'} />
              </div>

              {/* Complainant Info */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Complainant Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">Name</p>
                    <p className="font-medium text-slate-800">{complaint.complainant_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Email</p>
                    <p className="font-medium text-slate-800">{complaint.complainant_email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Phone</p>
                    <p className="font-medium text-slate-800">{complaint.complainant_phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Organization</p>
                    <p className="font-medium text-slate-800">{complaint.complainant_organization || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Complaint Description</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{complaint.event_description}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-32">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Timeline</h3>
                <div className="space-y-3 text-sm">
                  <SidebarRow label="Received" value={complaint.received_date ? new Date(complaint.received_date).toLocaleDateString() : '—'} />
                  <SidebarRow label="Days Open" value={Math.floor((new Date() - new Date(complaint.received_date)) / (1000 * 60 * 60 * 24))} />
                  {complaint.target_closure_date && (
                    <SidebarRow label="Target Closure" value={new Date(complaint.target_closure_date).toLocaleDateString()} />
                  )}
                  {complaint.actual_closure_date && (
                    <SidebarRow label="Closed" value={new Date(complaint.actual_closure_date).toLocaleDateString()} />
                  )}
                  {complaint.capa && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Linked CAPA</p>
                      <Link to={`/capa/${complaint.capa}`} className="text-sm text-emerald-600 hover:underline font-medium">
                        View CAPA →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investigation' && (
          <div className="space-y-6">
            {complaint.investigation_summary && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Investigation Summary</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{complaint.investigation_summary}</p>
              </div>
            )}
            {complaint.root_cause && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Root Cause Analysis</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{complaint.root_cause}</p>
              </div>
            )}
            {complaint.corrective_action && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Corrective Actions</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{complaint.corrective_action}</p>
              </div>
            )}
            {complaint.preventive_action && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Preventive Actions</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{complaint.preventive_action}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mdr' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* FDA 3500A Fields */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Patient Information (FDA 3500A)</h3>
                <div className="space-y-3 text-sm">
                  <FieldRow label="Age" value={complaint.patient_age || '—'} />
                  <FieldRow label="Sex" value={complaint.patient_sex_display || '—'} />
                  <FieldRow label="Weight (kg)" value={complaint.patient_weight_kg || '—'} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Device Information</h3>
                <div className="space-y-3 text-sm">
                  <FieldRow label="Usage" value={complaint.device_usage_display || '—'} />
                  <FieldRow label="Availability" value={complaint.device_available_display || '—'} />
                </div>
              </div>
            </div>

            {/* Reportability Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">FDA Reportability</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-2">Determination Status</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${reportabilityColor}`}>
                    {isReportable ? 'Reportable' : 'Not Reportable'}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">MDR Submission Status</p>
                  <p className="text-sm font-medium text-slate-800">{complaint.mdr_submission_status_display || 'Not Required'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">MDR Report Number</p>
                  <p className="text-sm font-medium text-slate-800">{complaint.mdr_report_number || '—'}</p>
                </div>
              </div>
              {complaint.reportability_justification && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Justification</p>
                  <p className="text-sm text-slate-600">{complaint.reportability_justification}</p>
                </div>
              )}
            </div>

            {/* MDR Timeline */}
            {complaint.mdr_submission_date && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">MDR Timeline</h3>
                <div className="space-y-3 text-sm">
                  {complaint.reportability_determination_date && (
                    <TimelineRow label="Reportability Determined" value={new Date(complaint.reportability_determination_date).toLocaleDateString()} />
                  )}
                  <TimelineRow label="MDR Submitted" value={new Date(complaint.mdr_submission_date).toLocaleDateString()} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mdr_reporting' && (
          <MDRReportingSection complaint={complaint} />
        )}

        {activeTab === 'activity' && (
          <ActivityTimeline timeline={timeline} />
        )}
      </div>
    </div>
  );
}

function MDRReportingSection({ complaint }) {
  const [showReportability, setShowReportability] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);

  const isReportable = complaint.is_reportable;
  const mdrSubmitted = complaint.mdr_report_submitted;
  const daysRemaining = complaint.mdr_days_remaining;
  const is5DayDeadline = complaint.mdr_5_day_deadline;
  const is30DayDeadline = complaint.mdr_30_day_deadline;

  const getDaysColor = (days) => {
    if (days === null) return 'text-slate-600';
    if (days < 0) return 'text-red-600 font-bold';
    if (days === 0) return 'text-red-600 font-bold';
    if (days <= 3) return 'text-orange-600 font-semibold';
    if (days <= 7) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Reportability Determination Banner */}
      <div className={`rounded-xl border p-6 ${
        isReportable
          ? 'bg-red-50 border-red-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">MDR Reportability Status</h3>
            <p className={`text-sm ${isReportable ? 'text-red-700' : 'text-green-700'}`}>
              {isReportable ? (
                'This complaint is reportable to FDA and has 5-day and 30-day reporting deadlines.'
              ) : (
                'This complaint is not reportable to FDA.'
              )}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isReportable
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {isReportable ? 'Reportable' : 'Not Reportable'}
          </div>
        </div>

        {isReportable && (
          <button
            onClick={() => setShowReportability(true)}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
          >
            <Shield size={16} className="inline mr-2" />
            Update Reportability (E-Sig)
          </button>
        )}
      </div>

      {/* MDR Deadlines Timeline */}
      {isReportable && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">MDR Reporting Deadlines</h3>

          <div className="space-y-4">
            {/* Timeline visualization */}
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200" />

              {/* Awareness Date */}
              {complaint.awareness_date && (
                <div className="relative ml-6 pb-4">
                  <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Awareness Date</p>
                    <p className="text-sm text-slate-600">
                      {new Date(complaint.awareness_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* 5-Day Deadline */}
              {is5DayDeadline && (
                <div className="relative ml-6 pb-4">
                  <div className={`absolute -left-8 top-1 w-4 h-4 rounded-full ${
                    mdrSubmitted ? 'bg-green-500' : complaint.is_mdr_overdue ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <div className={`p-3 rounded-lg ${
                    mdrSubmitted ? 'bg-green-50' : complaint.is_mdr_overdue ? 'bg-red-50' : 'bg-amber-50'
                  }`}>
                    <p className={`text-sm font-semibold ${
                      mdrSubmitted ? 'text-green-700' : complaint.is_mdr_overdue ? 'text-red-700' : 'text-amber-700'
                    }`}>
                      5 Business Day Deadline
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {new Date(is5DayDeadline).toLocaleDateString()}
                    </p>
                    {!mdrSubmitted && daysRemaining !== null && (
                      <p className={`text-xs mt-2 ${getDaysColor(daysRemaining)}`}>
                        {daysRemaining === 0 ? 'DUE TODAY' : daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 30-Day Deadline */}
              {is30DayDeadline && (
                <div className="relative ml-6">
                  <div className={`absolute -left-8 top-1 w-4 h-4 rounded-full ${
                    mdrSubmitted ? 'bg-green-500' : complaint.is_mdr_overdue ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className={`p-3 rounded-lg ${
                    mdrSubmitted ? 'bg-green-50' : complaint.is_mdr_overdue ? 'bg-red-50' : 'bg-blue-50'
                  }`}>
                    <p className={`text-sm font-semibold ${
                      mdrSubmitted ? 'text-green-700' : complaint.is_mdr_overdue ? 'text-red-700' : 'text-blue-700'
                    }`}>
                      30 Calendar Day Deadline
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {new Date(is30DayDeadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Reporting Requirements */}
      {isReportable && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-xl border p-4 ${
            complaint.vigilance_report_required
              ? 'bg-blue-50 border-blue-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                complaint.vigilance_report_required ? 'bg-blue-500' : 'bg-slate-300'
              }`} />
              <p className="text-sm font-semibold text-slate-700">EU IVDR Vigilance Report</p>
            </div>
            <p className={`text-xs ${
              complaint.vigilance_report_required ? 'text-blue-700 font-medium' : 'text-slate-600'
            }`}>
              {complaint.vigilance_report_required ? 'Required' : 'Not Required'}
            </p>
          </div>

          <div className={`rounded-xl border p-4 ${
            complaint.cdsco_report_required
              ? 'bg-purple-50 border-purple-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                complaint.cdsco_report_required ? 'bg-purple-500' : 'bg-slate-300'
              }`} />
              <p className="text-sm font-semibold text-slate-700">India CDSCO Report</p>
            </div>
            <p className={`text-xs ${
              complaint.cdsco_report_required ? 'text-purple-700 font-medium' : 'text-slate-600'
            }`}>
              {complaint.cdsco_report_required ? 'Required' : 'Not Required'}
            </p>
          </div>
        </div>
      )}

      {/* MDR Submission Tracking */}
      {isReportable && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">MDR Report Submission</h3>

          {mdrSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-green-600" />
                <p className="text-sm font-semibold text-green-700">MDR Report Submitted</p>
              </div>
              <div className="space-y-2 text-sm">
                <FieldRow label="Report Number" value={complaint.mdr_report_number} />
                <FieldRow label="Submitted Date" value={complaint.mdr_submission_date ? new Date(complaint.mdr_submission_date).toLocaleString() : '—'} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {complaint.is_mdr_overdue && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    MDR Report is OVERDUE
                  </p>
                </div>
              )}

              {!complaint.is_mdr_overdue && daysRemaining !== null && daysRemaining <= 5 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-700 font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} />
                    MDR Report Due in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowSubmission(true)}
                className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Submit MDR Report (E-Sig)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showReportability && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Update MDR Reportability</h3>
            <p className="text-sm text-slate-600 mb-6">E-signature required for this action per 21 CFR Part 11.</p>
            <button
              onClick={() => setShowReportability(false)}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Submit MDR Report</h3>
            <p className="text-sm text-slate-600 mb-6">E-signature required for this action per 21 CFR Part 11.</p>
            <button
              onClick={() => setShowSubmission(false)}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityTimeline({ timeline }) {
  if (!timeline.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <MessageSquare size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Activity Timeline</h3>
      <div className="relative ml-4">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200" />
        <div className="space-y-4 ml-6">
          {timeline.map((entry, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-white border-2 border-emerald-400" />
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-sm font-medium text-slate-700">{entry.type.replace(/_/g, ' ').toUpperCase()}</p>
                {entry.content && <p className="text-xs text-slate-600 mt-1">{entry.content}</p>}
                {entry.is_reportable !== undefined && (
                  <p className="text-xs text-slate-600 mt-1">
                    Status: {entry.is_reportable ? 'Reportable' : 'Not Reportable'}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">
                  {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={16} className="text-emerald-600" />
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

function SidebarRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

function TimelineRow({ label, value }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 last:border-0">
      <Clock size={14} className="text-emerald-600 flex-shrink-0" />
      <div className="flex justify-between flex-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800">{value}</span>
      </div>
    </div>
  );
}
