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
          setError('Failed to load luxury rooms');
        }
      } catch (err) {
        setError('Luxury gateway unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div style={{ backgroundColor: '#050505', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Premium Navbar */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem 5%', 
        background: 'rgba(5, 5, 5, 0.9)', 
        backdropFilter: 'blur(20px)', 
        position: 'fixed', 
        top: 0, 
        width: '100%', 
        zIndex: 100, 
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)' 
      }}>
        <a href="/" style={{ 
          fontSize: '1.8rem', 
          fontWeight: '900', 
          color: '#D4AF37', 
          textDecoration: 'none',
          letterSpacing: '-1px'
        }}>
          AYODHDYA <span style={{ color: 'white', fontWeight: '300' }}>HOTEL</span>
        </a>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <a href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.3s' }}>DASHBOARD</a>
          <a href="/signin" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            padding: '0.6rem 1.5rem', 
            border: '1px solid #D4AF37', 
            borderRadius: '50px',
            backgroundColor: 'rgba(212, 175, 55, 0.1)'
          }}>SIGN IN</a>
        </div>
      </nav>

      <main style={{ 
        paddingTop: '10rem', 
        paddingBottom: '6rem', 
        paddingLeft: '5%', 
        paddingRight: '5%', 
        maxWidth: '1400px', 
        margin: '0 auto' 
      }}>
        <header style={{ textAlign: 'center', marginBottom: '6rem', animation: 'fadeInDown 1s ease-out' }}>
          <span style={{ color: '#D4AF37', letterSpacing: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>UNPARALLELED ELEGANCE</span>
          <h1 style={{ 
            fontSize: '4.5rem', 
            marginTop: '1rem', 
            marginBottom: '1.5rem', 
            fontWeight: '900', 
            background: 'linear-gradient(to bottom, #ffffff, #94a3b8)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-2px'
          }}>
            Our Exclusive Suites
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
            Where ancient tradition meets contemporary luxury. Discover your sanctuary in the heart of hospitality.
          </p>
        </header>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10rem 0' }}>
            <div className="loader" style={{ 
              width: '50px', 
              height: '50px', 
              border: '2px solid rgba(212, 175, 55, 0.1)', 
              borderTop: '2px solid #D4AF37', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            <p style={{ color: '#D4AF37', marginTop: '2rem', letterSpacing: '2px', fontSize: '0.9rem' }}>PREPARING YOUR STAY...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '6rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '32px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ color: '#ef4444', fontSize: '1.2rem', marginBottom: '2rem' }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ 
              padding: '1rem 3rem', 
              background: '#D4AF37', 
              color: 'black', 
              border: 'none', 
              borderRadius: '50px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(212, 175, 55, 0.3)'
            }}>RETRY CONNECTION</button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '3rem' 
          }}>
            {rooms.length === 0 ? (
              <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#94a3b8', fontSize: '1.2rem' }}>Our suites are currently undergoing maintenance. Please return shortly.</p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} style={{ 
                  background: 'linear-gradient(145deg, #0a0a0a, #111)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '32px', 
                  overflow: 'hidden', 
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                  position: 'relative'
                }} className="room-card">
                  <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={room.image_url || '/images/rooms/fallback.png'} 
                      alt={room.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      top: '1.5rem', 
                      right: '1.5rem', 
                      padding: '0.6rem 1.2rem', 
                      background: 'rgba(0,0,0,0.6)', 
                      backdropFilter: 'blur(10px)', 
                      borderRadius: '50px', 
                      fontSize: '0.8rem', 
                      fontWeight: '700', 
                      color: '#D4AF37',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                      {room.room_type.toUpperCase()}
                    </div>
                  </div>
                  
                  <div style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.8rem', margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>{room.name}</h3>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '900', color: '#D4AF37' }}>${room.price_per_night}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '1px' }}>PER NIGHT</span>
                      </div>
                    </div>
                    
                    <p style={{ color: '#94a3b8', marginBottom: '2.5rem', lineHeight: '1.8', fontSize: '1rem', minHeight: '3.6rem' }}>
                      {room.description}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: room.is_available === 'Available' ? '#10b981' : '#f59e0b',
                          boxShadow: `0 0 10px ${room.is_available === 'Available' ? '#10b981' : '#f59e0b'}` 
                        }}></div>
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                          {room.is_available ? room.is_available.toUpperCase() : 'CALL FOR AVAILABILITY'}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => router.push(`/rooms/book/${room.id}`)}
                        style={{ 
                          padding: '1.2rem 2.5rem', 
                          background: 'white', 
                          color: 'black', 
                          border: 'none', 
                          borderRadius: '16px', 
                          fontWeight: '800', 
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.backgroundColor = '#D4AF37';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        RESERVE NOW
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        padding: '6rem 2rem', 
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>AYODHDYA HOTEL</div>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>&copy; 2026 Ayodhdya Hotel Group. Excellence in Every Stay.</p>
      </footer>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        .room-card:hover { 
          transform: translateY(-15px);
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        .room-card:hover img {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
