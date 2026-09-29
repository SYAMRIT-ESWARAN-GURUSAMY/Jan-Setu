import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DemoRunnerModal } from './components/DemoRunnerModal';
import { TelegramIngestionModal } from './components/TelegramIngestionModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { DemandClustersPage } from './pages/DemandClustersPage';
import { ClusterDetailPage } from './pages/ClusterDetailPage';
import { PriorityEnginePage } from './pages/PriorityEnginePage';
import { DistrictIntelligencePage } from './pages/DistrictIntelligencePage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { PolicyBriefsPage } from './pages/PolicyBriefsPage';
import { VerificationCenterPage } from './pages/VerificationCenterPage';
import { SystemAuditPage } from './pages/SystemAuditPage';

export function App() {
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-[#0B0F17] text-slate-100 font-sans">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader
            onRunDemo={() => setIsDemoOpen(true)}
            onOpenIngestion={() => setIsIngestionOpen(true)}
          />

          <main className="flex-1 overflow-y-auto">
            <Routes key={refreshKey}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage onRunDemo={() => setIsDemoOpen(true)} />} />
              <Route path="/complaints" element={<ComplaintsPage onOpenIngestion={() => setIsIngestionOpen(true)} />} />
              <Route path="/clusters" element={<DemandClustersPage />} />
              <Route path="/clusters/:id" element={<ClusterDetailPage />} />
              <Route path="/priority" element={<PriorityEnginePage />} />
              <Route path="/districts" element={<DistrictIntelligencePage />} />
              <Route path="/districts/:code" element={<DistrictIntelligencePage />} />
              <Route path="/review" element={<ReviewQueuePage />} />
              <Route path="/briefs" element={<PolicyBriefsPage />} />
              <Route path="/verification" element={<VerificationCenterPage />} />
              <Route path="/audit" element={<SystemAuditPage />} />
            </Routes>
          </main>
        </div>
      </div>

      <DemoRunnerModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onRefreshData={handleRefresh}
      />

      <TelegramIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        onSuccess={() => handleRefresh()}
      />
    </Router>
  );
}

export default App;
