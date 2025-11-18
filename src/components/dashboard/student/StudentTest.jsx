import React, { useState, useEffect } from "react";
import API from "../../../api/axiosConfig";

export default function StudentTest() {
  const [test, setTest] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("assigned_test");
    if (!raw) return;

    const data = JSON.parse(raw);
    setTest(data);
    setTimeLeft(data.duration);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function selectAnswer(i) {
    setAnswers({ ...answers, [test.questions[index]._id]: i });

    if (index + 1 < test.questions.length) {
      setIndex(index + 1);
    } else {
      finishTest();
    }
  }

  async function finishTest() {
    setFinished(true);

    const answerArray = test.questions.map((q) => ({
      questionId: q._id,
      selectedIndex: answers[q._id] ?? null,
    }));

    try {
      await API.post("/results/submit", {
        testId: test.testId,
        classroomId: test.classroomId,
        answers: answerArray,
      });

      alert("Test Submitted!");
    } catch (err) {
      console.log(err);
      alert("Error submitting test.");
    }

    sessionStorage.removeItem("assigned_test");
  }

  if (!test) return <p>Loading...</p>;
  if (finished) return <h2 className="text-center mt-20">Test Submitted!</h2>;

  const q = test.questions[index];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-3">{test.title}</h2>

      <div className="mb-4 text-right text-red-500 font-semibold">
        Time Left: {timeLeft}s
      </div>

      <div className="bg-gray-100 p-4 rounded-xl">
        <h3 className="font-medium">{q.q}</h3>

        <div className="mt-3 grid grid-cols-1 gap-2">
          {q.opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className="bg-white border p-2 rounded hover:bg-indigo-100"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
