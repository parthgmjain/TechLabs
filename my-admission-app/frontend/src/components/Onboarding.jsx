// src/components/Onboarding.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { saveOnboardingData, fetchProgrammes } from '../services/api';

const GYMNASIUMS = [
  'Aarhus Katedralskole','Aarhus Tech','Aalborg Katedralskole','Aalborg Studenterkursus',
  'Birkerød Gymnasium','Brøndby Gymnasium','Copenhagen Business Gymnasium',
  'Egaa Gymnasium','Frederiksberg Gymnasium','Frederiksborg Gymnasium',
  'Frederikssund Gymnasium','Gentofte Studenterkursus','Greve Gymnasium',
  'Hellerup Gymnasium','Herning Gymnasium','HF & VUC FYN','HF & VUC Nordsjælland',
  'Horsens Gymnasium','HTX Roskilde','HTX Ballerup','Ikast-Brande Gymnasium',
  'Kolding Gymnasium','Køge Gymnasium','Langkær Gymnasium','Lyngby Gymnasium',
  'Mulernes Legatskole','Nærum Gymnasium','Nørre Gymnasium','Odder Gymnasium',
  'Ordrup Gymnasium','Randers Gymnasium','Roskilde Gymnasium','Rungsted Gymnasium',
  'Sankt Annæ Gymnasium','Silkeborg Gymnasium','Slagelse Gymnasium','Sorø Akademi',
  'Svendborg Gymnasium','Sønderborg Gymnasium','Tornbjerg Gymnasium',
  'Vejle Gymnasium','Viborg Gymnasium & HF','Vordingborg Gymnasium',
  'Zahles Gymnasium','Ålborg Gymnasium','Åros Gymnasium'
];

const SUBJECTS = ['Danish','English','Maths A','Maths B','Physics','Chemistry','Biology','History','Social Studies','Psychology','Media Studies','Art','Music','Physical Education','German','French','Spanish'];

const WORK_TYPES = [
  { label: 'People', desc: 'Teaching, helping, understanding behaviour' },
  { label: 'Ideas', desc: 'Research, analysis, writing, theory' },
  { label: 'Systems', desc: 'Organising, building, solving problems' },
  { label: 'Data', desc: 'Numbers, patterns, evidence, predictions' },
  { label: 'Making', desc: 'Designing, crafting, building things' },
  { label: 'Culture', desc: 'Art, language, media, society' },
];

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState('Year 1');
  const [subjects, setSubjects] = useState([]);
  const [workType, setWorkType] = useState('');
  const [reflection, setReflection] = useState('');
  const [grades, setGrades] = useState({ Danish: '', MathsA: '', English: '', Physics: '' });
  const [selectedProgrammes, setSelectedProgrammes] = useState([]);
  const [synthesisLoading, setSynthesisLoading] = useState(true);
  const [synthesisDone, setSynthesisDone] = useState(false);
  const [gymSearch, setGymSearch] = useState('');
  const [showGymDropdown, setShowGymDropdown] = useState(false);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('');
  const [otherSubject, setOtherSubject] = useState('');
  const [showOtherSubject, setShowOtherSubject] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [allProgrammes, setAllProgrammes] = useState([]);
  const [programmesLoading, setProgrammesLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [recommendedUniversities, setRecommendedUniversities] = useState([]);
  const [uniLoading, setUniLoading] = useState(false);

  const gymDropdownRef = useRef(null);

  const validateStep = useCallback(() => {
    setErrorMsg('');
    switch (step) {
      case 2: if (!name.trim()) { setErrorMsg('Please enter your name.'); return false; } break;
      case 3: if (!school) { setErrorMsg('Please select your school.'); return false; } if (!year) { setErrorMsg('Please select your year.'); return false; } break;
      case 4: if (subjects.length === 0) { setErrorMsg('Please select at least one subject.'); return false; } break;
      case 5: if (!workType) { setErrorMsg('Please select a work type.'); return false; } break;
      case 6: if (!reflection.trim()) { setErrorMsg('Please write a few sentences.'); return false; } break;
      case 9: if (selectedProgrammes.length === 0) { setErrorMsg('Please select at least one target programme.'); return false; } break;
      default: break;
    }
    return true;
  }, [step, name, school, year, subjects, workType, reflection, selectedProgrammes]);

  const next = useCallback(() => { if (validateStep()) setStep(s => Math.min(s + 1, 10)); }, [validateStep]);
  const prev = useCallback(() => { setErrorMsg(''); setStep(s => s - 1); }, []);

  // Load programmes and deduplicate
  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        const data = await fetchProgrammes();
        const uniqueMap = new Map();
        for (const prog of data) if (!uniqueMap.has(prog.id)) uniqueMap.set(prog.id, prog);
        setAllProgrammes(Array.from(uniqueMap.values()));
      } catch (err) { console.error(err); } finally { setProgrammesLoading(false); }
    };
    loadProgrammes();
  }, []);

  useEffect(() => {
    if (step === 9) {
      generateRecommendations();
    }
  }, [step, grades, subjects, workType]);

  useEffect(() => {
    if (step === 10 && !synthesisDone) { setSynthesisLoading(true); setTimeout(() => setSynthesisLoading(false), 3000); setSynthesisDone(true); }
  }, [step, synthesisDone]);

  useEffect(() => {
    if (gymSearch.trim()) {
      const matches = GYMNASIUMS.filter(g => g.toLowerCase().includes(gymSearch.toLowerCase())).slice(0, 6);
      setFilteredGyms(matches);
      setShowGymDropdown(matches.length > 0);
    } else setShowGymDropdown(false);
  }, [gymSearch]);

  useEffect(() => {
    const words = reflection.trim() ? reflection.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [reflection]);

  const selectGymnasium = (gymName) => { setSchool(gymName); setGymSearch(gymName); setShowGymDropdown(false); setErrorMsg(''); };
  const toggleSubject = (sub) => { setSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]); setErrorMsg(''); };
  const selectWorkType = (wt) => { setWorkType(wt === workType ? '' : wt); setErrorMsg(''); };
  const updateGrade = (subject, value) => {
  let grade = value;

  if (grade === '') {
    setGrades(prev => ({
      ...prev,
      [subject]: ''
    }));
    return;
  }

  grade = Number(grade);

  if (grade > 12) grade = 12;
  if (grade < 0) grade = 0;

  setGrades(prev => ({
    ...prev,
    [subject]: grade
  }));
};
  const addGradeRow = () => {
    const customSubject = prompt("Enter subject name");

    if (!customSubject) return;

    const subject = customSubject.trim();

    if (!subject) return;

    if (grades[subject] !== undefined) {
      alert("Subject already exists");
      return;
    }

    setGrades(prev => ({
      ...prev,
      [subject]: ''
    }));

    alert(`${subject} added`);
  };
  const removeGradeRow = (subject) => {
    setGrades(prev => {
      const copy = { ...prev };
      delete copy[subject];
      return copy;
    });
  };
  const toggleProgramme = (prog) => { setSelectedProgrammes(prev => { const exists = prev.some(p => p.id === prog.id); if (exists) return prev.filter(p => p.id !== prog.id); if (prev.length < 3) return [...prev, prog]; alert('You can only select up to 3 programmes.'); return prev; }); setErrorMsg(''); };
  const generateRecommendations = async () => {
    setUniLoading(true);

        try {
          const programmes = await fetchProgrammes();

          const gradeValues = Object.values(grades)
            .filter(v => v !== '' && !isNaN(v))
            .map(Number);

          const avgGrade = gradeValues.length
            ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length
            : 0;

          const scored = programmes.map((programme) => {
            const cutoff = programme.cutoff || 8.0;

            let score = 0;

            // 1. GPA fit (IMPORTANT FIX)
            score += 50 - Math.abs(avgGrade - cutoff) * 8;

            // 2. Subject match
            subjects.forEach((subject) => {
              if (
                programme.name?.toLowerCase().includes(subject.toLowerCase())
              ) {
                score += 15;
              }
            });

            // 3. Interest match
            if (
              programme.name
                ?.toLowerCase()
                .includes(workType.toLowerCase())
            ) {
              score += 20;
            }

            return {
              ...programme,
              score
            };
          });

          const topFive = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

          setRecommendedUniversities(topFive);
        } catch (err) {
          console.error(err);
        } finally {
          setUniLoading(false);
        }
      };

  const handleComplete = async (formData) => {
    const profile = {
      id: formData.name?.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      name: formData.name,
      school: formData.school,
      year: formData.year,
      interest_tags: [formData.workType, ...formData.subjects].filter(Boolean).join(', '),
      motivation_quote: formData.reflection,
      target_programme_1: formData.selectedProgrammes[0]?.name || null,
      target_programme_2: formData.selectedProgrammes[1]?.name || null,
      what_you_want: formData.workType,
      gpa: (() => { const vals = Object.values(formData.grades).filter(v => v !== '' && !isNaN(parseFloat(v))); return vals.length ? parseFloat((vals.reduce((a,b) => a + parseFloat(b),0)/vals.length).toFixed(2)) : null; })(),
    };
    try { await saveOnboardingData(profile); } catch (err) { console.error(err); }
    const currentUser = JSON.parse(localStorage.getItem('ankr_current_user') || '{}');
    const fullData = { ...currentUser, ...formData };
    const users = JSON.parse(localStorage.getItem('ankr_users') || '[]');
    const index = users.findIndex(u => u.email === currentUser.email);
    if (index !== -1) users[index].profileData = fullData; else users.push({ email: currentUser.email, profileData: fullData });
    localStorage.setItem('ankr_users', JSON.stringify(users));
    onComplete(fullData);
  };

  const renderActiveStep = () => {
    const commonClasses = "animate-fade-up";

    switch (step) {
      case 1:
        return (
          <div className={commonClasses}>
            <span className="block font-serif italic text-2xl text-ink text-center mb-6">ankr</span>
            <h2 className="font-serif italic text-3xl leading-tight text-ink text-center mb-8">Let's figure out where you're headed.</h2>
            <img src="/Photos/Onboard%201.svg" className="w-44 mx-auto mb-8" alt="" />
            <button onClick={next} className="w-full bg-ink text-white rounded-pill py-4 font-semibold hover:bg-ink-2 transition-all">Let's go →</button>
          </div>
        );
      case 2:
        return (
          <div className={commonClasses}>
            <h2 className="font-serif italic text-3xl leading-tight text-ink mb-6">What should I call you?</h2>
            <img src="/Photos/Onboard%20name.svg" className="w-44 mx-auto mb-8" alt="" />
            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className="w-full border-b-2 border-ink-4 bg-transparent text-3xl py-2 outline-none focus:border-ink transition-colors mb-8" />
            {errorMsg && <div className="text-clay text-sm mb-4">{errorMsg}</div>}
            <div className="flex gap-3 mt-6">
              <button onClick={prev} className="text-ink-3 hover:text-ink transition-colors">← Back</button>
              <button onClick={next} className="flex-1 bg-ink text-white rounded-pill py-3 font-semibold hover:bg-ink-2 transition-all">Continue →</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className={commonClasses + " space-y-6"}>
            <h2 className="font-serif italic text-3xl leading-tight text-ink">Where are you right now?</h2>
            <img src="/Photos/Onboard%20school.svg" className="w-44 mx-auto" alt="" />
            <div>
              <label className="block font-mono text-[10px] tracking-wide text-ink-3 mb-2">Your school</label>
              <div className="relative">
                <input type="text" placeholder="Search for your gymnasium..." value={gymSearch} onChange={e => setGymSearch(e.target.value)} className="w-full border border-ink/20 rounded-xl py-3 pl-10 pr-4 bg-white focus:outline-none focus:border-ink transition-colors" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">🔍</span>
                {showGymDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-ink/10 rounded-xl shadow-lg max-h-48 overflow-auto" ref={gymDropdownRef}>
                    {filteredGyms.map(g => <div key={g} onClick={() => selectGymnasium(g)} className="px-4 py-2 hover:bg-cream-2 cursor-pointer text-sm">{g}</div>)}
                  </div>
                )}
              </div>
              {school && <div className="mt-2 text-xs font-mono text-mint-d">✓ {school}</div>}
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-wide text-ink-3 mb-2">Your year</label>
              <div className="grid grid-cols-3 gap-2">
                {['Year 1','Year 2','Year 3','HF','Gap year'].map(y => (
                  <div key={y} onClick={() => { setYear(y); setErrorMsg(''); }} className={`text-center py-2 border rounded-lg cursor-pointer transition-all ${year === y ? 'bg-ink text-white border-ink' : 'border-ink/20 hover:border-ink'}`}>{y}</div>
                ))}
              </div>
            </div>
            {errorMsg && <div className="text-clay text-sm">{errorMsg}</div>}
            <div className="flex gap-3 mt-6">
              <button onClick={prev} className="text-ink-3 hover:text-ink transition-colors">← Back</button>
              <button onClick={next} className="flex-1 bg-ink text-white rounded-pill py-3 font-semibold hover:bg-ink-2 transition-all">Continue →</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className={commonClasses + " space-y-6"}>
            <h2 className="font-serif italic text-3xl leading-tight text-ink">What are you studying?</h2>
            <img src="/Photos/Onboard%20subjects.svg" className="w-36 mx-auto" alt="" />
            <input type="text" placeholder="Filter subjects..." value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="w-full border border-ink/20 rounded-xl py-3 px-4 bg-white focus:outline-none focus:border-ink" />
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {SUBJECTS.filter(s =>
                  s.toLowerCase().includes(subjectFilter.toLowerCase())
                ).map(sub => (
                  <span
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all ${
                      subjects.includes(sub)
                        ? 'bg-ink text-white'
                        : 'bg-white border border-ink/20 hover:border-ink'
                    }`}
                  >
                    {sub}
                  </span>
                ))}

                {/* OTHER BUTTON */}
                <span
                  onClick={() => setShowOtherSubject(true)}
                  className="px-3 py-1.5 rounded-full text-sm cursor-pointer bg-white border border-dashed border-ink/40 hover:border-ink"
                >
                  + Other
                </span>
            </div>
            {showOtherSubject && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={otherSubject}
                  onChange={(e) => setOtherSubject(e.target.value)}
                  placeholder="Enter subject..."
                  className="flex-1 border border-ink/20 rounded-xl px-3 py-2 text-sm"
                />
                <button
                 onClick={() => {
                    const subject = otherSubject.trim();

                    if (!subject) return;

                    if (subjects.includes(subject)) {
                      alert("Subject already added");
                      return;
                    }

                    setSubjects(prev => [...prev, subject]);

                    alert(`${subject} added successfully`);

                    setOtherSubject('');
                    setShowOtherSubject(false);
                  }}
                  className="bg-ink text-white px-3 rounded-xl text-sm"
                >
                  Add
                </button>
              </div>
            )}
            {errorMsg && <div className="text-clay text-sm">{errorMsg}</div>}
            <div className="flex gap-3 mt-6">
              <button onClick={prev} className="text-ink-3 hover:text-ink transition-colors">← Back</button>
              <button onClick={next} className="flex-1 bg-ink text-white rounded-pill py-3 font-semibold hover:bg-ink-2 transition-all">Continue →</button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className={commonClasses + " space-y-6"}>
            <h2 className="font-serif italic text-3xl leading-tight text-ink">What kind of work pulls you forward?</h2>
            <img src="/Photos/Onboard%20interest.svg" className="w-36 mx-auto" alt="" />
            <div className="grid grid-cols-2 gap-3">
              {WORK_TYPES.map(wt => (
                <div key={wt.label} onClick={() => selectWorkType(wt.label)} className={`p-3 border rounded-xl cursor-pointer transition-all ${workType === wt.label ? 'border-ink bg-ink/5' : 'border-ink/20 hover:border-ink'}`}>
                  <div className="font-semibold text-sm">{wt.label}</div>
                  <div className="text-xs text-ink-3">{wt.desc}</div>
                </div>
              ))}
            </div>
            {errorMsg && <div className="text-clay text-sm">{errorMsg}</div>}
            <div className="flex gap-3 mt-6">
              <button onClick={prev} className="text-ink-3 hover:text-ink transition-colors">← Back</button>
              <button onClick={next} className="flex-1 bg-ink text-white rounded-pill py-3 font-semibold hover:bg-ink-2 transition-all">Continue →</button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className={commonClasses + " space-y-6"}>
            <h2 className="font-serif italic text-3xl leading-tight text-ink">Look back. What's actually shaped you — school, outside it, in your own head?</h2>
            <img src="/Photos/Onboard%20uncertanty.svg" className="w-44 mx-auto" alt="" />
            <textarea rows={5} placeholder="Think about what you keep coming back to — subjects, activities, anything that's stuck with you." value={reflection} onChange={e => setReflection(e.target.value)} className="w-full border border-ink/20 rounded-xl p-4 bg-white resize-none focus:outline-none focus:border-ink" />
            <div className="text-right text-xs font-mono text-ink-3">{wordCount} {wordCount === 1 ? 'word' : 'words'}</div>
            {errorMsg && <div className="text-clay text-sm">{errorMsg}</div>}
            <div className="flex gap-3 mt-6">
              <button onClick={prev} className="text-ink-3 hover:text-ink transition-colors">← Back</button>
              <button onClick={next} className="flex-1 bg-ink text-white rounded-pill py-3 font-semibold hover:bg-ink-2 transition-all">Continue →</button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className={commonClasses + " space-y-6"}>
            <h2 className="font-serif italic text-3xl leading-tight text-ink">You've told me what you want.</h2>
            <p className="text-ink-3 text-sm">Now let's find out what you can actually reach. Add your grades and I'll show you exactly where you stand against every programme you're considering.</p>
           
            <div className="grid grid-cols-2 gap-4 border border-ink/10 rounded-xl p-4 bg-white">
              <div>
                <div className="font-mono text-[9px] text-ink-3 uppercase mb-1">
                  What you want
                </div>

                <div className="text-sm space-y-1">
                  <div>
                    <strong>Focus:</strong> {workType || 'Not selected'}
                  </div>

                  <div>
                    <strong>Subjects:</strong>{' '}
                    {subjects.length > 0 ? subjects.join(', ') : 'None selected'}
                  </div>

                  <div>
                    <strong>Direction:</strong>{' '}
                    {reflection
                      ? reflection.split(' ').slice(0, 6).join(' ') + '...'
                      : 'No reflection yet'}
                  </div>
                </div>
              </div>
              <div><div className="font-mono text-[9px] text-ink-3 uppercase mb-1">What you can reach</div><div className="text-sm text-ink-3 italic">Add grades<br />to unlock →</div></div>
            </div>

            <button
              onClick={() => {
                // reset academic context before grading
                setSubjects([]);
                setGrades({
                  Danish: '',
                  MathsA: '',
                  English: '',
                  Physics: ''
                });

                setSelectedProgrammes([]);

                setStep(8);
              }}
              className="w-full bg-ink text-white rounded-pill py-3 font-semibold hover:bg-ink-2 transition-all"
            >
              Add my grades →
            </button>
            <button onClick={() => setStep(9)} className="w-full border-2 border-ink rounded-pill py-3 font-medium hover:bg-ink/5 transition-all">Skip for now</button>
            <button onClick={prev} className="text-ink-3 hover:text-ink transition-colors block text-center w-full">← Back</button>
          </div>
        );

      case 8: {
        const reach = (() => {
          const vals = Object.values(grades).filter(v => v !== '' && !isNaN(parseFloat(v)));
          const avg = vals.length ? vals.reduce((a,b) => a + parseFloat(b),0)/vals.length : 0;
          return [6.3,8.0,8.5,9.2,9.3,9.5,9.9,9.9,10.1,10.3,10.4,10.7,10.9,10.9,11.0].filter(t => avg >= t).length;
        })();
        return (
          <div className={commonClasses + " space-y-6"}>
            <h2 className="font-serif italic text-3xl leading-tight text-ink">Add your grades by subject.</h2>
            <img src="/Photos/Onboard%20grades.svg" className="w-36 mx-auto" alt="" />
            <div className="space-y-2">
              {Object.entries(grades).map(([sub, val]) => (
                <div key={sub} className="flex items-center gap-3 py-2 border-b border-ink/10">
                  <span className="flex-1 text-sm">{sub}</span>
                  <input type="number" min="0" max="12" step="1" value={val} onChange={e => updateGrade(sub, e.target.value)} className="w-16 px-2 py-1 text-center border border-ink/20 rounded-lg focus:outline-none focus:border-ink" />
                </div>
              ))}
            </div>
            <button onClick={addGradeRow} className="text-sm text-ink-3 hover:text-ink transition-colors">+ Add subject</button>
            <div className="text-sm font-mono text-mint-d">{reach} programme{reach !== 1 ? 's' : ''} in reach</div>
            <div className="flex gap-3 mt-6">
              <button onClick={prev} className="text-ink-3 hover:text-ink transition-colors">← Back</button>
              <button onClick={() => setStep(9)} className="flex-1 bg-ink text-white rounded-pill py-3 font-semibold hover:bg-ink-2 transition-all">Continue →</button>
            </div>
          </div>
        );
      }
      case 9: {
            if (programmesLoading) {
              return (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-cream-3 border-t-ink rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading programmes...</p>
                </div>
              );
            }

            const filtered = allProgrammes.filter(
              (p) =>
                !programmeFilter ||
                p.name?.toLowerCase().includes(programmeFilter.toLowerCase()) ||
                p.uni?.toLowerCase().includes(programmeFilter.toLowerCase())
            );

            const displayList =
              recommendedUniversities.length > 0
                ? recommendedUniversities
                : filtered;

            return (
              <div className={commonClasses + " space-y-6"}>
                <h2 className="font-serif italic text-3xl leading-tight text-ink">
                  Which programmes are you thinking about?
                </h2>

                <img
                  src="/Photos/Onboard%20target.svg"
                  className="w-36 mx-auto"
                  alt=""
                />

                <p className="text-ink-3 text-sm">
                  Pick 1–3. These become your roadmap destinations.
                </p>

                <input
                  type="text"
                  placeholder="Search programmes..."
                  value={programmeFilter}
                  onChange={(e) => setProgrammeFilter(e.target.value)}
                  className="w-full border border-ink/20 rounded-xl py-3 px-4 bg-white focus:outline-none focus:border-ink"
                />

                <div className="max-h-64 overflow-y-auto space-y-1">
                  {uniLoading ? (
                    <div className="text-sm text-ink-3">
                      Finding your matches...
                    </div>
                  ) : (
                    displayList.map((prog) => {
                      const isSelected = selectedProgrammes.some(
                        (p) => p.id === prog.id
                      );

                      return (
                        <div
                          key={prog.id}
                          onClick={() => toggleProgramme(prog)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "bg-ink/5 border border-ink"
                              : "border border-ink/10 hover:border-ink/30"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              isSelected
                                ? "bg-ink border-ink"
                                : "border-ink-3"
                            }`}
                          />

                          <div>
                            <div className="font-medium text-sm">
                              {prog.name}
                            </div>

                            <div className="text-xs font-mono text-ink-3">
                              {prog.uni}
                              {prog.cutoff
                                ? ` · Q1 ${prog.cutoff}`
                                : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {!uniLoading && displayList.length === 0 && (
                    <div className="text-center text-ink-3 py-8">
                      No programmes found.
                    </div>
                  )}
                </div>

                <div className="text-right text-xs font-mono text-ink-3">
                  {selectedProgrammes.length} of 3 selected
                </div>

                {errorMsg && (
                  <div className="text-clay text-sm">
                    {errorMsg}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={prev}
                    className="text-ink-3 hover:text-ink transition-colors"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={next}
                    className="flex-1 bg-ink text-white rounded-pill py-3 font-semibold hover:bg-ink-2 transition-all"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            );
          }
      case 10: {
        if (synthesisLoading) {
          return (
            <div className="text-center py-12 animate-fade-up">
              <div className="w-12 h-12 border-4 border-cream-3 border-t-ink rounded-full animate-spin mx-auto mb-6"></div>
              <div className="flex items-center justify-center gap-2 text-sm mb-2"><div className="w-2 h-2 rounded-full bg-ink border-2 border-ink"></div><span>Reading your profile</span></div>
              <div className="flex items-center justify-center gap-2 text-sm mb-2"><div className="w-2 h-2 rounded-full border-2 border-ink-3"></div><span>Matching programmes</span></div>
              <div className="flex items-center justify-center gap-2 text-sm mb-2"><div className="w-2 h-2 rounded-full border-2 border-ink-3"></div><span>Building milestones</span></div>
            </div>
          );
        }
        const gradeValues = Object.values(grades)
       .filter(v => v !== '' && !isNaN(parseFloat(v)))
       .map(Number);

    const hasGrades = gradeValues.length > 0;

    const avgGrade = gradeValues.length
      ? (gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length).toFixed(1)
      : null;

    const topCutoff = selectedProgrammes.length
      ? selectedProgrammes[0].cutoff
      : null;

    const gap =
      avgGrade && topCutoff
        ? (topCutoff - parseFloat(avgGrade)).toFixed(1)
        : null;

        return (
          <div className={commonClasses + " space-y-6"}>
            <h2 className="font-serif italic text-3xl leading-tight text-ink">Here's where you stand.</h2>
            
            <div className="bg-cream-2 rounded-xl p-4">
              <div className="font-mono text-[9px] text-ink-3 uppercase mb-1">
                The gap
              </div>

              {!hasGrades ? (
                <div className="text-sm text-ink-3 italic">
                  No grades provided yet — this is based only on your interests and goals.
                </div>
              ) : (
                <>
                  <div className="bg-white border border-ink/10 rounded-xl p-4 mb-3">
                    <div className="font-mono text-[9px] uppercase text-ink-3 mb-2">
                      Strengths
                    </div>

                    <ul className="text-sm space-y-1">
                      <li>✓ Work preference: {workType || 'Not selected'}</li>
                      <li>✓ Subjects: {subjects.length}</li>
                      <li>✓ Reflection: {wordCount} words</li>
                      <li>✓ Programmes: {selectedProgrammes.length}</li>
                    </ul>
                  </div>

                  <p className="text-sm">
                    You’re at <strong>{avgGrade}</strong>.{' '}
                    {topCutoff && (
                      <>
                        Target needs <strong>{topCutoff}</strong>.{' '}
                        Gap: <strong>{gap}</strong>.
                      </>
                    )}
                  </p>
                </>
              )}
            </div>
           
           <div className="bg-white border border-ink/10 rounded-xl p-4">
              <div className="font-mono text-[9px] uppercase text-ink-3 mb-2">
                Areas to Improve
              </div>

              <ul className="text-sm space-y-1">
                {!hasGrades && (
                  <li>• Add grades to unlock academic evaluation.</li>
                )}

                {hasGrades && topCutoff && parseFloat(avgGrade) < topCutoff && (
                  <li>• Academic gap of {gap} points to reach your top programme.</li>
                )}

                {subjects.length === 0 && (
                  <li>• Select subjects for better matching accuracy.</li>
                )}

                {reflection.length < 80 && (
                  <li>• Add more reflection for deeper profiling.</li>
                )}

                {selectedProgrammes.length === 0 && (
                  <li>• Select at least one programme.</li>
                )}
              </ul>
            </div>


            <div className="border border-ink/10 rounded-xl p-4 bg-white">
              <div className="font-mono text-[9px] uppercase text-ink-3 mb-2">
                Profile Evaluation
              </div>

             <p className="text-sm text-ink-2">
                {workType ? (
                  <>
                    Based on your work preference <strong>{workType}</strong>,
                    your profile is currently shaped by{' '}
                    <strong>{subjects.slice(0, 3).join(', ') || 'your selected subjects'}</strong>.
                  </>
                ) : (
                  <>Select a work preference to generate analysis.</>
                )}

                {selectedProgrammes.length > 0 && (
                  <>
                    {' '}Target programme: <strong>{selectedProgrammes[0].name}</strong>.
                  </>
                )}

                {hasGrades ? (
                  <>
                    {' '}Academic average: <strong>{avgGrade}</strong>.
                  </>
                ) : (
                  <>
                    {' '}No academic data provided yet.
                  </>
                )}
              </p>

            </div>
             <div className="bg-white border border-ink/10 rounded-xl p-4 space-y-2 text-sm">
                <div><strong>Name:</strong> {name}</div>
                <div><strong>School:</strong> {school}</div>
                <div><strong>Year:</strong> {year}</div>
                <div><strong>Subjects:</strong> {subjects.join(', ')}</div>
                <div><strong>Work Type:</strong> {workType}</div>
                <div><strong>Reflection:</strong> {reflection}</div>
                <div>
                  <strong>Grades:</strong>{" "}
                  {Object.entries(grades).map(([sub, val]) => (
                    <div
                      key={sub}
                      className="flex items-center gap-3 py-2 border-b border-ink/10"
                    >
                      <span className="flex-1 text-sm">{sub}</span>

                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={val}
                        onChange={(e) => updateGrade(sub, e.target.value)}
                        className="w-16 px-2 py-1 text-center border border-ink/20 rounded-lg"
                      />

                      {!['Danish', 'MathsA', 'English', 'Physics'].includes(sub) && (
                        <button
                          onClick={() => removeGradeRow(sub)}
                          className="text-xs text-red-500"
                        >
                          remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <strong>Selected Universities:</strong>{" "}
                  {selectedProgrammes?.length
                    ? selectedProgrammes.map(p => p.name).join(', ')
                    : 'None selected'}
                </div>
              </div>
              <button onClick={() => handleComplete({ name, school, year, subjects, workType, reflection, grades, selectedProgrammes })} className="w-full bg-ink text-white rounded-pill py-3 font-semibold hover:bg-ink-2 transition-all">This looks right →</button>
            <button onClick={() => setStep(9)} className="w-full border-2 border-ink rounded-pill py-3 font-medium hover:bg-ink/5 transition-all">Change something</button>
          </div>

        );
      }
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-2">
      <div className="h-1 bg-cream-3 mx-4 mt-6 rounded-full overflow-hidden">
        <div className="h-full bg-ink rounded-full transition-all duration-500" style={{ width: `${(step / 10) * 100}%` }} />
      </div>
      <div className="max-w-md mx-auto px-6 py-8">
        {renderActiveStep()}
      </div>
    </div>
  );
};

export default Onboarding;