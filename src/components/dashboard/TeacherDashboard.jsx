// src/components/dashboard/TeacherDashboard.jsx

import React, { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import ClassroomManager from "./teacher/ClassroomManager";
import QuestionManager from "./QuestionManager";
import API from "../../api/axiosConfig";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function TeacherDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [tab, setTab] = useState("classrooms");
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // FETCH: Students of Teacher
  // ------------------------------
  const fetchStudents = async () => {
    try {
      const res = await API.get("/teachers/students");
      setStudents(res.data || []);
    } catch (err) {
      console.warn("Fetch students failed", err);
    }
  };

  // ------------------------------
  // FETCH: Classrooms of Teacher
  // ------------------------------
  const fetchClassrooms = async () => {
    try {
      const res = await API.get("/classrooms/teacher");
      setClassrooms(res.data || []);
    } catch (err) {
      console.warn("Fetch classrooms failed", err);
    }
  };
const fetchPerformance = async () => {
  try {
    const res = await API.get("/results/teacher");
    setResults(res.data || []);
  } catch (e) {
    console.warn("Performance load failed:", e);
  }
};

  // ------------------------------
  // FETCH: Results of teacher tests
  // ------------------------------
  const fetchResults = async () => {
    try {
      const res = await API.get("/results/teacher");
      setResults(res.data || []);

      if (res.data?.length > 0) {
        const avg =
          res.data.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) /
          res.data.length;

        setAvgScore(Math.round(avg));
      }
    } catch (err) {
      console.warn("Fetch results failed", err);
    }
  };

  // ------------------------------
  // LOAD ALL
  // ------------------------------
  useEffect(() => {
    if (!user?._id) return;

    Promise.all([fetchStudents(), fetchClassrooms(), fetchResults()])
      .finally(() => setLoading(false));
  }, [user?._id]);

  const getStudentResults = (id) =>
    results.filter((r) => r.studentId === id);

  const chartData = students.map((s) => {
    const res = getStudentResults(s._id);
    const avg =
      res.length > 0
        ? Math.round(
            res.reduce(
              (sum, r) => sum + (r.score / r.total) * 100,
              0
            ) / res.length
          )
        : 0;

    return {
      name: s.name || s.email.split("@")[0],
      avgScore: avg
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* HERO */}
      <section className="text-center py-10 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg mb-10">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.email?.split("@")[0]}
        </h1>
        <p className="text-sm opacity-90 mt-2">
          Manage classrooms, tests & student progress.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-800">{students.length}</h3>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Tests Conducted</p>
            <h3 className="text-2xl font-bold text-gray-800">{results.length}</h3>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-pink-500">
            <p className="text-sm text-gray-500">Active Classrooms</p>
            <h3 className="text-2xl font-bold text-gray-800">{classrooms.length}</h3>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-emerald-500">
            <p className="text-sm text-gray-500">Average Score</p>
            <h3 className="text-2xl font-bold text-gray-800">{avgScore}%</h3>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-6 space-x-4">
          {["classrooms", "questions", "performance"].map((t) => (
            <button
              key={t}
              className={`px-5 py-2 rounded-full font-semibold transition ${
                tab === t
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
              onClick={() => setTab(t)}
            >
              {t === "classrooms" && "Classrooms"}
              {t === "questions" && "Manage Questions"}
              {t === "performance" && "Student Performance"}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {tab === "classrooms" && (
            <ClassroomManager teacherId={user?._id} />
          )}

          {tab === "questions" && <QuestionManager />}

          {tab === "performance" && (
            <>
              <h2 className="text-xl font-bold mb-3">📊 Student Performance</h2>

              <div className="h-80">
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
