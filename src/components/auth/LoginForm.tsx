import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Brain, Loader2 } from "lucide-react";

const LoginForm: React.FC = () => {
  const { signUp, signIn } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignup) {
      const { error } = await signUp(email, password, role);
      if (error) setMessage(error.message || "Signup failed");
      else setMessage("Signup successful. Check your email.");
    } else {
      const { error } = await signIn(email, password);
      if (error) setMessage(error.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left section */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 mr-2" />
            <h1 className="text-4xl font-bold">Your's Brain</h1>
          </div>
          <p className="text-lg opacity-90 leading-relaxed">
            Sharpen your aptitude and grow smarter every day. Your’s Brain helps students learn, test, and succeed — powered by smart technology and caring teachers.
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200"
        >
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-8 h-8 text-indigo-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-800">
              {isSignup ? "Create Account" : "YOUR'S BRAIN"}
            </h2>
          </div>

          <p className="text-center text-gray-500 mb-6">
            {isSignup ? "Sign up to start your learning journey." : "Log in to continue exploring aptitude learning."}
          </p>

          {message && (
            <div className="mb-4 text-sm text-center text-red-600 bg-red-50 p-2 rounded-lg">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <input
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {isSignup && (
              <select
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            )}

            <button
              disabled={loading}
              className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
              type="submit"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : null}
              {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
            </button>
          </div>

          <p className="text-center mt-6 text-sm text-gray-600">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="ml-2 text-indigo-600 hover:underline"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Login" : "Sign up"}
            </button>
          </p>

          <div className="mt-8 text-center text-gray-400 text-xs">
            <p>© 2025 Your’s Brain. Empowering minds through aptitude learning.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
