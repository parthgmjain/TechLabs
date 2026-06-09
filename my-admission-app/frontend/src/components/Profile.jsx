// src/components/Profile.jsx
import { useState, useMemo } from 'react';
import { saveStudentProfile } from '../services/api';

const Profile = ({ userData, setUserData, onLogout }) => {
  const [privacy, setPrivacy] = useState({ shareSignals: true, includeGrades: true });
  const [editingGrade, setEditingGrade] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const grades = userData?.grades || {};
  const programmes = userData?.selectedProgrammes || [];

  const avgGpa = useMemo(() => {
    const vals = Object.values(grades).filter(v => v !== '' && !isNaN(parseFloat(v)));
    if (vals.length === 0) return '—';
    return (vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(1);
  }, [grades]);

  const syncToBackend = async (updatedData) => {
    try {
      const profile = {
        id: updatedData.id || updatedData.name?.toLowerCase().replace(/\s+/g, '_'),
        name: updatedData.name,
        school: updatedData.school,
        year: updatedData.year,
        interest_tags: updatedData.interest_tags || '',
        motivation_quote: updatedData.motivation_quote || '',
        target_programme_1: updatedData.selectedProgrammes?.[0]?.name || null,
        target_programme_2: updatedData.selectedProgrammes?.[1]?.name || null,
        what_you_want: updatedData.workType || null,
        gpa: (() => {
          const vals = Object.values(updatedData.grades || {}).filter(v => v !== '' && !isNaN(parseFloat(v)));
          return vals.length ? parseFloat((vals.reduce((a,b) => a + parseFloat(b),0)/vals.length).toFixed(2)) : null;
        })(),
      };
      await saveStudentProfile(profile);
    } catch (err) { console.error('Failed to sync profile:', err); }
  };

  const persistLocally = (updatedData) => {
    const users = JSON.parse(localStorage.getItem('ankr_users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('ankr_current_user') || '{}');
    const index = users.findIndex(u => u.email === currentUser.email);
    if (index !== -1) users[index].profileData = updatedData;
    else users.push({ email: currentUser.email, profileData: updatedData });
    localStorage.setItem('ankr_users', JSON.stringify(users));
    setUserData(updatedData);
  };

  const saveChanges = (updatedData) => { persistLocally(updatedData); syncToBackend(updatedData); };

  const startEdit = (subject, val) => { setEditingGrade(subject); setEditingValue(String(val)); };
  const confirmEdit = (subject) => {
    const parsed = parseFloat(editingValue);
    if (isNaN(parsed) || parsed < 0 || parsed > 12) return;
    const newGrades = { ...grades, [subject]: parsed };
    saveChanges({ ...userData, grades: newGrades });
    setEditingGrade(null);
  };
  const deleteGrade = (subject) => {
    const newGrades = { ...grades };
    delete newGrades[subject];
    saveChanges({ ...userData, grades: newGrades });
  };
  const removeTarget = (idx) => {
    const newProgs = programmes.filter((_, i) => i !== idx);
    saveChanges({ ...userData, selectedProgrammes: newProgs });
  };

  const togglePill = (key) => setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-cream min-h-screen pb-8">
      <div className="profile-hero">
        <div className="profile-avatar-ring">{userData?.name?.[0]?.toUpperCase() || 'A'}</div>
        <div>
          <div className="profile-hello">Hello, {userData?.name || 'Alex'}.</div>
          <div className="profile-hero-sub">Let's look at where you're at.</div>
          <div className="profile-hero-status"><span className="profile-hero-dot"></span>{userData?.year || 'Y1'} · {userData?.school || 'Rysensteen Gymnasium'}</div>
        </div>
        <img src="/Photos/Profile%20page.svg" className="profile-hero-illo" alt="" />
      </div>

      <div className="profile-stats">
        <div className="profile-stat-item"><span className="profile-stat-tag">GPA</span><span className="profile-stat-num">{avgGpa}</span><span className="profile-stat-lbl">Your average</span></div>
        <div className="profile-stat-item"><span className="profile-stat-tag">Target</span><span className="profile-stat-num">{programmes.length}</span><span className="profile-stat-lbl">Programmes</span></div>
        <div className="profile-stat-item"><span className="profile-stat-tag">Stage</span><span className="profile-stat-num">{userData?.year || 'Y1'}</span><span className="profile-stat-lbl">Gymnasium</span></div>
      </div>

      <div className="profile-section">
        <div className="profile-section-label font-mono">Personal</div>
        <div className="profile-row"><span className="profile-key">Name</span><span className="profile-value">{userData?.name || 'Alex'}</span></div>
        <div className="profile-row"><span className="profile-key">School</span><span className="profile-value">{userData?.school || 'Rysensteen Gymnasium'}</span></div>
        <div className="profile-row"><span className="profile-key">Year</span><span className="profile-value">{userData?.year || 'Y1'}</span></div>
        <div className="profile-row"><span className="profile-key">Stage</span><span className="profile-value">Gymnasium</span></div>
      </div>

      <div className="profile-section">
        <div className="profile-section-label font-mono">My grades</div>
        {Object.entries(grades).map(([subject, grade]) => (
          <div key={subject} className="grade-list-row">
            <span className="grade-list-subject">{subject}</span>
            {editingGrade === subject ? (
              <>
                <input type="number" min="0" max="12" step="1" value={editingValue} onChange={e => setEditingValue(e.target.value)} className="w-14 px-2 py-0.5 text-center border border-ink/30 rounded-lg font-mono text-sm" autoFocus />
                <div className="grade-list-actions"><button className="grade-edit-btn font-mono" onClick={() => confirmEdit(subject)}>Save</button><button className="grade-edit-btn font-mono" onClick={() => setEditingGrade(null)}>Cancel</button></div>
              </>
            ) : (
              <>
                <span className="grade-list-grade font-mono">{grade}</span>
                <div className="grade-list-actions"><button className="grade-edit-btn font-mono" onClick={() => startEdit(subject, grade)}>Edit</button><button className="grade-edit-btn font-mono" onClick={() => deleteGrade(subject)}>Delete</button></div>
              </>
            )}
          </div>
        ))}
        <div className="grades-updated font-mono">Last updated: today.</div>
      </div>

      <div className="profile-section">
        <div className="profile-section-label font-mono">Target programmes</div>
        {programmes.map((prog, idx) => (
          <div key={idx} className="target-row">
            <div><div className="target-name">{prog.name}</div><div className="alumni-year font-mono">{prog.uni} {prog.cutoff ? `· Q1 ${prog.cutoff}` : ''}</div></div>
            <button className="target-remove" onClick={() => removeTarget(idx)}>×</button>
          </div>
        ))}
        {programmes.length === 0 && <div className="text-ink-3 text-sm">No target programmes selected.</div>}
      </div>

      <div className="profile-section">
        <div className="profile-section-label font-mono">Privacy</div>
        <div className="toggle-row">
          <div className="toggle-text"><div className="toggle-title">Share anonymised signals with counsellor</div><div className="toggle-desc">Your counsellor sees only patterns, not your conversations.</div></div>
          <button className={`toggle-pill ${privacy.shareSignals ? 'on' : ''}`} onClick={() => togglePill('shareSignals')}><div className="toggle-knob"></div></button>
        </div>
        <div className="toggle-row">
          <div className="toggle-text"><div className="toggle-title">Include grades in AI model</div><div className="toggle-desc">Turning this off means suggestions won't reference your grades.</div></div>
          <button className={`toggle-pill ${privacy.includeGrades ? 'on' : ''}`} onClick={() => togglePill('includeGrades')}><div className="toggle-knob"></div></button>
        </div>
      </div>

      <div className="profile-section">
        <button onClick={onLogout} className="w-full bg-clay text-white rounded-pill py-3 font-semibold hover:bg-clay-d transition-all">Log out</button>
      </div>
    </div>
  );
};

export default Profile;