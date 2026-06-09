// src/components/Copyright.jsx
const Copyright = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-cream p-8 max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 text-ink-3 hover:text-ink font-mono text-sm">← Back to home</button>
      <h1 className="font-serif italic text-3xl mb-6">Copyright & Legal</h1>
      <div className="space-y-4 text-ink-2">
        <p>© {new Date().getFullYear()} ANKR. All rights reserved.</p>
        <p>The ANKR name, logo, and all associated designs are trademarks of ANKR ApS.</p>
        <p>All content, including roadmaps, AI‑generated suggestions, and programme data, is protected by copyright law. You may not reproduce, distribute, or create derivative works without written permission.</p>
        <p>Third‑party programme data is sourced from official university admission statistics (ug.dk, optagelse.dk). We strive for accuracy but recommend verifying with the original sources.</p>
      </div>
    </div>
  );
};
export default Copyright;