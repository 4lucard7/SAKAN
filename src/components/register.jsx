

import { useState } from "react"
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react"
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })
  const [emailError, setEmailError] = useState(false)
  const [nameError, setNameError] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === "email") {
      setEmailError(value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    }
    if (name === "name") {
        setNameError(value.trim() === "");
}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    setEmailError(!isValidEmail)
    const isNameEmpty=form.name.trim("")==="";
    setNameError(isNameEmpty);
    if (!isValidEmail || !isNameEmpty) return;
    if (form.password !== form.password_confirmation) {
        alert("Passwords do not match");
        return;
    }
    await api.get("/sanctum/csrf-cookie")
    await api.post("/api/auth/register", form)
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center relative overflow-hidden px-4 py-10">
      {/* Decorative shape — top right */}
      <div className="pointer-events-none select-none absolute top-8 right-16 opacity-20">
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circle */}
          <circle cx="72" cy="72" r="60" stroke="#3b9edd" strokeWidth="12" fill="none" />
          {/* Plus */}
          <line x1="140" y1="90" x2="175" y2="90" stroke="#3b9edd" strokeWidth="12" strokeLinecap="round" />
          <line x1="157.5" y1="72" x2="157.5" y2="108" stroke="#3b9edd" strokeWidth="12" strokeLinecap="round" />
        </svg>
      </div>

      {/* Decorative shape — bottom left */}
      <div className="pointer-events-none select-none absolute bottom-12 left-12 opacity-20">
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="10"
            y="45"
            width="49"
            height="49"
            rx="6"
            transform="rotate(-45 10 45)"
            stroke="#3b9edd"
            strokeWidth="8"
            fill="none"
          />
        </svg>
      </div>

      {/* Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-lg w-full max-w-md px-8 py-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-[#2196F3] flex items-center justify-center shadow">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2L18 10L10 18L2 10L10 2Z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M10 6L14 10L10 14L6 10L10 6Z" fill="#2196F3" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[#2196F3] font-extrabold text-xl tracking-widest uppercase">Sakan</span>
        </div>

        

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nom <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center border rounded-lg px-3 py-2.5 gap-2 bg-white transition-all focus-within:ring-2 focus-within:ring-[#2196F3]/20 ${
                emailError
                  ? "border-red-400 focus-within:border-red-400"
                  : "border-gray-200 focus-within:border-[#2196F3]"
              }`}>
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"/>
            </div>
            {nameError && <div className="flex items-center gap-1.5 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs text-red-500">Veuillez entrer un nom valide.</span>
              </div>}
           
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center border rounded-lg px-3 py-2.5 gap-2 bg-white transition-all focus-within:ring-2 focus-within:ring-[#2196F3]/20 ${
                emailError
                  ? "border-red-400 focus-within:border-red-400"
                  : "border-gray-200 focus-within:border-[#2196F3]"
              }`}
            >
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>
            {emailError && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs text-red-500">Veuillez saisir une adresse e-mail valide.</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2 bg-white focus-within:border-[#2196F3] focus-within:ring-2 focus-within:ring-[#2196F3]/20 transition-all">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Confirmation */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2 bg-white focus-within:border-[#2196F3] focus-within:ring-2 focus-within:ring-[#2196F3]/20 transition-all">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type={showConfirm ? "text" : "password"}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-1 flex items-center justify-center gap-2 bg-[#2196F3] hover:bg-[#1976D2] active:bg-[#1565C0] text-white font-semibold text-sm py-3 rounded-xl transition-colors shadow-sm"
          >
            S'inscrire
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Vous avez deja un compte?{" "}
          <Link to="/" className="text-[#2196F3] font-semibold hover:underline">
            Se connecter
          </Link>
        </p>

        
      </div>
    </div>
  )
}
