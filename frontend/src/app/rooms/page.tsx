'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Room {
  id: number;
  name: string;
  room_type: string;
  price_per_night: number;
  description: string;
  image_url: string;
  is_available: string;
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://hotel-management-backend-2xln.onrender.com'}/api/rooms`);
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        } else {
          setError('Failed to load rooms');
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', position: 'fixed', top: 0, width: '100%', zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>Ayodhdya Hotel</a>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</a>
          <a href="/signin" style={{ color: '#94a3b8', textDecoration: 'none' }}>Sign In</a>
        </div>
      </nav>

      <main style={{ paddingTop: '8rem', paddingBottom: '4rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: '800' }}>Luxury Accommodations</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            Experience unparalleled comfort in our meticulously designed suites, where every detail is crafted for your ultimate relaxation.
          </p>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: '#94a3b8' }}>Loading luxury collections...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'white', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Try Again</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
            {rooms.length === 0 ? (
              <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#94a3b8' }}>No rooms currently available. Please check back later.</p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden', transition: 'transform 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ height: '240px', overflow: 'hidden' }}>
                    <img src={room.image_url} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{room.name}</h3>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${room.price_per_night}<span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'normal' }}>/night</span></span>
                    </div>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>{room.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: room.is_available === 'Available' ? '#10b981' : '#f59e0b', fontSize: '0.9rem' }}>● {room.is_available}</span>
                      <button style={{ padding: '0.75rem 2rem', background: 'white', color: 'black', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Book Now</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}>
        &copy; 2026 Ayodhdya Hotel. All rights reserved.
      </footer>
    </div>
  );
}
