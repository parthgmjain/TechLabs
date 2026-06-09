// src/components/Home.jsx
import { useState, useMemo } from 'react';

const Home = ({ userData }) => {
  const [checkinVisible, setCheckinVisible] = useState(true);
  const [checkinStep, setCheckinStep] = useState(1);
  const [checkinAnswers, setCheckinAnswers] = useState({});

  // -----------------------------
  // SAFE DATA EXTRACTION
  // -----------------------------
  const grades = userData?.grades || {};
  const targetProgrammes = userData?.selectedProgrammes || [];
  const topTarget = targetProgrammes[0];

  const validGradeValues = useMemo(() => {
    return Object.values(grades)
      .filter(v => v !== '' && !isNaN(parseFloat(v)))
      .map(Number);
  }, [grades]);

  const hasGrades = validGradeValues.length > 0;

  const userGpa = useMemo(() => {
    if (!hasGrades) return null;
    const avg =
      validGradeValues.reduce((a, b) => a + b, 0) /
      validGradeValues.length;
    return parseFloat(avg.toFixed(1));
  }, [validGradeValues, hasGrades]);

  const reachCount = useMemo(() => {
    if (userGpa === null) return null;

    return targetProgrammes.filter(p => {
      if (!p?.cutoff) return false;
      return p.cutoff <= userGpa;
    }).length;
  }, [targetProgrammes, userGpa]);

  const roadmapProgress = useMemo(() => {
    if (!hasGrades || !topTarget?.cutoff) return 0;

    const progress = (userGpa / topTarget.cutoff) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  }, [userGpa, topTarget, hasGrades]);

  const subjectsCount = Object.keys(grades).length;

  const selectCheckin = (step, idx) => {
    setCheckinAnswers(prev => ({ ...prev, [step]: idx }));

    // auto move to next step
    setTimeout(() => {
      if (step === 3) {
        setCheckinVisible(false);  //finish flow
      } else {
        setCheckinStep(s => s + 1);
      }
    }, 150);
  };

  const dismissCheckin = () => setCheckinVisible(false);

  return (
    <div className="bg-cream min-h-screen pb-20 md:pb-0">

      {/* HEADER */}
      <div className="page-header">
        <div className="home-greeting">Good morning.</div>

        {!checkinVisible && (
          <button
            className="checkin-nudge font-mono"
            onClick={() => setCheckinVisible(true)}
          >
            Weekly check-in ↓
          </button>
        )}
      </div>

      {/* POSITION STRIP */}
      <div className="home-position">
        <div>
          <span className="home-pos-label">What you want</span>
          <div className="home-pos-val">
            {userData?.workType || 'Not set yet'}
          </div>
          <div className="home-pos-sub">
            {topTarget
              ? `${topTarget.name?.split(' ')[0]} · ${topTarget.uni?.split(' ')[0] || ''}`
              : 'Add target'}
          </div>
        </div>

        <div className="home-pos-divider"></div>

        <div>
          <span className="home-pos-label">What you can reach</span>

          <div className="home-pos-val">
            {reachCount === null
              ? 'Add grades first'
              : `${reachCount} programme${reachCount !== 1 ? 's' : ''}`}
          </div>

          <div className="home-pos-sub">
            {hasGrades && topTarget
              ? `Gap to ${topTarget.name?.split(' ')[0]}: ${
                  (topTarget.cutoff - userGpa).toFixed(1)
                } pts`
              : 'Add grades & target'}
          </div>
        </div>
      </div>

      {/* CHECK-IN */}
      {checkinVisible && (
        <div className="checkin-card">
          <button className="checkin-dismiss" onClick={dismissCheckin}>
            ×
          </button>

          <span className="checkin-label">Weekly check-in</span>

          {checkinStep === 1 && (
            <div>
              <p className="checkin-q">
                How clear does your direction feel right now?
              </p>

              <div className="checkin-scale">
                {['😶','😕','😐','🙂','😌'].map((e, i) => (
                  <button
                    key={i}
                    className="checkin-opt"
                    onClick={() => selectCheckin(1, i)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {checkinStep === 2 && (
            <div>
              <p className="checkin-q">
                How's your energy for school this week?
              </p>

              <div className="checkin-scale">
                {['😶','😕','😐','🙂','😌'].map((e, i) => (
                  <button
                    key={i}
                    className="checkin-opt"
                    onClick={() => selectCheckin(2, i)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {checkinStep === 3 && (
            <div>
              <p className="checkin-q">
                Do you feel like you belong where you're headed?
              </p>

              <div className="checkin-scale">
                {['😶','😕','😐','🙂','😌'].map((e, i) => (
                  <button
                    key={i}
                    className="checkin-opt"
                    onClick={() => selectCheckin(3, i)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOCUS */}
      <div className="home-focus">
        <span className="home-focus-hd">This week</span>

        <div className="home-focus-row">
          <div style={{ flex: 1 }}>
            <div className="home-focus-task">Book open day at KU</div>
            <div className="home-focus-sub">
              Application · Closes Friday
            </div>
          </div>
          <span className="home-focus-due">3 days</span>
        </div>
      </div>

      {/* CARDS */}
      <div className="home-card-grid">

        {/* ROADMAP */}
        <div
          className="home-card home-card--clay home-card--featured"
          onClick={() => (window.location.hash = '#roadmap')}
        >
          <span className="home-card-num">Roadmap</span>

          <div className="home-card-body">
            <div>
              <div className="home-card-stat">
                {roadmapProgress}%
              </div>

              <div className="home-card-cat">To your goal</div>

              <div className="home-card-meta">
                Next:{' '}
                {topTarget
                  ? `Improve to ${topTarget.cutoff}`
                  : 'Select a target'}
              </div>
            </div>
          </div>

          <div className="home-card-bar">
            <div
              className="home-card-bar-fill"
              style={{ width: `${roadmapProgress}%` }}
            />
          </div>
        </div>

        {/* MENTOR */}
        <div
          className="home-card home-card--dark"
          onClick={() => (window.location.hash = '#chat')}
        >
          <span className="home-card-num">Mentor</span>
          <div className="home-card-stat">1</div>
          <div className="home-card-cat">New message</div>
        </div>

        {/* COMPASS */}
        <div
          className="home-card home-card--mint"
          onClick={() => (window.location.hash = '#compass')}
        >
          <span className="home-card-num">Compass</span>

          <div className="home-card-stat">
            {reachCount === null ? '—' : reachCount}
          </div>

          <div className="home-card-cat">In reach</div>

          <div className="home-card-meta">
            {targetProgrammes.slice(0, 2).map(p =>
              p.name?.split(' ')[0]
            ).join(' · ') || 'No targets'}
          </div>
        </div>

        {/* PROFILE */}
        <div
          className="home-card home-card--light home-card--slim home-card--featured"
          onClick={() => (window.location.hash = '#profile')}
        >
          <div className="home-card-slim-stats">
            <div className="home-card-slim-cell">
              <span className="home-card-slim-val">
                {userGpa ?? '—'}
              </span>
              <span className="home-card-slim-lbl">GPA</span>
            </div>

            <div className="home-card-slim-sep"></div>

            <div className="home-card-slim-cell">
              <span className="home-card-slim-val">14</span>
              <span className="home-card-slim-lbl">Day streak</span>
            </div>

            <div className="home-card-slim-sep"></div>

            <div className="home-card-slim-cell">
              <span className="home-card-slim-val">
                {subjectsCount}
              </span>
              <span className="home-card-slim-lbl">Subjects</span>
            </div>
          </div>

          <span className="home-card-slim-arrow">Profile ↗</span>
        </div>
      </div>
    </div>
  );
};

export default Home;