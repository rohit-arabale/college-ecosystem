/**
 * Register Page
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const DEPARTMENTS = [
  "Computer Science", "Electronics Engineering", "Mechanical Engineering",
  "Civil Engineering", "Chemical Engineering", "Mathematics",
  "Physics", "MBA", "Law", "Medical", "Other",
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    college: "", department: "Computer Science", year: "1",
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validateStep1 = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return false; }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { toast.error("Valid email is required"); return false; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return false; }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.college.trim()) { toast.error("College name is required"); return; }
    setLoading(true);
    try {
      const data = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        college: form.college,
        department: form.department,
        year: Number(form.year),
      });
      toast.success(data.message || "Account created! Welcome 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 mesh-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 text-2xl mb-4">
            🎓
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text">Join the Ecosystem</h1>
          <p className="text-white/40 mt-2 text-sm">Create your student profile</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= s ? "text-brand-400" : "text-white/20"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  step >= s ? "bg-brand-600/30 border-brand-500/50 text-brand-300" : "border-white/10 text-white/20"
                }`}>{s}</div>
                <span className="text-xs font-medium hidden sm:block">{s === 1 ? "Account" : "Profile"}</span>
              </div>
              {s < 2 && <div className={`flex-1 h-px transition-all ${step > s ? "bg-brand-500/50" : "bg-white/10"}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card p-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Full Name</label>
                <input name="name" placeholder="Aryan Sharma" value={form.name} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
                <input type="email" name="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} className="input-field pr-12" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-sm">{showPw ? "🙈" : "👁️"}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} className="input-field" />
              </div>
              <button type="submit" className="btn-primary w-full mt-2">Continue →</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">College / University</label>
                <input name="college" placeholder="IIT Delhi" value={form.college} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Department</label>
                <select name="department" value={form.department} onChange={handleChange} className="input-field">
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Year of Study</label>
                <select name="year" value={form.year} onChange={handleChange} className="input-field">
                  {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating...</> : "Create Account 🎉"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center mt-5 text-sm text-white/40">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
