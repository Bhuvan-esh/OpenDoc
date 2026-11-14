
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const checkBackendHealth = async () => {
  const response = await API.get("/api/health");
  return response.data;
};

// Currently supported by our Phase 1 backend.
export const previewDocument = async (payload) => {
  const response = await API.post(
    "/api/documents/preview",
    payload
  );

  return response.data;
};

// Planned backend endpoint for Phase 2.
export const createDocument = async (payload) => {
  const response = await API.post(
    "/api/documents",
    payload
  );

  return response.data;
};

// Planned backend endpoint for document content.
export const getDocumentContent = async (id, language) => {
  const response = await API.get(
    `/api/documents/${id}/content`,
    {
      params: { lang: language },
    }
  );

  return response.data;
};

// Planned backend endpoint for document-grounded Q&A.
export const askQuestion = async (payload) => {
  const response = await API.post("/api/qa", payload);
  return response.data;
};

// Planned backend endpoint for speech recognition.
export const transcribeAudio = async (formData) => {
  const response = await API.post(
    "/api/speech/transcribe",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export default API;
