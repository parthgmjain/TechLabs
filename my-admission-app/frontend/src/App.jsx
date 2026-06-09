// src/App.jsx
import { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Onboarding from './components/Onboarding';
import MainApp from './components/MainApp';
import PrivacyPolicy from './components/PrivacyPolicy';
import AboutUs from './components/AboutUs';
import Copyright from './components/Copyright';
// AuthModal is no longer used – we bypass login
import { ProgrammesProvider } from './components/context/ProgrammesContext';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [userData, setUserData] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isCounsellor, setIsCounsellor] = useState(false);

  // Load existing user from localStorage (if any) – but we will bypass auth for demo
  useEffect(() => {
    const currentUserStr = localStorage.getItem('ankr_current_user');
    const expiry = localStorage.getItem('ankr_current_user_expiry');
    if (currentUserStr && expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem('ankr_current_user');
      localStorage.removeItem('ankr_current_user_expiry');
      return;
    }
    if (currentUserStr && (!expiry || Date.now() <= parseInt(expiry))) {
      const user = JSON.parse(currentUserStr);
      const users = JSON.parse(localStorage.getItem('ankr_users') || '[]');
      const fullUser = users.find(u => u.email === user.email);
      if (fullUser && fullUser.profileData) {
        setUserData(fullUser.profileData);
        setHasProfile(true);
      } else if (fullUser) {
        setUserData(null);
        setHasProfile(false);
      }
    }
  }, []);

  // Direct start – no auth modal
  const startOnboarding = () => {
  // Clear any existing user data to ensure a fresh start for each user
  localStorage.removeItem('ankr_current_user');
  localStorage.removeItem('ankr_current_user_expiry');
  localStorage.removeItem('ankr_users'); // optional – removes all users
  // Create a brand new anonymous user
  const tempUser = { email: `demo_${Date.now()}@ankr.local` };
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem('ankr_current_user', JSON.stringify(tempUser));
  localStorage.setItem('ankr_current_user_expiry', expiry.toString());
  setCurrentView('onboarding');
};


  // Complete onboarding – saves profile and moves to app
  const completeOnboarding = (profileData) => {
    const currentUser = JSON.parse(localStorage.getItem('ankr_current_user'));
    if (!currentUser) {
      // Fallback: create a temporary user if missing
      const tempUser = { email: `user_${Date.now()}@temp.local` };
      localStorage.setItem('ankr_current_user', JSON.stringify(tempUser));
      const fullData = { ...tempUser, ...profileData };
      setUserData(fullData);
      setHasProfile(true);
      const users = JSON.parse(localStorage.getItem('ankr_users') || '[]');
      const newUser = { email: tempUser.email, profileData: fullData };
      users.push(newUser);
      localStorage.setItem('ankr_users', JSON.stringify(users));
      setCurrentView('app');
      return;
    }
    const fullData = { ...currentUser, ...profileData };
    setUserData(fullData);
    setHasProfile(true);
    const users = JSON.parse(localStorage.getItem('ankr_users') || '[]');
    const index = users.findIndex(u => u.email === currentUser.email);
    if (index !== -1) {
      users[index].profileData = fullData;
      localStorage.setItem('ankr_users', JSON.stringify(users));
    } else {
      users.push({ email: currentUser.email, profileData: fullData });
      localStorage.setItem('ankr_users', JSON.stringify(users));
    }
    setCurrentView('app');
  };

  const showCounsellor = () => {
    setIsCounsellor(true);
    setUserData({ name: 'Counsellor', isCounsellor: true });
    setCurrentView('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('ankr_current_user');
    localStorage.removeItem('ankr_current_user_expiry');
    setUserData(null);
    setHasProfile(false);
    setIsCounsellor(false);
    setCurrentView('landing');
  };

  const handleNavigateTo = (target) => {
    if (target === 'app') setCurrentView('app');
    else if (target === 'privacy') setCurrentView('privacy');
    else if (target === 'about') setCurrentView('about');
    else if (target === 'copyright') setCurrentView('copyright');
  };

  const goBackToLanding = () => setCurrentView('landing');

  return (
    <ProgrammesProvider>
      {currentView === 'landing' && (
        <Landing
          onStart={startOnboarding}
          onCounsellorClick={showCounsellor}
          hasProfile={hasProfile}
          onNavigateTo={handleNavigateTo}
        />
      )}
      {currentView === 'onboarding' && (
        <Onboarding onComplete={completeOnboarding} />
      )}
      {currentView === 'app' && (
        <MainApp
          userData={userData}
          setUserData={setUserData}
          initialPage={isCounsellor ? 'dashboard' : 'home'}
          isCounsellor={isCounsellor}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'privacy' && <PrivacyPolicy onBack={goBackToLanding} />}
      {currentView === 'about' && <AboutUs onBack={goBackToLanding} />}
      {currentView === 'copyright' && <Copyright onBack={goBackToLanding} />}
    </ProgrammesProvider>
  );
}

export default App;