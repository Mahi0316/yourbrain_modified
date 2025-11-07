import React, { useState, useEffect } from "react";
import { Header } from "../layout/Header";
import { supabase } from "../../lib/supabase";
import JoinClassroom from "./student/JoinClassroom";
import { Trophy, Clock, BookOpen, ArrowLeftCircle } from "lucide-react";

const QUESTIONS = {
  beginner: [
    { q: "2 + 3 = ?", opts: ["3", "4", "5", "6"], a: 2 },
    { q: "What comes next: 2,4,6,?", opts: ["7", "8", "9", "10"], a: 1 },
  ],
  intermediate: [
    { q: "If x+3=7, x = ?", opts: ["2", "3", "4", "5"], a: 2 },
    { q: "Find next: 3,6,12,?", opts: ["18", "20", "24", "30"], a: 2 },
  ],
  advanced: [
    { q: "What is 7*6 - 5?", opts: ["37", "42", "40", "47"], a: 0 },
    { q: "Solve: 2^5 / 2^2 = ?", opts: ["2", "4", "6", "8"], a: 3 },
  ],
};

export default function StudentDashboard({ user }) {
  const [level, setLevel] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [fetchedQuestions, setFetchedQuestions] = useState(null);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    const loadResults = async () => {
      const { data } = await supabase
        .from("results")
        .select("level, score, total, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setRecentResults(data);
    };
    if (user?.id) loadResults();
  }, [user]);

  const startLevel = async (lvl) => {
    try {
      const { data, error } = await supabase.from("questions").select("*").eq("level", lvl);
      if (!error && data && data.length > 0) {
        const mapped = data.map((q) => ({
          q: q.question,
          opts: [q.option_a, q.option_b, q.option_c, q.option_d],
          a: ["A", "B", "C", "D"].indexOf(q.correct_option || "A"),
        }));
        setFetchedQuestions(mapped);
      } else {
        setFetchedQuestions(null);
      }
    } catch (e) {
      console.warn("Could not load questions from DB", e);
      setFetchedQuestions(null);
    }

    setLevel(lvl);
    setIndex(0);
    setScore(0);
    setShowResult(false);
    setTimeLeft(timeLimit);
    setTimerRunning(true);
  };

  useEffect(() => {
    if (!timerRunning) return;
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setTimerRunning(false);
      setShowResult(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timeLeft]);

  const handleAnswer = async (choice) => {
    if (!timerRunning) return;
    const qs = fetchedQuestions?.length ? fetchedQuestions : QUESTIONS[level];
    if (!qs) return;

    if (choice === qs[index].a) setScore((s) => s + 1);

    if (index + 1 < qs.length) {
      setIndex((i) => i + 1);
    } else {
      setShowResult(true);
      setTimerRunning(false);
      try {
        await supabase.from("results").insert([
          {
            user_id: user.id,
            level,
            score,
            total: qs.length,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (e) {
        console.warn("Could not save result:", e);
      }
    }
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("current_test_questions");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.questions?.length) {
          setFetchedQuestions(parsed.questions);
          setLevel(parsed.title || "assigned");
          setIndex(0);
          setScore(0);
          setTimeLimit(parsed.duration || 60);
          setTimeLeft(parsed.duration || timeLimit);
          setTimerRunning(true);
          sessionStorage.removeItem("current_test_questions");
        }
      }
    } catch (e) {
      console.warn("load session test", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-start md:gap-6">
          <div className="md:w-1/3">
            <div className="bg-white shadow-lg rounded-2xl p-5 mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">👋 Welcome back, {user?.email?.split("@")[0]}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Continue sharpening your mind! Join classes, take quizzes, and track your progress below.
              </p>
            </div>

            <JoinClassroom user={user} />

            <div className="bg-white rounded-2xl shadow-md mt-6 p-5">
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" /> Recent Results
              </h3>
              {recentResults.length === 0 ? (
                <p className="text-sm text-gray-500">No recent attempts yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {recentResults.map((r, i) => (
                    <li key={i} className="p-2 bg-gray-50 rounded-lg flex justify-between">
                      <span className="capitalize">{r.level}</span>
                      <span className="font-semibold text-indigo-600">
                        {r.score}/{r.total}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <section className="flex-1 bg-white rounded-2xl p-6 shadow-lg">
            {!level && !showResult && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Aptitude Practice Levels</h2>
                    <p className="text-gray-600 text-sm">
                      Select a difficulty level and time limit to begin.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <select
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg p-2 text-sm"
                    >
                      <option value={30}>30s</option>
                      <option value={60}>1m</option>
                      <option value={120}>2m</option>
                      <option value={300}>5m</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {["beginner", "intermediate", "advanced"].map((lvl) => (
                    <div
                      key={lvl}
                      className="p-5 border rounded-2xl bg-gray-50 hover:bg-indigo-50 transition shadow-sm"
                    >
                      <BookOpen className="w-8 h-8 text-indigo-500 mb-3" />
                      <h3 className="font-semibold text-lg capitalize mb-2">{lvl}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {lvl === "beginner"
                          ? "Warm up with simple logic and math questions."
                          : lvl === "intermediate"
                          ? "Challenge yourself with reasoning puzzles."
                          : "Boost your skills with complex aptitude questions."}
                      </p>
                      <button
                        onClick={() => startLevel(lvl)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                      >
                        Start Quiz
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {level && !showResult && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
                  <span>Level: <b className="capitalize">{level}</b></span>
                  <span>Time Left: {timeLeft ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}` : "--"}</span>
                </div>

                <div className="bg-gray-100 p-5 rounded-2xl shadow-inner">
                  <p className="font-medium mb-3">
                    {(fetchedQuestions?.length ? fetchedQuestions : QUESTIONS[level])[index].q}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(fetchedQuestions?.length ? fetchedQuestions : QUESTIONS[level])[index].opts.map((opt, i) => (
                      <button
                        key={i}
                        className="p-3 border rounded-lg bg-white hover:bg-indigo-50 text-left transition"
                        onClick={() => handleAnswer(i)}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-500 text-right">
                    Question {index + 1} of {(fetchedQuestions?.length ? fetchedQuestions : QUESTIONS[level]).length}
                  </p>
                </div>
              </div>
            )}

            {showResult && (
              <div className="text-center py-10">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h3>
                <p className="text-gray-600 mb-4">
                  You scored <span className="font-semibold text-indigo-600">{score}</span> out of
                  {(fetchedQuestions?.length ? fetchedQuestions : QUESTIONS[level]).length}
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
                    onClick={() => startLevel(level)}
                  >
                    Retry
                  </button>
                  <button
                    className="flex items-center gap-2 border border-gray-400 px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                    onClick={() => {
                      setLevel(null);
                      setShowResult(false);
                    }}
                  >
                    <ArrowLeftCircle className="w-4 h-4" /> Back to Levels
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        © 2025 Your’s Brain — Learn. Practice. Excel.
      </footer>
    </div>
  );
}