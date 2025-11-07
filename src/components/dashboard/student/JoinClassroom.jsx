import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Loader2, DoorOpen, ClipboardList, GraduationCap } from "lucide-react";

export default function JoinClassroom({ user }) {
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (user) fetchJoined();
  }, [user]);

  // 🔹 Fetch classrooms student has joined
// 🔹 Fetch classrooms student has joined
async function fetchJoined() {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from("classroom_students")
      .select(`classroom_id, classrooms(id, name, code, created_at, teacher_id)`)
      .eq("student_id", user.id);

    if (error) throw error;

    // Map classrooms
    const rows = (data || []).map((r) => r.classrooms || r);
    setJoined(rows);
  } catch (e) {
    console.warn(e);
    setJoined([]);
  } finally {
    setLoading(false);
  }
}


// 🔹 Join classroom by code
async function joinByCode(e) {
  e && e.preventDefault();
  if (!code.trim()) return alert("Please enter a classroom code.");
  setJoining(true);

  try {
    // Find classroom by code
    const { data: cls, error } = await supabase
      .from("classrooms")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .limit(1)
      .single();

    if (error || !cls) throw new Error("Classroom not found.");

    // Check if already joined
    const { data: already } = await supabase
      .from("classroom_students")
      .select("*")
      .eq("classroom_id", cls.id)
      .eq("student_id", user.id)
      .limit(1);

    if (already && already.length > 0) {
      alert("You have already joined this classroom.");
      setCode("");
      fetchJoined();
      return;
    }

    // Insert RLS-safe
    const { error: insErr } = await supabase
      .from("classroom_students")
      .insert([{ classroom_id: cls.id, student_id: user.id }]);

    if (insErr) throw insErr;

    alert(`✅ Successfully joined "${cls.name}"!`);
    setCode("");
    fetchJoined(); // REFRESH frontend
  } catch (err) {
    alert("❌ Join failed: " + (err.message || err));
  } finally {
    setJoining(false);
  }
}


  // 🔹 Open a classroom and view available tests
  async function openClassroom(c) {
    setSelectedClassroom(c);
    setTests([]);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("classroom_id", c.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTests(data || []);
    } catch (e) {
      console.warn(e);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Start assigned test
  async function startTest(test) {
    try {
      const { data: tq, error: e } = await supabase
        .from("test_questions")
        .select("question_id")
        .eq("test_id", test.id);
      if (e) throw e;

      const qids = (tq || []).map((r) => r.question_id);
      if (qids.length === 0)
        return alert("No questions assigned to this test yet.");

      const { data: qs, error: e2 } = await supabase
        .from("questions")
        .select("*")
        .in("id", qids);
      if (e2) throw e2;

      const mapped = qs.map((q) => ({
        q: q.question,
        opts: [q.option_a, q.option_b, q.option_c, q.option_d],
        a: ["A", "B", "C", "D"].indexOf(q.correct_option || "A"),
      }));

      const { data: attempt, error: errAttempt } = await supabase
        .from("test_attempts")
        .insert([
          {
            test_id: test.id,
            student_id: user.id,
            status: "pending",
            started_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (errAttempt) console.warn("attempt create failed:", errAttempt);

      // Save to sessionStorage for StudentDashboard
      sessionStorage.setItem(
        "current_test_questions",
        JSON.stringify({
          title: test.title,
          questions: mapped,
          testId: test.id,
          attemptId: attempt?.id || null,
          duration: test.duration_seconds || 60,
        })
      );

      window.location.href = "/";
    } catch (err) {
      alert("Could not start test: " + (err.message || err));
    }
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-indigo-600" />
        Join Classroom
      </h3>

      {/* Join Form */}
      <form onSubmit={joinByCode} className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter classroom code (e.g., 7F2K9QX)"
          className="p-2 border rounded-lg flex-1 text-sm"
        />
        <button
          className="btn bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          type="submit"
          disabled={joining}
        >
          {joining ? <Loader2 className="animate-spin w-4 h-4" /> : <DoorOpen />}
          Join
        </button>
      </form>

      {/* Joined Classrooms */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-indigo-500" />
          My Classrooms{" "}
          <span className="text-sm text-gray-500">
            ({loading ? "Loading..." : joined.length})
          </span>
        </h4>

        <div className="grid md:grid-cols-2 gap-4 mt-3">
          {joined.map((c) => (
            <div
              key={c.id}
              className="border p-4 rounded-xl flex justify-between items-start hover:shadow transition"
            >
              <div>
                <div className="font-semibold text-indigo-700">{c.name}</div>
                <div className="text-xs text-gray-500">
                  Code: <strong>{c.code}</strong>
                </div>
                <div className="text-xs text-gray-400">
                  Created: {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                className="btn text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg"
                onClick={() => openClassroom(c)}
              >
                Open
              </button>
            </div>
          ))}

          {joined.length === 0 && !loading && (
            <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg border">
              You haven’t joined any classrooms yet. Ask your teacher for a
              classroom code to join.
            </div>
          )}
        </div>
      </div>

      {/* Selected Classroom Tests */}
      {selectedClassroom && (
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-bold text-indigo-700">
              Tests in {selectedClassroom.name}
            </h4>
            <button
              className="text-sm text-gray-500 hover:underline"
              onClick={() => setSelectedClassroom(null)}
            >
              Close
            </button>
          </div>

          <div className="mt-3">
            {tests.length === 0 && !loading && (
              <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded-lg border">
                No tests assigned yet.
              </div>
            )}

            {tests.map((t) => (
              <div
                key={t.id}
                className="border rounded-lg p-3 mb-2 flex justify-between items-center hover:shadow-sm transition"
              >
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-gray-500">
                    Level: {t.level} • Duration: {t.duration_seconds}s
                  </div>
                </div>
                <button
                  className="btn bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm"
                  onClick={() => startTest(t)}
                >
                  Attempt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
