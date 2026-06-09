// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { fetchAllStudents } from '../services/api';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cohort, setCohort] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchAllStudents();
        setStudents(data);
        const years = [...new Set(data.map(s => s.year).filter(Boolean))];
        setAvailableYears(years);
        if (years.length > 0) setCohort(years[0]);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    const loadFiltered = async () => {
      if (cohort === 'all') return;
      setLoading(true);
      try {
        const data = await fetchAllStudents(cohort);
        setStudents(data);
      } catch (err) {
        console.error('Failed to filter students:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFiltered();
  }, [cohort]);

  const handleReachOut = (studentId) => {
    alert(`Opening contact for student ${studentId}`);
  };

  const getSignal = (student) => {
    const hasTarget = !!(student.target_programme_1 || student.target_programme_2);
    const gpa = student.gpa;
    if (!hasTarget) return { text: 'No target', type: 'med' };
    if (gpa >= 8.0) return { text: 'On track', type: 'low' };
    if (gpa >= 5.0) return { text: 'Needs work', type: 'med' };
    return { text: 'At risk', type: 'high' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalStudents = students.length;
  const noTargetCount = students.filter(s => !s.target_programme_1 && !s.target_programme_2).length;
  const onTrackCount = students.filter(s => getSignal(s).type === 'low').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-800 text-white px-6 py-5 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif italic text-2xl md:text-3xl">Cohort overview</h1>
            <p className="text-slate-300 text-sm mt-1">Monitor student progress and intervene early</p>
          </div>
          <select
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
          >
            <option value="all">All years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 md:p-8">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-800">{totalStudents}</span>
            <span className="text-3xl">👥</span>
          </div>
          <div className="font-mono text-xs text-slate-500 mt-1 uppercase tracking-wide">Total students</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-800">{noTargetCount}</span>
            <span className="text-3xl">🎯</span>
          </div>
          <div className="font-mono text-xs text-slate-500 mt-1 uppercase tracking-wide">No target set</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-800">{onTrackCount}</span>
            <span className="text-3xl">✅</span>
          </div>
          <div className="font-mono text-xs text-slate-500 mt-1 uppercase tracking-wide">On track</div>
        </div>
      </div>

      <div className="mx-6 md:mx-8 mb-8 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-mono text-[11px] text-slate-500 uppercase tracking-wider">ID</th>
                <th className="text-left py-3 px-4 font-mono text-[11px] text-slate-500 uppercase tracking-wider">Target</th>
                <th className="text-left py-3 px-4 font-mono text-[11px] text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="text-left py-3 px-4 font-mono text-[11px] text-slate-500 uppercase tracking-wider">GPA</th>
                <th className="text-left py-3 px-4 font-mono text-[11px] text-slate-500 uppercase tracking-wider">Signal</th>
                <th className="text-left py-3 px-4 font-mono text-[11px] text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No students found for this cohort. Add some via onboarding.</td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const signal = getSignal(student);
                  const targetName = student.target_programme_1
                    ? student.target_programme_1.split('_').slice(1).join(' ').slice(0, 30) || student.target_programme_1
                    : (student.target_programme_2 ? student.target_programme_2.split('_').slice(1).join(' ').slice(0, 30) : 'None');
                  const stage = student.year || student.stage || '—';
                  const gpa = student.gpa != null ? student.gpa.toFixed(1) : '—';
                  return (
                    <tr key={student.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">{student.id || student.student_id}</td>
                      <td className="py-3 px-4 text-slate-600">{targetName}</td>
                      <td className="py-3 px-4 text-slate-600">{stage}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{gpa}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                          signal.type === 'low' ? 'bg-green-100 text-green-700' :
                          signal.type === 'med' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            signal.type === 'low' ? 'bg-green-500' :
                            signal.type === 'med' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                          {signal.text}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleReachOut(student.id || student.student_id)}
                          className="px-3 py-1.5 rounded-md border border-slate-300 text-xs font-mono text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-all"
                        >
                          Reach out
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;