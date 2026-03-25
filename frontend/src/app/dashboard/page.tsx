'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/signin');
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return <div className="auth-container"><p>Loading...</p></div>;

  return (
    <>
      <nav className="navbar">
        <a href="/" className="logo">Ayodhdya Hotel</a>
        <div className="nav-links">
          <span className="user-welcome">Welcome, {user.username}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', marginLeft: '1rem' }}>Logout</button>
        </div>
      </nav>

      <main className="hero-container" style={{ justifyContent: 'flex-start', paddingTop: '5rem' }}>
        <h1 style={{ fontSize: '3rem' }}>Your Dashboard</h1>
        <p className="subtitle">
          Manage your luxury stays and explore exclusive Ayodhdya Hotel services.
        </p>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>My Bookings</h3>
            <p>You have no active bookings.</p>
            <a href="/rooms" className="btn btn-black" style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>Book a Room</a>
          </div>
          
          <div className="dashboard-card">
            <h3>Profile Details</h3>
            <div className="profile-info">
              <p><strong>Name:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .user-welcome {
          color: #94a3b8;
          font-weight: 500;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          width: 100%;
          max-width: 1000px;
          margin-top: 2rem;
        }
        .dashboard-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 2rem;
          text-align: left;
          backdrop-filter: blur(20px);
        }
        .dashboard-card h3 {
          margin-bottom: 1rem;
          color: white;
        }
        .profile-info p {
          margin: 0.5rem 0;
          color: #94a3b8;
        }
      `}</style>
    </>
  );
}
