// src/components/dashboard/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import { supabase } from "../../lib/supabase";
import ClassroomManager from "./teacher/ClassroomManager";
import QuestionManager from "./QuestionManager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TeacherDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [tab, setTab] = useState("classrooms");
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch students
  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*");
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
      setError("Failed to fetch students.");
    }
  };

  // ✅ Fetch classrooms owned by this teacher
  const fetchClassrooms = async () => {
    try {
      const { data, error } = await supabase
        .from("classrooms")
        .select(`
          id, name, code, created_at, teacher_id, enrollments(student_id)
        `)
        .eq("teacher_id", user?.id); // UUID column
      if (error) throw error;
      setClassrooms(data || []);
    } catch (err) {
      console.error("Error fetching classrooms:", err);
      setClassrooms([]);
      setError("Failed to fetch classrooms.");
    }
  };

  // ✅ Fetch test results
  const fetchResults = async () => {
    try {
      const { data, error } = await supabase.from("results").select("*");
      if (error) throw error;
      setResults(data || []);

      if (data?.length > 0) {
        const avg =
          data.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) /
          data.length;
        setAvgScore(Math.round(avg));
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setResults([]);
    }
  };

  // ✅ Load all data
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([fetchStudents(), fetchClassrooms(), fetchResults()])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const getStudentResults = (id) =>
    results.filter((r) => r.user_id === id);

  const chartData = students.map((s) => {
    const res = getStudentResults(s.id);
    const avg =
      res.length > 0
        ? Math.round(
            res.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) /
              res.length
          )
        : 0;
    return {
      name: s.full_name || s.email?.split("@")[0],
      avgScore: avg,
    };
  });

  // ✅ Loading or error state
  
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="text-center py-10 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg mb-10">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.email?.split("@")[0] || "Teacher"} 👩‍🏫
        </h1>
        <p className="text-sm mt-2 opacity-90">
          Manage classrooms, quizzes, and track students’ growth in one place.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white shadow rounded-2xl p-5 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-800">{students.length}</h3>
          </div>

          <div className="bg-white shadow rounded-2xl p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Tests Conducted</p>
            <h3 className="text-2xl font-bold text-gray-800">{results.length}</h3>
          </div>

          <div className="bg-white shadow rounded-2xl p-5 border-l-4 border-pink-500">
            <p className="text-sm text-gray-500">Active Classrooms</p>
            <h3 className="text-2xl font-bold text-gray-800">{classrooms.length}</h3>
          </div>

          <div className="bg-white shadow rounded-2xl p-5 border-l-4 border-emerald-500">
            <p className="text-sm text-gray-500">Average Score</p>
            <h3 className="text-2xl font-bold text-gray-800">{avgScore}%</h3>
          </div>
        </div>

        {/* Display Classrooms */}
        {classrooms.length === 0 ? (
          <p className="text-center text-gray-500">No classrooms found.</p>
        ) : (
          classrooms.map((c) => (
            <div
              key={c.id}
              className="border p-4 rounded-xl flex justify-between items-center mb-2"
            >
              <div>
                <div className="font-semibold text-indigo-700">{c.name}</div>
                <div className="text-xs text-gray-500">Code: {c.code}</div>
                <div className="text-xs text-gray-400">
                  Students: {c.enrollments?.length || 0}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-6 space-x-4">
          {[
            { id: "classrooms", label: "Classrooms" },
            { id: "questions", label: "Manage Questions" },
            { id: "performance", label: "Student Performance" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-full font-semibold transition ${
                tab === t.id
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow p-6">
          {tab === "classrooms" && (
            <div>
              <h2 className="text-xl font-bold mb-3">📘 Manage Classrooms</h2>
              <ClassroomManager teacherId={user?.id} />
            </div>
          )}

          {tab === "questions" && (
            <div>
              <h2 className="text-xl font-bold mb-3">🧩 Manage Questions</h2>
              <QuestionManager />
            </div>
          )}

          {tab === "performance" && (
            <div>
              <h2 className="text-xl font-bold mb-3">📊 Student Performance Overview</h2>
              <div className="h-80 mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3 font-semibold">Student</th>
                      <th className="p-3 font-semibold">Attempts</th>
                      <th className="p-3 font-semibold">Average %</th>
                      <th className="p-3 font-semibold">Last Test</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((s, idx) => {
                      const res = getStudentResults(students[idx]?.id);
                      const last =
                        res.length > 0
                          ? new Date(res[res.length - 1].created_at).toLocaleDateString()
                          : "-";
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50 transition">
                          <td className="p-3 font-medium text-gray-700">{s.name}</td>
                          <td className="p-3">{res.length}</td>
                          <td className="p-3">{s.avgScore}%</td>
                          <td className="p-3">{last}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
