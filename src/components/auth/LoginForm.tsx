import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const LoginForm = () => {
  const { signInStudent, signInTeacher } = useAuth();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  const result =
    role === "student"
      ? await signInStudent(email, password)
      : await signInTeacher(email, password);

  if (result?.error) {
    setError(result.error);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold">Login</h2>

      <select
        className="border p-2 w-full rounded"
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>

      <input
        className="border p-2 w-full rounded"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700"
      >
        Login
      </button>

      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default LoginForm;
