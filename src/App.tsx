import React from 'react';
import { KubeOpsProvider, useKubeOps } from './context/KubeOpsContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { NotificationDrawer } from './components/layout/NotificationDrawer';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { KubernetesPage } from './pages/KubernetesPage';
import { TerraformPage } from './pages/TerraformPage';
import { ConfigManagementPage } from './pages/ConfigManagementPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { JenkinsPage } from './pages/JenkinsPage';
import { SelfHealingPage } from './pages/SelfHealingPage';
import { ArchitecturePage } from './pages/ArchitecturePage';

const AppContent: React.FC = () => {
  const { activePage } = useKubeOps();

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'kubernetes':
        return <KubernetesPage />;
      case 'terraform':
        return <TerraformPage />;
      case 'ansible':
      case 'puppet':
        return <ConfigManagementPage />;
      case 'nagios':
        return <MonitoringPage />;
      case 'jenkins':
        return <JenkinsPage />;
      case 'self-healing':
        return <SelfHealingPage />;
      case 'architecture':
        return <ArchitecturePage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0d14] text-slate-100 font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Header */}
        <Header />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#0a0d14]">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette />

      {/* Slide-over Notifications & Activity Drawer */}
      <NotificationDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <KubeOpsProvider>
      <AppContent />
    </KubeOpsProvider>
  );
};

export default App;
