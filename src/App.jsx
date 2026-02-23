import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

// ============ ICONS (inline SVG components) ============
const Icon = ({ path, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);
const Icons = {
  dashboard: <Icon path={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>} />,
  document: <Icon path={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>} />,
  capa: <Icon path={<><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></>} />,
  complaint: <Icon path={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>} />,
  training: <Icon path={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>} />,
  audit: <Icon path={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>} />,
  supplier: <Icon path={<><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>} />,
  risk: <Icon path={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>} />,
  ai: <Icon path={<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>} />,
  search: <Icon path={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} />,
  bell: <Icon path={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} />,
  user: <Icon path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />,
  settings: <Icon path={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />,
  plus: <Icon path={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />,
  chevDown: <Icon path={<polyline points="6 9 12 15 18 9"/>} size={16} />,
  chevRight: <Icon path={<polyline points="9 18 15 12 9 6"/>} size={16} />,
  check: <Icon path={<polyline points="20 6 9 17 4 12"/>} />,
  x: <Icon path={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />,
  filter: <Icon path={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>} />,
  eye: <Icon path={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />,
  clock: <Icon path={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />,
  trending: <Icon path={<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>} />,
  shield: <Icon path={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} />,
  robot: <Icon path={<><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></>} />,
  regulatory: <Icon path={<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>} />,
};

// ============ THEME ============
const theme = {
  navy: "#0B2447", teal: "#19A7CE", gold: "#F4A261", green: "#2D6A4F",
  red: "#E76F51", purple: "#7C3AED", bg: "#F8FAFC", card: "#FFFFFF",
  text: "#1E293B", textLight: "#64748B", border: "#E2E8F0",
};

// ============ SAMPLE DATA ============
const kpiData = [
  { label: "Open CAPAs", value: 14, trend: -2, color: theme.red },
  { label: "Pending DCOs", value: 8, trend: 3, color: theme.gold },
  { label: "Training Compliance", value: "94.2%", trend: 1.5, color: theme.green },
  { label: "Open Complaints", value: 23, trend: -5, color: theme.teal },
  { label: "Overdue Actions", value: 3, trend: -1, color: theme.red },
  { label: "AI Predictions Today", value: 47, trend: 12, color: theme.purple },
];

const monthlyQualityData = [
  { month: "Sep", capas: 8, complaints: 15, ncs: 12, aiPredictions: 32 },
  { month: "Oct", capas: 12, complaints: 18, ncs: 9, aiPredictions: 45 },
  { month: "Nov", capas: 6, complaints: 22, ncs: 14, aiPredictions: 58 },
  { month: "Dec", capas: 10, complaints: 16, ncs: 8, aiPredictions: 67 },
  { month: "Jan", capas: 7, complaints: 20, ncs: 11, aiPredictions: 78 },
  { month: "Feb", capas: 14, complaints: 23, ncs: 10, aiPredictions: 92 },
];

const complaintsByProduct = [
  { name: "FIA Analysers", value: 28, color: theme.teal },
  { name: "CLIA Systems", value: 22, color: theme.navy },
  { name: "Biochemistry", value: 18, color: theme.gold },
  { name: "Rapid Tests", value: 15, color: theme.green },
  { name: "Urine Analysis", value: 10, color: theme.red },
  { name: "POCT Devices", value: 7, color: theme.purple },
];

const documents = [
  { id: "AM-SOP-001", title: "Quality Management System Manual", type: "SOP", status: "Effective", version: "Rev 4", owner: "Dr. Priya Sharma", department: "Quality", lastUpdated: "2026-02-15", aiClass: "Policy Document", aiConf: 96 },
  { id: "AM-SOP-012", title: "FIA Analyser Calibration Procedure", type: "SOP", status: "In Review", version: "Rev 2", owner: "Rajesh Kumar", department: "Production", lastUpdated: "2026-02-18", aiClass: "Calibration SOP", aiConf: 94 },
  { id: "AM-WI-045", title: "CLIA Reagent Incoming Inspection", type: "Work Instruction", status: "Effective", version: "Rev 1", owner: "Anita Desai", department: "QC", lastUpdated: "2026-01-22", aiClass: "Inspection WI", aiConf: 91 },
  { id: "AM-FRM-023", title: "Complaint Investigation Form", type: "Form", status: "Effective", version: "Rev 3", owner: "Vikram Patel", department: "Quality", lastUpdated: "2026-02-01", aiClass: "Quality Form", aiConf: 98 },
  { id: "AM-SOP-034", title: "CAPA Management Procedure", type: "SOP", status: "Draft", version: "Rev 5", owner: "Dr. Priya Sharma", department: "Quality", lastUpdated: "2026-02-19", aiClass: "CAPA SOP", aiConf: 97 },
  { id: "AM-POL-002", title: "Supplier Quality Agreement Template", type: "Policy", status: "Effective", version: "Rev 2", owner: "Suresh Reddy", department: "Supply Chain", lastUpdated: "2026-01-10", aiClass: "Supplier Policy", aiConf: 89 },
  { id: "AM-SOP-056", title: "Rapid Test Kit Stability Study Protocol", type: "SOP", status: "Pending Approval", version: "Rev 1", owner: "Dr. Meena Iyer", department: "R&D", lastUpdated: "2026-02-12", aiClass: "Stability Protocol", aiConf: 93 },
  { id: "AM-WI-078", title: "Urine Analyser QC Daily Procedure", type: "Work Instruction", status: "Effective", version: "Rev 2", owner: "Karthik Nair", department: "QC", lastUpdated: "2025-12-05", aiClass: "QC Procedure", aiConf: 95 },
];

const capaRecords = [
  { id: "CAPA-2026-014", title: "FIA Analyser Sensitivity Drift in Lot B2026-03", source: "Complaint", status: "Investigation", priority: "High", owner: "Rajesh Kumar", dueDate: "2026-03-15", aiRootCause: "Reagent conjugation variability", aiConf: 82 },
  { id: "CAPA-2026-013", title: "Labeling Error on Rapid Test Kit Packaging", source: "Internal Audit", status: "Action Planning", priority: "Medium", owner: "Anita Desai", dueDate: "2026-03-01", aiRootCause: "Artwork revision control gap", aiConf: 76 },
  { id: "CAPA-2026-012", title: "CLIA Cross-Reactivity Above Specification", source: "Complaint", status: "Root Cause Analysis", priority: "Critical", owner: "Dr. Meena Iyer", dueDate: "2026-02-28", aiRootCause: "Antibody specificity degradation", aiConf: 88 },
  { id: "CAPA-2026-011", title: "Supplier Deviation \u2013 Raw Material CoA Mismatch", source: "Incoming Inspection", status: "Effectiveness Verification", priority: "Medium", owner: "Suresh Reddy", dueDate: "2026-02-20", aiRootCause: "Supplier process change undisclosed", aiConf: 71 },
  { id: "CAPA-2026-010", title: "Training Records Missing for New QC Analysts", source: "Management Review", status: "Closed", priority: "Low", owner: "Vikram Patel", dueDate: "2026-01-30", aiRootCause: "Onboarding checklist incomplete", aiConf: 90 },
];

const complaints = [
  { id: "CMP-2026-089", product: "FIA-500 Analyser", customer: "Apollo Diagnostics, Chennai", description: "Inconsistent TSH results across duplicate samples", severity: "Critical", status: "Under Investigation", reportable: "Yes", aiTriage: "Assay Performance \u2013 Precision", aiConf: 91, date: "2026-02-18" },
  { id: "CMP-2026-088", product: "RapidCheck HIV Kit", customer: "Primary Health Center, Pune", description: "Faint test line on positive control", severity: "Major", status: "New", reportable: "Under Review", aiTriage: "Reagent Stability", aiConf: 85, date: "2026-02-17" },
  { id: "CMP-2026-087", product: "CLIA-3000 System", customer: "Max Healthcare, Delhi", description: "Software error during batch processing \u2013 results not saved", severity: "Critical", status: "CAPA Initiated", reportable: "Yes", aiTriage: "Software Error", aiConf: 94, date: "2026-02-15" },
  { id: "CMP-2026-086", product: "BioLyte Biochemistry Analyser", customer: "SRL Diagnostics, Mumbai", description: "Elevated sample carry-over between high and low concentration samples", severity: "Major", status: "Investigation Complete", reportable: "No", aiTriage: "Instrument Malfunction", aiConf: 78, date: "2026-02-12" },
  { id: "CMP-2026-085", product: "UriScan-10 Analyser", customer: "Thyrocare Labs, Navi Mumbai", description: "Color reader giving inconsistent glucose readings", severity: "Minor", status: "Closed", reportable: "No", aiTriage: "Reader Accuracy", aiConf: 88, date: "2026-02-08" },
];

const trainingRecords = [
  { id: "TRN-001", course: "ISO 13485:2016 Awareness", type: "eLearning", assignedTo: "All QMS Personnel", compliance: 94, due: "2026-03-01", status: "In Progress", aiGap: "3 personnel at risk of missing deadline" },
  { id: "TRN-002", course: "FIA Analyser Operation & Maintenance", type: "On-the-Job", assignedTo: "Production Team A", compliance: 100, due: "2026-02-15", status: "Completed", aiGap: null },
  { id: "TRN-003", course: "CAPA Investigation Techniques", type: "Classroom", assignedTo: "Quality Engineers", compliance: 78, due: "2026-02-28", status: "Overdue", aiGap: "5 engineers need to complete \u2013 CAPA workload impact predicted" },
  { id: "TRN-004", course: "CDSCO MDR 2017 Regulatory Requirements", type: "eLearning", assignedTo: "Regulatory Affairs Team", compliance: 100, due: "2026-01-31", status: "Completed", aiGap: null },
  { id: "TRN-005", course: "Good Documentation Practices", type: "Read & Understand", assignedTo: "New Hires (Q1 2026)", compliance: 67, due: "2026-03-15", status: "In Progress", aiGap: "2 new hires behind schedule \u2013 recommend accelerated path" },
  { id: "TRN-006", course: "Complaint Handling & Vigilance Reporting", type: "Classroom", assignedTo: "Customer Support + QA", compliance: 85, due: "2026-03-10", status: "In Progress", aiGap: "Customer support team lagging \u2013 suggest priority scheduling" },
];

const auditFindings = [
  { id: "AUD-2026-003", type: "Internal", scope: "Document Control", status: "Open", findings: 3, majorNC: 0, minorNC: 2, obs: 1, nextDate: "2026-04-15" },
  { id: "AUD-2026-002", type: "Supplier", scope: "Raw Material Supplier \u2013 BioReagents Ltd", status: "Closed", findings: 5, majorNC: 1, minorNC: 3, obs: 1, nextDate: "2026-06-01" },
  { id: "AUD-2026-001", type: "Internal", scope: "Production & QC", status: "Closed", findings: 4, majorNC: 0, minorNC: 2, obs: 2, nextDate: "2026-05-01" },
];

const aiInsights = [
  { type: "prediction", icon: "trending", title: "Complaint Trend Alert", desc: "FIA Analyser complaints up 40% this quarter. AI predicts reagent lot B2026-03 as primary contributor. Recommend immediate lot investigation.", confidence: 87, severity: "high", time: "2 hours ago" },
  { type: "recommendation", icon: "robot", title: "CAPA Effectiveness Risk", desc: "CAPA-2026-011 effectiveness verification due today. Historical data suggests 68% chance of recurrence based on similar supplier deviations. Recommend extended monitoring.", confidence: 72, severity: "medium", time: "4 hours ago" },
  { type: "classification", icon: "ai", title: "Auto-Classified Document", desc: "New upload 'AM-SOP-057' automatically classified as 'Stability Protocol' for R&D department. Routing to Dr. Meena Iyer for review.", confidence: 93, severity: "low", time: "5 hours ago" },
  { type: "regulatory", icon: "regulatory", title: "Regulatory Intelligence", desc: "CDSCO issued new guidance on IVD software validation (Feb 2026). AI analysis: 3 SOPs require updates. Impact assessment generated.", confidence: 81, severity: "medium", time: "1 day ago" },
  { type: "training", icon: "training", title: "Training Compliance Risk", desc: "5 QC analysts at risk of training lapse by March 1st. AI recommends priority eLearning assignment to maintain 95%+ compliance.", confidence: 91, severity: "medium", time: "1 day ago" },
];

// ============ UTILITY COMPONENTS ============
const Badge = ({ children, color = theme.teal, bg }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: bg || `${color}18`, color }}>{children}</span>
);

const StatusBadge = ({ status }) => {
  const map = {
    "Effective": { color: theme.green, bg: "#2D6A4F18" },
    "Draft": { color: theme.textLight, bg: "#64748B18" },
    "In Review": { color: theme.gold, bg: "#F4A26118" },
    "Pending Approval": { color: theme.purple, bg: "#7C3AED18" },
    "Approved": { color: theme.green, bg: "#2D6A4F18" },
    "Closed": { color: theme.green, bg: "#2D6A4F18" },
    "Investigation": { color: theme.gold, bg: "#F4A26118" },
    "Root Cause Analysis": { color: theme.red, bg: "#E76F5118" },
    "Action Planning": { color: theme.purple, bg: "#7C3AED18" },
    "Effectiveness Verification": { color: theme.teal, bg: "#19A7CE18" },
    "New": { color: theme.teal, bg: "#19A7CE18" },
    "Under Investigation": { color: theme.gold, bg: "#F4A26118" },
    "CAPA Initiated": { color: theme.red, bg: "#E76F5118" },
    "Investigation Complete": { color: theme.green, bg: "#2D6A4F18" },
    "Critical": { color: "#DC2626", bg: "#DC262618" },
    "High": { color: theme.red, bg: "#E76F5118" },
    "Major": { color: theme.gold, bg: "#F4A26118" },
    "Medium": { color: theme.gold, bg: "#F4A26118" },
    "Minor": { color: theme.teal, bg: "#19A7CE18" },
    "Low": { color: theme.textLight, bg: "#64748B18" },
    "Completed": { color: theme.green, bg: "#2D6A4F18" },
    "In Progress": { color: theme.teal, bg: "#19A7CE18" },
    "Overdue": { color: theme.red, bg: "#E76F5118" },
    "Open": { color: theme.gold, bg: "#F4A26118" },
    "Yes": { color: theme.red, bg: "#E76F5118" },
    "No": { color: theme.green, bg: "#2D6A4F18" },
    "Under Review": { color: theme.purple, bg: "#7C3AED18" },
  };
  const s = map[status] || { color: theme.textLight, bg: "#64748B18" };
  return <Badge color={s.color} bg={s.bg}>{status}</Badge>;
};

const AIConfBadge = ({ confidence }) => {
  const color = confidence >= 90 ? theme.green : confidence >= 80 ? theme.teal : confidence >= 70 ? theme.gold : theme.red;
  return (
    <div className="flex items-center gap-1">
      <div className="w-8 h-1.5 rounded-full bg-gray-200 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${confidence}%`, backgroundColor: color }} /></div>
      <span className="text-xs font-medium" style={{ color }}>{confidence}%</span>
    </div>
  );
};

const Card = ({ children, className = "", style = {} }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`} style={style}>{children}</div>
);

const SearchBar = ({ placeholder = "Search...", value, onChange }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{Icons.search}</div>
    <input type="text" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const ProgressBar = ({ value, color = theme.teal }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} /></div>
    <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
  </div>
);

// ============ MODULE COMPONENTS ============

// --- DASHBOARD ---
function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiData.map((kpi, i) => (
          <Card key={i} className="p-4">
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className={`text-xs mt-1 ${kpi.trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {kpi.trend > 0 ? "\u2191" : "\u2193"} {Math.abs(kpi.trend)} from last month
            </p>
          </Card>
        ))}
      </div>

      {/* AI Insights Panel */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${theme.purple}15` }}>
            <Icon path={<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></>} color={theme.purple} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">AI Insights & Predictions</h3>
            <p className="text-xs text-gray-500">Real-time intelligence from your quality data</p>
          </div>
          <Badge color={theme.purple}>{aiInsights.length} Active</Badge>
        </div>
        <div className="space-y-3">
          {aiInsights.slice(0, 3).map((ins, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-cyan-200 transition-colors cursor-pointer" style={{ backgroundColor: ins.severity === "high" ? "#FEF2F2" : ins.severity === "medium" ? "#FFFBEB" : "#F0FDF4" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ins.severity === "high" ? theme.red : ins.severity === "medium" ? theme.gold : theme.green }}>
                <Icon path={<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2"/></>} color="white" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{ins.title}</span>
                  <AIConfBadge confidence={ins.confidence} />
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{ins.desc}</p>
                <p className="text-xs text-gray-400 mt-1">{ins.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Quality Events Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyQualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
              <Area type="monotone" dataKey="complaints" stroke={theme.teal} fill={`${theme.teal}30`} strokeWidth={2} name="Complaints" />
              <Area type="monotone" dataKey="capas" stroke={theme.red} fill={`${theme.red}20`} strokeWidth={2} name="CAPAs" />
              <Area type="monotone" dataKey="ncs" stroke={theme.gold} fill={`${theme.gold}20`} strokeWidth={2} name="Nonconformances" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Complaints by Product Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={complaintsByProduct} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {complaintsByProduct.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Predictions Chart */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">AI Prediction Volume Growth</h3>
        <p className="text-xs text-gray-500 mb-4">Automated classifications, routing decisions, and risk assessments</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyQualityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
            <Bar dataKey="aiPredictions" fill={theme.purple} radius={[4, 4, 0, 0]} name="AI Predictions" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// --- DOCUMENT CONTROL ---
function DocumentControl() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showDCO, setShowDCO] = useState(false);
  const filtered = documents.filter(d =>
    (filter === "All" || d.status === filter) &&
    (d.title.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()))
  );
  const statuses = ["All", "Effective", "Draft", "In Review", "Pending Approval"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Document Control</h2>
          <p className="text-xs text-gray-500">Manage controlled documents, SOPs, and work instructions</p>
        </div>
        <button onClick={() => setShowDCO(!showDCO)} className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-lg transition" style={{ backgroundColor: theme.teal }}>
          {Icons.plus} <span>New DCO</span>
        </button>
      </div>

      {showDCO && <DCOForm onClose={() => setShowDCO(false)} />}

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1"><SearchBar placeholder="Search documents..." value={search} onChange={setSearch} /></div>
          <div className="flex gap-1.5">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${filter === s ? 'text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`} style={filter === s ? { backgroundColor: theme.navy } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Doc ID", "Title", "Type", "Status", "Version", "Owner", "AI Classification", ""].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer">
                  <td className="py-2.5 px-3 font-mono text-xs font-medium" style={{ color: theme.teal }}>{doc.id}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-800 max-w-xs truncate">{doc.title}</td>
                  <td className="py-2.5 px-3"><Badge color={theme.navy}>{doc.type}</Badge></td>
                  <td className="py-2.5 px-3"><StatusBadge status={doc.status} /></td>
                  <td className="py-2.5 px-3 text-gray-600">{doc.version}</td>
                  <td className="py-2.5 px-3 text-gray-600 text-xs">{doc.owner}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{doc.aiClass}</span>
                      <AIConfBadge confidence={doc.aiConf} />
                    </div>
                  </td>
                  <td className="py-2.5 px-3">{Icons.eye}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DCOForm({ onClose }) {
  const [step, setStep] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [formData, setFormData] = useState({ title: "", type: "Administrative", reason: "", documents: "", impact: "" });

  const runAI = useCallback(() => {
    setAiSuggestion({
      classification: formData.reason.toLowerCase().includes("safety") ? "Major" : formData.reason.toLowerCase().includes("error") || formData.reason.toLowerCase().includes("update") ? "Minor" : "Administrative",
      approvers: ["Dr. Priya Sharma (QA Director)", "Rajesh Kumar (Production Head)", "Vikram Patel (Quality Manager)"],
      impact: "Low regulatory impact. No CDSCO notification required. 2 SOPs and 1 Work Instruction may need updates.",
      confidence: 87,
      estimatedDays: 5,
    });
  }, [formData.reason]);

  return (
    <Card className="p-5 border-2" style={{ borderColor: `${theme.teal}40` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Create Document Change Order (DCO)</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">{Icons.x}</button>
      </div>
      <div className="flex gap-4 mb-4">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'text-white' : 'text-gray-400 bg-gray-100'}`} style={step >= s ? { backgroundColor: theme.teal } : {}}>
              {step > s ? "\u2713" : s}
            </div>
            <span className={`text-xs ${step >= s ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
              {s === 1 ? "Details" : s === 2 ? "AI Analysis" : "Review"}
            </span>
            {s < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Change Title</label>
            <input className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Describe the change..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Change Type</label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Administrative</option><option>Minor</option><option>Major</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Affected Documents</label>
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., AM-SOP-001" value={formData.documents} onChange={e => setFormData({...formData, documents: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Reason for Change</label>
            <textarea className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none" placeholder="Describe why this change is needed..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
          </div>
          <button onClick={() => { setStep(2); runAI(); }} className="px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.teal }}>
            Next: AI Analysis \u2192
          </button>
        </div>
      )}

      {step === 2 && aiSuggestion && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                <Icon path={<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2"/></>} color="white" size={12} />
              </div>
              <span className="text-sm font-bold text-purple-800">AI Analysis Complete</span>
              <AIConfBadge confidence={aiSuggestion.confidence} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-purple-600 font-medium">Suggested Classification</span><p className="font-semibold text-gray-800">{aiSuggestion.classification}</p></div>
              <div><span className="text-xs text-purple-600 font-medium">Estimated Review Time</span><p className="font-semibold text-gray-800">{aiSuggestion.estimatedDays} business days</p></div>
            </div>
            <div className="mt-2"><span className="text-xs text-purple-600 font-medium">Recommended Approvers</span>
              <div className="flex flex-wrap gap-1 mt-1">{aiSuggestion.approvers.map((a, i) => <Badge key={i} color={theme.navy}>{a}</Badge>)}</div>
            </div>
            <div className="mt-2"><span className="text-xs text-purple-600 font-medium">Impact Assessment</span><p className="text-xs text-gray-700 mt-0.5">{aiSuggestion.impact}</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600">\u2190 Back</button>
            <button onClick={() => setStep(3)} className="px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.teal }}>Accept & Review \u2192</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              {Icons.check}
              <span className="text-sm font-bold text-green-800">Ready to Submit</span>
            </div>
            <p className="text-xs text-green-700">DCO will be routed to 3 approvers. Estimated completion: 5 business days. Electronic signatures required per 21 CFR Part 11.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600">\u2190 Back</button>
            <button onClick={onClose} className="px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.green }}>Submit DCO</button>
          </div>
        </div>
      )}
    </Card>
  );
}

// --- CAPA MANAGEMENT ---
function CAPAManagement() {
  const [search, setSearch] = useState("");
  const filtered = capaRecords.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-800">CAPA Management</h2><p className="text-xs text-gray-500">Corrective and Preventive Action tracking with AI root cause prediction</p></div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.teal }}>{Icons.plus} <span>New CAPA</span></button>
      </div>

      {/* CAPA Pipeline */}
      <div className="grid grid-cols-5 gap-3">
        {["Investigation", "Root Cause Analysis", "Action Planning", "Effectiveness Verification", "Closed"].map((stage, i) => {
          const count = capaRecords.filter(c => c.status === stage).length;
          const colors = [theme.gold, theme.red, theme.purple, theme.teal, theme.green];
          return (
            <Card key={i} className="p-3 text-center" style={{ borderTop: `3px solid ${colors[i]}` }}>
              <p className="text-2xl font-bold" style={{ color: colors[i] }}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stage}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <div className="mb-4"><SearchBar placeholder="Search CAPA records..." value={search} onChange={setSearch} /></div>
        <div className="space-y-3">
          {filtered.map((capa, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-100 hover:border-cyan-200 transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-medium" style={{ color: theme.teal }}>{capa.id}</span>
                    <StatusBadge status={capa.priority} />
                    <StatusBadge status={capa.status} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{capa.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Source: {capa.source}</span>
                    <span>Owner: {capa.owner}</span>
                    <span>Due: {capa.dueDate}</span>
                  </div>
                </div>
                <div className="ml-4 p-3 rounded-lg bg-purple-50 border border-purple-100 max-w-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <Icon path={<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2"/></>} color={theme.purple} size={12} />
                    <span className="text-xs font-semibold text-purple-700">AI Root Cause Prediction</span>
                  </div>
                  <p className="text-xs text-purple-600">{capa.aiRootCause}</p>
                  <AIConfBadge confidence={capa.aiConf} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// --- COMPLAINT HANDLING ---
function ComplaintHandling() {
  const [search, setSearch] = useState("");
  const filtered = complaints.filter(c => c.description.toLowerCase().includes(search.toLowerCase()) || c.product.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-800">Complaint Handling</h2><p className="text-xs text-gray-500">Customer complaint management with AI auto-triage for IVD products</p></div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.teal }}>{Icons.plus} <span>Log Complaint</span></button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[{ label: "Total Open", value: 4, color: theme.gold }, { label: "Critical", value: 2, color: theme.red }, { label: "Reportable", value: 2, color: theme.red }, { label: "Avg Resolution", value: "12 days", color: theme.teal }].map((s, i) => (
          <Card key={i} className="p-3 text-center"><p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="mb-4"><SearchBar placeholder="Search complaints..." value={search} onChange={setSearch} /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {["ID", "Product", "Description", "Severity", "Status", "Reportable", "AI Triage", ""].map(h => (
                <th key={h} className="text-left py-2.5 px-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer">
                  <td className="py-2.5 px-2 font-mono text-xs" style={{ color: theme.teal }}>{c.id}</td>
                  <td className="py-2.5 px-2 text-xs font-medium">{c.product}</td>
                  <td className="py-2.5 px-2 text-xs max-w-xs truncate text-gray-600">{c.description}</td>
                  <td className="py-2.5 px-2"><StatusBadge status={c.severity} /></td>
                  <td className="py-2.5 px-2"><StatusBadge status={c.status} /></td>
                  <td className="py-2.5 px-2"><StatusBadge status={c.reportable} /></td>
                  <td className="py-2.5 px-2">
                    <div><span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{c.aiTriage}</span>
                    <AIConfBadge confidence={c.aiConf} /></div>
                  </td>
                  <td className="py-2.5 px-2">{Icons.eye}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// --- TRAINING ---
function TrainingManagement() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-800">Training Management</h2><p className="text-xs text-gray-500">Competency tracking with AI gap analysis and compliance prediction</p></div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.teal }}>{Icons.plus} <span>Assign Training</span></button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[{ label: "Overall Compliance", value: "89%", color: theme.green }, { label: "Courses Active", value: 6, color: theme.teal }, { label: "Overdue", value: 1, color: theme.red }, { label: "AI Risk Alerts", value: 3, color: theme.purple }].map((s, i) => (
          <Card key={i} className="p-3 text-center"><p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          {trainingRecords.map((tr, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-100 hover:border-cyan-200 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs" style={{ color: theme.teal }}>{tr.id}</span>
                    <StatusBadge status={tr.status} />
                    <Badge color={theme.navy}>{tr.type}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{tr.course}</p>
                  <p className="text-xs text-gray-500 mt-1">Assigned to: {tr.assignedTo} | Due: {tr.due}</p>
                  <div className="mt-2 max-w-xs"><ProgressBar value={tr.compliance} color={tr.compliance >= 90 ? theme.green : tr.compliance >= 70 ? theme.teal : theme.red} /></div>
                </div>
                {tr.aiGap && (
                  <div className="ml-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 max-w-xs">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Icon path={<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2"/></>} color={theme.gold} size={12} />
                      <span className="text-xs font-semibold text-amber-700">AI Gap Alert</span>
                    </div>
                    <p className="text-xs text-amber-600">{tr.aiGap}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// --- AUDIT MANAGEMENT ---
function AuditManagement() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-800">Audit Management</h2><p className="text-xs text-gray-500">Internal and supplier audit planning, execution, and finding management</p></div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.teal }}>{Icons.plus} <span>Schedule Audit</span></button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[{ label: "Audits This Year", value: 3, color: theme.teal }, { label: "Open Findings", value: 3, color: theme.gold }, { label: "Major NCs", value: 1, color: theme.red }, { label: "Next Audit", value: "Apr 15", color: theme.navy }].map((s, i) => (
          <Card key={i} className="p-3 text-center"><p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          {auditFindings.map((a, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-100 hover:border-cyan-200 transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs" style={{ color: theme.teal }}>{a.id}</span>
                    <Badge color={theme.navy}>{a.type} Audit</Badge>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{a.scope}</p>
                  <p className="text-xs text-gray-500 mt-1">Next scheduled: {a.nextDate}</p>
                </div>
                <div className="flex gap-4 text-center">
                  <div><p className="text-lg font-bold" style={{ color: theme.red }}>{a.majorNC}</p><p className="text-xs text-gray-500">Major NC</p></div>
                  <div><p className="text-lg font-bold" style={{ color: theme.gold }}>{a.minorNC}</p><p className="text-xs text-gray-500">Minor NC</p></div>
                  <div><p className="text-lg font-bold" style={{ color: theme.teal }}>{a.obs}</p><p className="text-xs text-gray-500">Observations</p></div>
                  <div><p className="text-lg font-bold text-gray-800">{a.findings}</p><p className="text-xs text-gray-500">Total</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// --- AI COMMAND CENTER ---
function AICommandCenter() {
  const [query, setQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "system", text: "Welcome to the AI Quality Assistant. I can help you with document classification, complaint analysis, CAPA root cause investigation, regulatory queries, and more. How can I assist you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!query.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", text: query }]);
    setIsTyping(true);
    setQuery("");
    setTimeout(() => {
      const responses = {
        default: "Based on my analysis of your quality data, I can provide insights on this topic. I\u2019ve identified relevant documents, historical CAPAs, and regulatory requirements that may be helpful. Would you like me to generate a detailed report?",
        complaint: "I\u2019ve analyzed your complaint database and found 3 similar historical complaints related to FIA analyser sensitivity issues. The most common root cause was reagent conjugation variability (found in 67% of similar cases). I recommend initiating a lot-level investigation on the current reagent batch.",
        capa: "Looking at your CAPA trends, I see a 40% increase in FIA-related CAPAs this quarter. The primary contributors appear to be Lot B2026-03 (reagent) and a process parameter drift in the conjugation step. I suggest a preventive action targeting the incoming reagent inspection criteria.",
        regulatory: "Based on the latest CDSCO guidance published in February 2026, three of your SOPs require updates: AM-SOP-012 (Calibration), AM-SOP-034 (CAPA), and AM-WI-045 (Incoming Inspection). I\u2019ve drafted an impact assessment. Shall I create the DCOs?",
        training: "Your training compliance is at 89% overall. I\u2019ve identified 5 QC analysts at risk of missing their March 1st deadline for CAPA Investigation Techniques training. Recommend: assign eLearning modules immediately and schedule make-up sessions for next week.",
      };
      const key = query.toLowerCase().includes("complaint") ? "complaint" : query.toLowerCase().includes("capa") ? "capa" : query.toLowerCase().includes("regulatory") || query.toLowerCase().includes("cdsco") ? "regulatory" : query.toLowerCase().includes("training") ? "training" : "default";
      setChatMessages(prev => [...prev, { role: "ai", text: responses[key] }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-gray-800">AI Command Center</h2><p className="text-xs text-gray-500">Natural language interface to your quality intelligence engine</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chat */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col" style={{ height: "480px" }}>
            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.purple }}>
                <Icon path={<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2"/></>} color="white" size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-800">AI Quality Assistant</span>
              <span className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md px-3 py-2 rounded-lg text-sm ${msg.role === "user" ? "text-white" : msg.role === "ai" ? "bg-purple-50 text-gray-800 border border-purple-100" : "bg-gray-100 text-gray-700"}`}
                    style={msg.role === "user" ? { backgroundColor: theme.teal } : {}}>
                    {msg.role === "ai" && <div className="flex items-center gap-1 mb-1"><Icon path={<><circle cx="12" cy="12" r="3"/></>} color={theme.purple} size={10} /><span className="text-xs font-semibold text-purple-600">AI</span></div>}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="flex justify-start"><div className="bg-purple-50 border border-purple-100 px-3 py-2 rounded-lg text-sm text-purple-600">Analyzing your quality data...</div></div>}
            </div>
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder="Ask about complaints, CAPAs, documents, regulations..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} />
              <button onClick={handleSend} className="px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: theme.purple }}>Send</button>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Card className="p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick AI Actions</h4>
            <div className="space-y-2">
              {[
                { label: "Analyze complaint trends", desc: "Review last 90 days" },
                { label: "Check regulatory updates", desc: "CDSCO, FDA, EU IVDR" },
                { label: "Predict training gaps", desc: "Next 30 days forecast" },
                { label: "CAPA root cause analysis", desc: "AI-powered investigation" },
                { label: "Supplier risk assessment", desc: "Performance scoring" },
                { label: "Generate management review", desc: "Q1 2026 summary" },
              ].map((action, i) => (
                <button key={i} onClick={() => { setQuery(action.label); }} className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition">
                  <p className="text-xs font-medium text-gray-800">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">AI Model Status</h4>
            <div className="space-y-2">
              {[
                { name: "Document Classifier", status: "Active", acc: "94%" },
                { name: "Complaint Triage", status: "Active", acc: "91%" },
                { name: "Root Cause Predictor", status: "Active", acc: "82%" },
                { name: "Regulatory NLP", status: "Training", acc: "87%" },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: theme.green }}>{m.acc}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${m.status === "Active" ? "bg-green-400" : "bg-amber-400"}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN APP ============
export default function ArniMedicaEQMS() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications] = useState(5);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.dashboard },
    { id: "documents", label: "Document Control", icon: Icons.document },
    { id: "capa", label: "CAPA Management", icon: Icons.capa },
    { id: "complaints", label: "Complaints", icon: Icons.complaint },
    { id: "training", label: "Training", icon: Icons.training },
    { id: "audit", label: "Audit Management", icon: Icons.audit },
    { id: "ai", label: "AI Command Center", icon: Icons.ai },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard": return <Dashboard />;
      case "documents": return <DocumentControl />;
      case "capa": return <CAPAManagement />;
      case "complaints": return <ComplaintHandling />;
      case "training": return <TrainingManagement />;
      case "audit": return <AuditManagement />;
      case "ai": return <AICommandCenter />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.navy }}>
              <span className="text-white font-bold text-xs">AM</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm font-bold" style={{ color: theme.navy }}>ARNI MEDICA</p>
                <p className="text-xs" style={{ color: theme.teal }}>AI-EQMS</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${activeModule === item.id ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
              style={activeModule === item.id ? { backgroundColor: `${theme.teal}12`, color: theme.teal, borderRight: `3px solid ${theme.teal}` } : {}}
              title={sidebarCollapsed ? item.label : undefined}>
              <span className="flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
              {item.id === "ai" && !sidebarCollapsed && (
                <span className="ml-auto w-2 h-2 rounded-full bg-green-400" />
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: theme.navy }}>MK</div>
              <div><p className="text-xs font-medium text-gray-800">MK Parvathaneni</p><p className="text-xs text-gray-500">Quality Director</p></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-gray-800">
              {navItems.find(n => n.id === activeModule)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64"><SearchBar placeholder="Global search (AI-powered)..." value="" onChange={() => {}} /></div>
            <button className="relative text-gray-500 hover:text-gray-700">
              {Icons.bell}
              {notifications > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: theme.red, fontSize: "9px" }}>{notifications}</span>}
            </button>
            <button className="text-gray-500 hover:text-gray-700">{Icons.settings}</button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderModule()}
        </div>

        {/* Footer */}
        <div className="h-8 border-t border-gray-100 bg-white flex items-center justify-between px-6">
          <p className="text-xs text-gray-400">Arni Medica AI-EQMS v1.0 | ISO 13485 Compliant | 21 CFR Part 11 Ready</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-xs text-gray-400">All AI Models Active | Last sync: 2 min ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
