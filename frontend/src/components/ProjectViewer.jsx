import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, FolderTree, Code2, BookOpen, Settings, 
  ArrowLeft, Copy, Download, AlertTriangle, Check, Loader2
} from 'lucide-react';
import './components.css';

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

const API_BASE = window.location.origin.includes('localhost:5173') 
  ? 'http://localhost:8000' 
  : window.location.origin;

class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Markdown render error: ", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          fontFamily: 'var(--font-body)', 
          fontSize: '0.8rem', 
          color: 'var(--text-white)',
          background: '#000',
          padding: '1rem',
          border: '1px solid var(--border-color)'
        }}>
          {this.props.content}
        </pre>
      );
    }
    return this.props.children;
  }
}

function SafeMarkdown({ content }) {
  return (
    <MarkdownErrorBoundary content={content}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </MarkdownErrorBoundary>
  );
}

export default function ProjectViewer({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('readme'); // 'summary', 'readme', 'api_docs', 'setup_guide', 'folder_structure'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Database read sequence timed out.');
        }
        const data = await response.json();
        if (data.success && data.project) {
          setProject(data.project);
        } else {
          throw new Error('Telemetry record cache empty.');
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Unable to retrieve cached documentation details.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleCopy = () => {
    let textToCopy = '';
    if (activeSection === 'readme') textToCopy = project.readme;
    else if (activeSection === 'api_docs') textToCopy = project.api_docs;
    else if (activeSection === 'setup_guide') textToCopy = project.setup_guide;
    else if (activeSection === 'folder_structure') textToCopy = project.folder_structure;
    else if (activeSection === 'summary') textToCopy = project.summary;

    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let content = '';
    let filename = '';

    if (activeSection === 'readme') {
      content = project.readme;
      filename = `${project.project_name}_README.md`;
    } else if (activeSection === 'api_docs') {
      content = project.api_docs;
      filename = `${project.project_name}_API.md`;
    } else if (activeSection === 'setup_guide') {
      content = project.setup_guide;
      filename = `${project.project_name}_SETUP.md`;
    } else if (activeSection === 'folder_structure') {
      content = project.folder_structure;
      filename = `${project.project_name}_STRUCTURE.txt`;
    } else if (activeSection === 'summary') {
      content = project.summary;
      filename = `${project.project_name}_SUMMARY.md`;
    }

    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1.5rem' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>SYNCHRONIZING DOCUMENTATION STATE...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hud-panel empty-state" style={{ margin: '2rem auto', maxWidth: '550px', borderColor: 'var(--error)' }}>
        <AlertTriangle size={36} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--error)' }}>Telemetry Retrieval Fault</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>
    );
  }

  if (!project) return null;

  const currentContent = () => {
    switch (activeSection) {
      case 'summary':
        return (
          <div className="markdown-body animate-fade-in">
            <h2>Project Overview</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              High-level analysis summary generated for <strong>{project.project_name}</strong>.
            </p>
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', border: '1px solid rgba(0, 255, 102, 0.1)' }}>
              <SafeMarkdown content={project.summary || 'No summary generated.'} />
            </div>
          </div>
        );
      case 'readme':
        return (
          <div className="markdown-body animate-fade-in">
            <SafeMarkdown content={project.readme || 'No README generated.'} />
          </div>
        );
      case 'api_docs':
        return (
          <div className="markdown-body animate-fade-in">
            <SafeMarkdown content={project.api_docs || 'No API documentation generated.'} />
          </div>
        );
      case 'setup_guide':
        return (
          <div className="markdown-body animate-fade-in">
            <SafeMarkdown content={project.setup_guide || 'No Setup Guide generated.'} />
          </div>
        );
      case 'folder_structure':
        return (
          <div className="animate-fade-in">
            <pre className="folder-tree">
              {project.folder_structure || 'No folder structure available.'}
            </pre>
          </div>
        );
      default:
        return null;
    }
  };

  const getSectionFilename = () => {
    switch (activeSection) {
      case 'summary': return 'SUMMARY.MD';
      case 'readme': return 'README.MD';
      case 'api_docs': return 'API.MD';
      case 'setup_guide': return 'SETUP.MD';
      case 'folder_structure': return 'STRUCTURE.TXT';
      default: return 'DOC';
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', padding: '0 1rem' }}>
      <button 
        className="btn btn-secondary" 
        onClick={onBack}
        style={{ margin: '1rem 0', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="viewer-layout">
        {/* Sidebar Nav links */}
        <div className="hud-panel viewer-nav">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold', paddingLeft: '0.5rem' }}>
            PROJECT_METRICS
          </div>
          
          <button 
            className={`viewer-nav-btn ${activeSection === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveSection('summary')}
          >
            <BookOpen size={14} /> Overview
          </button>
          
          <button 
            className={`viewer-nav-btn ${activeSection === 'folder_structure' ? 'active' : ''}`}
            onClick={() => setActiveSection('folder_structure')}
          >
            <FolderTree size={14} /> Structure
          </button>

          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.5rem', fontWeight: 'bold', paddingLeft: '0.5rem' }}>
            CACHED_OUTPUTS
          </div>
          
          <button 
            className={`viewer-nav-btn ${activeSection === 'readme' ? 'active' : ''}`}
            onClick={() => setActiveSection('readme')}
          >
            <FileText size={14} /> README.md
          </button>
          
          <button 
            className={`viewer-nav-btn ${activeSection === 'api_docs' ? 'active' : ''}`}
            onClick={() => setActiveSection('api_docs')}
          >
            <Code2 size={14} /> API_Guide
          </button>
          
          <button 
            className={`viewer-nav-btn ${activeSection === 'setup_guide' ? 'active' : ''}`}
            onClick={() => setActiveSection('setup_guide')}
          >
            <Settings size={14} /> Setup_Guide
          </button>
        </div>

        {/* Viewer Content Panel styled like DOC_PREVIEW */}
        <div className="hud-panel viewer-doc-panel">
          <div className="viewer-doc-header">
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                DOC_PREVIEW: {getSectionFilename()}
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-white)', margin: '0.2rem 0 0' }}>
                {project.project_name}
              </h3>
              {project.repo_url && (
                <a 
                  href={project.repo_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.75rem', marginTop: '0.2rem' }}
                >
                  <Github size={12} />
                  <span>{project.repo_url}</span>
                </a>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }} onClick={handleCopy} title="Copy Code text">
                {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }} onClick={handleDownload} title="Save to disk">
                <Download size={14} />
              </button>
            </div>
          </div>

          <div style={{ minHeight: '350px' }}>
            {currentContent()}
          </div>
        </div>
      </div>

      {copied && (
        <div className="toast">
          TELEMETRY_COPIED_TO_CLIPBOARD
        </div>
      )}
    </div>
  );
}
