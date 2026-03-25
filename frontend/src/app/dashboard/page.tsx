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
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        router.push('/signin');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}><p>Loading...</p></div>;

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>Ayodhdya Hotel</a>
        <div>
          <span style={{ color: '#94a3b8', marginRight: '1rem' }}>Welcome, {user.username}</span>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', borderRadius: '8px' }}>Logout</button>
        </div>
      </nav>

      <main>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Your Dashboard</h1>
        <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>
          Manage your luxury stays and explore exclusive Ayodhdya Hotel services.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>My Bookings</h3>
            <p style={{ color: '#94a3b8' }}>You have no active bookings.</p>
            <a href="/rooms" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '8px', width: '100%', textAlign: 'center' }}>Book a Room</a>
          </div>
          
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Profile Details</h3>
            <div style={{ color: '#94a3b8' }}>
              <p><strong>Name:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
