import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Brain,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Send,
  Cpu,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Info
} from 'lucide-react';
import type { Machine, DiagnosisResult } from '../types';
import { api } from '../services/api';

interface AIDiagnosticStudioProps {
  machines: Machine[];
  initialMachineId?: string;
  onNavigateToMemory?: () => void;
}

export const AIDiagnosticStudio: React.FC<AIDiagnosticStudioProps> = ({
  machines,
  initialMachineId,
  onNavigateToMemory,
}) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>(initialMachineId || (machines[0]?.id ?? ''));
  const [problemCategory, setProblemCategory] = useState<string>('Vibration');
  const [severity, setSeverity] = useState<string>('High');
  const [symptomsInput, setSymptomsInput] = useState<string>('High frequency harmonic vibration, Elevated bearing housing temperature');
  const [observedBehavior, setObservedBehavior] = useState<string>('Machine begins vibrating aggressively above 3500 RPM. Audible grinding noise near spindle drive.');
  const [technicianNotes, setTechnicianNotes] = useState<string>('Checked belt tension yesterday; belt appeared intact.');

  const [loading, setLoading] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [showTrace, setShowTrace] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState<'Helpful' | 'Not Helpful' | null>(null);
  const [feedbackWorked, setFeedbackWorked] = useState<'Yes' | 'Partially' | 'No' | null>(null);
  const [feedbackAction, setFeedbackAction] = useState<string>('');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (initialMachineId) {
      setSelectedMachineId(initialMachineId);
    }
  }, [initialMachineId]);

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  const symptomPresets: Record<string, string[]> = {
    Vibration: [
      'High frequency harmonic vibration',
      'Radial displacement > 5.5mm/s',
      'Audible mechanical rattle at high speed',
      'Shaft runout oscillation',
    ],
    Overheating: [
      'Housing surface temp > 80°C',
      'Coolant supply pressure drop',
      'Thermal cutout trigger',
      'Heat discoloration on bearing housing',
    ],
    Cavitation: [
      'Popping sound like gravel in pump',
      'Flow discharge pressure erratic',
      'Suction pressure below vapor point',
      'Impeller pitting observed',
    ],
    'Pressure drop': [
      'System pressure falling under load',
      'Proportional valve hunting',
      'Hydraulic oil foaming',
      'Cylinder creep',
    ],
    'Motor Current Overload': [
      'Current spike > 140% of rated FLA',
      'VFD tripping on OC3 overload',
      'Motor winding insulation test degraded',
    ],
  };

  const diagnosticSteps = [
    'Querying Supabase relational records & past work orders...',
    'Querying Hindsight persistent organizational memory bank...',
    'Correlating cross-asset failure patterns & past solutions...',
    'Filtering out previously failed troubleshooting actions...',
    'Synthesizing grounded recommendation with evidence trace...',
  ];

  const handleRunDiagnosis = async () => {
    if (!selectedMachine) return;
    setLoading(true);
    setErrorMsg(null);
    setDiagnosisResult(null);
    setFeedbackSuccessMsg(null);
    setCurrentStepIndex(0);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < diagnosticSteps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    try {
      const symptomsList = symptomsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const telemetryMeasurements: Record<string, any> = {};
      selectedMachine.metrics?.forEach((metric) => {
        telemetryMeasurements[metric.metric_name] = metric.metric_value;
      });

      const res = await api.runDiagnosis({
        machine_id: selectedMachine.id,
        problem_category: problemCategory,
        symptoms: symptomsList,
        observed_behavior: observedBehavior,
        measurements: telemetryMeasurements,
        technician_notes: technicianNotes,
        severity: severity,
      });

      clearInterval(stepInterval);
      setDiagnosisResult(res);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || 'Diagnosis generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSymptom = (sym: string) => {
    const list = symptomsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.includes(sym)) {
      setSymptomsInput(list.filter((s) => s !== sym).join(', '));
    } else {
      setSymptomsInput([...list, sym].join(', '));
    }
  };

  const handleSubmitFeedback = async () => {
    if (!diagnosisResult) return;
    setSubmittingFeedback(true);
    try {
      await api.submitDiagnosisFeedback({
        recommendation_id: diagnosisResult.id,
        rating: feedbackRating || undefined,
        worked_status: feedbackWorked || undefined,
        actual_action_taken: feedbackAction || undefined,
        actual_result: feedbackWorked === 'Yes' ? 'Issue resolved' : 'Further investigation needed',
      });
      setFeedbackSuccessMsg('Feedback stored! Hindsight organizational memory updated.');
    } catch (err: any) {
      alert(`Error submitting feedback: ${err.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6e4de] border border-[#d36d4e]/30 text-[#d36d4e] text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Diagnostic Studio &bull; Grounded Industrial Reasoning</span>
          </div>
          <h1 className="font-serif font-normal text-2xl sm:text-3xl text-[#182026] tracking-tight">
            Equipment Diagnostic Engine
          </h1>
          <p className="text-xs text-[#717b85] mt-1">
            Synthesizes current sensor telemetry, operational history, and Hindsight organizational memory
          </p>
        </div>

        {selectedMachine && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#e4dcce] text-xs shadow-sm">
            <span className="text-[#717b85]">Target Asset:</span>
            <span className="font-bold text-[#d36d4e]">{selectedMachine.machine_code}</span>
            <span className="text-[#a0abb5]">&bull;</span>
            <span className="text-[#182026] font-medium">{selectedMachine.name}</span>
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="ui-card p-5 rounded-2xl border border-[#e4dcce] bg-white space-y-4">
            <h2 className="text-xs font-bold text-[#182026] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#f1ebdF]">
              <Cpu className="w-4 h-4 text-[#d36d4e]" />
              <span>Incident Parameters & Live Telemetry</span>
            </h2>

            {/* Machine Selector */}
            <div>
              <label className="block text-xs font-medium text-[#4e5b67] mb-1">
                Select Equipment
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-xs text-[#182026] focus:outline-none focus:border-[#d36d4e]"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.machine_code} - {m.name} ({m.type_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Real-time Telemetry Preview for this Machine */}
            {selectedMachine && selectedMachine.metrics && selectedMachine.metrics.length > 0 && (
              <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6] space-y-2">
                <span className="text-[10px] font-bold text-[#717b85] uppercase tracking-wider block">
                  Active Sensor Stream (Injected into AI context)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedMachine.metrics.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded-lg bg-white border border-[#e4dcce] flex items-center justify-between text-xs"
                    >
                      <span className="text-[#647482] capitalize text-[11px]">
                        {m.metric_name.replace('_', ' ')}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          m.status === 'Critical'
                            ? 'text-[#d36d4e]'
                            : m.status === 'Warning'
                            ? 'text-[#df9e52]'
                            : 'text-[#3e6b5c]'
                        }`}
                      >
                        {m.metric_value} {m.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Problem Category & Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#4e5b67] mb-1">
                  Problem Category
                </label>
                <select
                  value={problemCategory}
                  onChange={(e) => setProblemCategory(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-xs text-[#182026] focus:outline-none focus:border-[#d36d4e]"
                >
                  <option value="Vibration">Vibration</option>
                  <option value="Overheating">Overheating</option>
                  <option value="Cavitation">Cavitation</option>
                  <option value="Pressure drop">Pressure drop</option>
                  <option value="Motor Current Overload">Motor Current Overload</option>
                  <option value="Hydraulic Fluid Leak">Hydraulic Fluid Leak</option>
                  <option value="Unusual Noise">Unusual Noise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4e5b67] mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-xs text-[#182026] focus:outline-none focus:border-[#d36d4e]"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Symptoms Input & Quick Badges */}
            <div>
              <label className="block text-xs font-medium text-[#4e5b67] mb-1">
                Reported Symptoms (comma separated)
              </label>
              <textarea
                rows={2}
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="e.g. High harmonic vibration, bearing temp elevated"
                className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-xs text-[#182026] focus:outline-none focus:border-[#d36d4e] resize-none"
              />

              {/* Symptom Presets */}
              {symptomPresets[problemCategory] && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {symptomPresets[problemCategory].map((sym) => {
                    const isSelected = symptomsInput.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleToggleSymptom(sym)}
                        className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-[#f6e4de] text-[#d36d4e] border-[#d36d4e]/40 font-medium'
                            : 'bg-white text-[#647482] border-[#e4dcce] hover:border-[#cfc3b0]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {sym}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Observed Behavior */}
            <div>
              <label className="block text-xs font-medium text-[#4e5b67] mb-1">
                Observed Equipment Behavior
              </label>
              <textarea
                rows={2}
                value={observedBehavior}
                onChange={(e) => setObservedBehavior(e.target.value)}
                placeholder="Physical observations, noises, smell, intermittent patterns..."
                className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-xs text-[#182026] focus:outline-none focus:border-[#d36d4e] resize-none"
              />
            </div>

            {/* Technician Notes */}
            <div>
              <label className="block text-xs font-medium text-[#4e5b67] mb-1">
                Field Technician Notes & Prior Checks
              </label>
              <textarea
                rows={2}
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                placeholder="Any actions already performed or environmental notes..."
                className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-xs text-[#182026] focus:outline-none focus:border-[#d36d4e] resize-none"
              />
            </div>

            {/* Submit Diagnostic Action */}
            <button
              onClick={handleRunDiagnosis}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#d36d4e] hover:bg-[#c25838] text-white font-semibold text-xs shadow-md shadow-[#d36d4e]/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Grounded Diagnosis...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#fbf2e3]" />
                  <span>Execute Grounded AI Diagnosis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output & Reasoning Trace (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Diagnostic Loading State with Step Visualizer */}
          {loading && (
            <div className="ui-card rounded-2xl p-8 border border-[#d36d4e]/30 bg-white text-center space-y-6">
              <div className="relative w-14 h-14 mx-auto">
                <div className="absolute inset-0 rounded-full border-3 border-[#d36d4e]/20 border-t-[#d36d4e] animate-spin"></div>
                <Brain className="w-7 h-7 text-[#d36d4e] absolute inset-0 m-auto" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#182026]">Synthesizing Equipment Intelligence</h3>
                <p className="text-xs text-[#d36d4e] font-medium mt-1">
                  {diagnosticSteps[currentStepIndex]}
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2 text-left">
                {diagnosticSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {idx < currentStepIndex ? (
                      <CheckCircle2 className="w-4 h-4 text-[#3e6b5c] flex-shrink-0" />
                    ) : idx === currentStepIndex ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#d36d4e] border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#d5dbdf] flex-shrink-0" />
                    )}
                    <span
                      className={
                        idx <= currentStepIndex ? 'text-[#182026] font-medium' : 'text-[#8a96a3]'
                      }
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-[#faeae4] border border-[#d36d4e]/40 text-[#d36d4e] text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* No Diagnosis Yet Placeholder */}
          {!loading && !diagnosisResult && (
            <div className="ui-card rounded-2xl p-10 border border-[#e4dcce] bg-white text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-14 h-14 rounded-full bg-[#f6e4de] flex items-center justify-center text-[#d36d4e] mb-3">
                <Stethoscope className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#182026]">Diagnostic Studio Ready</h3>
              <p className="text-xs text-[#717b85] max-w-md mt-1 leading-relaxed">
                Select equipment, define the observed symptoms or anomalies, and launch the diagnostic reasoning engine to retrieve historical facts, avoid known failed approaches, and isolate root causes.
              </p>
              <button
                onClick={handleRunDiagnosis}
                className="mt-5 px-4 py-2 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-[#182026] text-xs font-semibold border border-[#e4dbcd] transition-all"
              >
                Run Sample Diagnosis for {selectedMachine?.machine_code || 'Selected Machine'} &rarr;
              </button>
            </div>
          )}

          {/* Active Diagnostic Result */}
          {diagnosisResult && (
            <div className="space-y-4">
              {/* Header Card with Confidence */}
              <div className="ui-card rounded-2xl p-6 border border-[#e4dcce] bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f6e4de] text-[#d36d4e]">
                        {diagnosisResult.machine_code}
                      </span>
                      <span className="text-xs font-semibold text-[#182026]">
                        {diagnosisResult.problem_category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e3ece6] text-[#3e6b5c] border border-[#3e6b5c]/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Memory Grounded
                      </span>
                    </div>
                    <h2 className="font-serif text-xl font-bold text-[#182026] mt-2">
                      Grounded Diagnostic Assessment
                    </h2>
                  </div>

                  {/* Confidence Score Pill */}
                  <div className="flex items-center gap-3 bg-[#faf7f2] px-3.5 py-2 rounded-xl border border-[#e4dcce]">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#717b85] block">
                        Confidence
                      </span>
                      <span className="text-xl font-bold text-[#d36d4e] font-serif">
                        {Math.round(diagnosisResult.confidence_score * 100)}%
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#f6e4de] flex items-center justify-center text-[#d36d4e]">
                      <Brain className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Priority Recommended First Check */}
                <div className="mt-5 p-4 rounded-xl bg-[#fdf9f2] border border-[#df9e52]/40">
                  <div className="flex items-center gap-2 text-[#df9e52] font-bold text-xs uppercase tracking-wider mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Recommended First Check (Priority Action)</span>
                  </div>
                  <p className="text-xs font-semibold text-[#182026] leading-relaxed">
                    {diagnosisResult.recommended_first_check}
                  </p>
                </div>

                {/* Why This Recommendation */}
                <div className="mt-4 space-y-1">
                  <span className="text-xs font-semibold text-[#717b85] uppercase tracking-wider">
                    Why This Recommendation
                  </span>
                  <p className="text-xs text-[#4e5b67] leading-relaxed bg-[#faf7f2] p-3 rounded-xl border border-[#ece4d6]">
                    {diagnosisResult.why_explanation}
                  </p>
                </div>
              </div>

              {/* Likely Causes */}
              <div className="ui-card rounded-2xl p-5 border border-[#e4dcce] bg-white">
                <h3 className="text-xs font-bold text-[#717b85] uppercase tracking-wider mb-3">
                  Likely Root Causes & Probability
                </h3>
                <div className="space-y-2.5">
                  {diagnosisResult.likely_causes?.map((cause, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#182026]">{cause.cause}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f6e4de] text-[#d36d4e]">
                            {cause.likelihood}
                          </span>
                        </div>
                        <p className="text-xs text-[#717b85] mt-1">{cause.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two Column Row: Previously Failed Approaches vs Historical Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Previously Failed Approaches to AVOID */}
                <div className="p-4 rounded-xl bg-[#faeae4]/70 border border-[#d36d4e]/30">
                  <div className="flex items-center gap-2 text-[#d36d4e] font-bold text-xs uppercase tracking-wider mb-2">
                    <XCircle className="w-4 h-4" />
                    <span>Previously Failed Actions (DO NOT REPEAT)</span>
                  </div>
                  <p className="text-[11px] text-[#717b85] mb-3">
                    These approaches were attempted on this machine or similar models and failed to resolve the issue:
                  </p>
                  <div className="space-y-2">
                    {diagnosisResult.previously_failed?.length > 0 ? (
                      diagnosisResult.previously_failed.map((fail, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-white border border-[#d36d4e]/20 text-xs">
                          <div className="flex items-center justify-between font-semibold text-[#d36d4e]">
                            <span>{fail.action}</span>
                            <span className="text-[10px] text-[#8a96a3]">{fail.incident}</span>
                          </div>
                          <p className="text-[11px] text-[#717b85] mt-0.5">{fail.why_avoid}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#717b85] italic">No recorded negative outcomes on file.</p>
                    )}
                  </div>
                </div>

                {/* Verified Historical Evidence */}
                <div className="p-4 rounded-xl bg-[#e3ece6]/70 border border-[#3e6b5c]/30">
                  <div className="flex items-center gap-2 text-[#3e6b5c] font-bold text-xs uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Historical Evidence</span>
                  </div>
                  <p className="text-[11px] text-[#717b85] mb-3">
                    Grounded citations from past resolved repairs in Supabase and Hindsight:
                  </p>
                  <div className="space-y-2">
                    {diagnosisResult.historical_evidence?.length > 0 ? (
                      diagnosisResult.historical_evidence.map((ev, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-white border border-[#3e6b5c]/20 text-xs">
                          <div className="flex items-center justify-between font-semibold text-[#3e6b5c]">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e3ece6] text-[#3e6b5c]">
                              {ev.incident_id}
                            </span>
                            <span className="text-[10px] text-[#717b85]">{ev.machine_code}</span>
                          </div>
                          <p className="text-[11px] text-[#4e5b67] mt-1">{ev.evidence}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#717b85] italic">Grounded in verified historical repair standards.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Memory Impact Statement */}
              {diagnosisResult.memory_impact && (
                <div className="p-4 rounded-xl bg-[#fbf2e3] border border-[#df9e52]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#df9e52] font-bold text-xs uppercase tracking-wider">
                      <Brain className="w-4 h-4" />
                      <span>Memory Impact & Continuous Learning</span>
                    </div>
                    {onNavigateToMemory && (
                      <button
                        onClick={onNavigateToMemory}
                        className="text-[11px] font-semibold text-[#d36d4e] hover:underline"
                      >
                        Inspect in Memory Graph &rarr;
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#4e5b67] leading-relaxed">
                    {diagnosisResult.memory_impact.impact_narrative}
                  </p>
                  {diagnosisResult.memory_impact.prevention_rule && (
                    <div className="mt-2 text-[11px] text-[#8a5d20] bg-white p-2 rounded-lg border border-[#df9e52]/30">
                      <span className="font-bold">Rule: </span>
                      {diagnosisResult.memory_impact.prevention_rule}
                    </div>
                  )}
                </div>
              )}

              {/* Expandable Reasoning Trace */}
              {diagnosisResult.why_trace && diagnosisResult.why_trace.length > 0 && (
                <div className="ui-card rounded-xl p-4 border border-[#e4dcce] bg-white">
                  <button
                    onClick={() => setShowTrace(!showTrace)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-[#4e5b67] hover:text-[#182026]"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#d36d4e]" />
                      <span>Diagnostic Reasoning Trace ({diagnosisResult.why_trace.length} Deductive Steps)</span>
                    </span>
                    {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showTrace && (
                    <div className="mt-3 pt-3 border-t border-[#f1ebdF] space-y-2 text-xs">
                      {diagnosisResult.why_trace.map((step, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#faf7f2] border border-[#ece4d6]">
                          <span className="text-[#d36d4e] font-bold block">{step.step}</span>
                          <span className="text-[#717b85] text-[11px] mt-0.5 block">{step.evidence}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Technician Feedback Submission */}
              <div className="ui-card rounded-2xl p-5 border border-[#e4dcce] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#182026] uppercase tracking-wider flex items-center gap-2">
                    <ThumbsUp className="w-3.5 h-3.5 text-[#d36d4e]" />
                    <span>Technician Feedback Loop (Reinforces Hindsight Memory)</span>
                  </h3>
                  {feedbackSuccessMsg && (
                    <span className="text-xs text-[#3e6b5c] font-semibold">{feedbackSuccessMsg}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#717b85] mb-1 font-medium">
                      Was this recommendation helpful?
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFeedbackRating('Helpful')}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          feedbackRating === 'Helpful'
                            ? 'bg-[#e3ece6] text-[#3e6b5c] border-[#3e6b5c]/40'
                            : 'bg-[#faf7f2] text-[#647482] border-[#e4dbcd] hover:border-[#cfc3b0]'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful</span>
                      </button>
                      <button
                        onClick={() => setFeedbackRating('Not Helpful')}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          feedbackRating === 'Not Helpful'
                            ? 'bg-[#f6e4de] text-[#d36d4e] border-[#d36d4e]/40'
                            : 'bg-[#faf7f2] text-[#647482] border-[#e4dbcd] hover:border-[#cfc3b0]'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Not Helpful</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#717b85] mb-1 font-medium">
                      Did the recommended check work?
                    </label>
                    <div className="flex gap-2">
                      {(['Yes', 'Partially', 'No'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setFeedbackWorked(opt)}
                          className={`flex-1 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                            feedbackWorked === opt
                              ? 'bg-[#fbf1e2] text-[#df9e52] border-[#df9e52]/40'
                              : 'bg-[#faf7f2] text-[#647482] border-[#e4dbcd] hover:border-[#cfc3b0]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#717b85] mb-1 font-medium">
                    Actual Action Taken & Field Outcome
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={feedbackAction}
                      onChange={(e) => setFeedbackAction(e.target.value)}
                      placeholder="e.g. Checked belt tension, adjusted by 15%, vibration normalized to 2.1 mm/s"
                      className="flex-1 bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-1.5 text-xs text-[#182026] focus:outline-none focus:border-[#d36d4e]"
                    />
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback}
                      className="px-4 py-1.5 rounded-xl bg-[#d36d4e] hover:bg-[#c25838] text-white text-xs font-semibold shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
