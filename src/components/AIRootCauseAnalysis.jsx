import { useState } from 'react';
import { Sparkles, Copy, Check, RotateCw } from 'lucide-react';

// AI suggestion engine - pattern matching based on CAPA attributes
const generateSuggestions = (capa) => {
  const category = capa.category?.toLowerCase() || '';
  const source = capa.source?.toLowerCase() || '';
  const title = capa.title?.toLowerCase() || '';
  const description = capa.description?.toLowerCase() || '';

  // Equipment-related root causes
  const equipmentCauses = [
    { cause: 'Equipment calibration drift beyond acceptable limits', confidence: 'High' },
    { cause: 'Preventive maintenance not performed on schedule', confidence: 'High' },
    { cause: 'Equipment qualification/validation expired or incomplete', confidence: 'Medium' },
    { cause: 'Improper equipment setup or parameter configuration', confidence: 'Medium' },
  ];

  // Process-related root causes
  const processCauses = [
    { cause: 'Standard Operating Procedure (SOP) not followed or outdated', confidence: 'High' },
    { cause: 'Inadequate employee training or competency gap', confidence: 'High' },
    { cause: 'Process validation not performed for changed parameters', confidence: 'Medium' },
    { cause: 'Control limits not established or monitored', confidence: 'Medium' },
  ];

  // Product-related root causes
  const productCauses = [
    { cause: 'Raw material specification not met or supplier change', confidence: 'High' },
    { cause: 'Product testing/inspection criteria not comprehensive', confidence: 'High' },
    { cause: 'Specification limit tightened without production verification', confidence: 'Medium' },
    { cause: 'Design defect or manufacturing tolerance issue', confidence: 'Medium' },
  ];

  // Documentation-related root causes
  const documentationCauses = [
    { cause: 'Change control process bypassed or inadequately executed', confidence: 'High' },
    { cause: 'Document review and approval not completed properly', confidence: 'High' },
    { cause: 'Procedure update not communicated to relevant personnel', confidence: 'Medium' },
    { cause: 'Obsolete document version still in use', confidence: 'Medium' },
  ];

  // Complaint-related root causes
  const complaintCauses = [
    { cause: 'Customer usage or handling conditions not anticipated', confidence: 'Medium' },
    { cause: 'Product specification does not match customer expectations', confidence: 'Medium' },
    { cause: 'Customer training or instructions inadequate', confidence: 'Low' },
    { cause: 'Batch-specific issue requiring investigation', confidence: 'Medium' },
  ];

  // Select base causes based on category
  let selectedCauses = [];
  if (category.includes('equipment') || category.includes('instrument')) {
    selectedCauses = equipmentCauses;
  } else if (category.includes('process') || category.includes('procedure')) {
    selectedCauses = processCauses;
  } else if (category.includes('product') || category.includes('quality')) {
    selectedCauses = productCauses;
  } else if (category.includes('document')) {
    selectedCauses = documentationCauses;
  } else {
    // Default mix if no specific category
    selectedCauses = [...equipmentCauses.slice(0, 2), ...processCauses.slice(0, 2)];
  }

  // Add complaint-specific causes if source is complaint
  if (source.includes('complaint') || source.includes('customer')) {
    selectedCauses = [...selectedCauses, ...complaintCauses.slice(0, 1)];
  }

  // If audit source, add documentation/process causes
  if (source.includes('audit') || source.includes('inspection')) {
    const auditCause = {
      cause: 'Non-compliance with documented procedure or regulation',
      confidence: 'High'
    };
    if (!selectedCauses.some(c => c.cause.includes('Non-compliance'))) {
      selectedCauses.unshift(auditCause);
    }
  }

  return selectedCauses.slice(0, 4);
};

// Generate Ishikawa categories based on CAPA details
const generateIshikawaCategorization = (capa) => {
  const categories = {
    'Man (Personnel)': false,
    'Machine (Equipment)': false,
    'Method (Process)': false,
    'Material (Resources)': false,
    'Mother Nature (Environment)': false,
    'Measurement (Inspection)': false,
  };

  const category = capa.category?.toLowerCase() || '';
  const source = capa.source?.toLowerCase() || '';
  const description = capa.description?.toLowerCase() || '';
  const title = capa.title?.toLowerCase() || '';

  // Determine involvement based on CAPA details
  if (category.includes('process') || source.includes('audit') || description.includes('train')) {
    categories['Man (Personnel)'] = true;
  }
  if (category.includes('equipment') || description.includes('calibr') || title.includes('sensor')) {
    categories['Machine (Equipment)'] = true;
  }
  if (category.includes('process') || description.includes('procedure') || title.includes('procedure')) {
    categories['Method (Process)'] = true;
  }
  if (category.includes('product') || source.includes('complaint') || description.includes('material')) {
    categories['Material (Resources)'] = true;
  }
  if (category.includes('environment') || description.includes('temperature') || description.includes('humidity')) {
    categories['Mother Nature (Environment)'] = true;
  }
  if (category.includes('quality') || description.includes('inspect') || description.includes('test')) {
    categories['Measurement (Inspection)'] = true;
  }

  // Ensure at least 2 are selected for meaningful analysis
  const selected = Object.entries(categories).filter(([, value]) => value);
  if (selected.length === 0) {
    categories['Method (Process)'] = true;
    categories['Measurement (Inspection)'] = true;
  }

  return categories;
};

// Generate recommended actions based on CAPA
const generateRecommendedActions = (capa) => {
  const category = capa.category?.toLowerCase() || '';
  const source = capa.source?.toLowerCase() || '';

  const actions = [];

  // Equipment actions
  if (category.includes('equipment') || category.includes('instrument')) {
    actions.push({
      action: 'Schedule equipment calibration and maintenance per manufacturer specifications',
      type: 'preventive'
    });
    actions.push({
      action: 'Conduct equipment qualification study or repeat validation if parameters changed',
      type: 'corrective'
    });
  }

  // Process actions
  if (category.includes('process') || category.includes('procedure')) {
    actions.push({
      action: 'Review and update Standard Operating Procedures (SOPs); implement through change control',
      type: 'corrective'
    });
    actions.push({
      action: 'Conduct mandatory training for all affected personnel and verify competency',
      type: 'preventive'
    });
  }

  // Product actions
  if (category.includes('product') || category.includes('quality')) {
    actions.push({
      action: 'Evaluate supplier performance and implement supplier assessment protocol',
      type: 'corrective'
    });
    actions.push({
      action: 'Enhance incoming material inspection plan and acceptance criteria',
      type: 'preventive'
    });
  }

  // Documentation actions
  if (category.includes('document')) {
    actions.push({
      action: 'Strengthen change control process with enhanced review requirements',
      type: 'preventive'
    });
    actions.push({
      action: 'Implement document management system updates and version control',
      type: 'corrective'
    });
  }

  // Complaint-specific actions
  if (source.includes('complaint')) {
    actions.push({
      action: 'Perform customer impact assessment and determine need for field action',
      type: 'corrective'
    });
  }

  // Audit-specific actions
  if (source.includes('audit')) {
    actions.push({
      action: 'Implement corrective action plan with timeline and responsible parties',
      type: 'corrective'
    });
  }

  // Default actions if not enough generated
  if (actions.length < 3) {
    actions.push({
      action: 'Implement monitoring/surveillance plan to detect recurrence',
      type: 'preventive'
    });
  }
  if (actions.length < 4) {
    actions.push({
      action: 'Schedule effectiveness check and document verification of implementation',
      type: 'preventive'
    });
  }

  return actions.slice(0, 4);
};

// Generate similar past CAPAs (mock data)
const generateSimilarCAPAs = (capa) => {
  const category = capa.category || 'General';
  const mockCAPAs = [
    {
      id: 'CAPA-2024-0847',
      title: `Previous ${category} issue - Temperature control deviation`,
      category: category,
      status: 'Closed',
      severity: 'High',
      similarity: '87%'
    },
    {
      id: 'CAPA-2023-0652',
      title: `Related process deviation - Calibration lapse`,
      category: category,
      status: 'Closed',
      severity: 'Medium',
      similarity: '72%'
    },
    {
      id: 'CAPA-2024-0521',
      title: `Similar root cause analysis - Documentation compliance`,
      category: category,
      status: 'Closed',
      severity: 'Medium',
      similarity: '65%'
    }
  ];

  return mockCAPAs;
};

export default function AIRootCauseAnalysis({ capa }) {
  const safeCapa = capa || { category: 'General', source: '', title: '', description: '' };
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [suggestions, setSuggestions] = useState(generateSuggestions(safeCapa));
  const [ishikawa, setIshikawa] = useState(generateIshikawaCategorization(safeCapa));
  const [similarCAPAs] = useState(generateSimilarCAPAs(safeCapa));
  const [actions, setActions] = useState(generateRecommendedActions(safeCapa));

  // Show empty state if no CAPA data provided
  if (!capa) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">AI-Powered Root Cause Assistant</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-500">No CAPA data available. Root cause analysis will appear here when a CAPA is selected.</p>
        </div>
      </div>
    );
  }

  const handleCopyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerateSuggestions = () => {
    setSuggestions(generateSuggestions(safeCapa));
    setActions(generateRecommendedActions(safeCapa));
  };

  const getConfidenceBadgeColor = (confidence) => {
    switch (confidence) {
      case 'High':
        return 'bg-emerald-100 text-emerald-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      case 'Low':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getIshikawaColor = (isSelected) => {
    return isSelected
      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
      : 'bg-slate-50 border-slate-200 text-slate-500';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">AI-Powered Root Cause Assistant</h2>
        </div>
        <p className="text-emerald-50 text-sm mt-1">Contextual analysis based on CAPA attributes</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Suggested Root Causes */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Suggested Root Causes</h3>
          <div className="space-y-3">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
              >
                <div className="flex-1">
                  <p className="text-slate-900 font-medium text-sm mb-2">{item.cause}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBadgeColor(item.confidence)}`}>
                      {item.confidence} Confidence
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(item.cause, `cause-${idx}`)}
                  className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition text-slate-600 hover:text-slate-900"
                  title="Copy to clipboard"
                >
                  {copiedIndex === `cause-${idx}` ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ishikawa (Fishbone) Diagram Categories */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Fishbone Diagram Analysis</h3>
          <p className="text-sm text-slate-600 mb-3">Likely contributor categories (6M Framework):</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ishikawa).map(([category, isSelected]) => (
              <div
                key={category}
                className={`p-3 rounded-lg border transition ${getIshikawaColor(isSelected)}`}
              >
                <p className="text-sm font-medium">{category}</p>
                {isSelected && <p className="text-xs mt-1">✓ Likely involved</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Similar Past CAPAs */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Similar Past CAPAs</h3>
          <p className="text-sm text-slate-600 mb-3">These CAPAs share similar characteristics:</p>
          <div className="space-y-2">
            {similarCAPAs.map((similarCapa, idx) => (
              <div
                key={idx}
                className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start justify-between"
              >
                <div>
                  <p className="font-medium text-sm text-slate-900">{similarCapa.id}</p>
                  <p className="text-xs text-slate-600 mt-1">{similarCapa.title}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                      {similarCapa.status}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                      similarCapa.severity === 'High' ? 'bg-red-100 text-red-700' :
                      similarCapa.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {similarCapa.severity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{similarCapa.similarity}</p>
                  <p className="text-xs text-slate-600">similarity</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            {actions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
              >
                <div className="flex-1">
                  <p className="text-slate-900 font-medium text-sm mb-2">{item.action}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.type === 'corrective'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type === 'corrective' ? 'Corrective' : 'Preventive'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(item.action, `action-${idx}`)}
                  className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition text-slate-600 hover:text-slate-900"
                  title="Copy to clipboard"
                >
                  {copiedIndex === `action-${idx}` ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Generate New Suggestions Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleRegenerateSuggestions}
            className="w-full px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-emerald-200"
          >
            <RotateCw className="w-4 h-4" />
            Generate New Suggestions
          </button>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            <span className="font-medium">Note:</span> These are AI-powered contextual suggestions based on CAPA attributes.
            Review and customize recommendations based on actual investigation findings.
          </p>
        </div>
      </div>
    </div>
  );
}
