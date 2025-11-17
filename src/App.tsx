import React from "react";
import { useAuth } from "./contexts/AuthContext";
import LoginForm from "./components/auth/LoginForm";
import TeacherDashboard from "./components/dashboard/TeacherDashboard";
import StudentDashboard from "./components/dashboard/StudentDashboard";

const App: React.FC = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  // Not logged in → show login page
  if (!user || !role) return <LoginForm />;

  // Logged in → load respective dashboard
  return role === "teacher" ? (
    <TeacherDashboard user={user} />
  ) : (
    <StudentDashboard user={user} />
  );
};

export default App;
