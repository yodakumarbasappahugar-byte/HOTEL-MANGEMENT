'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Room {
  id: number;
  name: string;
  room_type: string;
  price_per_night: number;
  description: string;
  image_url: string;
  is_available: string;
}

export default function BookRoomPage() {
  const router = useRouter();
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://hotel-management-backend-2xln.onrender.com'}/api/rooms/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRoom(data);
        } else {
          setError('The requested suite was not found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Vault connection interrupted');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoom();
  }, [id]);

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !room) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * room.price_per_night;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please sign in to confirm your reservation');
      router.push('/signin');
      return;
    }

    const price = calculateTotalPrice();
    if (price <= 0) {
      alert('Please select a valid date range');
      return;
    }

    const user = JSON.parse(userStr);
    setBookingLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://hotel-management-backend-2xln.onrender.com'}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          room_id: room?.id,
          check_in: new Date(checkIn).toISOString(),
          check_out: new Date(checkOut).toISOString(),
          total_price: price
        }),
      });

      if (response.ok) {
        setBookingSuccess(true);
        setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        const data = await response.json();
        alert(data.detail || 'Reservation could not be processed');
      }
    } catch (err) {
      alert('Gateway error. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div style={{ background: '#050505', color: '#D4AF37', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', letterSpacing: '4px' }}>
      <div className="loader" style={{ width: '40px', height: '40px', border: '2px solid rgba(212,175,55,0.1)', borderTop: '2px solid #D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '2rem' }}></div>
      PREPARING YOUR RESERVATION...
      <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !room) return (
    <div style={{ background: '#050505', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: '#D4AF37', marginBottom: '1.5rem' }}>OFF-LIMITS</h1>
      <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem' }}>{error || 'The requested luxury experience is currently unavailable.'}</p>
      <button onClick={() => router.push('/rooms')} style={{ padding: '1rem 2rem', background: 'white', color: 'black', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>RETURN TO GALLERY</button>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#050505', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ 
        padding: '1.5rem 5%', 
        background: 'rgba(5, 5, 5, 0.9)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/rooms" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>← RETURN TO SELECTION</Link>
        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>AYODHDYA <span style={{ color: '#D4AF37' }}>RESERVATIONS</span></div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '6rem auto', padding: '0 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '5rem', alignItems: 'start' }}>
          <div style={{ animation: 'fadeInLeft 0.8s ease-out' }}>
            <div style={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginBottom: '3rem' }}>
              <img 
                src={room.image_url || '/luxury.png'} 
                alt={room.name} 
                style={{ width: '100%', display: 'block' }} 
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' }}
              />
            </div>
            
            <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-2px' }}>{room.name}</h1>
            <div style={{ color: '#D4AF37', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '2.5rem' }}>{room.room_type.toUpperCase()}</div>
            <p style={{ fontSize: '1.4rem', lineHeight: '1.8', color: '#94a3b8', marginBottom: '3rem' }}>{room.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem' }}>
              <div>
                <div style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>CAPACITY</div>
                <div style={{ fontSize: '1.2rem' }}>2 Guests</div>
              </div>
              <div>
                <div style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>VIEW</div>
                <div style={{ fontSize: '1.2rem' }}>Cityscape</div>
              </div>
              <div>
                <div style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>SERVICE</div>
                <div style={{ fontSize: '1.2rem' }}>24/7 Butler</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '40px', padding: '3rem', position: 'sticky', top: '8rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Price per night</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>${room.price_per_night} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal' }}>USD</span></div>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ width: '80px', height: '80px', background: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>RESERVATION SECURED</h2>
                <p style={{ color: '#94a3b8' }}>Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleBooking}>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>CHECK-IN DATE</label>
                  <input 
                    type="date" 
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', padding: '1.2rem', color: 'white', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>CHECK-OUT DATE</label>
                  <input 
                    type="date" 
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', padding: '1.2rem', color: 'white', outline: 'none' }}
                  />
                </div>

                {calculateTotalPrice() > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '2.5rem' }}>
                    <span style={{ color: '#94a3b8' }}>Grand Total</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#D4AF37' }}>${calculateTotalPrice()}</span>
                  </div>
                )}

                <button 
                  disabled={bookingLoading || bookingSuccess}
                  style={{ 
                    width: '100%', 
                    padding: '1.5rem', 
                    background: (bookingLoading || bookingSuccess) ? '#111' : '#D4AF37', 
                    color: bookingSuccess ? '#D4AF37' : 'black', 
                    border: bookingSuccess ? '1px solid #D4AF37' : 'none', 
                    borderRadius: '20px', 
                    fontSize: '1.1rem', 
                    fontWeight: '900', 
                    cursor: (bookingLoading || bookingSuccess) ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s ease, opacity 0.2s ease',
                    letterSpacing: '1px'
                  }}
                  onMouseOver={(e) => !bookingLoading && !bookingSuccess && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => !bookingLoading && !bookingSuccess && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {bookingLoading ? 'PROCESSING...' : bookingSuccess ? 'RESERVED ✓' : 'CONFIRM RESERVATION'}
                </button>
              </form>
            )}
            
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '2rem' }}>Price includes all premium amenities and taxes.</p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        input::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
