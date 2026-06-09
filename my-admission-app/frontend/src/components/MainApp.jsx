// src/components/MainApp.jsx
import { useState } from 'react';
import Home from './Home';
import Roadmap from './Roadmap';
import Mentor from './Mentor';
import Exploration from './Exploration';
import Compass from './Compass';
import Profile from './Profile';
import Dashboard from './Dashboard';

const MainApp = ({ userData, setUserData, initialPage = 'home', isCounsellor = false, onLogout }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [thisWeekItems, setThisWeekItems] = useState([
    { text: 'Book KU open day', date: '3 days' }
  ]);

  const addToRoadmap = (text, date) => {
    setThisWeekItems(prev => [...prev, { text, date }]);
  };

  const pages = {
    home: <Home userData={userData} />,
    roadmap: <Roadmap userData={userData} thisWeekItems={thisWeekItems} onAddToRoadmap={addToRoadmap} />,
    chat: <Mentor userData={userData} onOpenExploration={() => setCurrentPage('exploration')} onAddToRoadmap={addToRoadmap} />,
    exploration: <Exploration userData={userData} onClose={() => setCurrentPage('chat')} />,
    compass: <Compass userData={userData} />,
    profile: <Profile userData={userData} setUserData={setUserData} onLogout={onLogout} />,
    dashboard: <Dashboard />,
  };

  // Counsellor sidebar (minimal)
  const counsellorNavItems = [
    { id: 'dashboard', label: 'Cohort', icon: '📊' },
    { id: 'profile', label: 'Settings', icon: '⚙️' },
  ];

  // Student sidebar
  const studentNavItems = [
    { id: 'home', label: 'Home', icon: '⌂' },
    { id: 'roadmap', label: 'Roadmap', icon: '◈' },
    { id: 'chat', label: 'Mentor', icon: '◎' },
    { id: 'compass', label: 'Compass', icon: '✦' },
    { id: 'profile', label: 'Profile', icon: '○' },
  ];

  const navItems = isCounsellor ? counsellorNavItems : studentNavItems;

  // If counsellor and currentPage is not in counsellorNavItems, force to dashboard
  if (isCounsellor && !counsellorNavItems.some(item => item.id === currentPage)) {
    // Use setTimeout to avoid state update during render
    setTimeout(() => setCurrentPage('dashboard'), 0);
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-cream">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-ink/10 shadow-sm z-20">
        <div className="p-6 border-b border-ink/10">
          <img src="/Photos/ankr%20logo.svg" className="h-7 w-auto" alt="ankr" />
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 font-mono text-sm transition-all duration-200 ${
                currentPage === id
                  ? 'bg-ink text-white shadow-md'
                  : 'text-ink-3 hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <span className="text-lg w-6">{icon}</span>
              <span className="font-medium">{label}</span>
              {currentPage === id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"></span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-ink/10 text-center">
          <div className="font-mono text-[9px] text-ink-3">
            {isCounsellor ? 'Counsellor Portal' : 'v2.0 · ANKR'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {pages[currentPage]}
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-ink/10 flex justify-around items-center py-2 pb-3 z-30 shadow-lg">
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setCurrentPage(id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 ${
              currentPage === id
                ? 'text-ink scale-105'
                : 'text-ink-4 hover:text-ink-2'
            }`}
          >
            <span className="text-xl">{icon}</span>
            <span className="font-mono text-[10px] tracking-wide">{label}</span>
            {currentPage === id && (
              <span className="w-1 h-1 rounded-full bg-ink mt-0.5"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MainApp;