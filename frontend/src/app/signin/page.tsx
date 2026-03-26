'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Signing In...');
  const [error, setError] = useState('');

  useEffect(() => {
    // Proactively warm up the backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://hotel-management-backend-2xln.onrender.com'}/api/ping`).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoadingMessage('Signing In...');

    const loadingTimeout = setTimeout(() => {
      setLoadingMessage('Optimizing connection, please wait...');
    }, 10000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 150000); // 150s timeout (2.5 mins)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://hotel-management-backend-2xln.onrender.com'}/api/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(loadingTimeout);
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.detail || 'Sign in failed');
      }
    } catch (err: any) {
      clearTimeout(loadingTimeout);
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('The server is still waking up from a deep sleep (Render Free Tier). This can take up to 3 minutes on the first try. Please refresh and try one more time.');
      } else {
        setError('Connection error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <a href="/" className="logo">Ayodhdya Hotel</a>
        <div className="nav-links">
          <a href="/signup" className="btn btn-black" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>Create Account</a>
        </div>
      </nav>

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your Ayodhdya Hotel account</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="you@example.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <button type="submit" className="btn btn-black auth-btn" disabled={loading}>
              {loading ? loadingMessage : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-footer">
            Don't have an account? <a href="/signup">Sign up</a>
          </div>
        </div>
      </main>

      <style jsx>{`
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          text-align: center;
        }
      `}</style>
    </>
  );
}
