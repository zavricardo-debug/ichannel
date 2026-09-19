import React, { useState } from 'react';
import { ChannelManagerProvider } from './context/ChannelManagerContext';
import Navbar from './components/Navbar';
import MultiCalendarView from './components/MultiCalendar/MultiCalendarView';
import BulkUpdateModal from './components/BulkUpdater/BulkUpdateModal';
import DiscountsView from './components/Discounts/DiscountsView';
import AdminPage from './components/Admin/AdminPage';
import ListingsView from './components/Listings/ListingsView';
import ReservationsView from './components/Reservations/ReservationsView';
import SyncStatusModal from './components/SyncStatusModal';
import CloudflareDeployModal from './components/CloudflareDocs/CloudflareDeployModal';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('calendar');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Global Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'calendar' && (
          <MultiCalendarView onOpenBulkModal={() => setIsBulkModalOpen(true)} />
        )}
        {currentTab === 'discounts' && <DiscountsView />}
        {currentTab === 'admin' && (
          <AdminPage onOpenDeployModal={() => setIsDeployModalOpen(true)} />
        )}
        {currentTab === 'listings' && <ListingsView />}
        {currentTab === 'reservations' && <ReservationsView />}
      </main>

      {/* Modals & Overlays */}
      <SyncStatusModal />
      <BulkUpdateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
      <CloudflareDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ChannelManagerProvider>
      <MainApp />
    </ChannelManagerProvider>
  );
}
