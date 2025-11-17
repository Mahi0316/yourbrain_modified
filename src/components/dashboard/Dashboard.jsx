import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

import TeacherDashboard from "./teacher/TeacherDashboard";
import StudentDashboard from "./student/StudentDashboard";

export default function Dashboard() {
  const { user, role } = useContext(AuthContext);

  if (!user) return <p>Loading...</p>;
  if (!role) return <p>Role not assigned.</p>;

  return (
    <>
      {role === "teacher" ? (
        <TeacherDashboard user={user} />
      ) : (
        <StudentDashboard user={user} />
      )}
    </>
  );
}
