import React, { useState, useRef } from 'react';
import { UploadCloud, FileArchive, ArrowRight, AlertCircle, Cpu, Wifi, Radio } from 'lucide-react';

const Github = ({ size = 24, className, style }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2.5" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import './components.css';

const API_BASE = window.location.origin.includes('localhost:5173') 
  ? 'http://localhost:8000' 
  : window.location.origin;

export default function UploadPanel({ onUploadSuccess, onGenerationStart, onGenerationError }) {
  const [activeTab, setActiveTab] = useState('github'); // 'github' or 'zip'
  const [repoUrl, setRepoUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Format Rejection: Only standard .zip compression payloads are accepted.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Format Rejection: Only standard .zip compression payloads are accepted.');
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Submit handlers
  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError('');
    onGenerationStart('Initializing remote GIT clone operations...');

    try {
      const response = await fetch(`${API_BASE}/github-repo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Clone execution failure.');
      }

      onUploadSuccess({
        project_id: data.project_id,
        project_name: data.project_name,
        source_path: data.source_path,
        repo_url: data.repo_url
      });
    } catch (err) {
      setError(`Sequence Interrupt: ${err.message}`);
      onGenerationError();
    } finally {
      setLoading(false);
    }
  };

  const handleZipSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    onGenerationStart('Uploading ZIP package to neural analyzer buffer...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'File stream upload aborted.');
      }

      onUploadSuccess({
        project_id: data.project_id,
        project_name: data.project_name,
        source_path: data.source_path,
        repo_url: null
      });
    } catch (err) {
      setError(`Sequence Interrupt: ${err.message}`);
      onGenerationError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hud-panel upload-card animate-fade-in">
      <h2 style={{ fontSize: '1.4rem', textTransform: 'uppercase', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', textAlign: 'center' }}>
        ANALYZE_NEW_CODEBASE
      </h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        Provide remote Git telemetry or stream compressed source archive for neural indexing.
      </p>

      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'github' ? 'active' : ''}`}
          onClick={() => handleTabChange('github')}
          disabled={loading}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Github size={12} /> git_remote
          </div>
        </button>
        <button 
          className={`tab ${activeTab === 'zip' ? 'active' : ''}`}
          onClick={() => handleTabChange('zip')}
          disabled={loading}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileArchive size={12} /> zip_archive
          </div>
        </button>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(255, 59, 59, 0.1)',
          border: '1px solid rgba(255, 59, 59, 0.3)',
          marginBottom: '1.25rem',
          color: 'var(--error)',
          fontSize: '0.8rem'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'github' ? (
        <form onSubmit={handleGithubSubmit} className="animate-fade-in">
          <div className="form-group">
            <label className="form-label" htmlFor="repo-url">TARGET_REPOSITORY_URL</label>
            <input
              id="repo-url"
              className="form-input"
              type="url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading || !repoUrl}
          >
            {loading ? 'INDEXING...' : 'INITIALIZE REMOTE ANALYSIS'} 
            <ArrowRight size={16} />
          </button>
        </form>
      ) : (
        <form onSubmit={handleZipSubmit} className="animate-fade-in">
          <div 
            className={`dropzone ${dragActive ? 'active' : ''}`} 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              style={{ display: 'none' }} 
              accept=".zip"
              onChange={handleFileChange}
              disabled={loading}
            />
            <UploadCloud size={36} className="dropzone-icon" />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-white)' }}>
                DRAG & DROP ARCHIVE FILE (.ZIP) HERE
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                or click to browse local filesystems
              </p>
            </div>
            <button type="button" className="btn btn-secondary" style={{ pointerEvents: 'none', fontSize: '0.75rem', padding: '0.35rem 0.75rem', marginTop: '0.5rem' }}>
              CHOOSE PAYLOAD
            </button>
          </div>

          {selectedFile && (
            <div className="file-info">
              <FileArchive size={14} style={{ color: 'var(--primary)' }} />
              <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                <p style={{ fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-white)' }}>
                  {selectedFile.name}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  SIZE: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1.25rem' }}
            disabled={loading || !selectedFile}
          >
            {loading ? 'STREAMING...' : 'UPLOAD & INJECT PAYLOAD'} 
            <ArrowRight size={16} />
          </button>
        </form>
      )}
    </div>
  );
}
