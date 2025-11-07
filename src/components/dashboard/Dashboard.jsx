import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import TeacherDashboard from "../components/TeacherDashboard";
import StudentDashboard from "../components/StudentDashboard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
      setRole(data?.role);
    }
  }

  if (!user) return <p>Loading...</p>;
  if (!role) return <p>Role not assigned.</p>;

  return (
    <>
      {role === "teacher" ? <TeacherDashboard user={user} /> : <StudentDashboard user={user} />}
    </>
  );
}
