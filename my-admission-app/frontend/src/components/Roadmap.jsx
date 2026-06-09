// src/components/Roadmap.jsx
import { useState, useEffect, useMemo } from 'react';
import { getRecommendations } from '../services/api';
import { useProgrammes } from './context/ProgrammesContext';

const MILESTONE_STEPS = [
  { step: 'Step 01', pathLabel: 'KU path', title: 'Choose extracurricular', body: 'Pick an activity that signals genuine interest in your target field — research assistance, volunteering, or shadowing a professional.', addLabel: 'Choose extracurricular', step2Title: null },
  { step: 'Step 01', pathLabel: 'CBS path', title: 'Join an organisation', body: 'Model UN, student council, or work experience. Demonstrates structure and collaboration — valued by business and social science programmes.', addLabel: 'Join an organisation', step2Title: 'Apply Jun 2028', step2Body: 'Applications open in March. You\'ll need final grades plus a short motivation letter.', step2AddLabel: 'Draft motivation letter' },
  { step: 'Step 01', pathLabel: 'Gap year', title: 'Gap year · Travel', body: 'A structured year abroad building language skills, volunteering, or working in a relevant field.', addLabel: null },
];

const Roadmap = ({ userData, thisWeekItems, onAddToRoadmap }) => {
  const { getProgrammeById } = useProgrammes();
  const [openNodes, setOpenNodes] = useState({});
  const [programmes, setProgrammes] = useState([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userGpa = useMemo(() => {
    const grades = userData?.grades || {};
    const vals = Object.values(grades).filter(v => v !== '' && !isNaN(parseFloat(v)));
    if (vals.length === 0) return null;
    return parseFloat((vals.reduce((a,b) => a + parseFloat(b), 0) / vals.length).toFixed(1));
  }, [userData?.grades]);

  useEffect(() => {
    const query = [userData?.workType, userData?.interest_tags].filter(Boolean).join(', ');
    if (!query) { setLoading(false); return; }
    setError(null);
    getRecommendations(query, 3)
      .then(res => {
        const recs = res.recommendations || [];
        const resolved = recs.slice(0,3).map(rec => {
          const full = getProgrammeById(rec.program_id);
          return full ? { id: full.id, score: rec.score, name: full.name, uni: full.uni, cutoff: full.cutoff } : null;
        });
        while (resolved.length < 3) resolved.push(null);
        setProgrammes(resolved);
      })
      .catch(err => { console.error(err); setError('Could not load recommendations'); })
      .finally(() => setLoading(false));
  }, [userData?.workType, userData?.interest_tags, getProgrammeById]);

 const toggleNode = (nodeId) => {
  setOpenNodes(prev => {
    // If clicking the already open node, close it
    if (prev[nodeId]) {
      return { ...prev, [nodeId]: false };
    }
    // Otherwise close all, then open this one
    const newState = {};
    Object.keys(prev).forEach(key => { newState[key] = false; });
    newState[nodeId] = true;
    return newState;
  });
};

  const addToRoadmap = (text, date) => onAddToRoadmap?.(text, date);

  const prog0 = programmes[0];
  const prog1 = programmes[1];
  const gap0 = (prog0?.cutoff != null && userGpa != null) ? (userGpa - prog0.cutoff).toFixed(1) : null;
  const gap1 = (prog1?.cutoff != null && userGpa != null) ? (userGpa - prog1.cutoff).toFixed(1) : null;
  const fmt = (n) => n == null ? '—' : n > 0 ? `+${n}` : n;
  const difficulty = (gap) => gap >= 0 ? 'In reach' : gap >= -1.0 ? 'Possible' : gap >= -2.5 ? 'Hard reach' : 'Stretch';

  return (
    <div className="bg-cream min-h-screen pb-8">
      <div className="page-header"><div className="page-title font-serif">Roadmap</div></div>
      <div className="page-illo page-illo--sm"><img src="/Photos/Roadmap.svg" alt="" /></div>

      <div className="rmap-status-bar">
        <div><span className="rmap-status-lbl">Where you are</span><span className="rmap-status-val">Gymnasium</span><span className="rmap-status-sub">{userData?.year || 'Year 1'} · Now</span></div>
        <div className="rmap-status-sep"></div>
        <span className="rmap-status-hint">3 paths identified · tap nodes to explore</span>
      </div>

      <div className="rmap-canvas-wrap">
        <div className="rmap-canvas">
          {/* SVG lines – unchanged */}
          <svg className="rmap-lines" width="960" height="430" fill="none">
            <path d="M155,111 V420" stroke="#E8E8E8" strokeWidth="1.5"/>
            <path d="M114,250 H155" stroke="#E8E8E8" strokeWidth="1.5"/>
            <path d="M155,111 H222" stroke="#E8E8E8" strokeWidth="1.5"/>
            <path d="M415,111 H745 V78  H820" stroke="#E8E8E8" strokeWidth="1.5"/>
            <path d="M155,265 H222" stroke="#E8E8E8" strokeWidth="1.5"/>
            <path d="M420,265 H465 V319 H510" stroke="#E8E8E8" strokeWidth="1.5"/>
            <path d="M688,319 H745 V278 H820" stroke="#E8E8E8" strokeWidth="1.5"/>
            <path d="M155,420 H820" stroke="#E8E8E8" strokeWidth="1.5"/>
            <path d="M114,250 H155 V111 H222" stroke="#537CDE" strokeWidth="2" opacity="0.6" strokeDasharray="5 4"/>
            <path d="M415,111 H745 V78  H820" stroke="#537CDE" strokeWidth="1.5" opacity="0.25" strokeDasharray="5 4"/>
          </svg>

          {/* Start node */}
          <div className="rmap-node rmap-node--start" style={{left:'42px',top:'214px'}}>
            <div className="rmap-circle--start transition-all hover:scale-105 duration-200">
              <svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" stroke="#E4E4E4" strokeWidth="3"/><circle cx="24" cy="24" r="17" stroke="#537CDE" strokeWidth="3" strokeDasharray="34 73" strokeLinecap="round" transform="rotate(-90 24 24)"/><text x="24" y="27.5" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#537CDE" fontWeight="600">32%</text></svg>
            </div>
            <span className="rmap-node-lbl">You · now</span>
          </div>

          {/* MS1 - Choose extracurricular */}
          <div className="rmap-node rmap-node--ms transition-all duration-200 hover:scale-[1.02]" style={{left:'222px',top:'82px'}} onClick={() => toggleNode('ms1')}>
            <div className="rmap-pill transition-all hover:shadow-md hover:border-ink/30">
              <span className="rmap-pill-tag">{MILESTONE_STEPS[0].step} · {MILESTONE_STEPS[0].pathLabel}</span>
              <span className="rmap-pill-title">{MILESTONE_STEPS[0].title}</span>
            </div>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 z-20 ${openNodes.ms1 ? 'roadmap-expand-enter' : 'roadmap-expand-exit'}`}>
              <div className="rmap-expand">
                <span className="rmap-ex-badge">What you need</span>
                <span className="rmap-ex-title">{MILESTONE_STEPS[0].title}</span>
                <p className="rmap-ex-body">{MILESTONE_STEPS[0].body}</p>
                {prog0 && <span className="rmap-ex-req">Target GPA: {prog0.cutoff ?? '—'} · Gap: {fmt(gap0)} pts</span>}
                <button className="rmap-ex-add transition-all hover:opacity-90 active:scale-95" onClick={(e) => { e.stopPropagation(); addToRoadmap(MILESTONE_STEPS[0].addLabel, 'This week'); }}>Add to this week →</button>
              </div>
            </div>
          </div>

          {/* Goal node 1 (top) */}
          <div className="rmap-node rmap-node--goal transition-all duration-200 hover:scale-105" style={{left:'820px',top:'44px'}} onClick={() => toggleNode('goal0')}>
            <div className="rmap-goal-blob rmap-goal-blob--ku shadow-md hover:shadow-lg transition-all">
              <span className="rmap-goal-init">{!loading && prog0 ? prog0.uni?.split(' ')[0]?.slice(0,2).toUpperCase() : 'KU'}</span>
            </div>
            <span className="rmap-node-lbl">{!loading && prog0 ? prog0.name?.split(' ')[0] : 'Target'}</span>
            <span className="rmap-status-chip rmap-chip--hard transition-all">{gap0 ? difficulty(parseFloat(gap0)) : '—'}</span>
            <div className={`absolute right-full top-0 mr-4 w-64 z-20 ${openNodes.goal0 ? 'roadmap-expand-enter' : 'roadmap-expand-exit'}`}>
              <div className="rmap-expand rmap-expand--left">
                <span className="rmap-ex-badge">Top target</span>
                <span className="rmap-ex-title">{prog0?.name}</span>
                <span className="rmap-ex-uni">{prog0?.uni}</span>
                <div className="rmap-ex-stats">
                  <div className="rmap-ex-stat"><span className="rmap-ex-stat-val">{prog0?.cutoff ?? '—'}</span><span className="rmap-ex-stat-lbl">Cutoff</span></div>
                  <div className="rmap-ex-stat"><span className="rmap-ex-stat-val rmap-ex-stat-val--warn">{userGpa ?? '—'}</span><span className="rmap-ex-stat-lbl">Yours</span></div>
                  <div className="rmap-ex-stat"><span className="rmap-ex-stat-val">{fmt(gap0)}</span><span className="rmap-ex-stat-lbl">Gap</span></div>
                </div>
                <p className="rmap-ex-body">Your top AI‑matched programme based on your interests and work preferences.</p>
                <span className="rmap-status-chip rmap-chip--hard w-full text-center block">{difficulty(parseFloat(gap0 || 0))}</span>
              </div>
            </div>
          </div>

          {/* MS2 - Join organisation */}
          <div className="rmap-node rmap-node--ms transition-all duration-200 hover:scale-[1.02]" style={{left:'222px',top:'236px'}} onClick={() => toggleNode('ms2')}>
            <div className="rmap-pill transition-all hover:shadow-md hover:border-ink/30">
              <span className="rmap-pill-tag">{MILESTONE_STEPS[1].step} · {MILESTONE_STEPS[1].pathLabel}</span>
              <span className="rmap-pill-title">{MILESTONE_STEPS[1].title}</span>
            </div>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 z-20 ${openNodes.ms2 ? 'roadmap-expand-enter' : 'roadmap-expand-exit'}`}>
              <div className="rmap-expand">
                <span className="rmap-ex-badge">What you need</span>
                <span className="rmap-ex-title">{MILESTONE_STEPS[1].title}</span>
                <p className="rmap-ex-body">{MILESTONE_STEPS[1].body}</p>
                {prog1 && <span className="rmap-ex-req">Target GPA: {prog1.cutoff ?? '—'} · Gap: {fmt(gap1)} pts</span>}
                <button className="rmap-ex-add transition-all hover:opacity-90 active:scale-95" onClick={(e) => { e.stopPropagation(); addToRoadmap(MILESTONE_STEPS[1].addLabel, 'This week'); }}>Add to this week →</button>
              </div>
            </div>
          </div>

          {/* MS3 - Apply (only for middle path) */}
          {MILESTONE_STEPS[1].step2Title && (
            <div className="rmap-node rmap-node--ms transition-all duration-200 hover:scale-[1.02]" style={{left:'510px',top:'290px'}} onClick={() => toggleNode('ms3')}>
              <div className="rmap-pill transition-all hover:shadow-md hover:border-ink/30">
                <span className="rmap-pill-tag">Step 02 · CBS path</span>
                <span className="rmap-pill-title">{MILESTONE_STEPS[1].step2Title}</span>
                <span className="rmap-pill-sub">Deadline: Jun 19, 2028</span>
              </div>
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 z-20 ${openNodes.ms3 ? 'roadmap-expand-enter' : 'roadmap-expand-exit'}`}>
                <div className="rmap-expand rmap-expand--above">
                  <span className="rmap-ex-badge">Deadline</span>
                  <span className="rmap-ex-title">{MILESTONE_STEPS[1].step2Title}</span>
                  <p className="rmap-ex-body">{MILESTONE_STEPS[1].step2Body}</p>
                  <span className="rmap-ex-req">Deadline: Jun 19, 2028 · ~2 years away<br />Open Mar 2028</span>
                  <button className="rmap-ex-add transition-all hover:opacity-90 active:scale-95" onClick={(e) => { e.stopPropagation(); addToRoadmap(MILESTONE_STEPS[1].step2AddLabel, 'Mar 2028'); }}>Add to this week →</button>
                </div>
              </div>
            </div>
          )}

          {/* Goal node 2 (middle) */}
          <div className="rmap-node rmap-node--goal transition-all duration-200 hover:scale-105" style={{left:'820px',top:'244px'}} onClick={() => toggleNode('goal1')}>
            <div className="rmap-goal-blob rmap-goal-blob--cbs shadow-md hover:shadow-lg transition-all">
              <span className="rmap-goal-init">{!loading && prog1 ? prog1.uni?.split(' ')[0]?.slice(0,3).toUpperCase() : 'CBS'}</span>
            </div>
            <span className="rmap-node-lbl">{!loading && prog1 ? prog1.name?.split(' ')[0] : 'Alternative'}</span>
            <span className="rmap-status-chip rmap-chip--possible transition-all">{gap1 ? difficulty(parseFloat(gap1)) : 'Possible'}</span>
            <div className={`absolute right-full top-0 mr-4 w-64 z-20 ${openNodes.goal1 ? 'roadmap-expand-enter' : 'roadmap-expand-exit'}`}>
              <div className="rmap-expand rmap-expand--left">
                <span className="rmap-ex-badge">Alternative target</span>
                <span className="rmap-ex-title">{prog1?.name}</span>
                <span className="rmap-ex-uni">{prog1?.uni}</span>
                <div className="rmap-ex-stats">
                  <div className="rmap-ex-stat"><span className="rmap-ex-stat-val">{prog1?.cutoff ?? '—'}</span><span className="rmap-ex-stat-lbl">Cutoff</span></div>
                  <div className="rmap-ex-stat"><span className="rmap-ex-stat-val rmap-ex-stat-val--warn">{userGpa ?? '—'}</span><span className="rmap-ex-stat-lbl">Yours</span></div>
                  <div className="rmap-ex-stat"><span className="rmap-ex-stat-val">{fmt(gap1)}</span><span className="rmap-ex-stat-lbl">Gap</span></div>
                </div>
                <p className="rmap-ex-body">Your second AI‑matched programme — a different angle on your interests.</p>
                <span className="rmap-status-chip rmap-chip--possible w-full text-center block">{difficulty(parseFloat(gap1 || 0))}</span>
              </div>
            </div>
          </div>

          {/* Gap year node (bottom) */}
          <div className="rmap-node rmap-node--goal transition-all duration-200 hover:scale-105" style={{left:'820px',top:'386px'}} onClick={() => toggleNode('gap')}>
            <div className="rmap-goal-blob rmap-goal-blob--alt shadow-sm hover:shadow-md transition-all">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="7.5" stroke="#AAAAAA" strokeWidth="1.5"/><path d="M11 3.5v15M3.5 11h15" stroke="#CCCCCC" strokeWidth="1" strokeDasharray="2 2.5"/></svg>
            </div>
            <span className="rmap-node-lbl">Gap year</span>
            <span className="rmap-status-chip rmap-chip--alt transition-all">Alternative</span>
            <div className={`absolute right-full top-0 mr-4 w-64 z-20 ${openNodes.gap ? 'roadmap-expand-enter' : 'roadmap-expand-exit'}`}>
              <div className="rmap-expand rmap-expand--left">
                <span className="rmap-ex-badge">Alternative path</span>
                <span className="rmap-ex-title">Gap year · Travel</span>
                <p className="rmap-ex-body">{MILESTONE_STEPS[2].body}</p>
                <span className="rmap-ex-req">No GPA requirement · Flexible timing</span>
                <span className="rmap-status-chip rmap-chip--alt w-full text-center block">Alternative</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rmap-this-week">
        <span className="rmap-tw-label">This week</span>
        <div className="space-y-2">
          {thisWeekItems.map((item, idx) => (
            <div key={idx} className="rmap-tw-item transition-all hover:bg-cream-2 rounded-lg px-2 -mx-2">
              <span className="rmap-tw-dot rmap-tw-dot--active"></span>
              <span className="rmap-tw-text">{item.text}</span>
              <span className="rmap-tw-date font-mono">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;