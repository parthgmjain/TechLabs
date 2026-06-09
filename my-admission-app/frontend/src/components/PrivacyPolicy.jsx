// src/components/PrivacyPolicy.jsx
const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-cream p-8 max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 text-ink-3 hover:text-ink font-mono text-sm">← Back to home</button>
      <h1 className="font-serif italic text-3xl mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-ink-2">
        <p>Last updated: June 2026</p>
        <p>ANKR is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our platform.</p>
        <h2 className="font-serif italic text-xl mt-4">1. Information we collect</h2>
        <p>We collect information you provide directly, such as your name, educational background, grades, and programme preferences. We also collect usage data to improve our AI mentor and roadmap features.</p>
        <h2 className="font-serif italic text-xl mt-4">2. How we use your information</h2>
        <p>Your data is used to generate personalized roadmaps, match you with relevant programmes, and train our AI models (anonymized). We never sell your personal data to third parties.</p>
        <h2 className="font-serif italic text-xl mt-4">3. Data security</h2>
        <p>All data is encrypted in transit and at rest. You can request deletion of your profile at any time.</p>
        <h2 className="font-serif italic text-xl mt-4">4. Contact</h2>
        <p>For privacy concerns, email us at privacy@ankr.ai.</p>
      </div>
    </div>
  );
};
export default PrivacyPolicy;