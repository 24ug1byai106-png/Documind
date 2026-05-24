import React, { useState, useEffect, useRef } from 'react';
import { Check, Loader2 } from 'lucide-react';
import './components.css';

export default function LoadingProgress({ initialMessage }) {
  const [step, setStep] = useState(0);
  const [consoleLines, setConsoleLines] = useState([
    `> INITIALIZING NEURAL_ANALYZER_V2`,
    `> SETTING UP COGNITIVE PIPELINE BUFFER... OK`,
    `> SCANNING DIRECTORIES FOR COMPATIBLE EXTENSIONS...`
  ]);
  const consoleEndRef = useRef(null);

  // Steps checklist definition
  const steps = [
    { label: 'FOLDER_STRUCTURE_PARSED', desc: 'Analyzing directories and indexing file trees.' },
    { label: 'DEPENDENCY_GRAPH_MAPPED', desc: 'Parsing import trees and abstract syntax syntax.' },
    { label: 'SEMANTIC_INDEX_COMPLETE', desc: 'Correlating functional elements and symbols.' },
    { label: 'GENERATING_NEURAL_DOCS', desc: 'Synthesizing technical outlines and references using AI.' }
  ];

  // Operations terminal scrolling effect
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLines]);

  // Telemetry logs simulation
  useEffect(() => {
    const logs = [
      `> READING FILE CONTENT: package.json`,
      `> MAPPING AST NODES: backend/app/main.py (fastapi)`,
      `> REGISTRY SYMBOLS PARSED: save_project_docs [function]`,
      `> REGISTRY SYMBOLS PARSED: db_service [module]`,
      `> CACHING SYMBOL RELATIONSHIPS... DONE`,
      `> CREATING DEEP SEMANTIC VECTOR INDEXES...`,
      `> TOKEN LENGTH: 124,591 CHUNKS`,
      `> INJECTING NEURAL_ANALYZER FOR READMES`,
      `> AI MODEL INITIALIZED: llama-3.1-8b-instant`,
      `> REQUESTED PROMPTS PACKAGED... STREAMING`,
      `> GENERATING SUMMARY OUTLINES`,
      `> DETECTING API SCHEMA: /generate-docs [POST]`,
      `> SYNERGIZING DOCUMENTATION VIEWS...`
    ];

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < logs.length) {
        setConsoleLines(prev => [...prev, logs[logIndex]]);
        logIndex++;
      }
      
      // Gradually advance steps checklist based on logs length
      if (logIndex === 3) setStep(1);
      if (logIndex === 7) setStep(2);
      if (logIndex === 10) setStep(3);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hud-panel progress-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>REPOSITORY ANALYSIS ACTIVE</h2>
        <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontFamily: 'var(--font-heading)' }}>
          SYS_TIME: {new Date().toTimeString().split(' ')[0]}
        </span>
      </div>

      <div className="progress-header-grid">
        {/* Steps Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
          {steps.map((s, idx) => {
            const isCompleted = step > idx;
            const isActive = step === idx;
            return (
              <div 
                key={idx} 
                className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  opacity: isCompleted || isActive ? 1 : 0.4
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `1.5px solid ${isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted ? 'var(--success)' : 'var(--primary)',
                  boxShadow: isActive ? '0 0 5px var(--primary)' : 'none'
                }}>
                  {isCompleted ? (
                    <Check size={10} strokeWidth={3} />
                  ) : isActive ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <div style={{ width: '4px', height: '4px', background: 'var(--text-muted)', borderRadius: '50%' }} />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-white)'
                  }}>
                    {s.label}
                  </span>
                  {isActive && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {s.desc}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Core Graphic visual */}
        <div className="ai-core-graphic">
          <div className="ai-core-sphere" />
          <span style={{ fontSize: '0.6rem', color: 'var(--primary)', letterSpacing: '1px', fontFamily: 'var(--font-heading)' }}>
            AI_CORE_ACTIVE
          </span>
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            width: '4px',
            height: '4px',
            background: 'var(--primary)',
            boxShadow: '0 0 5px var(--primary)'
          }} />
        </div>
      </div>

      {/* Live operations console */}
      <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
          LIVE CONSOLE
        </h4>
        <div className="console-panel">
          {consoleLines.map((line, i) => (
            <div key={i} className="console-line">
              {line}
            </div>
          ))}
          <div className="console-line">
            &gt; {initialMessage === 'Initializing Analysis Sequence...' ? 'EXTRAPOLATING SOURCE TELEMETRY' : initialMessage.toUpperCase()}...
            <span className="console-cursor" />
          </div>
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
