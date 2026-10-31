/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WingoProvider } from './context/WingoContext';
import { WingoHeader } from './components/WingoHeader';
import { WingoDashboard } from './views/WingoDashboard';
import { AnalyticsView } from './views/AnalyticsView';
import { ApiConfigModal } from './components/ApiConfigModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <WingoProvider>
      <div className="min-h-screen bg-[#06070a] text-[#ede8dc] flex flex-col font-sans">
        <WingoHeader
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1 mx-auto w-full max-w-5xl px-3 py-4 sm:px-6">
          {currentView === 'dashboard' ? (
            <WingoDashboard
              isSettingsOpen={isSettingsOpen}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onCloseSettings={() => setIsSettingsOpen(false)}
            />
          ) : (
            <AnalyticsView />
          )}
        </main>

        <ApiConfigModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </WingoProvider>
  );
}
