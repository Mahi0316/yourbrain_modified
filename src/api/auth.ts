import API from "./axiosConfig";

// STUDENTS
export const studentRegister = (payload: { name: string; email: string; password: string }) =>
  API.post("/students/register", payload);

export const studentLogin = (payload: { email: string; password: string }) =>
  API.post("/students/login", payload);

// TEACHERS
export const teacherRegister = (payload: { name: string; email: string; password: string }) =>
  API.post("/teachers/register", payload);

export const teacherLogin = (payload: { email: string; password: string }) =>
  API.post("/teachers/login", payload);
