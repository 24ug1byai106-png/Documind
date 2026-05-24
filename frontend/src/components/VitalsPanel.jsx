import React, { useState, useEffect } from 'react';
import { Cpu, Terminal, Radio, ShieldCheck, Zap } from 'lucide-react';
import './components.css';

export default function VitalsPanel() {
  const [cpuVal, setCpuVal] = useState(76);
  const [ramVal, setRamVal] = useState(34);
  const [diskVal, setDiskVal] = useState(19);
  const [eqHeights, setEqHeights] = useState([40, 60, 20, 80, 50, 70, 30, 90, 45, 65]);
  const [logs, setLogs] = useState([
    { id: 1, time: '14:21:05', text: 'Optimized index for "AuthService.ts"' },
    { id: 2, time: '14:21:12', text: 'Garbage collection initiated...' },
    { id: 3, time: '14:21:44', text: 'New pattern detected in /api/v1/users' },
    { id: 4, time: '14:22:01', text: 'Synchronized local sqlite fallback database: documind.db' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuVal(prev => {
        const diff = Math.floor(Math.random() * 9) - 4;
        const next = prev + diff;
        return next > 95 || next < 40 ? 76 : next;
      });
      setRamVal(prev => {
        const diff = Math.floor(Math.random() * 3) - 1;
        const next = prev + diff;
        return next > 50 || next < 25 ? 34 : next;
      });
      setDiskVal(prev => {
        const diff = Math.random() > 0.9 ? 1 : 0;
        return prev + diff > 99 ? 19 : prev + diff;
      });
      setEqHeights(prev => prev.map(() => Math.floor(Math.random() * 85) + 10));

      if (Math.random() > 0.5) {
        const modules = ['database/db_service', 'services/ai_service', 'routes/generate', 'utils/config', 'routes/upload'];
        const states = ['ONLINE', 'STANDBY', 'OPTIMIZED', 'REFRESHED', 'PINGING'];
        const chosenModule = modules[Math.floor(Math.random() * modules.length)];
        const chosenState = states[Math.floor(Math.random() * states.length)];
        
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        
        setLogs(prev => [
          { id: Date.now(), time: timeStr, text: `Module app.${chosenModule} state shifted to ${chosenState}` },
          ...prev.slice(0, 7)
        ]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const radius = 30;
  const strokeDasharray = 2 * Math.PI * radius;

  return (
    <div className="hud-panel animate-fade-in" style={{ margin: '1.5rem', padding: '2rem', textAlign: 'left' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={20} /> SYSTEM_NEURAL_TELEMETRY
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
          Active hardware diagnostics, cognitive neural load registers, and live system log trace.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Side: Circular Gauges */}
        <div className="hud-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid rgba(0, 255, 102, 0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={14} className="animate-pulse" /> DIAGNOSTIC_CORES
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem 0' }}>
            {/* CPU Gauge */}
            <div className="vital-dial" style={{ width: '100px', height: '100px' }}>
              <svg className="vital-dial-svg" viewBox="0 0 80 80">
                <circle className="vital-dial-bg" cx="40" cy="40" r={radius} strokeWidth="5px" />
                <circle 
                  className="vital-dial-fill" 
                  cx="40" 
                  cy="40" 
                  r={radius} 
                  strokeWidth="5px"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDasharray - (cpuVal / 100) * strokeDasharray}
                />
              </svg>
              <div className="vital-dial-label">
                <span className="vital-dial-value" style={{ fontSize: '1.1rem' }}>{cpuVal}%</span>
                <span className="vital-dial-name" style={{ fontSize: '0.6rem' }}>CPU_LOAD</span>
              </div>
            </div>

            {/* RAM Gauge */}
            <div className="vital-dial" style={{ width: '100px', height: '100px' }}>
              <svg className="vital-dial-svg" viewBox="0 0 80 80">
                <circle className="vital-dial-bg" cx="40" cy="40" r={radius} strokeWidth="5px" />
                <circle 
                  className="vital-dial-fill vital-dial-fill-cyan" 
                  cx="40" 
                  cy="40" 
                  r={radius} 
                  strokeWidth="5px"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDasharray - (ramVal / 100) * strokeDasharray}
                />
              </svg>
              <div className="vital-dial-label">
                <span className="vital-dial-value" style={{ fontSize: '1.1rem' }}>{ramVal}%</span>
                <span className="vital-dial-name" style={{ fontSize: '0.6rem' }}>RAM_USED</span>
              </div>
            </div>

            {/* DISK Gauge */}
            <div className="vital-dial" style={{ width: '100px', height: '100px' }}>
              <svg className="vital-dial-svg" viewBox="0 0 80 80">
                <circle className="vital-dial-bg" cx="40" cy="40" r={radius} strokeWidth="5px" />
                <circle 
                  className="vital-dial-fill" 
                  cx="40" 
                  cy="40" 
                  r={radius} 
                  strokeWidth="5px"
                  stroke="var(--warning)"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDasharray - (diskVal / 100) * strokeDasharray}
                />
              </svg>
              <div className="vital-dial-label">
                <span className="vital-dial-value" style={{ fontSize: '1.1rem' }}>{diskVal}%</span>
                <span className="vital-dial-name" style={{ fontSize: '0.6rem' }}>DISK_USED</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="vitals-meter-label">
              <span>COGNITIVE_VECTOR_CAPACITY</span>
              <span>142,891 / 500,000 TOKENS</span>
            </div>
            <div className="vitals-bar-bg" style={{ height: '8px' }}>
              <div className="vitals-bar-fill" style={{ width: '28.5%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
            <span>NEURAL_DECISION_CONFIDENCE:</span>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>0.992 (NOMINAL)</span>
          </div>

          <div className="confidence-chart" style={{ height: '70px', marginTop: '0.5rem' }}>
            {eqHeights.map((h, i) => (
              <div 
                key={i} 
                className="confidence-bar" 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Event Console */}
        <div className="hud-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid rgba(0, 255, 102, 0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={14} /> NEURAL_EVENT_TRACE
          </h3>
          <div className="event-logs-list" style={{ maxHeight: '260px', height: '260px' }}>
            {logs.map((log) => (
              <div key={log.id} className="event-log-item" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span className="event-log-time" style={{ color: 'var(--primary)' }}>[{log.time}]</span>
                <span className="event-log-text">{log.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)' }}>
              <ShieldCheck size={14} />
              <span>LOGS_INTEGRITY: SECURED</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--secondary)' }}>
              <Zap size={14} />
              <span>DIAG_SPEED: 12ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
