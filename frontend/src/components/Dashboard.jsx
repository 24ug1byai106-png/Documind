import React, { useState, useEffect } from 'react';
import { Search, FolderGit, Calendar, Plus, ExternalLink, RefreshCw, Cpu, Database, Award } from 'lucide-react';
import './components.css';

const API_BASE = window.location.origin.includes('localhost:5173') 
  ? 'http://localhost:8000/api' 
  : `${window.location.origin}/api`;

export default function Dashboard({ onSelectProject, onNewProjectClick, searchFilter = '' }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Live vitals states for retro HUD animation
  const [cpuVal, setCpuVal] = useState(76);
  const [ramVal, setRamVal] = useState(34);
  const [eqHeights, setEqHeights] = useState([40, 60, 20, 80, 50, 70]);
  const [logs, setLogs] = useState([
    { id: 1, time: '14:21:05', text: 'Optimized index for "AuthService.ts"' },
    { id: 2, time: '14:21:12', text: 'Garbage collection initiated...' },
    { id: 3, time: '14:21:44', text: 'New pattern detected in /api/v1/users' }
  ]);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/projects`);
      if (!response.ok) {
        throw new Error('Database pipeline unresponsive.');
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
      setError('System Connection Fault: Unable to synchronize cached documentation states.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fluctuating HUD telemetry effects
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate CPU
      setCpuVal(prev => {
        const diff = Math.floor(Math.random() * 7) - 3;
        const next = prev + diff;
        return next > 95 || next < 40 ? 76 : next;
      });
      // Fluctuate RAM
      setRamVal(prev => {
        const diff = Math.floor(Math.random() * 3) - 1;
        const next = prev + diff;
        return next > 50 || next < 25 ? 34 : next;
      });
      // Fluctuate confidence equalizer graph
      setEqHeights(prev => prev.map(() => Math.floor(Math.random() * 80) + 15));
      
      // Randomly append logs
      if (Math.random() > 0.7) {
        const files = ['main.py', 'App.jsx', 'db_service.py', 'routes/generate.py', 'ai_service.py', 'vite.config.js'];
        const actions = ['Indexed code tokens in', 'Saved documentation state for', 'Triggered AI mapping in', 'Cleaned sandbox path for'];
        const chosenFile = files[Math.floor(Math.random() * files.length)];
        const chosenAction = actions[Math.floor(Math.random() * actions.length)];
        
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        
        setLogs(prev => [
          { id: Date.now(), time: timeStr, text: `${chosenAction} "${chosenFile}"` },
          ...prev.slice(0, 4) // Keep only recent logs
        ]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredProjects = projects.filter(p => 
    p.project_name.toLowerCase().includes(searchFilter.toLowerCase()) || 
    (p.repo_url && p.repo_url.toLowerCase().includes(searchFilter.toLowerCase())) ||
    (p.summary && p.summary.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // SVGs for circular dials
  const radius = 30;
  const strokeDasharray = 2 * Math.PI * radius;
  const cpuDashoffset = strokeDasharray - (cpuVal / 100) * strokeDasharray;
  const ramDashoffset = strokeDasharray - (ramVal / 100) * strokeDasharray;

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* Left Main Dashboard area */}
      <div>
        {/* Banner Hero Card */}
        <div className="hud-panel hero-panel">
          <div className="hero-id-tag">[ID: 884-X-ALPHA]</div>
          <h2 className="hero-title">
            DOCUMIND AI: Turn Codebases Into Intelligence
          </h2>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onNewProjectClick}>
              <Plus size={16} /> Initialize Analysis
            </button>
            <button className="btn btn-secondary" onClick={onNewProjectClick}>
              Upload Repository
            </button>
          </div>
        </div>

        {/* Section title */}
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={16} /> CACHED_PROJECT_STATES // {filteredProjects.length} RECORDS
        </h3>

        {/* Project card grids */}
        {loading ? (
          <div className="projects-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="hud-panel project-card" style={{ opacity: 0.5, borderStyle: 'dashed' }}>
                <div style={{ height: '20px', width: '70%', background: 'rgba(0, 255, 102, 0.1)', marginBottom: '1rem' }} />
                <div style={{ height: '12px', width: '90%', background: 'rgba(0, 255, 102, 0.05)', marginBottom: '0.5rem' }} />
                <div style={{ height: '12px', width: '80%', background: 'rgba(0, 255, 102, 0.05)', marginBottom: '0.5rem' }} />
                <div style={{ height: '12px', width: '50%', background: 'rgba(0, 255, 102, 0.05)' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="hud-panel empty-state" style={{ borderColor: 'var(--error)' }}>
            <FolderGit size={36} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>Connection Interrupt</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchProjects}>
              <RefreshCw size={14} /> Synchronize States
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="hud-panel empty-state">
            <FolderGit size={36} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No documentation records</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {searchFilter ? "No telemetry matches current search query." : "No projects generated. Initiate a new repository analysis sequence to begin."}
            </p>
            {!searchFilter && (
              <button className="btn btn-primary" onClick={onNewProjectClick}>
                Start Analysis Sequence
              </button>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="hud-panel project-card"
                onClick={() => onSelectProject(project.id)}
              >
                <div>
                  <h4 className="project-card-title">{project.project_name}</h4>
                  {project.repo_url ? (
                    <a 
                      href={project.repo_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="project-card-repo"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>{project.repo_url}</span>
                        <ExternalLink size={10} />
                      </div>
                    </a>
                  ) : (
                    <span className="project-card-repo" style={{ color: 'var(--text-muted)' }}>
                      LOCAL_ZIP_UPLOAD
                    </span>
                  )}
                  <p className="project-card-summary">
                    {project.summary || 'No summary telemetry cached.'}
                  </p>
                </div>
                <div className="project-card-date">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ANLZ_DT: {formatDate(project.created_at)}</span>
                    <span style={{ color: 'var(--primary)', fontSize: '0.65rem' }}>[READ_STATE]</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar HUD Widgets */}
      <div className="sidebar-widgets">
        
        {/* System Vitals Panel */}
        <div className="hud-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid rgba(0, 255, 102, 0.1)', paddingBottom: '0.5rem', display: 'flex', justifyItems: 'center', gap: '0.5rem' }}>
            <Cpu size={14} /> SYSTEM_VITALS
          </h4>
          
          <div className="vital-dials-container">
            {/* CPU Dial */}
            <div className="vital-dial">
              <svg className="vital-dial-svg" viewBox="0 0 80 80">
                <circle className="vital-dial-bg" cx="40" cy="40" r={radius} />
                <circle 
                  className="vital-dial-fill vital-dial-fill-cyan" 
                  cx="40" 
                  cy="40" 
                  r={radius} 
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={cpuDashoffset}
                />
              </svg>
              <div className="vital-dial-label">
                <span className="vital-dial-value">{cpuVal}%</span>
                <span className="vital-dial-name">CPU</span>
              </div>
            </div>

            {/* RAM Dial */}
            <div className="vital-dial">
              <svg className="vital-dial-svg" viewBox="0 0 80 80">
                <circle className="vital-dial-bg" cx="40" cy="40" r={radius} />
                <circle 
                  className="vital-dial-fill" 
                  cx="40" 
                  cy="40" 
                  r={radius} 
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={ramDashoffset}
                />
              </svg>
              <div className="vital-dial-label">
                <span className="vital-dial-value">{ramVal}%</span>
                <span className="vital-dial-name">RAM</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div className="vitals-meter-label">
              <span>TOKEN_USAGE</span>
              <span>142,891 / 500K</span>
            </div>
            <div className="vitals-bar-bg">
              <div className="vitals-bar-fill" style={{ width: '28.5%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
            <span>CONFIDENCE:</span>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>0.992</span>
          </div>
          
          {/* Equalizer animation */}
          <div className="confidence-chart">
            {eqHeights.map((h, i) => (
              <div 
                key={i} 
                className="confidence-bar" 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Neural Event Log Panel */}
        <div className="hud-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid rgba(0, 255, 102, 0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            NEURAL_EVENT_LOG
          </h4>
          <div className="event-logs-list">
            {logs.map((log) => (
              <div key={log.id} className="event-log-item">
                <span className="event-log-time">[{log.time}]</span>
                <span className="event-log-text">{log.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Morse Stream Panel */}
        <div className="hud-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid rgba(0, 255, 102, 0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            MORSE_STREAM_ENCODER
          </h4>
          <div className="morse-code-text">
            ...  --  -  -  .  -.  -..  ...  .-  .-.  .  .-.  .  .-  -..  -.--
          </div>
        </div>

        {/* Dependency Viz Panel */}
        <div className="hud-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid rgba(0, 255, 102, 0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            DEP_VIZ_LITE
          </h4>
          <div className="dep-viz-container">
            <div className="dep-node active">CORE</div>
            <div className="dep-line" />
            <div className="dep-node">API</div>
            <div className="dep-line" />
            <div className="dep-node">UI</div>
          </div>
        </div>

      </div>
    </div>
  );
}
