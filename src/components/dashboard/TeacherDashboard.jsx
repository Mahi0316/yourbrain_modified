// src/components/dashboard/TeacherDashboard.jsx

import React, { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import ClassroomManager from "./teacher/ClassroomManager";
import QuestionManager from "./QuestionManager";
import API from "../../api/axiosConfig";

import PerformanceGraph from "./teacher/PerformanceGraph"; // ⭐ NEW IMPORT

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

  const fetchStudents = async () => {
    try {
      const res = await API.get("/teachers/students");
      setStudents(res.data || []);
    } catch (err) {
      console.warn("Fetch students failed", err);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const res = await API.get("/classrooms/teacher");
      setClassrooms(res.data || []);
    } catch (err) {
      console.warn("Fetch classrooms failed", err);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await API.get("/results/teacher/all"); // ⭐ UPDATED ROUTE
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

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([fetchStudents(), fetchClassrooms(), fetchResults()])
      .finally(() => setLoading(false));
  }, [user?._id]);


  const getStudentResults = (id) =>
    results.filter((r) => r.studentId?._id === id);

  const chartData = students.map((s) => {
    const res = getStudentResults(s._id);
    const avg =
      res.length > 0
        ? Math.round(
            res.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / res.length
          )
        : 0;

    return {
      name: s.name || s.email?.split("@")[0],
      avgScore: avg
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <section className="text-center py-10 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg mb-10">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.email?.split("@")[0]}
        </h1>
        <p className="text-sm opacity-90 mt-2">
          Manage classrooms, tests & student progress.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-16">

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold">{students.length}</h3>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Tests Conducted</p>
            <h3 className="text-2xl font-bold">{results.length}</h3>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-pink-500">
            <p className="text-sm text-gray-500">Active Classrooms</p>
            <h3 className="text-2xl font-bold">{classrooms.length}</h3>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-emerald-500">
            <p className="text-sm text-gray-500">Average Score</p>
            <h3 className="text-2xl font-bold">{avgScore}%</h3>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-6 space-x-4">
          {["classrooms", "questions", "performance"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full font-semibold ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border"
              }`}
            >
              {t === "classrooms" && "Classrooms"}
              {t === "questions" && "Manage Questions"}
              {t === "performance" && "Student Performance"}
            </button>
          ))}
        </div>

        {/* CONTENT BOX */}
        <div className="bg-white rounded-2xl shadow-xl p-6">

          {/* CLASSROOMS */}
          {tab === "classrooms" && (
            <ClassroomManager teacherId={user?._id} />
          )}

          {/* QUESTIONS */}
          {tab === "questions" && <QuestionManager />}

          {/* PERFORMANCE TAB */}
          {tab === "performance" && (
            <>
              <h2 className="text-xl font-bold mb-3">📊 Student Performance Overview</h2>

              {/* TOP CHART */}
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

              {/* STUDENT TABLE + GRAPH PER STUDENT */}
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3">Student</th>
                      <th className="p-3">Attempts</th>
                      <th className="p-3">Average %</th>
                      <th className="p-3">Last Test</th>
                      <th className="p-3">View Tests</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((s, idx) => {
                      const res = getStudentResults(s._id);

                      const avgScore =
                        res.length > 0
                          ? Math.round(
                              res.reduce(
                                (sum, r) => sum + (r.score / r.total) * 100,
                                0
                              ) / res.length
                            )
                          : 0;

                      const last =
                        res.length > 0
                          ? new Date(res[res.length - 1].createdAt).toLocaleString()
                          : "-";

                      return (
                        <React.Fragment key={s._id}>
                          <tr className="border-b">
                            <td className="p-3 font-medium">{chartData[idx].name}</td>
                            <td className="p-3">{res.length}</td>
                            <td className="p-3">{avgScore}%</td>
                            <td className="p-3">{last}</td>
                            <td className="p-3 text-indigo-600 cursor-pointer"
                              onClick={() =>
                                setStudents((prev) =>
                                  prev.map((x) =>
                                    x._id === s._id
                                      ? { ...x, showTests: !x.showTests }
                                      : x
                                  )
                                )
                              }
                            >
                              {s.showTests ? "Hide" : "View"}
                            </td>
                          </tr>

                          {/* STUDENT TEST LIST + GRAPH */}
                          {s.showTests && (
                            <tr className="bg-gray-50 border-b">
                              <td colSpan={5} className="p-4">

                                {/* ⭐ NEW GRAPH ADDED HERE ⭐ */}
                                <div className="mb-6">
                                  <PerformanceGraph results={res} />
                                </div>

                                {res.length === 0 ? (
                                  <p className="text-gray-500">No tests attempted.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {res.map((attempt) => (
                                      <div key={attempt._id} className="p-3 bg-white border rounded-xl">
                                        <div className="font-semibold">
                                          {attempt.testId?.title}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          Score: {attempt.score}/{attempt.total} (
                                          {Math.round(
                                            (attempt.score / attempt.total) * 100
                                          )}
                                          %)
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(attempt.createdAt).toLocaleString()}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
