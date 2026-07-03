"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useStore } from "@/lib/store";

export function AuthModal() {
  const { isAuthOpen, setAuthOpen } = useStore();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ email: "", name: "", password: "", confirmPassword: "", phone: "" });

  const handleClose = () => {
    setAuthOpen(false);
    setError("");
    setTimeout(() => setMode("login"), 200);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(loginForm.email, loginForm.password);
    setLoading(false);
    if (result.success) {
      handleClose();
      useStore.getState().showNotification("Welcome back!", "success");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.email || !registerForm.name || !registerForm.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    const result = await register({
      email: registerForm.email,
      name: registerForm.name,
      password: registerForm.password,
      phone: registerForm.phone || undefined,
    });
    setLoading(false);
    if (result.success) {
      handleClose();
      useStore.getState().showNotification("Account created successfully!", "success");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  const inputClass =
    "w-full bg-transparent border border-[#E8E8E8] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:outline-none focus:border-[#111] transition-colors";

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4"
          >
            <div className="bg-[#F8F8F6] w-full max-w-[420px] relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#999] hover:text-[#111] transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="px-8 pt-8 pb-6">
                <h2 className="text-[24px] font-medium tracking-[-0.02em] text-[#111] mb-1">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-[13px] text-[#999]">
                  {mode === "login"
                    ? "Sign in to access your account"
                    : "Join MAISON for an elevated shopping experience"}
                </p>
              </div>

              {/* Tabs */}
              <div className="px-8 mb-6">
                <div className="flex border-b border-[#E8E8E8]">
                  <button
                    onClick={() => { setMode("login"); setError(""); }}
                    className={`flex-1 pb-3 text-[12px] font-medium tracking-[0.1em] uppercase transition-colors relative ${
                      mode === "login" ? "text-[#111]" : "text-[#999] hover:text-[#666]"
                    }`}
                  >
                    Sign In
                    {mode === "login" && (
                      <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111]" />
                    )}
                  </button>
                  <button
                    onClick={() => { setMode("register"); setError(""); }}
                    className={`flex-1 pb-3 text-[12px] font-medium tracking-[0.1em] uppercase transition-colors relative ${
                      mode === "register" ? "text-[#111]" : "text-[#999] hover:text-[#666]"
                    }`}
                  >
                    Register
                    {mode === "register" && (
                      <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-8 mb-4"
                  >
                    <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-2.5">{error}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <div className="px-8 pb-8">
                <AnimatePresence mode="wait">
                  {mode === "login" ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={handleLogin}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className={inputClass + " pl-11"}
                          autoComplete="email"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className={inputClass + " pl-11 pr-11"}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#111] text-[#F8F8F6] py-3.5 text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Sign In <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleRegister}
                      className="space-y-3"
                    >
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type="text"
                          placeholder="Full name"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                          className={inputClass + " pl-11"}
                          autoComplete="name"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className={inputClass + " pl-11"}
                          autoComplete="email"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type="tel"
                          placeholder="Phone number (optional)"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          className={inputClass + " pl-11"}
                          autoComplete="tel"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password (min 6 characters)"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className={inputClass + " pl-11 pr-11"}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type="password"
                          placeholder="Confirm password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          className={inputClass + " pl-11"}
                          autoComplete="new-password"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#111] text-[#F8F8F6] py-3.5 text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Create Account <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-[#E8E8E8] text-center">
                  <p className="text-[12px] text-[#999]">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                      className="text-[#111] font-medium hover:underline"
                    >
                      {mode === "login" ? "Create one" : "Sign in"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}