// MERN version of QuestionManager.jsx

import React, { useEffect, useState } from "react";
import API from "../../api/axiosConfig";

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // MongoDB form structure
  const [form, setForm] = useState({
    id: null,
    level: "beginner",
    text: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctIndex: 0,
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  // 🔹 Fetch all questions from backend
  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await API.get("/questions");
      setQuestions(res.data || []);
    } catch (e) {
      console.warn("Could not fetch questions:", e.message || e);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Populate form for editing
  const startEdit = (q) => {
    setForm({
      id: q._id,
      level: q.level,
      text: q.text,
      optionA: q.options[0],
      optionB: q.options[1],
      optionC: q.options[2],
      optionD: q.options[3],
      correctIndex: q.correctIndex,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () =>
    setForm({
      id: null,
      level: "beginner",
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctIndex: 0,
    });

  // 🔹 Save question (create / update)
  const save = async (e) => {
    e.preventDefault();

    const payload = {
      level: form.level,
      text: form.text,
      options: [form.optionA, form.optionB, form.optionC, form.optionD],
      correctIndex: Number(form.correctIndex),
    };

    try {
      if (form.id) {
        await API.put(`/questions/${form.id}`, payload);
      } else {
        await API.post(`/questions`, payload);
      }

      resetForm();
      fetchQuestions();
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  // 🔹 Delete Question
  const remove = async (id) => {
    if (!confirm("Delete this question?")) return;

    try {
      await API.delete(`/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Question Manager</h3>

      {/* Form */}
      <form onSubmit={save} className="mt-4 bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <input
            placeholder="Question text"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            className="p-2 border rounded col-span-2"
          />

          <input
            placeholder="Option A"
            value={form.optionA}
            onChange={(e) => setForm({ ...form, optionA: e.target.value })}
            className="p-2 border rounded"
          />

          <input
            placeholder="Option B"
            value={form.optionB}
            onChange={(e) => setForm({ ...form, optionB: e.target.value })}
            className="p-2 border rounded"
          />

          <input
            placeholder="Option C"
            value={form.optionC}
            onChange={(e) => setForm({ ...form, optionC: e.target.value })}
            className="p-2 border rounded"
          />

          <input
            placeholder="Option D"
            value={form.optionD}
            onChange={(e) => setForm({ ...form, optionD: e.target.value })}
            className="p-2 border rounded"
          />

          {/* Correct Answer */}
          <select
            value={form.correctIndex}
            onChange={(e) => setForm({ ...form, correctIndex: Number(e.target.value) })}
            className="p-2 border rounded"
          >
            <option value={0}>A</option>
            <option value={1}>B</option>
            <option value={2}>C</option>
            <option value={3}>D</option>
          </select>

          <div className="flex items-center gap-2">
            <button className="btn bg-indigo-600 text-white px-4 py-2 rounded" type="submit">
              {form.id ? "Update" : "Add"} Question
            </button>
            <button type="button" className="btn-outline" onClick={resetForm}>
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Questions List */}
      <div className="mt-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded flex-1"
          />

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="p-2 border rounded"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>

        <h4 className="font-semibold">
          Existing Questions {loading ? "(loading...)" : `(${questions.length})`}
        </h4>

        <div className="grid grid-cols-1 gap-3 mt-3">
          {(() => {
            const filtered = questions.filter((q) => {
              const s = search.toLowerCase();
              return (
                !s ||
                q.text.toLowerCase().includes(s) ||
                q.level.toLowerCase().includes(s)
              );
            });

            const start = (page - 1) * pageSize;
            const items = filtered.slice(start, start + pageSize);

            return items.map((q) => (
              <div key={q._id} className="border rounded p-3 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">{q.level}</div>
                    <div className="font-medium">{q.text}</div>

                    <div className="text-xs text-gray-600 mt-1">
                      A. {q.options[0]} &nbsp; B. {q.options[1]} &nbsp; C. {q.options[2]} &nbsp; D.{" "}
                      {q.options[3]}
                    </div>

                    <div className="text-xs text-green-600 mt-1">
                      Correct: {["A", "B", "C", "D"][q.correctIndex]}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button className="btn" onClick={() => startEdit(q)}>
                      Edit
                    </button>

                    <button className="btn-outline" onClick={() => remove(q._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ));
          })()}

          {questions.length === 0 && (
            <div className="text-gray-500">
              No questions found. Add some using the form above.
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Page {page}</div>

            <div className="flex items-center gap-2">
              <button
                className="btn-outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>

              <button className="btn" onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
