import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { User, AtSign, Lock, GraduationCap } from "lucide-react";
import logo from "../../assets/yourbrain-logo.png"; // <== put your generated logo here

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

    if (result?.error) setError(result.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0118] relative overflow-hidden">

      {/* ✨ Neon Background Glow Layers */}
      <div className="absolute w-[600px] h-[600px] bg-purple-700/40 blur-[180px] rounded-full -top-40 -left-40"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-600/40 blur-[180px] rounded-full bottom-0 right-0"></div>

      {/* ⚡ Floating hologram grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-[url('https://i.imgur.com/gfQbSxF.png')] bg-cover bg-center"
      />

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md p-10 rounded-3xl 
        bg-white/10 backdrop-blur-2xl border border-white/20
        shadow-[0_0_40px_rgba(138,43,226,0.6)]"
      >
        {/* LOGO + TITLE */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img
            src={logo}
            className="mx-auto h-20 drop-shadow-[0_0_10px_rgba(0,200,255,0.8)] animate-pulse"
          />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text 
            bg-gradient-to-r from-cyan-400 to-purple-500 mt-4 tracking-wide drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
            YOUR'S BRAIN
          </h1>
          <p className="text-purple-200 mt-1 tracking-wide text-sm">
            Access the Future of Learning
          </p>
        </motion.div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SELECT ROLE */}
          <motion.div whileHover={{ scale: 1.02 }} className="relative">
            <User className="absolute left-3 top-3 text-cyan-300" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-3 pl-10 rounded-xl bg-white/10 text-cyan-100 
              border border-cyan-300/40 outline-none backdrop-blur-md
              focus:border-cyan-400 transition shadow-[0_0_12px_rgba(0,255,255,0.2)]"
            >
              <option className="text-black" value="student">Student</option>
              <option className="text-black" value="teacher">Teacher</option>
            </select>
          </motion.div>

          {/* EMAIL */}
          <motion.div whileHover={{ scale: 1.02 }} className="relative">
            <AtSign className="absolute left-3 top-3 text-purple-300" />
            <input
              className="w-full p-3 pl-10 rounded-xl bg-white/10 text-purple-100 
              border border-purple-300/40 outline-none placeholder-purple-300/60
              focus:border-purple-400 transition shadow-[0_0_12px_rgba(200,0,255,0.2)]"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </motion.div>

          {/* PASSWORD */}
          <motion.div whileHover={{ scale: 1.02 }} className="relative">
            <Lock className="absolute left-3 top-3 text-pink-300" />
            <input
              className="w-full p-3 pl-10 rounded-xl bg-white/10 text-pink-100 
              border border-pink-300/40 outline-none placeholder-pink-300/60
              focus:border-pink-400 transition shadow-[0_0_12px_rgba(255,0,200,0.2)]"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </motion.div>

          {/* LOGIN BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3 rounded-xl text-lg font-bold tracking-wide
            bg-gradient-to-r from-cyan-400 to-purple-500 text-white 
            shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(155,0,255,0.7)]
            transition"
          >
            LOGIN
          </motion.button>

          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-center text-sm animate-pulse">
              {error}
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;
