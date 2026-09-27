import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { CommandCenter } from './components/CommandCenter';
import { AIDiagnosticStudio } from './components/AIDiagnosticStudio';
import { FleetExplorer } from './components/FleetExplorer';
import { IncidentsView } from './components/IncidentsView';
import { MemoryBankView } from './components/MemoryBankView';
import { SystemHealthView } from './components/SystemHealthView';
import { NewIncidentModal } from './components/NewIncidentModal';
import { ResolveIncidentModal } from './components/ResolveIncidentModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { MachineDetailModal } from './components/MachineDetailModal';
import type { Machine, Incident, InsightsSummary, SystemHealth } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Data
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [insights, setInsights] = useState<InsightsSummary | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Modal states
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState<boolean>(false);
  const [resolveIncident, setResolveIncident] = useState<Incident | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  // Diagnostic Studio prefill target
  const [diagnoseTargetMachineId, setDiagnoseTargetMachineId] = useState<string | undefined>(undefined);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      const [h, ins, m, inc] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getInsights().catch(() => null),
        api.getMachines().catch(() => []),
        api.getIncidents().catch(() => []),
      ]);
      setHealth(h);
      setInsights(ins);
      setMachines(m);
      setIncidents(inc);
    } catch (err) {
      console.error('Error loading platform data', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleOpenQuickDiagnose = (machineId?: string) => {
    if (machineId) {
      setDiagnoseTargetMachineId(machineId);
    }
    setActiveTab('diagnose');
  };

  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachine(machine);
  };

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handleOpenResolveModal = (incident: Incident) => {
    setResolveIncident(incident);
  };

  const handleDiagnoseFromIncident = (machineId: string, _incident: Incident) => {
    setDiagnoseTargetMachineId(machineId);
    setActiveTab('diagnose');
  };

  const handleIncidentCreated = () => {
    loadData();
    showToast('Incident logged successfully and added to active queue.');
  };

  const handleIncidentResolved = () => {
    loadData();
    showToast('Work order resolved! Permanent fix & lesson indexed in Hindsight memory.');
  };

  const handleSelectIncidentById = async (incId: string) => {
    try {
      const inc = await api.getIncident(incId);
      setSelectedMachine(null);
      setSelectedIncident(inc);
    } catch (err) {
      console.error('Error fetching incident', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#182026] flex selection:bg-[#d36d4e] selection:text-white antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-white border border-[#3e6b5c]/30 text-[#182026] text-xs font-semibold shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-[#3e6b5c] animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <TopNavbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Content View */}
        <main className="flex-1 px-8 py-2">
          {loadingInitial ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
              <div className="w-10 h-10 border-3 border-[#d36d4e]/20 border-t-[#d36d4e] rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-[#717b85]">
                Connecting to BYTE4 REMEMBR Knowledge Core...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <CommandCenter
                  insights={insights}
                  machines={machines}
                  incidents={incidents}
                  onSelectMachine={handleSelectMachine}
                  onSelectIncident={handleSelectIncident}
                  onNavigateToDiagnose={handleOpenQuickDiagnose}
                  onNavigateToIncidents={() => setActiveTab('incidents')}
                  onNavigateToMemory={() => setActiveTab('memory')}
                />
              )}

              {activeTab === 'machines' && (
                <FleetExplorer
                  machines={machines}
                  onSelectMachine={handleSelectMachine}
                  onDiagnoseMachine={handleOpenQuickDiagnose}
                />
              )}

              {activeTab === 'diagnose' && (
                <AIDiagnosticStudio
                  machines={machines}
                  initialMachineId={diagnoseTargetMachineId}
                  onNavigateToMemory={() => setActiveTab('memory')}
                />
              )}

              {activeTab === 'incidents' && (
                <IncidentsView
                  incidents={incidents}
                  machines={machines}
                  onSelectIncident={handleSelectIncident}
                  onOpenResolveModal={handleOpenResolveModal}
                  onDiagnoseIncident={handleDiagnoseFromIncident}
                  onOpenNewIncident={() => setIsNewIncidentOpen(true)}
                />
              )}

              {activeTab === 'memory' && (
                <MemoryBankView machines={machines} />
              )}

              {activeTab === 'insights' && (
                <CommandCenter
                  insights={insights}
                  machines={machines}
                  incidents={incidents}
                  onSelectMachine={handleSelectMachine}
                  onSelectIncident={handleSelectIncident}
                  onNavigateToDiagnose={handleOpenQuickDiagnose}
                  onNavigateToIncidents={() => setActiveTab('incidents')}
                  onNavigateToMemory={() => setActiveTab('memory')}
                />
              )}

              {activeTab === 'settings' && (
                <SystemHealthView health={health} onRefreshHealth={loadData} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        machines={machines}
        onIncidentCreated={handleIncidentCreated}
        onRunDiagnosisWithIncident={(machId) => handleOpenQuickDiagnose(machId)}
      />

      <ResolveIncidentModal
        isOpen={!!resolveIncident}
        onClose={() => setResolveIncident(null)}
        incident={resolveIncident}
        onIncidentResolved={handleIncidentResolved}
      />

      <IncidentDetailModal
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        incident={selectedIncident}
        onOpenResolve={handleOpenResolveModal}
        onDiagnose={handleDiagnoseFromIncident}
      />

      <MachineDetailModal
        isOpen={!!selectedMachine}
        onClose={() => setSelectedMachine(null)}
        machine={selectedMachine}
        onDiagnose={(mId) => handleOpenQuickDiagnose(mId)}
        onSelectIncidentById={handleSelectIncidentById}
      />
    </div>
  );
}

export default App;
