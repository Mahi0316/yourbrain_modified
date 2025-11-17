import API from "./axiosConfig";

export const fetchQuestions = (level: string) =>
  API.get(`/questions/${level}`);

export const createQuestion = (payload: {
  text: string;
  options: string[];
  correctIndex: number;
  level: string;
}) => API.post("/questions", payload);
