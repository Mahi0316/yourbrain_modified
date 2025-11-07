import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

/*
Expected Supabase table: questions
Fields: id, level, question, option_a, option_b, option_c, option_d, correct_option, created_at
*/

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState({
    id: null, level: "beginner", question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A"
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("questions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setQuestions(data || []);
    } catch (e) {
      console.warn("Could not fetch questions:", e.message || e);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  const startEdit = (q) => {
    setForm({
      id: q.id,
      level: q.level,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option || "A"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => setForm({ id: null, level: "beginner", question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A" });

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      level: form.level,
      question: form.question,
      option_a: form.option_a,
      option_b: form.option_b,
      option_c: form.option_c,
      option_d: form.option_d,
      correct_option: form.correct_option
    };
    try {
      if (form.id) {
        const { error } = await supabase.from("questions").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("questions").insert([payload]);
        if (error) throw error;
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      alert("Save failed: " + (err.message || err));
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this question?")) return;
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      alert("Delete failed: " + (err.message || err));
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Question Manager</h3>
      <form onSubmit={save} className="mt-4 bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={form.level} onChange={(e)=>setForm({...form, level:e.target.value})} className="p-2 border rounded">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input placeholder="Question text" value={form.question} onChange={(e)=>setForm({...form, question:e.target.value})} className="p-2 border rounded col-span-2" />
          <input placeholder="Option A" value={form.option_a} onChange={(e)=>setForm({...form, option_a:e.target.value})} className="p-2 border rounded" />
          <input placeholder="Option B" value={form.option_b} onChange={(e)=>setForm({...form, option_b:e.target.value})} className="p-2 border rounded" />
          <input placeholder="Option C" value={form.option_c} onChange={(e)=>setForm({...form, option_c:e.target.value})} className="p-2 border rounded" />
          <input placeholder="Option D" value={form.option_d} onChange={(e)=>setForm({...form, option_d:e.target.value})} className="p-2 border rounded" />
          <select value={form.correct_option} onChange={(e)=>setForm({...form, correct_option:e.target.value})} className="p-2 border rounded">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
          <div className="flex items-center gap-2">
            <button className="btn" type="submit">{form.id ? "Update" : "Add"} Question</button>
            <button type="button" className="btn-outline" onClick={resetForm}>Reset</button>
          </div>
        </div>
      </form>

      <div className="mt-4">
        <div className="flex items-center gap-3 mb-3">
          <input placeholder="Search questions..." value={search} onChange={(e)=>{setSearch(e.target.value); setPage(1);}} className="p-2 border rounded flex-1" />
          <select value={pageSize} onChange={(e)=>{setPageSize(Number(e.target.value)); setPage(1);}} className="p-2 border rounded">
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>

        <h4 className="font-semibold">Existing Questions {loading ? "(loading...)" : `(${questions.length})`}</h4>
        <div className="grid grid-cols-1 gap-3 mt-3">
          {(() => {
            const filtered = questions.filter(q => {
              const s = search.toLowerCase();
              return !s || (q.question && q.question.toLowerCase().includes(s)) || (q.level && q.level.toLowerCase().includes(s));
            });
            const start = (page-1)*pageSize;
            const pageItems = filtered.slice(start, start+pageSize);
            return pageItems.map(q => (
              <div key={q.id} className="border rounded p-3 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">{q.level}</div>
                    <div className="font-medium">{q.question}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      A. {q.option_a} &nbsp; B. {q.option_b} &nbsp; C. {q.option_c} &nbsp; D. {q.option_d}
                    </div>
                    <div className="text-xs text-green-600 mt-1">Correct: {q.correct_option}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="btn" onClick={()=>startEdit(q)}>Edit</button>
                    <button className="btn-outline" onClick={()=>remove(q.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ));
          })()}
          {questions.length === 0 && <div className="text-gray-500">No questions found. Add some using the form above.</div>}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Page {page}</div>
            <div className="flex items-center gap-2">
              <button className="btn-outline" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
              <button className="btn" onClick={()=>setPage(p=>p+1)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
