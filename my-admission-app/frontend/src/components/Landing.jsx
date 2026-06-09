// src/components/Landing.jsx
import { useState } from 'react';

const Landing = ({ onStart, onCounsellorClick, onNavigateTo, hasProfile = false }) => {
  const [loading, setLoading] = useState(false);

  const handleStartClick = () => {
    if (hasProfile) onNavigateTo?.('app');
    else onStart();
  };

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="w-8 h-8 border-4 border-cream-3 border-t-ink rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-2 flex flex-col">
      <nav className="flex justify-between items-center px-6 py-4 md:px-12 lg:px-20 border-b border-ink/10 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <img src="/Photos/ankr%20logo.svg" className="h-7 md:h-8 w-auto" alt="ankr" />
        <button onClick={handleStartClick} className="bg-ink text-white px-5 py-2 rounded-pill text-sm font-semibold hover:bg-ink-2 transition-all">
          {hasProfile ? 'Go to my dashboard →' : 'Start planning →'}
        </button>
      </nav>

      <section className="px-6 md:px-12 lg:px-20 pt-12 md:pt-20 pb-8 md:pb-12 border-b border-ink/10">
        <div className="max-w-3xl">
          <h1 className="font-serif italic text-4xl md:text-5xl lg:text-6xl text-ink leading-tight mb-6">Figure out where you're applying — before it's urgent.</h1>
          <img src="/Photos/Landing%201.svg" className="w-48 mb-8" alt="" />
          <div className="landing-props space-y-3">
            <p className="landing-prop">Build a roadmap from where you are to the programme you want.</p>
            <p className="landing-prop">See real entrance requirements against your actual grades.</p>
            <p className="landing-prop">An AI mentor that notices things and helps you plan — not a chatbot.</p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-6 md:px-12 lg:px-20 border-b border-ink/10">
        <div className="max-w-5xl mx-auto">
          <div className="how-header text-center font-mono text-[11px] tracking-wider uppercase text-ink-3 mb-8">How it works</div>
          <div className="how-grid grid md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Reflect.', desc: 'Your interests and ambitions, mapped in one clear place.', img: '/Photos/screen-cards/Reflect.svg' },
              { num: '02', title: 'Assess.', desc: 'See which programmes you can actually reach with your grades.', img: '/Photos/screen-cards/Assess.svg' },
              { num: '03', title: 'Plan.', desc: 'A personal roadmap — milestone by milestone, updated as you go.', img: '/Photos/screen-cards/Plan.svg' },
              { num: '04', title: 'Navigate.', desc: 'A mentor that notices things and adapts — not just a chatbot.', img: '/Photos/screen-cards/Navigate.svg' },
            ].map(card => (
              <div key={card.num} className="how-card text-center">
                <div className="how-card-illo mb-3"><img src={card.img} className="how-card-illo-img w-16 h-16 mx-auto" alt="" /></div>
                <span className="how-card-num font-mono text-[12px] text-ink-3 block">{card.num}</span>
                <div className="how-card-title font-medium text-ink">{card.title}</div>
                <div className="how-card-desc text-xs text-ink-3 mt-1">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-6 md:px-12 lg:px-20 text-center">
        <div className="max-w-lg mx-auto">
          <img src="/Photos/Landing%202.svg" className="w-32 mx-auto mb-6" alt="" />
          <h2 className="font-serif italic text-2xl md:text-3xl text-ink mb-4">Start your journey today</h2>
          <p className="text-ink-3 mb-8">Get personalized guidance from AI mentor, build your roadmap, and reach your dream programme.</p>
          <button onClick={handleStartClick} className="w-full bg-ink text-white rounded-pill py-4 font-semibold">{hasProfile ? 'Continue to dashboard →' : 'Start planning →'}</button>
          <button onClick={onCounsellorClick} className="w-full mt-4 text-ink-3 text-sm hover:text-ink font-mono">For counsellors →</button>
        </div>
      </section>

      <footer className="mt-auto border-t border-ink/10 py-6 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4 text-xs font-mono text-ink-3">
          <div className="flex gap-6">
            <button onClick={() => onNavigateTo?.('privacy')}>Privacy Policy</button>
            <button onClick={() => onNavigateTo?.('about')}>About Us</button>
            <button onClick={() => onNavigateTo?.('copyright')}>© Copyright</button>
          </div>
          <div>© {new Date().getFullYear()} ANKR – All rights reserved</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;