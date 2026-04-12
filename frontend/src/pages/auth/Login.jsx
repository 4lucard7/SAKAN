import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Eye, EyeOff, Mail, Lock ,AlertCircle} from 'lucide-react'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [backendError, setBackendError] = useState("");
  

  const handle = (e) => {
    const {name,value}=e.target;
    setForm(f => ({ ...f, [name]: value }))
     if (name === "email") {
      setEmailError(
        value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      )
    }
    if (name === "password") {
      setPasswordError(value.trim() === "")
    }

  } 

  const submit = async (e) => {
    e.preventDefault()
    setBackendError("")
    const isvalidEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const isvalidPassword=form.password.trim() !== "";
    setEmailError(!isvalidEmail);
    setPasswordError(!isvalidPassword)
    if(!isvalidEmail || !isvalidPassword) return;
    const res = await login(form)
    if (res.success){
      navigate('/dashboard')
    } 
    else{
      setBackendError("Email ou mot de passe incorrect"); setForm({email:form.email ,password:""})

    } 
  }

  return (
    <div className="min-h-screen  from-[#caf0f8] via-[#e0f7fa] to-[#f0f9ff] flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-hover w-full max-w-md p-8 fade-in">
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


          <p className="text-sm text-gray-500 text-center mb-6">
            Entrez vos identifiants pour accéder à votre tableau de bord
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="label">email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email" type="email" 
                  value={form.email} onChange={handle}
                  placeholder="name@example.com"
                  className={`input pl-9  ${emailError ? "border-red-400" : "border-gray-200 focus:border-[#2196F3]"}
                  `}
                />
              </div>
              {emailError && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-500">
                  Adresse e-mail invalide
                </span>
              </div>
            )}

            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Mot de passe <span className="text-red-500">*</span></label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password" type={show ? 'text' : 'password'} 
                  value={form.password} onChange={handle}
                  placeholder="••••••••"
                  className="input pl-9 pr-10"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordError && (
                <span className='text-xs text-red-500'>le mot de passe est obligatoire</span>
              )}
              {backendError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">
                        {backendError}
                    </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="bg-[#2196F3] justify-center text-white font-semibold  rounded-xl py-2 hover:bg-[#1976D2] transition">
              {loading ? 'Connexion...' : 'Login →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="text-[#2196F3] font-semibold hover:underline">S'inscrire</Link>
          </p>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 flex items-center justify-center gap-1">
        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        SAKAN 2026 © Tous droits réservés
      </footer>
    </div>
  )
}
