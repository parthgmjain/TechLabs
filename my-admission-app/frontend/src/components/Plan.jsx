// src/components/Plan.jsx
import React from 'react';

const Plan = ({ userData }) => {
  // Compute GPA from grades (same logic as in Profile)
  const computeGPA = () => {
    const grades = userData?.grades || {};
    const values = Object.values(grades).filter(v => v !== '' && !isNaN(parseFloat(v)));
    if (values.length === 0) return null;
    const avg = values.reduce((a, b) => a + parseFloat(b), 0) / values.length;
    return parseFloat(avg.toFixed(1));
  };

  const userGpa = computeGPA();
  const targetProgrammes = userData?.selectedProgrammes || [];
  const topTarget = targetProgrammes[0];
  const targetCutoff = topTarget?.cutoff;

  // Determine if GPA meets the target cutoff (or is close)
  const meetsCutoff = targetCutoff && userGpa !== null && userGpa >= targetCutoff;
  const gap = targetCutoff && userGpa !== null ? (targetCutoff - userGpa).toFixed(1) : null;

  // Milestones based on user's current stage and data
  const milestones = [];

  // 1. GPA Evaluation
  milestones.push({
    title: "GPA Evaluation",
    subtitle: userGpa ? `${userGpa} avg` : "Not available",
    status: userGpa ? (meetsCutoff ? "done" : "current") : "upcoming",
    desc: userGpa
      ? meetsCutoff
        ? `Your ${userGpa} GPA meets the cutoff for ${topTarget?.name || 'your target'}. Focus on maintaining it.`
        : `Your ${userGpa} GPA is ${gap} points below the cutoff for ${topTarget?.name || 'your target'}. Prioritise grade improvement.`
      : "Add your grades in Profile to see your standing."
  });

  // 2. Subject Strengthening (if Maths B or other required subjects are missing)
  const requiredSubjects = ['Maths B', 'English B', 'Danish A']; // example – could be dynamic
  const missingSubjects = requiredSubjects.filter(sub => 
    !userData?.subjects?.includes(sub) && !Object.keys(userData?.grades || {}).includes(sub)
  );
  if (missingSubjects.length > 0) {
    milestones.push({
      title: "Subject Requirements",
      subtitle: "Missing subjects",
      status: "current",
      desc: `You still need ${missingSubjects.join(', ')} to be eligible for many programmes. Consider supplementary courses.`
    });
  }

  // 3. Quota 2 Preparation (if user is in Year 2 or 3)
  const year = userData?.year || 'Year 1';
  const isUpperYear = year === 'Year 2' || year === 'Year 3' || year === 'HF';
  if (isUpperYear && targetProgrammes.length > 0) {
    milestones.push({
      title: "Quota 2 Strategy",
      subtitle: "Current Phase",
      status: "current",
      desc: `Craft a strong motivation letter and gather relevant experiences (e.g., volunteering, projects) that align with ${topTarget?.name}.`
    });
  }

  // 4. Application Submission (always upcoming)
  milestones.push({
    title: "Application Submission",
    subtitle: "Final Gate • March 15",
    status: "upcoming",
    desc: "Submit your application via optagelse.dk. Ensure all documents and grades are finalised."
  });

  // Helper to get status classes
  const getStatusClasses = (status) => {
    switch (status) {
      case 'done':
        return 'border-mint-d bg-mint';
      case 'current':
        return 'border-clay bg-clay-l animate-pulse';
      default:
        return 'border-ink-4';
    }
  };

  const getDotInner = (status) => {
    if (status === 'done') return <div className="w-1.5 h-1.5 bg-mint-d rounded-full"></div>;
    if (status === 'current') return <div className="w-1.5 h-1.5 bg-clay rounded-full"></div>;
    return null;
  };

  return (
    <div className="flex-1 bg-cream-2">
      {/* Page Header */}
      <div className="p-6 pb-5 border-b border-cream-3 bg-white">
        <span className="font-mono text-[11px] tracking-[.1em] uppercase text-ink-3 block mb-1">Strategy</span>
        <h1 className="font-serif italic text-2xl text-ink">Admission Roadmap</h1>
      </div>

      {/* Overview Metric Strip */}
      <div className="flex items-center gap-5 p-4 border-b border-cream-3 bg-white">
        <div>
          <span className="font-mono text-[9px] tracking-wider uppercase text-ink-3 block mb-1">Target Gate</span>
          <span className="font-serif italic text-xl text-ink leading-none">
            {targetProgrammes.length > 0 ? 'Quota 1/2' : 'Undecided'}
          </span>
        </div>
        <div className="w-[1px] h-10 bg-cream-3 shrink-0"></div>
        <div>
          <span className="font-mono text-[9px] tracking-wider uppercase text-ink-3 block mb-1">Preparation Confidence</span>
          <span className="font-mono text-xs text-mint-d font-medium block">
            {userGpa && meetsCutoff ? 'On Track' : (userGpa ? 'Needs Improvement' : 'Add Grades')}
          </span>
        </div>
      </div>

      {/* Timeline / Branch Layout */}
      <div className="p-6 flex flex-col gap-8 relative">
        {/* Continuous background vertical timeline axis line */}
        <div className="absolute left-[33px] top-10 bottom-10 w-[1.5px] bg-ink-4"></div>

        {milestones.map((node, index) => (
          <div key={index} className="flex gap-4 items-start relative z-10">
            {/* Status Dot Switcher */}
            <div className={`w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shrink-0 mt-1 shadow-sm ${getStatusClasses(node.status)}`}>
              {getDotInner(node.status)}
            </div>

            {/* Metric Content Card */}
            <div className="flex-1 bg-white border border-cream-3 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`text-[14px] font-semibold ${node.status === 'done' ? 'text-ink-2 line-through' : 'text-ink'}`}>
                  {node.title}
                </h3>
                <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3">
                  {node.subtitle}
                </span>
              </div>
              <p className="text-xs text-ink-3 leading-relaxed">{node.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plan;