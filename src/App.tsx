import React from "react";
import { Routes, Route } from "react-router-dom";

import { useAuth } from "./contexts/AuthContext";
import LoginForm from "./components/auth/LoginForm";
import TeacherDashboard from "./components/dashboard/TeacherDashboard";
import StudentDashboard from "./components/dashboard/StudentDashboard";
import StudentTest from "./components/dashboard/student/StudentTest"; // your test page

const App: React.FC = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={!user ? <LoginForm /> : (role === "teacher" ? <TeacherDashboard user={user} /> : <StudentDashboard user={user} />)} />

      {/* Test Attempt Page */}
      <Route path="/student-test" element={<StudentTest />} />
    </Routes>
  );
};

export default App;
