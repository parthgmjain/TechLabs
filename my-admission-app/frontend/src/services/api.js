const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/* =========================
   CORE REQUEST WRAPPER
========================= */
async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body || undefined
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "API request failed");
  }

  return res.json();
}

/* =========================
   STUDENT API
========================= */
export async function saveStudentProfile(profile) {
  return request("/api/students", {
    method: "POST",
    body: JSON.stringify(profile)
  });
}

export async function fetchStudentProfile(studentId) {
  return request(`/api/students/${encodeURIComponent(studentId)}`);
}

export async function fetchAllStudents(stage = null) {
  return request(
    stage
      ? `/api/students?stage=${encodeURIComponent(stage)}`
      : "/api/students"
  );
}

/* =========================
   PROGRAMME API
========================= */
export async function fetchProgrammes() {
  return request("/api/programmes");
}

export async function getRecommendations(query, k = 10) {
  return request("/api/recommend", {
    method: "POST",
    body: JSON.stringify({
      query,
      k,
      graph_weight: 0.6
    })
  });
}

/* =========================
   MENTOR (HYBRID AI LAYER)
========================= */
export async function getMentorReply(message, userData) {
  return request("/api/mentor/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      userData
    })
  });
}

export async function getMentorInsights(userData) {
  return request("/api/mentor/insights", {
    method: "POST",
    body: JSON.stringify({ userData })
  });
}

/* =========================
   BACKWARD COMPATIBILITY
========================= */
export const saveOnboardingData = saveStudentProfile;

/* =========================
   DEFAULT EXPORT (KEEP YOUR STYLE)
========================= */
export default {
  getRecommendations,
  saveStudentProfile,
  fetchProgrammes,
  saveOnboardingData,
  fetchStudentProfile,
  fetchAllStudents,
  getMentorReply,
  getMentorInsights
};