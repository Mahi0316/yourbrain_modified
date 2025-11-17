import API from "./axiosConfig";

// Teacher creates testroom
export const createClassroom = (payload: {
  title?: string;
  questionIds: string[];
  durationSeconds?: number;
  scheduledAt?: string | null;
}) => API.post("/testrooms/create", payload);

// Student joins by code
export const joinClassroom = (code: string) =>
  API.post("/testrooms/join", { code });

// Fetch specific testroom
export const getClassroom = (id: string) =>
  API.get(`/testrooms/${id}`);

// Student submits test
export const submitTest = (payload: {
  roomId: string;
  answers: { questionId: string; selectedIndex: number }[];
}) => API.post("/testrooms/submit", payload);
