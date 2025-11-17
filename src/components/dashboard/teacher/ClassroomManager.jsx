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
  setStudents([]);
  setAttempts([]);

  try {
    const res = await API.get(`/classrooms/full/${c._id}`);

    setStudents(res.data.students || []);
    setAttempts(res.data.tests || []);   // tests assigned to this classroom
  } catch (err) {
    console.warn("Error loading classroom:", err);
  }
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

      {/* LIST */}
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
              onClick={() => setSelected(c)}
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

          <TestManager classroom={selected} />
        </div>
      )}
    </div>
  );
}
