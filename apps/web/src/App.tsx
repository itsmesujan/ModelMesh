import React, { useState, useEffect } from 'react';
import {
  OverviewIcon,
  ProvidersIcon,
  AutoConnectIcon,
  ModelsIcon,
  RoutingIcon,
  UsageIcon,
  HealthIcon,
  PoliciesIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  RefreshIcon
} from './components/Icons';

import { OverviewView } from './views/OverviewView';
import { ProvidersView } from './views/ProvidersView';
import { AutoConnectView } from './views/AutoConnectView';
import { ModelsView } from './views/ModelsView';
import { RoutingView } from './views/RoutingView';
import { UsageView } from './views/UsageView';
import { HealthView } from './views/HealthView';
import { PoliciesView } from './views/PoliciesView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState<boolean>(true);

  const [overview, setOverview] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any>(null);
  const [catalog, setCatalog] = useState<any>(null);
  const [policies, setPolicies] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const fetchAllData = async () => {
    try {
      const [ovRes, provRes, tasksRes, catRes, polRes, telRes, hlthRes] = await Promise.all([
        fetch('/api/overview').catch(() => null),
        fetch('/api/providers').catch(() => null),
        fetch('/api/connectors/tasks').catch(() => null),
        fetch('/api/models/catalog').catch(() => null),
        fetch('/api/policies').catch(() => null),
        fetch('/api/telemetry').catch(() => null),
        fetch('/api/health').catch(() => null),
      ]);

      if (ovRes?.ok) setOverview(await ovRes.json());
      if (provRes?.ok) setProviders(await provRes.json());
      if (tasksRes?.ok) setTasks(await tasksRes.json());
      if (catRes?.ok) setCatalog(await catRes.json());
      if (polRes?.ok) setPolicies(await polRes.json());
      if (telRes?.ok) setTelemetry(await telRes.json());
      if (hlthRes?.ok) setHealth(await hlthRes.json());
    } catch (err) {
      console.error('Failed to fetch ModelMesh data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000); // Polling update every 8s
    return () => clearInterval(interval);
  }, []);

  const handleConnectKey = async (providerId: string, apiKey: string) => {
    const res = await fetch('/api/connectors/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, apiKey })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to connect API key');
    }
    const data = await res.json();
    await fetchAllData();
    return data;
  };


  const handleTriggerAutoConnect = async () => {
    const res = await fetch('/api/connectors/autoconnect', { method: 'POST' });
    if (res.ok) {
      const run = await res.json();
      setTasks(run);
      await fetchAllData();
    }
  };

  const handleSelectPolicyMode = async (mode: string) => {
    const res = await fetch('/api/policies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <OverviewIcon size={18} /> },
    { id: 'providers', label: 'Providers', icon: <ProvidersIcon size={18} />, badge: providers.length },
    { id: 'autoconnect', label: 'AutoConnect', icon: <AutoConnectIcon size={18} />, badge: tasks?.attentionCount ? `${tasks.attentionCount} pending` : undefined },
    { id: 'models', label: 'Models', icon: <ModelsIcon size={18} />, badge: catalog?.canonicals?.length },
    { id: 'routing', label: 'Routing', icon: <RoutingIcon size={18} /> },
    { id: 'usage', label: 'Usage', icon: <UsageIcon size={18} /> },
    { id: 'health', label: 'Health', icon: <HealthIcon size={18} /> },
    { id: 'policies', label: 'Policies', icon: <PoliciesIcon size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">M</div>
          <div>
            <div className="brand-title">ModelMesh</div>
            <div className="brand-subtitle">AI Control Plane</div>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-pill success">
              <span className="dot" />
              127.0.0.1:4000
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            {theme === 'dark' ? <SunIcon size={15} /> : <MoonIcon size={15} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div className="page-header-title" style={{ textTransform: 'capitalize' }}>
            {activeTab}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchAllData} title="Refresh data">
              <RefreshIcon size={14} /> Refresh
            </button>
          </div>
        </header>

        <div className="page-container">
          {loading && !overview ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Connecting to local gateway...
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView overview={overview} onNavigate={setActiveTab} onRefresh={fetchAllData} />
              )}
              {activeTab === 'providers' && (
                <ProvidersView providers={providers} onConnectKey={handleConnectKey} onRefresh={fetchAllData} />
              )}
              {activeTab === 'autoconnect' && (
                <AutoConnectView tasks={tasks} onTriggerAutoConnect={handleTriggerAutoConnect} onConnectKey={handleConnectKey} />
              )}
              {activeTab === 'models' && (
                <ModelsView catalog={catalog} />
              )}
              {activeTab === 'routing' && (
                <RoutingView policies={policies} onSelectMode={handleSelectPolicyMode} />
              )}
              {activeTab === 'usage' && (
                <UsageView telemetry={telemetry} />
              )}
              {activeTab === 'health' && (
                <HealthView health={health} onRefresh={fetchAllData} />
              )}
              {activeTab === 'policies' && (
                <PoliciesView policies={policies} />
              )}
              {activeTab === 'settings' && (
                <SettingsView overview={overview} theme={theme} onToggleTheme={toggleTheme} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
