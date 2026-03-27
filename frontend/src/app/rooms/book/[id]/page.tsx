'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
        <a href="/rooms" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>← RETURN TO SELECTION</a>
        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>AYODHDYA <span style={{ color: '#D4AF37' }}>RESERVATIONS</span></div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '6rem auto', padding: '0 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '5rem', alignItems: 'start' }}>
          <div style={{ animation: 'fadeInLeft 0.8s ease-out' }}>
            <div style={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginBottom: '3rem' }}>
              <img 
                src={room.image_url} 
                alt={room.name} 
                style={{ width: '100%', display: 'block' }} 
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' }}
              />
            </div>
            <span style={{ color: '#D4AF37', letterSpacing: '3px', fontSize: '0.8rem', fontWeight: 'bold' }}>{room.room_type.toUpperCase()}</span>
            <h1 style={{ fontSize: '3.5rem', marginTop: '0.5rem', marginBottom: '1.5rem', fontWeight: '900', letterSpacing: '-2px' }}>{room.name}</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: '1.8', fontWeight: '300' }}>{room.description}</p>
          </div>

          <div style={{ 
            background: 'linear-gradient(145deg, #0a0a0a, #111)', 
            padding: '3rem', 
            borderRadius: '32px', 
            border: '1px solid rgba(212, 175, 55, 0.2)', 
            position: 'sticky',
            top: '8rem',
            animation: 'fadeInRight 0.8s ease-out'
          }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '2.5rem', fontWeight: '800' }}>Confirm Stay</h2>
            
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 2rem',
                  border: '1px solid #10b981'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>✓</span>
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>RESERVATION SECURED</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Preparing your welcome at Ayodhdya Hotel...</p>
              </div>
            ) : (
              <form onSubmit={handleBooking}>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.8rem', color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>ARRIVAL DATE</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required style={{ width: '100%', padding: '1.2rem', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#D4AF37'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}/>
                </div>
                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.8rem', color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>DEPARTURE DATE</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required style={{ width: '100%', padding: '1.2rem', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#D4AF37'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}/>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b' }}>
                    <span>Standard rate</span>
                    <span>${room.price_per_night} / night</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Grand Total</span>
                    <span style={{ fontSize: '2.2rem', fontWeight: '900', color: '#D4AF37' }}>${calculateTotalPrice()}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={bookingLoading || !checkIn || !checkOut}
                  style={{ 
                    width: '100%', 
                    padding: '1.5rem', 
                    background: 'white', 
                    color: 'black', 
                    border: 'none', 
                    borderRadius: '20px', 
                    fontWeight: '900', 
                    fontSize: '1rem', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s',
                    opacity: (bookingLoading || !checkIn || !checkOut) ? 0.5 : 1,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => { if(!bookingLoading && checkIn && checkOut) e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.backgroundColor = '#D4AF37'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  {bookingLoading ? 'SECURING...' : 'CONFIRM RESERVATION'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
