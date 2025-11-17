import React, { useEffect, useState } from "react";
import API from "../../../api/axiosConfig";

export default function TestManager({ classroom, onTestCreated }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("beginner");
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const res = await API.get("/questions");
      setQuestions(res.data || []);
    } catch (e) {
      setQuestions([]);
    }
  }

  function toggle(id) {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  }

  async function createTest(e) {
    e.preventDefault();
    if (!classroom) return alert("No classroom selected");
    if (!title.trim()) return alert("Enter a title");

    try {
      const payload = {
        classroomId: classroom._id,
        title,
        level,
        durationSeconds: duration,
        questionIds: selected,
      };

      await API.post("/tests/create", payload);

      alert("Test created!");

      setTitle("");
      setSelected([]);
      onTestCreated && onTestCreated();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-xl mt-4">
      <h3 className="text-lg font-semibold mb-2">Create Test</h3>

      <form onSubmit={createTest} className="grid gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Test title"
          className="p-2 border rounded"
        />

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <div>
          <label className="text-sm">Duration</label>
          <select
            className="p-2 border rounded ml-2"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={30}>30s</option>
            <option value={60}>1 min</option>
            <option value={120}>2 mins</option>
            <option value={300}>5 mins</option>
          </select>
        </div>

        <div className="border p-2 rounded max-h-40 overflow-auto bg-white">
          {questions.map((q) => (
            <label key={q._id} className="flex gap-2 p-1 items-start">
              <input
                type="checkbox"
                checked={selected.includes(q._id)}
                onChange={() => toggle(q._id)}
              />
              <div>
                <div className="font-medium">{q.text}</div>
                <div className="text-xs text-gray-500">{q.level}</div>
              </div>
            </label>
          ))}
        </div>

        <button className="bg-indigo-600 text-white px-4 py-2 rounded">
          Create Test
        </button>
      </form>
    </div>
  );
}
