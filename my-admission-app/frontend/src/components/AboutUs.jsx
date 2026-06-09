// src/components/AboutUs.jsx
const AboutUs = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-cream p-8 max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 text-ink-3 hover:text-ink font-mono text-sm">← Back to home</button>
      <h1 className="font-serif italic text-3xl mb-6">About ANKR</h1>
      <div className="space-y-4 text-ink-2">
        <p>ANKR was born from a simple observation: students don't lack ambition – they lack clarity.</p>
        <p>We combined AI mentorship, real university data, and personal reflection to build the first roadmap platform that actually respects how students make decisions.</p>
        <p>Our team consists of educators, developers, and former guidance counsellors. We're based in Copenhagen, Denmark, and we're on a mission to make higher education navigation transparent and empowering.</p>
        <p>Questions? Reach out at hello@ankr.ai.</p>
      </div>
    </div>
  );
};
export default AboutUs;