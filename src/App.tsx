import React from "react";
import { useAuth } from "./contexts/AuthContext";
import LoginForm from "./components/auth/LoginForm";
import TeacherDashboard from "./components/dashboard/TeacherDashboard";
import StudentDashboard from "./components/dashboard/StudentDashboard";

const App: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <LoginForm />;

  const role = user.user_metadata?.role || user.role || (user?.role === 'teacher' ? 'teacher' : 'student');

  return role === "teacher" ? <TeacherDashboard /> : <StudentDashboard user={user} />;
};

export default App;
