/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGame } from '../context/GameContext';
import { Home, Zap, Clock, Cpu, History, TrendingUp, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useGame();

  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'signals', label: 'Signals', icon: Zap },
    { id: '30s', label: '30s', icon: Clock },
    { id: '1m', label: '1m', icon: Clock },
    { id: 'ai', label: 'AI Lab', icon: Cpu },
    { id: 'history', label: 'History', icon: History },
    { id: 'performance', label: 'Stats', icon: TrendingUp },
    { id: 'settings', label: 'API', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d4af37]/25 bg-[#0a0b10]/95 backdrop-blur-2xl px-1 py-1.5 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 transition-all duration-200 select-none ${
                isActive ? 'text-[#f5d77f]' : 'text-[#7e7769] hover:text-[#bbb2a2]'
              }`}
            >
              <div
                className={`relative flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${
                  isActive ? 'scale-110 bg-[#d4af37]/20 text-[#f5d77f]' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#f5d77f] shadow-[0_0_6px_#f5d77f]" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${isActive ? 'font-bold text-[#f5d77f]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
