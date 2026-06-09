// src/components/Mentor.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { useProgrammes } from './context/ProgrammesContext';

const Mentor = ({ userData, onOpenExploration, onAddToRoadmap }) => {
  const { getProgrammeById } = useProgrammes();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const targetProg = userData?.selectedProgrammes?.[0];
  const targetFull = targetProg?.id ? getProgrammeById(targetProg.id) : null;

  // ---------------- GPA ----------------
  const userGpa = useMemo(() => {
    const grades = userData?.grades || {};
    const vals = Object.values(grades).filter(v => v !== '' && !isNaN(parseFloat(v)));
    return vals.length
      ? parseFloat((vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1))
      : null;
  }, [userData?.grades]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'ai',
          text: `Hey ${userData?.name || 'there'}. What’s on your mind today?`,
          time: getTime()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ---------------- 1. RULE ENGINE ----------------
  const ruleEngine = (text) => {
    const t = text.toLowerCase();

    if (t.match(/^(hi|hello|hey)/)) {
      return `Hey — do you want to talk about your target programme or your grades first?`;
    }

    if (t.includes('cutoff') || t.includes('admission')) {
      if (!targetProg || !userGpa) {
        return `I need your target programme + grades to estimate admission chances properly.`;
      }

      const gap = (targetProg.cutoff - userGpa).toFixed(1);

      return gap > 0
        ? `You're ${gap} points below ${targetProg.name}. This is fixable, but we need to focus on high-impact subjects.`
        : `You're above the cutoff for ${targetProg.name}. Now it's about subject alignment and competitiveness.`;
    }

    if (t.includes('stress') || t.includes('confused')) {
      return null; // let AI handle this
    }

    return null;
  };

  // ---------------- 2. BUILD CONTEXT ----------------
  const buildContext = (userMsg) => {
    const grades = userData?.grades || {};

    return `
User name: ${userData?.name}
Work type: ${userData?.workType}
Target: ${targetProg?.name} (${targetProg?.cutoff})
GPA: ${userGpa}
Subjects: ${Object.keys(grades).join(', ')}
Reflection: ${userData?.reflection || ''}
User message: ${userMsg}

Rules:
- Be a calm academic mentor
- Give actionable advice
- Reference GPA, cutoff, subjects when relevant
- Be concise but insightful
`;
  };

  // ---------------- 3. AI CALL ----------------
  const callAI = async (userMsg, context) => {
    try {
      const res = await fetch('/my-admission-app/frontend/src/services/api.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context
        })
      });

      const data = await res.json();
      return data.reply;
    } catch (err) {
      console.error(err);
      return "I couldn't process that right now, but we can still figure it out together.";
    }
  };

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;

    setMessages(prev => [
      ...prev,
      { role: 'user', text: userMsg, time: getTime() }
    ]);

    setInput('');
    setLoading(true);

    // 1. Try rule engine first
    const ruleReply = ruleEngine(userMsg);

    if (ruleReply) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: ruleReply, time: getTime() }
        ]);
        setLoading(false);
      }, 400);
      return;
    }

    // 2. AI fallback
    const context = buildContext(userMsg);
    const aiReply = await callAI(userMsg, context);

    setMessages(prev => [
      ...prev,
      { role: 'ai', text: aiReply, time: getTime() }
    ]);

    setLoading(false);
  };

  // ---------------- UI ----------------
 return (
    <div className="mentor-page">
      {/* Header */}
      <div className="mentor-header">
        <div className="page-title font-serif">Mentor</div>
      </div>

      {/* Context */}
      <div className="mentor-context">
        <span className="font-mono">
          {targetProg
            ? `${targetProg.name} · cutoff ${targetProg.cutoff} · GPA ${userGpa ?? '—'}`
            : 'No target set'}
        </span>
      </div>

      {/* Chat area */}
      <div className="mentor-chat">
        {messages.map((m, i) => (
          <div key={i} className={`msg msg--${m.role}`}>
            <div className="msg-bubble">
              <p className={m.role === 'ai' ? 'font-serif' : ''}>
                {m.text}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg msg--ai">
            <div className="msg-bubble">Thinking...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input fixed bottom */}
      <div className="mentor-input-bar">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e =>
            e.key === 'Enter' && !e.shiftKey && sendMessage()
          }
          placeholder="Talk to your mentor..."
          className="mentor-input"
        />
        <button className="mentor-send" onClick={sendMessage}>
          →
        </button>
      </div>
    </div>
  );
};

export default Mentor;