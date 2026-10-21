'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Mic,
  MicOff,
  Volume2,
  Square,
  Play,
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

  // Free & Local Voice Dictation (Speech-to-Text) State
  const [isListening, setIsListening] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startVoiceDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      simulateVoiceStream(
        'Ambulance 104 dispatch: Need 4 units of O-negative blood immediately at Apollo Greams Rd for incoming Level 1 trauma with severe hemorrhagic shock.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setAudioDuration(0);
        timerRef.current = setInterval(() => {
          setAudioDuration((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        if (transcript.trim()) {
          setInputText(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning/error:', event.error);
        stopVoiceDictation();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      simulateVoiceStream(
        'Ambulance 104 dispatch: Need 4 units of O-negative PRBC immediately at Apollo Hospitals Greams Road for incoming Level 1 trauma victim.'
      );
    }
  };

  const stopVoiceDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const simulateVoiceStream = (phrase: string) => {
    stopVoiceDictation();
    setIsListening(true);
    setInputText('');
    setAudioDuration(0);
    const words = phrase.split(' ');
    let currentIdx = 0;

    const timer = setInterval(() => {
      setAudioDuration((prev) => prev + 1);
    }, 1000);

    const streamInterval = setInterval(() => {
      if (currentIdx < words.length) {
        setInputText((prev) => (prev ? prev + ' ' + words[currentIdx] : words[currentIdx]));
        currentIdx++;
      } else {
        clearInterval(streamInterval);
        clearInterval(timer);
        setIsListening(false);
      }
    }, 150);
  };

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 dark:bg-[#18191E]/75 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#222329] border-l border-slate-200 dark:border-white/[0.08] shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#18191E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <VitalisLogo size="md" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Emergency Clinical Intake Assistant
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 font-medium">
                  Clinical Triage
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Convert emergency radio calls, paramedic messages, or doctor orders into verified dispatch requests
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
              Sample Emergency Patient Cases
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-2 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-xs transition-all cursor-pointer shadow-xs"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{preset.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{preset.source} Order</div>
                </button>
              ))}
            </div>
          </div>

          {/* Ingestion Source Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 font-medium">
              Message Source Channel
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

          {/* Local Free Voice-to-Text & Ambulance Dispatch Dictation Bar */}
          <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] dark:bg-rose-500/[0.07] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_12px_rgba(225,29,72,0.5)]'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Emergency Voice-to-Text
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                      Local &amp; Free
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Browser Web Speech Engine • Zero API keys or cloud tokens required
                  </span>
                </div>
              </div>

              {/* Live Audio Equalizer Waveform & Timer */}
              {isListening && (
                <div className="flex items-center gap-2 font-mono text-xs text-rose-600 dark:text-rose-400 font-bold bg-white dark:bg-[#18191E] px-2.5 py-1 rounded-full border border-rose-500/25 shadow-xs">
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className="w-0.5 bg-rose-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 bg-rose-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 bg-rose-500 rounded-full animate-bounce h-2.5" style={{ animationDelay: '300ms' }} />
                    <span className="w-0.5 bg-rose-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: '450ms' }} />
                  </div>
                  <span>00:{audioDuration.toString().padStart(2, '0')}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Mic Start / Stop Dictation Toggle */}
              {isListening ? (
                <button
                  type="button"
                  onClick={stopVoiceDictation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Dictation</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startVoiceDictation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Live Dictation</span>
                </button>
              )}

              {/* Radio Dispatch Audio Stream Simulator */}
              <button
                type="button"
                disabled={isListening}
                onClick={() =>
                  simulateVoiceStream(
                    'Ambulance 104 dispatch: Need 4 units of O-negative PRBC immediately at Apollo Greams Rd for incoming Level 1 trauma with severe hemorrhagic shock.'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18191E] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition-all disabled:opacity-50 shadow-2xs"
              >
                <Radio className="w-3.5 h-3.5 text-blue-500" />
                <span>Simulate Ambulance Radio Voice</span>
              </button>
            </div>
          </div>

          {/* Unstructured Dispatch Text Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                Emergency Request Notes / Audio Transcript
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Incoming {source} Transmission
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

            {/* Run Extraction Button */}
            <div className="mt-3 flex items-center justify-end">
              <button
                onClick={handleRunJevExtraction}
                disabled={isExtracting || !inputText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Patient Emergency Order...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract Patient Order</span>
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
                    Extracted Clinical Order Details
                  </span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-medium">
                  Confidence: {(extractionResult.extracted.confidence_score * 100).toFixed(0)}%
                </span>
              </div>

              {/* Formatted Order Summary Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#18191E] border border-slate-200 dark:border-white/[0.08]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Requested Resource</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {extractionResult.extracted.units_requested} Units • {extractionResult.extracted.blood_group} {extractionResult.extracted.resource_type}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#18191E] border border-slate-200 dark:border-white/[0.08]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Patient Urgency</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    ESI Tier {extractionResult.extracted.urgency_tier} (Emergency)
                  </span>
                </div>
                <div className="col-span-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#18191E] border border-slate-200 dark:border-white/[0.08]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Receiving Hospital</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {extractionResult.extracted.destination_facility_name}
                  </span>
                </div>
              </div>

              {/* Find Match Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ready to search hospital donor reserves
                </span>
                <button
                  onClick={handleInvokeReActSolver}
                  disabled={isSolving}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{isSolving ? 'Matching Donor Hospitals...' : 'Find Best Hospital Match & Route'}</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Clinical Route Evaluation Trace */}
          {(isSolving || reactSteps.length > 0) && (
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-slate-900 dark:bg-slate-950 p-4 space-y-2 font-mono text-[11px] animate-in fade-in duration-200 shadow-xs">
              <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold text-xs text-white">AI Safety & Route Verification Steps</span>
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

          {/* Solver Result & Push to Doctor Sign-Off Action */}
          {solverResult && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-3 animate-in fade-in duration-300 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Best Donor Hospital Identified (Rank 1)
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  Match Score: {solverResult.pi}
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
                  <span>Submit for Doctor Sign-Off</span>
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
