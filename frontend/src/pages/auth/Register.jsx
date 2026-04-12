import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { User, Mail, Lock, Eye, EyeOff,AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState(false)
  const [pwdError, setPwdError] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [match_pwd_error, setMatch_pwd_error] = useState(false)




  const handle = (e) => {
    const {name,value}=e.target;
    setForm(f => ({ ...f, [name]:value }))
    if(name ==="email"){
      setEmailError(value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    }
    if(name ==="name"){
      setNameError(value.trim()==="")
    }
    if (name === "password") {
      setPasswordError(value.trim() === "")
    }

  }

  const submit = async (e) => {
    e.preventDefault()
    const isvalidEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    setEmailError(!isvalidEmail);
    const isNameEmpty=form.name.trim()==="";
    setNameError(isNameEmpty);
    const isvalidPassword=form.password.trim() !== "";
    setPwdError(!isvalidPassword)
    if(isNameEmpty || !isvalidEmail ||!isvalidPassword) return;
    if(form.password !== form.password_confirmation){
      setMatch_pwd_error(true)
      return;
      
    }else{
      setMatch_pwd_error(false)
    }

    const res = await register(form)
    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.message)
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

        

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="label">nom <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="name"  value={form.name} onChange={handle}
                  placeholder="Votre nom complet" className="input pl-9" />
              </div>
              {nameError &&(
                <div className="flex items-center gap-1.5 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs text-red-500">Veuillez entrer un nom valide.</span>
              </div>
              )}
            </div>

            <div>
              <label className="label">email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="email" type="email"  value={form.email} onChange={handle}
                  placeholder="name@example.com" className="input pl-9" />
              </div>
              {emailError && (
                <div className="flex items-center gap-1.5 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs text-red-500">Veuillez saisir une addresse email valide.</span>
              </div>
                
              )}
            </div>

            <div>
              <label className="label">Mot de passe <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="password" type={show ? 'text' : 'password'} 
                  value={form.password} onChange={handle} placeholder="••••••••" className="input pl-9 pr-10" />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwdError && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="text-xs text-red-500">
                    Saisie un mot de passe de 8 caractére
                  </span>
                </div>
               )}
            </div>

            <div>
              <label className="label">Confirmer le mot de passe <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="password_confirmation" type={show ? 'text' : 'password'} 
                  value={form.password_confirmation} onChange={handle}
                  placeholder="••••••••" className="input pl-9" />
              </div>
              {match_pwd_error && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="text-xs text-red-500">
                    Les mots de passe ne correspondent pas
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="bg-[#2196F3] justify-center text-white font-semibold  rounded-xl py-2 hover:bg-[#1976D2] transition">
              {loading ? 'Création...' : "S'inscrire →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Vous avez déja un compte ?{' '}
            <Link to="/login" className="text-[#2196F3] font-semibold hover:underline">se connecter</Link>
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
