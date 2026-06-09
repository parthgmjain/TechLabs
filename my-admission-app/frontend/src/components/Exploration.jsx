import { useState } from 'react';

const THEMES = [
  {
    id: 0,
    name: "Feelings",
    emoji: "🌊",
    color: "rgba(167,133,254,.13)",
    accent: "#A785FE",
    tagline: "Your emotional relationship with the future",
    desc: "Not what you plan — how the whole question of what next actually sits with you.",
    questions: [
      "Before we get into subjects or programmes — how does the whole question of what next sit with you right now? Not what you're planning. Just how you actually feel about it.",
      "When you actually picture yourself five years from now — in a job, any job — what's the first feeling that comes up? Before you edit it."
    ]
  },
  {
    id: 1,
    name: "Money",
    emoji: "💰",
    color: "rgba(214,239,114,.22)",
    accent: "#8FA800",
    tagline: "What enough actually looks like for you",
    desc: "Security, ambition, freedom — where does money fit in the picture you want?",
    questions: [
      "When you imagine a life that feels okay financially — not rich, just okay — what does that look like day-to-day? House, time, freedom — what matters?",
      "Is money something you're actively building your choices around, or more in the background?"
    ]
  },
  {
    id: 2,
    name: "Passion",
    emoji: "🔥",
    color: "rgba(234,169,203,.18)",
    accent: "#C94B8A",
    tagline: "What pulls your attention without being told to",
    desc: "The things you read, watch, or think about when nobody asked you to.",
    questions: [
      "What's something you find yourself reading about, watching, or thinking about when nobody's asked you to? Not what you're good at — what pulls your attention without you being told it should?",
      "Has that been there for a while, or did it show up more recently? When you're in it — what is it that actually feels good about it?"
    ]
  },
  {
    id: 3,
    name: "Talents",
    emoji: "⚡",
    color: "rgba(83,124,222,.12)",
    accent: "#537CDE",
    tagline: "What others naturally trust you with",
    desc: "Not what you're supposed to be good at — what do people actually rely on you for?",
    questions: [
      "What do people come to you for? Not what you're supposed to be good at — what do the people around you actually trust you with?",
      "When you do that thing — does it feel like effort, or more like you're just doing something obvious that others seem to find hard?"
    ]
  },
  {
    id: 4,
    name: "Work Style",
    emoji: "🧩",
    color: "rgba(0,182,92,.11)",
    accent: "#00B65C",
    tagline: "How you operate when it actually feels right",
    desc: "Alone or with others. Structured or figuring it out. Stable or constantly new.",
    questions: [
      "Think about a time you were working on something and it felt good. School, home, doesn't matter. Were you alone or with others? Was it structured or were you figuring it out as you went?",
      "Do you tend to want to see the full picture before you start, or do you prefer to move and adjust?"
    ]
  },
  {
    id: 5,
    name: "Skills",
    emoji: "📐",
    color: "rgba(248,49,28,.08)",
    accent: "#D43020",
    tagline: "What you're genuinely curious to go deeper on",
    desc: "Not what's useful — what kind of problem do you want to understand from the inside?",
    questions: [
      "What's a subject — or a type of problem — you'd want to go deeper on? Not because it's useful, but because you're genuinely curious about what's inside it.",
      "When you get something right in that area — a good essay, a problem solved, something you made — what does that feel like?"
    ]
  },
  {
    id: 6,
    name: "Values",
    emoji: "🧭",
    color: "rgba(83,124,222,.08)",
    accent: "#537CDE",
    tagline: "What would make your work feel worth doing",
    desc: "Impact, craft, recognition, freedom, belonging — what would make it feel real?",
    questions: [
      "If your work felt genuinely worth doing — not just okay, but worth the time — what would that be about? Impact on people, the craft itself, something else?",
      "Is there anything you'd feel bad about doing for money — a line you know you have, even if you haven't fully articulated it?"
    ]
  }
 ];

const Exploration = ({ onClose }) => {
  const [view, setView] = useState('grid');
  const [activeTheme, setActiveTheme] = useState(null);
  const [profile, setProfile] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [exchangeCount, setExchangeCount] = useState(0);

  const openTheme = (theme) => {
    setActiveTheme(theme);
    setMessages([{ role: 'ai', text: theme.questions[0] }]);
    setExchangeCount(0);
    setView('panel');
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    const newCount = exchangeCount + 1;
    setExchangeCount(newCount);
    if (newCount === 1 && activeTheme.questions[1]) {
      setTimeout(() => setMessages(prev => [...prev, { role: 'ai', text: activeTheme.questions[1] }]), 700);
    } else {
      setProfile(prev => ({
        ...prev,
        [activeTheme.id]: { responses: [...(prev[activeTheme.id]?.responses || []), input], complete: true }
      }));
      setTimeout(() => setMessages(prev => [...prev, { role: 'ai', text: `✓ ${activeTheme.name} noted — your profile is building up.`, isDone: true }]), 700);
    }
  };

  const closePanel = () => {
    setView('grid');
    setActiveTheme(null);
    setMessages([]);
  };

  const completedCount = Object.values(profile).filter(p => p.complete).length;

  return (
    <div className="h-full flex flex-col">
      {view === 'grid' && (
        <>
          <div className="pt-6 px-5 pb-2 border-b border-cream-3">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="font-mono text-xs text-ink-3">&larr; Mentor</button>
              <div className="font-serif italic text-lg">Self-Exploration</div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-1 bg-cream-3 rounded-full"><div className="h-full bg-colChat rounded-full" style={{ width: `${(completedCount / 7) * 100}%` }}></div></div>
              <span className="font-mono text-[10px] text-ink-4">{completedCount} of 7 themes explored</span>
            </div>
          </div>
          <div className="p-4 text-sm text-ink-3">Pick a theme that resonates today. Each answer shapes your profile.</div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {THEMES.map(theme => {
              const done = profile[theme.id]?.complete;
              return (
                <div key={theme.id} onClick={() => !done && openTheme(theme)} className={`border border-ink rounded-sm p-3 cursor-pointer ${done ? 'opacity-70' : ''}`} style={{ background: theme.color }}>
                  <div className="text-2xl mb-1">{theme.emoji}</div>
                  <div className="font-serif italic text-lg">{theme.name}</div>
                  <div className="text-xs font-medium mt-1">{theme.tagline}</div>
                  <div className="text-xs text-ink-3 mt-1">{theme.desc}</div>
                  <div className="mt-3 font-mono text-[9px] text-right">{done ? '✓ Explored' : 'Explore →'}</div>
                </div>
              );
            })}
          </div>
          {completedCount > 0 && (
            <div className="mx-4 mb-6 p-4 border border-ink bg-white">
              <div className="font-mono text-[9px] text-colChat mb-2">Your profile so far</div>
              {Object.entries(profile).filter(([_, v]) => v.complete).map(([id, data]) => {
                const theme = THEMES.find(t => t.id == id);
                const preview = data.responses.join(' · ').slice(0, 180);
                return (
                  <div key={id} className="border-l-2 pl-2 mb-2" style={{ borderLeftColor: theme.accent }}>
                    <div className="font-mono text-[9px]">{theme.emoji} {theme.name}</div>
                    <div className="text-xs text-ink-3">{preview}…</div>
                  </div>
                );
              })}
              <button onClick={() => alert('Saved to profile!')} className="w-full mt-3 bg-colChat text-ink py-2 rounded-pill font-mono text-xs">Save to Ankr →</button>
            </div>
          )}
        </>
      )}

      {view === 'panel' && activeTheme && (
        <>
          <div className="pt-6 px-5 pb-2 border-b border-cream-3">
            <div className="flex items-center gap-3">
              <button onClick={closePanel} className="font-mono text-xs text-ink-3">&larr; Themes</button>
              <div className="font-serif italic text-lg">{activeTheme.emoji} {activeTheme.name}</div>
            </div>
          </div>
          <div className="p-4 text-sm text-ink-3 border-b border-cream-3"><strong>{activeTheme.emoji} {activeTheme.name}</strong> — {activeTheme.tagline}</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-ink text-white' : 'bg-white border border-cream-3'}`}>
                  <p className={msg.role === 'ai' ? 'font-serif italic text-sm' : 'text-sm'}>{msg.text}</p>
                  {msg.isDone && <button onClick={closePanel} className="mt-2 bg-ink text-white px-4 py-1 rounded-pill text-xs">Back to themes</button>}
                </div>
              </div>
            ))}
          </div>
          {!messages.some(m => m.isDone) && (
            <div className="p-3 border-t border-cream-3 bg-white">
              <div className="flex gap-2 items-end border border-ink rounded-sm p-2 bg-cream-2">
                <textarea rows="1" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} className="flex-1 bg-transparent border-none outline-none resize-none text-sm" placeholder="Type your reply…"></textarea>
                <button onClick={sendMessage} className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center">→</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Exploration;