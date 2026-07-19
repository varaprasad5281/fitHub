import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-zinc-400 mb-6">
            This password reset link is missing or invalid.
          </p>
          <Link to="/login" className="text-amber-400 hover:text-amber-300">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      // Auto-login after successful reset
      setToken(data.token);
      setDone(true);
      setTimeout(() => navigate("/Home", { replace: true }), 2000);
    } catch (err) {
      toast.error(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Password updated!
          </h2>
          <p className="text-zinc-400">Redirecting you to the app…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
            7%
          </h1>
          <h2 className="text-xl font-bold text-white mb-1">
            Set new password
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-11 rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-lg py-3 h-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          <Link to="/login" className="text-amber-400 hover:text-amber-300">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
