'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Creating Account...');
  const [error, setError] = useState('');

  useEffect(() => {
    // Proactively warm up the backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://hotel-management-backend-2xln.onrender.com'}/api/ping`).catch(() => {});
  }, [formData]); // Re-ping if user starts typing, ensures keep-alive

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoadingMessage('Creating Account...');

    const loadingTimeout = setTimeout(() => {
      setLoadingMessage('The server is waking up, please stay with us...');
    }, 10000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 150000); // 150s timeout (2.5 mins)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://hotel-management-backend-2xln.onrender.com'}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(loadingTimeout);
      clearTimeout(timeoutId);

      if (response.ok) {
        router.push('/signin');
      } else {
        const data = await response.json();
        setError(data.detail || 'Registration failed');
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
          <a href="/signin" className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>Sign In</a>
        </div>
      </nav>

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create an Account</h2>
            <p>Join Ayodhdya Hotel to unlock premium hospitality</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="John Doe" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

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
              {loading ? loadingMessage : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-footer">
            Already have an account? <a href="/signin">Sign in</a>
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
