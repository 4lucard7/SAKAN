import React, { useState } from 'react';
import api from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Login failed", error);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-sky-500 text-white p-3 rounded-lg mb-2">
            <span className="font-bold text-xl">SAKAN</span>
          </div>
          <p className="text-gray-500 text-sm text-center">Entrez vos identifiants pour accéder à votre tableau de bord</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">email *</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700">Mot de passe *</label>
              <a href="#" className="text-sm text-sky-500 hover:underline">Mot de passe oublié?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-sky-500 rounded border-gray-300" />
            <label className="ml-2 block text-sm text-gray-700">Remember me</label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors"
          >
            {loading ? 'Chargement...' : 'Login →'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Vous n'avez pas de compte? <a href="/register" className="text-sky-500 font-medium">S'inscrire</a>
        </p>
      </div>
    </div>
  );
}