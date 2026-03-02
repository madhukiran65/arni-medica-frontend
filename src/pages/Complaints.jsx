import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { MessageSquareWarning, AlertCircle, FileWarning, Shield, Clock } from 'lucide-react';

function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}><Icon size={18} className="text-white" /></div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintRes, statsRes] = await Promise.all([
          complaintsAPI.getAll(),
          complaintsAPI.complaintStats()
        ]);
        setComplaints(complaintRes.data?.results || complaintRes.data || []);
        setStats(statsRes.data || {});
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const total = complaints.length;
  const open = complaints.filter(c => !['closed', 'resolved'].includes(c.status)).length;
  const mdrReportable = complaints.filter(c => c.is_reportable_to_fda).length;
  const critical = complaints.filter(c => c.severity === 'critical' || c.event_type === 'death').length;

  const columns = [
    {
      key: 'complaint_id',
      label: 'ID',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-blue-700">{val || '—'}</span>
          {row.is_mdr_overdue && (
            <span className="inline-block w-2 h-2 rounded-full bg-red-600" title="MDR Overdue" />
          )}
        </div>
      )
    },
    { key: 'title', label: 'Title', render: (val) => <span className="font-medium text-slate-800">{val || '—'}</span> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'severity', label: 'Severity', render: (val) => <StatusBadge status={val} /> },
    { key: 'category', label: 'Category', render: (val) => <span className="text-sm">{String(val || '—').replace(/_/g, ' ')}</span> },
    {
      key: 'is_reportable',
      label: 'MDR Reportable',
      render: (val, row) => {
        if (!val && !row.is_reportable_to_fda) {
          return <span className="text-slate-400 text-xs">Not Reportable</span>;
        }
        return (
          <div className="flex items-center gap-1">
            <span className={`font-semibold text-xs px-2 py-1 rounded ${
              val ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'
            }`}>
              {val ? 'MDR' : 'Legacy MDR'}
            </span>
            {row.is_mdr_overdue && (
              <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded">OVERDUE</span>
            )}
          </div>
        );
      }
    },
    { key: 'event_type', label: 'Event Type', render: (val) => <span className="text-sm">{String(val || '—').replace(/_/g, ' ')}</span> },
    { key: 'received_date', label: 'Received', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
  ];

  const filters = [
    {
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'new', label: 'New' },
        { value: 'under_investigation', label: 'Under Investigation' },
        { value: 'capa_initiated', label: 'CAPA Initiated' },
        { value: 'investigation_complete', label: 'Investigation Complete' },
        { value: 'closed', label: 'Closed' },
        { value: 'rejected', label: 'Rejected' },
      ]
    },
    {
      key: 'severity',
      label: 'All Severities',
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'major', label: 'Major' },
        { value: 'minor', label: 'Minor' },
      ]
    },
    {
      key: 'category',
      label: 'All Categories',
      options: [
        { value: 'product_quality', label: 'Product Quality' },
        { value: 'product_performance', label: 'Product Performance' },
        { value: 'labeling', label: 'Labeling' },
        { value: 'packaging', label: 'Packaging' },
        { value: 'documentation', label: 'Documentation' },
        { value: 'service', label: 'Service' },
        { value: 'other', label: 'Other' },
      ]
    },
    {
      key: 'is_reportable',
      label: 'MDR Reportability',
      options: [
        { value: 'true', label: 'MDR Reportable' },
        { value: 'false', label: 'Not MDR Reportable' },
      ]
    },
    {
      key: 'mdr_report_submitted',
      label: 'MDR Submission',
      options: [
        { value: 'true', label: 'Submitted' },
        { value: 'false', label: 'Not Submitted' },
      ]
    },
    {
      key: 'complainant_type',
      label: 'All Complainant Types',
      options: [
        { value: 'customer', label: 'Customer' },
        { value: 'patient', label: 'Patient' },
        { value: 'healthcare_provider', label: 'Healthcare Provider' },
        { value: 'distributor', label: 'Distributor' },
        { value: 'internal', label: 'Internal' },
        { value: 'regulatory_authority', label: 'Regulatory Authority' },
        { value: 'other', label: 'Other' },
      ]
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Complaint Handling</h1>
        <p className="text-sm text-slate-500 mt-1">Customer complaints with FDA MDR reporting and investigation tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <MiniStat icon={MessageSquareWarning} label="Total Complaints" value={total} color="bg-blue-500" />
        <MiniStat icon={AlertCircle} label="Open" value={open} color="bg-amber-500" />
        <MiniStat icon={FileWarning} label="FDA MDR" value={mdrReportable} color="bg-red-500" />
        <MiniStat icon={Shield} label="Critical/Major" value={critical} color="bg-orange-500" />
      </div>

      <DataTable
        columns={columns}
        data={complaints}
        loading={loading}
        searchPlaceholder="Search by complaint ID, title..."
        onAdd={() => navigate('/complaints/new')}
        addLabel="New Complaint"
        onRowClick={(row) => navigate(`/complaints/${row.id}`)}
        filters={filters}
      />
    </div>
  );
}
