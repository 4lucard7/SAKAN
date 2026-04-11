import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const res = await login(form)
    if (res.success) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#caf0f8] via-[#e0f7fa] to-[#f0f9ff] flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-hover w-full max-w-md p-8 fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-sakan-blue rounded-2xl flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <path d="M4 20 L12 6 L20 20" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                <circle cx="12" cy="6" r="2.5" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-sakan-dark tracking-tight">SAKAN</span>
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
                  name="email" type="email" required
                  value={form.email} onChange={handle}
                  placeholder="name@example.com"
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Mot de passe <span className="text-red-500">*</span></label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password" type={show ? 'text' : 'password'} required
                  value={form.password} onChange={handle}
                  placeholder="••••••••"
                  className="input pl-9 pr-10"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary justify-center mt-2">
              {loading ? 'Connexion...' : 'Login →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="text-sakan-blue font-semibold hover:underline">S'inscrire</Link>
          </p>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 flex items-center justify-center gap-1">
        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        SECURE AES-256 ENCRYPTION
      </footer>
    </div>
  )
}
