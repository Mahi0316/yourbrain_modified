// src/components/dashboard/StudentDashboard.jsx

import React, { useState, useEffect } from "react";
import { Header } from "../layout/Header";
import JoinClassroom from "./student/JoinClassroom";

import { Trophy, Clock, BookOpen, ArrowLeftCircle } from "lucide-react";
import API from "../../api/axiosConfig";

const FALLBACK_QUESTIONS = {
  beginner: [
    { q: "2 + 3 = ?", opts: ["3", "4", "5", "6"], a: 2 },
    { q: "What comes next: 2,4,6,?", opts: ["7", "8", "9", "10"], a: 1 },
  ],
  intermediate: [
    { q: "If x+3=7, x = ?", opts: ["2", "3", "4", "5"], a: 2 },
    { q: "3,6,12,?", opts: ["18", "20", "24", "30"], a: 2 },
  ],
  advanced: [
    { q: "7*6 - 5 = ?", opts: ["37", "42", "40", "47"], a: 0 },
    { q: "2^5 / 2^2 = ?", opts: ["2", "4", "6", "8"], a: 3 },
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

  // 🔹 Load student's real results
  useEffect(() => {
    if (!user?._id) return;

    async function loadResults() {
      try {
        const res = await API.get("/results/my");
        setRecentResults(res.data || []);
      } catch (err) {
        console.warn("Failed to load results", err);
      }
    }

    loadResults();
  }, [user]);

  // 🔹 Start quiz for selected level
const startLevel = async (lvl) => {
  setLevel(lvl);         // first update UI state immediately
  setIndex(0);
  setScore(0);
  setShowResult(false);

  try {
    const res = await API.get(`/questions/level/${lvl}`);


    if (res.data?.length > 0) {
      setFetchedQuestions(
        res.data.map((q) => ({
          q: q.text,
          opts: q.options,
          a: q.correctIndex
        }))
      );
    } else {
      setFetchedQuestions(FALLBACK_QUESTIONS[lvl]);
    }
  } catch {
    setFetchedQuestions(FALLBACK_QUESTIONS[lvl]);
  }

  setTimeLeft(timeLimit);   // FIX
  setTimerRunning(true);    // FIX
};


  // 🔹 Timer
  useEffect(() => {
    if (!timerRunning || timeLeft === null) return;

    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }

    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timeLeft]);

  // 🔹 When student clicks answer
  const handleAnswer = (choice) => {
    const qs = fetchedQuestions || FALLBACK_QUESTIONS[level];

    if (choice === qs[index].a) setScore((s) => s + 1);

    if (index + 1 < qs.length) setIndex((i) => i + 1);
    else finishQuiz(qs);
  };

  // 🔹 Finish + Save result
  async function finishQuiz(qs = null) {
    const questions = qs || fetchedQuestions || FALLBACK_QUESTIONS[level];

    setShowResult(true);
    setTimerRunning(false);

    try {
      await API.post("/results", {
        studentId: user._id,
        level,
        score,
        total: questions.length,
      });
    } catch (e) {
      console.warn("Saving result failed", e);
    }
  }

  // 🔹 Load assigned test (coming from JoinClassroom)
useEffect(() => {
  const raw = sessionStorage.getItem("current_test_questions");
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);

    setFetchedQuestions(parsed.questions);
    setLevel(parsed.title);
    setIndex(0);
    setScore(0);

    const duration = parsed.durationSeconds ?? parsed.duration ?? 60;

    setTimeLimit(duration);
    setTimeLeft(duration);
    setTimerRunning(true);
  } catch (err) {
    console.warn("Failed to load assigned test", err);
  }

  sessionStorage.removeItem("current_test_questions");
}, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:gap-6">

          {/* LEFT SIDEBAR */}
          <div className="md:w-1/3">
            {/* Greeting */}
            <div className="bg-white shadow-lg rounded-2xl p-5 mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">
                👋 Hello, {user?.email?.split("@")[0]}
              </h2>
              <p className="text-sm text-gray-500">
                Join classrooms, take tests, and track your progress!
              </p>
            </div>

            <JoinClassroom user={user} />

            {/* Recent results */}
            <div className="bg-white rounded-2xl shadow-md mt-6 p-5">
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Recent Results
              </h3>

              {recentResults.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No results yet.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {recentResults.map((r) => (
                    <li key={r._id} className="p-2 bg-gray-50 rounded-lg flex justify-between">
                      <span>{r.level}</span>
                      <span className="font-semibold text-indigo-600">
                        {r.score}/{r.total}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT SECTION → QUIZ */}
          <section className="flex-1 bg-white rounded-2xl p-6 shadow-lg">

            {/* Level Selector */}
            {!level && !showResult && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Aptitude Practice</h2>
                    <p className="text-gray-600 text-sm">
                      Select difficulty to begin.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <select
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="border p-2 rounded-lg text-sm"
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
                      className="p-5 border rounded-2xl bg-gray-50 hover:bg-indigo-50 transition"
                    >
                      <BookOpen className="w-8 h-8 text-indigo-500 mb-3" />
                      <h3 className="font-semibold text-lg capitalize mb-2">
                        {lvl}
                      </h3>
                      <button
                        onClick={() => startLevel(lvl)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Show Question */}
            {level && !showResult && (
              <div className="mt-6">
                <div className="flex justify-between text-gray-600 text-sm mb-3">
                  <span>Level: {level}</span>
                  <span>
                    Time Left:{" "}
                    {timeLeft !== null
                      ? `${Math.floor(timeLeft / 60)}:${String(
                          timeLeft % 60
                        ).padStart(2, "0")}`
                      : "--"}
                  </span>
                </div>

                <div className="bg-gray-100 p-5 rounded-2xl shadow-inner">
                  <p className="font-medium mb-3">
                    {(fetchedQuestions || FALLBACK_QUESTIONS[level])[index].q}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(fetchedQuestions || FALLBACK_QUESTIONS[level])[index].opts.map(
                      (opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          className="p-3 border rounded-lg bg-white hover:bg-indigo-50 text-left"
                        >
                          {String.fromCharCode(65 + i)}. {opt}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            {showResult && (
              <div className="text-center py-10">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">Quiz Finished!</h3>
                <p className="mt-2 text-gray-600">
                  Score:{" "}
                  <span className="font-semibold text-indigo-600">
                    {score}
                  </span>{" "}
                  /
                  {(fetchedQuestions || FALLBACK_QUESTIONS[level]).length}
                </p>

                <div className="mt-5 flex justify-center gap-4">
                  <button
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
                    onClick={() => startLevel(level)}
                  >
                    Retry
                  </button>

                  <button
                    className="flex items-center gap-2 border px-6 py-2 rounded-lg text-gray-600"
                    onClick={() => {
                      setLevel(null);
                      setShowResult(false);
                    }}
                  >
                    <ArrowLeftCircle className="w-4 h-4" /> Back
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
