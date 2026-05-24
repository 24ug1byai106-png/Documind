import React, { useState } from 'react';
import { 
  LayoutDashboard, Upload, Activity, Binary, Archive, 
  Shield, Wifi, Lock, User, Search, Radio, FileText
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import UploadPanel from './components/UploadPanel';
import LoadingProgress from './components/LoadingProgress';
import ProjectViewer from './components/ProjectViewer';
import ReportsPanel from './components/ReportsPanel';
import VitalsPanel from './components/VitalsPanel';

const API_BASE = window.location.origin.includes('localhost:5173') 
  ? 'http://localhost:8000/api' 
  : `${window.location.origin}/api`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App boundary error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="hud-panel empty-state" style={{ margin: '2rem', padding: '2rem', borderColor: 'var(--error)' }}>
          <h2 style={{ color: 'var(--error)' }}>System Render Fault</h2>
          <p style={{ color: 'var(--text-white)', fontSize: '0.85rem', margin: '1rem 0' }}>
            {this.state.error?.toString()}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reboot Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'new_analysis', 'loading', 'viewer'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [generationMsg, setGenerationMsg] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard', 'upload', 'analysis', 'neural_net', 'archive'
  const [searchQuery, setSearchQuery] = useState('');

  const handleUploadSuccess = async ({ project_id, project_name, source_path, repo_url }) => {
    setView('loading');
    setGenerationMsg('Initializing Analysis Sequence...');
    
    try {
      const response = await fetch(`${API_BASE}/generate-docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id,
          project_name,
          source_path,
          repo_url
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Analysis sequence interrupted.');
      }

      if (data.success && data.supabase_id) {
        setSelectedProjectId(data.supabase_id);
        setView('viewer');
      } else {
        throw new Error('Failed to cache documentation state.');
      }
    } catch (err) {
      console.error(err);
      alert(`System Fault: ${err.message}`);
      setView('new_analysis');
    }
  };

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    setView('viewer');
  };

  const navigateMenu = (menuName) => {
    setActiveMenu(menuName);
    if (menuName === 'dashboard') {
      setView('dashboard');
    } else if (menuName === 'upload') {
      setView('new_analysis');
    } else if (menuName === 'vitals') {
      setView('vitals');
    } else if (menuName === 'reports') {
      setView('reports');
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            onSelectProject={handleSelectProject}
            onNewProjectClick={() => navigateMenu('upload')}
            searchFilter={searchQuery}
          />
        );
      case 'new_analysis':
        return (
          <UploadPanel 
            onUploadSuccess={handleUploadSuccess}
            onGenerationStart={(msg) => {
              setView('loading');
              setGenerationMsg(msg);
            }}
            onGenerationError={() => setView('new_analysis')}
          />
        );
      case 'loading':
        return <LoadingProgress initialMessage={generationMsg} />;
      case 'vitals':
        return <VitalsPanel />;
      case 'reports':
        return (
          <ReportsPanel 
            onSelectProject={handleSelectProject}
          />
        );
      case 'viewer':
        return (
          <ErrorBoundary>
            <ProjectViewer 
              projectId={selectedProjectId}
              onBack={() => setView('dashboard')}
            />
          </ErrorBoundary>
        );
      default:
        return <Dashboard onSelectProject={handleSelectProject} searchQuery={searchQuery} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-white)' }}>
      {/* Left Sidebar */}
      <aside className="hud-sidebar">
        <div className="sidebar-logo-container">
          <div className="sidebar-logo">DOCUMIND_AI</div>
          <div className="sidebar-subtitle">V_2.4.0_STABLE</div>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`sidebar-btn ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigateMenu('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`sidebar-btn ${activeMenu === 'upload' ? 'active' : ''}`}
            onClick={() => navigateMenu('upload')}
          >
            <Upload size={16} />
            <span>Analyze New</span>
          </button>
          
          <button 
            className={`sidebar-btn ${activeMenu === 'vitals' ? 'active' : ''}`}
            onClick={() => navigateMenu('vitals')}
          >
            <Activity size={16} />
            <span>System Vitals</span>
          </button>
          
          <button 
            className={`sidebar-btn ${activeMenu === 'reports' ? 'active' : ''}`}
            onClick={() => navigateMenu('reports')}
          >
            <FileText size={16} />
            <span>System Reports</span>
          </button>
        </nav>

        {/* Bottom User Box */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <User size={16} />
          </div>
          <div className="profile-info">
            <div className="profile-name">ADM_0X88F2</div>
            <div className="profile-status">
              <Shield size={10} />
              <span>SECURE_CHNL</span>
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            boxShadow: '0 0 5px var(--primary)'
          }} />
        </div>
      </aside>

      {/* Main Panel Content Column */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '100vh', overflowX: 'hidden' }}>
        
        {/* HUD Top Header */}
        <header className="hud-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 className="hud-header-title">DOCUMIND_HUD</h1>
            <div className="hud-header-links">
              <span className={`hud-header-link ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => navigateMenu('dashboard')}>Monitor</span>
              <span className={`hud-header-link ${activeMenu === 'upload' || activeMenu === 'analysis' ? 'active' : ''}`} onClick={() => navigateMenu('upload')}>Operations</span>
              <span className={`hud-header-link ${activeMenu === 'reports' ? 'active' : ''}`} onClick={() => navigateMenu('reports')}>Reports</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="hud-header-search">
              <Search size={14} style={{ color: 'var(--primary)' }} />
              <input 
                type="text" 
                placeholder="QUERY_SYS..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hud-header-icons">
              <Lock size={16} style={{ cursor: 'pointer' }} title="Secure Session" />
              <Wifi size={16} title="Network Connected" />
              <Radio size={16} className="animate-pulse" title="System Beacon Active" />
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <main style={{ flexGrow: 1 }}>
          {renderContent()}
        </main>

        {/* HUD Bottom Telemetry Footer */}
        <footer className="hud-footer">
          <div className="hud-footer-left">
            <span>SYSTEM_LOGS: STABLE</span>
            <span>//</span>
            <span>CONNECTION: ENCRYPTED</span>
            <span>//</span>
            <span>ID: 0X88F2</span>
          </div>
          <div>
            <span>MORSE_STREAM: ... --- ...</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>LATENCY: 12MS</span>
            <span>UPTIME: 99.9%</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
