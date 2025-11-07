import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function TestManager({ classroom, onTestCreated }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("beginner");
  const [duration, setDuration] = useState(60); // seconds
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const { data, error } = await supabase.from("questions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setQuestions(data || []);
    } catch (e) {
      console.warn(e);
      setQuestions([]);
    }
  }

  function toggle(qid) {
    setSelected(prev => prev.includes(qid) ? prev.filter(x => x !== qid) : [...prev, qid]);
  }

  async function createTest(e) {
    e.preventDefault();
    if (!classroom || !title) return alert("Select classroom and enter test title");
    try {
      const { data: t, error } = await supabase.from("tests").insert([{ classroom_id: classroom.id, title, level, duration_seconds: duration }]).select().single();
      if (error) throw error;
      if (selected.length > 0) {
        const rows = selected.map(qid => ({ test_id: t.id, question_id: qid }));
        const { error: e2 } = await supabase.from("test_questions").insert(rows);
        if (e2) throw e2;
      }
      setTitle(""); setLevel("beginner"); setDuration(60); setSelected([]);
      alert("Test created");
      onTestCreated && onTestCreated();
    } catch (err) {
      alert("Create failed: " + (err.message || err));
    }
  }

  return (
    <div className="mt-3 p-3 bg-white rounded shadow">
      <h5 className="font-semibold">Create Test</h5>
      <form onSubmit={createTest} className="grid gap-2 mt-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Test title" className="p-2 border rounded" />
        <select value={level} onChange={e => setLevel(e.target.value)} className="p-2 border rounded">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <div className="flex gap-2 items-center">
          <label className="text-sm">Duration:</label>
          <select value={duration} onChange={e=>setDuration(Number(e.target.value))} className="p-2 border rounded">
            <option value={30}>30s</option>
            <option value={60}>60s</option>
            <option value={120}>2m</option>
            <option value={300}>5m</option>
            <option value={600}>10m</option>
          </select>
          <span className="text-sm text-gray-500">seconds</span>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Pick questions to assign</div>
          <div className="max-h-40 overflow-auto border p-2 rounded bg-gray-50">
            {questions.map(q => (
              <label key={q.id} className="flex items-start gap-2 p-1">
                <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggle(q.id)} />
                <div className="text-sm">
                  <div className="font-medium">{q.question}</div>
                  <div className="text-xs text-gray-500">{q.level}</div>
                </div>
              </label>
            ))}
            {questions.length === 0 && <div className="text-gray-500">No questions found.</div>}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn" type="submit">Create Test</button>
          <button type="button" className="btn-outline" onClick={()=>{ setTitle(""); setSelected([]); }}>Reset</button>
        </div>
      </form>
    </div>
  );
}
