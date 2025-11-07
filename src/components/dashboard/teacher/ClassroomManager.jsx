// src/components/dashboard/teacher/ClassroomManager.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import TestManager from "./TestManager";
import { ClipboardCopy } from "lucide-react";

function genCode(len = 7) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function ClassroomManager({ teacherId }) {
  const [classrooms, setClassrooms] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    if (teacherId) fetchClassrooms();
  }, [teacherId]);

  // Fetch all classrooms of this teacher
  async function fetchClassrooms() {
    setLoading(true);
    const { data, error } = await supabase
      .from("classrooms")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching classrooms:", error);
    } else {
      setClassrooms(data || []);
    }
    setLoading(false);
  }

  // Create a new classroom
  async function createClassroom(e) {
    e.preventDefault();
    if (!teacherId) return alert("⚠️ Teacher not logged in yet!");
    if (!name.trim()) return alert("Enter a classroom name");

    const code = genCode(7);

    const { error } = await supabase.from("classrooms").insert([
      { name, teacher_id: teacherId, code },
    ]);

    if (error) {
      console.error(error);
      return alert("Error creating classroom: " + error.message);
    }

    setName("");
    fetchClassrooms();
    alert(`✅ Classroom "${name}" created!\nCode: ${code}`);
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert("Copied classroom code!");
  };

  // Open a classroom to view students and tests
  async function openClassroom(c) {
    setSelected(c);

    // Fetch joined students
    const { data: studentsData } = await supabase
      .from("classroom_students")
      .select("student_id, joined_at")
      .eq("classroom_id", c.id);
    setStudents(studentsData || []);

    // Fetch attempts
    const { data: tests } = await supabase
      .from("tests")
      .select("id, title")
      .eq("classroom_id", c.id);

    const testIds = (tests || []).map((t) => t.id);

    if (testIds.length) {
      const { data: attemptsData } = await supabase
        .from("test_attempts")
        .select("*, tests(title)")
        .in("test_id", testIds);
      setAttempts(attemptsData || []);
    } else {
      setAttempts([]);
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200 mt-6">
      <h2 className="text-2xl font-bold text-gray-800">📚 Classroom Manager</h2>

      <form onSubmit={createClassroom} className="mt-5 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter classroom name..."
          className="flex-1 p-3 border rounded-xl focus:ring focus:ring-indigo-200 outline-none"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm"
        >
          Create
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          My Classrooms {loading ? "⏳" : `(${classrooms.length})`}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((c) => (
            <div
              key={c.id}
              className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800 text-lg">{c.name}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    Code:{" "}
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <ClipboardCopy
                      size={16}
                      className="cursor-pointer text-indigo-500 hover:text-indigo-700"
                      onClick={() => copyCode(c.code)}
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => openClassroom(c)}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Open →
                </button>
              </div>
            </div>
          ))}
          {classrooms.length === 0 && (
            <div className="text-gray-500 italic">
              No classrooms yet. Create your first one!
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xl font-bold text-gray-800">{selected.name}</h4>
              <p className="text-gray-500 text-sm">
                Classroom Code: <strong>{selected.code}</strong>
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-sm px-4 py-2 border rounded-xl hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
              <h5 className="font-semibold text-gray-700">
                👩‍🎓 Students ({students.length})
              </h5>
              <div className="mt-2 space-y-2 text-sm">
                {students.length === 0 && (
                  <p className="text-gray-400">No students yet.</p>
                )}
                {students.map((s) => (
                  <div key={s.student_id} className="p-2 bg-white border rounded-lg">
                    <div className="font-medium">{s.student_id}</div>
                    <div className="text-xs text-gray-500">
                      Joined: {new Date(s.joined_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
              <h5 className="font-semibold text-gray-700">🧾 Test Attempts</h5>
              {attempts.length === 0 ? (
                <p className="text-gray-400 mt-2">No attempts yet.</p>
              ) : (
                <div className="mt-2 space-y-2 text-sm">
                  {attempts.map((a) => (
                    <div key={a.id} className="bg-white p-2 rounded-lg border text-gray-700">
                      <div className="font-medium">{a.tests?.title || "Test"}</div>
                      <div className="text-xs text-gray-500">
                        {a.student_id} • {a.status} • Score: {a.score ?? "—"} / {a.total ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <TestManager classroom={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
