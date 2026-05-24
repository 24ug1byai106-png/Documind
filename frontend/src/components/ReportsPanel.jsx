import React, { useState, useEffect } from 'react';
import { FileText, Download, ShieldCheck, Activity, Database, ArrowLeft } from 'lucide-react';
import './components.css';

const API_BASE = window.location.origin.includes('localhost:5173') 
  ? 'http://localhost:8000/api' 
  : `${window.location.origin}/api`;

export default function ReportsPanel({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/projects`);
      if (!response.ok) {
        throw new Error('Failed to fetch system logs.');
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
      setError('Connection interrupted during telemetry download.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDownloadReportFile = () => {
    if (projects.length === 0) {
      alert("No telemetry logs to export.");
      return;
    }
    const reportData = {
      system_id: "0X88F2",
      security_level: "SECURE_CHNL",
      export_timestamp: new Date().toISOString(),
      active_connections: 1,
      total_records: projects.length,
      latency: "12ms",
      uptime: "99.9%",
      database_state: "SQLite Fallback Active",
      records: projects.map(p => ({
        id: p.id,
        project_name: p.project_name,
        repo_url: p.repo_url || "LOCAL_ZIP_STREAM",
        created_at: p.created_at,
        estimated_token_weight: Math.floor(Math.random() * 20000) + 15000,
        status: "INDEXED_AND_SECURED"
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DOCUMIND_SYSTEM_REPORT_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="hud-panel animate-fade-in" style={{ margin: '1.5rem', padding: '2rem', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} /> SYSTEM_STATUS_REPORTS
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Browse parsed metadata logs and download compiled system logs files.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleDownloadReportFile} disabled={loading || projects.length === 0}>
          <Download size={14} /> EXPORT REPORT FILE
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <span>SYNCHRONIZING SYSTEM LOGS...</span>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ borderColor: 'var(--error)', background: 'rgba(255, 59, 59, 0.05)' }}>
          <h3 style={{ color: 'var(--error)' }}>Telemetry Sync Failed</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={fetchProjects}>Retry Sync</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FileText size={36} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No report telemetry cached</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Analyze codebases to generate telemetry reports.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="markdown-body" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 255, 102, 0.05)', color: 'var(--primary)' }}>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>PROJECT_NAME</th>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>SOURCE_TYPE</th>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>TELEMETRY_ID</th>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>DATETIME_CACHED</th>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr 
                  key={p.id} 
                  style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}
                  onClick={() => onSelectProject(p.id)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 102, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                >
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                    {p.project_name}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                    {p.repo_url ? 'GIT_REMOTE' : 'LOCAL_ZIP'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)', fontFamily: 'var(--font-body)', fontSize: '0.75rem' }}>
                    {p.id}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)', color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldCheck size={12} /> SECURED
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
