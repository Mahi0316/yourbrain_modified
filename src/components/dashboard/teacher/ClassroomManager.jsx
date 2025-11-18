// src/components/dashboard/teacher/ClassroomManager.jsx

import React, { useEffect, useState } from "react";
import TestManager from "./TestManager";
import { ClipboardCopy } from "lucide-react";
import API from "../../../api/axiosConfig";

function genCode(len = 7) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return [...Array(len)]
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

export default function ClassroomManager({ teacherId }) {
  const [classrooms, setClassrooms] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null);

  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (teacherId) fetchClassrooms();
  }, [teacherId]);

  async function fetchClassrooms() {
    try {
      const res = await API.get("/classrooms/teacher");
      setClassrooms(res.data || []);
    } catch (err) {
      console.warn("Error fetching classrooms", err);
    }
  }

  async function createClassroom(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Enter a name");

    const code = genCode();

    try {
      await API.post("/classrooms/create", { name, code });
      alert(`Classroom created: ${name}\nCode: ${code}`);
      setName("");
      fetchClassrooms();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function openClassroom(c) {
    setSelected(c);

    try {
      const res = await API.get(`/classrooms/full/${c._id}`);

      setStudents(res.data.students || []);
      setTests(res.data.tests || []);
      setResults(res.data.results || []);

    } catch (err) {
      console.warn("Error loading classroom:", err);
    }
  }

  function getStudentResults(studentId) {
    return results.filter((r) => r.studentId._id === studentId);
  }

  return (
    <div className="bg-white/80 p-6 rounded-2xl shadow-lg border mt-4">
      <h2 className="text-2xl font-bold">📘 Classroom Manager</h2>

      {/* CREATE */}
      <form onSubmit={createClassroom} className="flex gap-3 mt-4">
        <input
          className="flex-1 border p-3 rounded-xl"
          placeholder="Enter classroom name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl shadow">
          Create
        </button>
      </form>

      {/* CLASSROOM LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {classrooms.map((c) => (
          <div
            key={c._id}
            className="bg-gradient-to-br from-indigo-50 to-white border p-4 rounded-xl shadow hover:shadow-md"
          >
            <h3 className="font-bold text-lg">{c.name}</h3>

            <div className="text-sm text-gray-600 flex gap-2 mt-1">
              Code:
              <span className="font-mono bg-gray-100 px-2 rounded">{c.code}</span>
              <ClipboardCopy
                className="text-indigo-600 cursor-pointer"
                size={16}
                onClick={() => navigator.clipboard.writeText(c.code)}
              />
            </div>

            <button
              className="mt-3 text-indigo-600 hover:underline"
              onClick={() => openClassroom(c)}
            >
              Open →
            </button>
          </div>
        ))}
      </div>

      {/* SELECTED CLASSROOM */}
      {selected && (
        <div className="mt-8 border-t pt-4">
          <h3 className="text-xl font-bold">{selected.name}</h3>
          <p className="text-sm text-gray-600">
            Code: <b>{selected.code}</b>
          </p>

          {/* STUDENTS LIST */}
          <div className="mt-6 bg-gray-50 p-4 rounded-xl">
            <h4 className="text-lg font-semibold">👨‍🎓 Students ({students.length})</h4>

            {students.length === 0 && (
              <p className="text-gray-500 mt-2">No students joined yet.</p>
            )}

            {students.map((s) => (
              <div key={s._id} className="border p-3 rounded mt-2">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-600">{s.email}</div>
              </div>
            ))}
          </div>

          {/* STUDENT PERFORMANCE */}
          <div className="mt-6 bg-gray-50 p-4 rounded-xl">
            <h4 className="text-lg font-semibold">📊 Performance</h4>

            {students.map((s) => {
              const myResults = getStudentResults(s._id);

              return (
                <div key={s._id} className="mt-4 border p-3 rounded-xl bg-white">
                  <h5 className="font-semibold text-indigo-700">{s.name}</h5>

                  {myResults.length === 0 ? (
                    <p className="text-gray-500 text-sm">No attempts yet.</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {myResults.map((r) => (
                        <div
                          key={r._id}
                          className="p-3 bg-gray-50 border rounded shadow-sm"
                        >
                          <div className="font-medium">
                            {r.testId?.title || "Test"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Score: {r.score}/{r.total} (
                            {Math.round((r.score / r.total) * 100)}%)
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(r.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* TEST MANAGER */}
          <div className="mt-6">
            <TestManager classroom={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
