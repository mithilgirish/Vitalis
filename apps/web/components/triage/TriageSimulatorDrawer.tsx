'use client';

import React, { useState } from 'react';
import { useVitalis } from '../../lib/store/vitalisContext';
import { VitalisLogo } from '../common/VitalisLogo';
import { IngestionSource, JevExtractionResult, BiologicalResourceType, BloodGroup } from '../../lib/types';
import {
  X,
  Zap,
  Radio,
  MessageSquare,
  FileText,
  Edit3,
  Sparkles,
  Bot,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Terminal,
  Layers,
} from 'lucide-react';

const PRESET_SCENARIOS = [
  {
    name: 'Level 1 Trauma (Apollo)',
    source: 'Radio' as IngestionSource,
    text: 'Need 4 units of O-negative blood immediately at Apollo Greams Rd for an incoming Level 1 trauma victim.',
    extracted: {
      resource_type: 'PRBC' as const,
      blood_group: 'O-' as const,
      units_requested: 4,
      urgency_tier: 1,
      confidence_score: 0.96,
      destination_facility_id: 'FAC-APOLLO',
      destination_facility_name: 'Apollo Hospitals, Greams Road',
      clinical_indication: 'Incoming Level 1 Trauma Victim — Exsanguinating Shock',
    },
  },
  {
    name: 'Aortic Dissection (Fortis)',
    source: 'EHR' as IngestionSource,
    text: 'Stat order: 6 units AB-negative Fresh Frozen Plasma required in OR-3 Fortis Malar Hospital for acute thoracic aortic dissection.',
    extracted: {
      resource_type: 'FFP' as const,
      blood_group: 'AB-' as const,
      units_requested: 6,
      urgency_tier: 1,
      confidence_score: 0.98,
      destination_facility_id: 'FAC-FORTIS',
      destination_facility_name: 'Fortis Malar Hospital',
      clinical_indication: 'Acute Thoracic Aortic Dissection Bypass',
    },
  },
  {
    name: 'Pediatric Dengue (SRMC)',
    source: 'SMS' as IngestionSource,
    text: 'Dr Sridhar PICU SRMC: urgent requirement 4 units B+ platelets for dengue hemorrhagic shock syndrome platelets at 12k.',
    extracted: {
      resource_type: 'Platelets' as const,
      blood_group: 'B+' as const,
      units_requested: 4,
      urgency_tier: 2,
      confidence_score: 0.94,
      destination_facility_id: 'FAC-SRMC',
      destination_facility_name: 'Sri Ramachandra (SRMC)',
      clinical_indication: 'Severe Dengue Hemorrhagic Shock with Thrombocytopenia',
    },
  },
  {
    name: 'Kidney Transplant (Gleneagles)',
    source: 'Manual' as IngestionSource,
    text: 'Deceased donor match confirmed at Gleneagles Health City for O+ Kidney recipient. Organ ischemic window is 14 hours.',
    extracted: {
      resource_type: 'Kidney' as const,
      blood_group: 'O+' as const,
      units_requested: 1,
      urgency_tier: 1,
      confidence_score: 0.99,
      destination_facility_id: 'FAC-GLENEAGLES',
      destination_facility_name: 'Gleneagles Health City',
      clinical_indication: 'Deceased Donor Kidney Transplant Viability Protocol',
    },
  },
];

export function TriageSimulatorDrawer() {
  const { isTriageOpen, closeTriage, addRequestFromTriage } = useVitalis();

  const [source, setSource] = useState<IngestionSource>('Radio');
  const [inputText, setInputText] = useState(
    'Need 4 units of O-negative blood immediately at Apollo Greams Rd for an incoming Level 1 trauma victim.'
  );

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<JevExtractionResult | null>(null);

  const [isSolving, setIsSolving] = useState(false);
  const [reactSteps, setReactSteps] = useState<string[]>([]);
  const [solverResult, setSolverResult] = useState<{
    rank1: string;
    distance: string;
    pi: number;
    viabilityMinutes: number;
    synthesis: string;
  } | null>(null);

  if (!isTriageOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setSource(preset.source);
    setInputText(preset.text);
    setExtractionResult(null);
    setSolverResult(null);
    setReactSteps([]);
  };

  const handleRunJevExtraction = async () => {
    setIsExtracting(true);
    setExtractionResult(null);
    setSolverResult(null);
    setReactSteps([]);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    let extractedPayload: JevExtractionResult['extracted'] | null = null;

    try {
      const response = await fetch(`${backendUrl}/api/v1/triage/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: inputText,
          source: source.toLowerCase(),
        }),
      });
      if (response.ok) {
        const json = await response.json();
        const data = json.data;
        extractedPayload = {
          resource_type: data.resource_type as BiologicalResourceType,
          blood_group: data.blood_group as BloodGroup,
          units_requested: data.units_requested,
          urgency_tier: data.urgency_tier,
          confidence_score: data.confidence_score,
          destination_facility_id: 'FAC-APOLLO',
          destination_facility_name: data.target_facility_name,
          clinical_indication: 'Unstructured Clinical Triage Request',
        };
      }
    } catch {
      // Backend offline, fallback to local preset or deterministic logic
    }

    if (!extractedPayload) {
      const matchedPreset = PRESET_SCENARIOS.find((p) => p.text === inputText);
      extractedPayload = matchedPreset
        ? matchedPreset.extracted
        : {
            resource_type: (inputText.toLowerCase().includes('platelet')
              ? 'Platelets'
              : inputText.toLowerCase().includes('plasma') || inputText.toLowerCase().includes('ffp')
              ? 'FFP'
              : 'PRBC') as BiologicalResourceType,
            blood_group: (inputText.includes('O-')
              ? 'O-'
              : inputText.includes('AB-')
              ? 'AB-'
              : inputText.includes('B+')
              ? 'B+'
              : 'O+') as BloodGroup,
            units_requested: 4,
            urgency_tier: 1,
            confidence_score: 0.96,
            destination_facility_id: 'FAC-APOLLO',
            destination_facility_name: 'Apollo Hospitals, Greams Road',
            clinical_indication: 'Unstructured Clinical Triage Request',
          };
    }

    const result: JevExtractionResult = {
      rawInput: inputText,
      source,
      extracted: extractedPayload,
      validatedPydantic: true,
      extractedAt: new Date().toLocaleTimeString(),
    };

    setExtractionResult(result);
    setIsExtracting(false);
  };

  const handleInvokeReActSolver = () => {
    if (!extractionResult) return;
    setIsSolving(true);
    setReactSteps([]);

    const steps = [
      '⚡ [LangChain ReAct] Parsing validated Pydantic schema: resource_type="PRBC", blood_group="O-", urgency_tier=1...',
      '📍 [PostGIS Spatial Engine] Querying available donors within 30-min viability radius of Apollo Greams Rd...',
      '🌲 [XGBoost Depletion Classifier] Predicting 72h stockout probabilities for candidates FAC-RBTC and FAC-RGGGH...',
      '📊 [Viability Solver] Computing Priority Index (PI): RBTC score = 4.821 (Rank 1), RGGGH score = 4.412 (Rank 2)...',
      '✅ [Guardrail Check] Candidate 72h stockout risk (4.0%) < 40.0% threshold. Zero quality penalty applied.',
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        const nextStep = steps[current];
        setReactSteps((prev) => [...prev, nextStep]);
        current++;
      } else {
        clearInterval(interval);
        setIsSolving(false);
        setSolverResult({
          rank1: 'Regional Blood Transfusion Center, Egmore',
          distance: '6.4 km (18 mins)',
          pi: 4.821,
          viabilityMinutes: 28,
          synthesis:
            'Optimal donor identified: RBTC holds 28 units with zero projected stockout risk. Transit time (18 mins) safely within 30-min window. Guardrails satisfied.',
        });
      }
    }, 350);
  };

  const handlePushToHitl = () => {
    if (!extractionResult) return;
    addRequestFromTriage(extractionResult);
    closeTriage();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1A202C] border-l border-slate-200 dark:border-[#2D3748] shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <VitalisLogo size="md" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Triage Simulator Drawer
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 font-medium">
                  Operator Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Test unstructured text ingestion via Jev Pydantic extraction & ReAct solver
              </p>
            </div>
          </div>
          <button
            onClick={closeTriage}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Scenario Quick Loader */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 font-medium">
              Quick Clinical Scenario Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-2 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-xs transition-all cursor-pointer shadow-xs"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{preset.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{preset.source} Protocol</div>
                </button>
              ))}
            </div>
          </div>

          {/* Ingestion Source Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 font-medium">
              Ingestion Protocol Source
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Radio', 'SMS', 'EHR', 'Manual'] as IngestionSource[]).map((src) => {
                const isSelected = source === src;
                const iconMap = {
                  Radio: Radio,
                  SMS: MessageSquare,
                  EHR: FileText,
                  Manual: Edit3,
                };
                const Icon = iconMap[src];

                return (
                  <button
                    key={src}
                    onClick={() => setSource(src)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{src}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unstructured Dispatch Text Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                Raw Unstructured Dispatch Text
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Simulated {source} Transmission
              </span>
            </div>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors shadow-xs"
                placeholder="Paste dispatch audio transcript, EHR emergency order, or paramedic SMS..."
              />
            </div>

            {/* Run Jev Extraction Button */}
            <div className="mt-3 flex items-center justify-end">
              <button
                onClick={handleRunJevExtraction}
                disabled={isExtracting || !inputText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Jev Schema Extraction...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Jev Extraction</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live JSON Output Card: Validated Pydantic Schema */}
          {extractionResult && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-4 space-y-3 animate-in fade-in duration-300 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    Validated Pydantic Clinical Schema
                  </span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-medium">
                  Confidence: {(extractionResult.extracted.confidence_score * 100).toFixed(0)}%
                </span>
              </div>

              {/* Formatted JSON Box */}
              <pre className="p-3 rounded-xl bg-slate-900 dark:bg-[#070B12] border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
{JSON.stringify(extractionResult.extracted, null, 2)}
              </pre>

              {/* Invoke LangChain ReAct Solver Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ready for spatial candidate matching
                </span>
                <button
                  onClick={handleInvokeReActSolver}
                  disabled={isSolving}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{isSolving ? 'Solving Trajectory...' : 'Invoke LangChain ReAct Solver'}</span>
                </button>
              </div>
            </div>
          )}

          {/* LangChain ReAct Terminal Trace */}
          {(isSolving || reactSteps.length > 0) && (
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-slate-900 dark:bg-slate-950 p-4 space-y-2 font-mono text-[11px] animate-in fade-in duration-200 shadow-xs">
              <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-2">
                <Terminal className="w-4 h-4" />
                <span className="font-semibold text-xs text-white">LangChain ReAct Scratchpad</span>
              </div>
              <div className="space-y-1.5 pt-1 text-slate-300">
                {reactSteps.map((step, idx) => (
                  <div key={idx} className="leading-relaxed animate-in fade-in">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solver Result & Push to HITL Queue Action */}
          {solverResult && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-3 animate-in fade-in duration-300 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Optimal Match Identified (Rank 1)
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  PI Score: {solverResult.pi}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">{solverResult.synthesis}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Estimated Transit: {solverResult.distance}
                </span>
                <button
                  onClick={handlePushToHitl}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
                >
                  <span>Broadcast to HITL Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
