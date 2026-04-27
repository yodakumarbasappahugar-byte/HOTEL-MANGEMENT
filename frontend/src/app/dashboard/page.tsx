'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './dashboard.css';

const rooms = [
  {
    id: 1,
    name: 'Luxury Sunset Suite',
    price: '$1,200/night',
    description: 'Ultra-luxury suite with floor-to-ceiling windows and panoramic city views.',
    image: '/images/suite_luxury.png',
    badge: 'Most Popular',
  },
  {
    id: 2,
    name: 'Deluxe Ocean View',
    price: '$650/night',
    description: 'Contemporary room with a private balcony and stunning ocean vistas.',
    image: '/images/suite_deluxe.png',
    badge: 'Best Value',
  },
  {
    id: 3,
    name: 'Royal Presidential Suite',
    price: '$2,500/night',
    description: 'Grandest suite with private infinity pool and opulent marble finishings.',
    image: '/images/suite_presidential.png',
    badge: 'Premium',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/signin');
    } else {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
        router.push('/signin');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user)
    return (
      <div className="db-loading">
        <div className="db-spinner" />
        <p>Loading your experience…</p>
      </div>
    );

  return (
    <div className="db-root">
      {/* ── NAV ── */}
      <nav className="db-nav">
        <a href="/" className="db-logo">
          ✦ Empire Royal Hotel
        </a>
        <div className="db-nav-right">
          <span className="db-welcome">Welcome back, {user.username} 👋</span>
          <button id="logout-btn" onClick={handleLogout} className="db-logout-btn">
            Logout
          </button>
        </div>
      </nav>

      {/* ── HERO GREETING ── */}
      <section className="db-hero">
        <h1 className="db-hero-title">Your Dashboard</h1>
        <p className="db-hero-sub">
          Manage your luxury stays and explore exclusive Empire Royal Hotel services.
        </p>
      </section>

      {/* ── QUICK CARDS ── */}
      <section className="db-quick-grid">
        <div className="db-card db-card-info">
          <div className="db-card-icon">🛎️</div>
          <h3>My Bookings</h3>
          <p className="db-muted">You have no active bookings.</p>
          <a href="/rooms" id="book-room-btn" className="db-btn-gold">
            Book a Room
          </a>
        </div>

        <div className="db-card db-card-info">
          <div className="db-card-icon">👤</div>
          <h3>Profile Details</h3>
          <div className="db-profile-info">
            <p>
              <span className="db-label">Name</span>
              {user.username}
            </p>
            <p>
              <span className="db-label">Email</span>
              {user.email}
            </p>
          </div>
        </div>

        <div className="db-card db-card-info">
          <div className="db-card-icon">⭐</div>
          <h3>Loyalty Points</h3>
          <p className="db-muted">0 points earned so far.</p>
          <span className="db-badge-gold">Gold Member</span>
        </div>
      </section>

      {/* ── LUXURY ACCOMMODATIONS ── */}
      <section className="db-rooms-section">
        <div className="db-section-header">
          <h2 className="db-section-title">Luxury Accommodations</h2>
          <p className="db-section-sub">
            Experience unparalleled comfort in our meticulously designed suites, where every detail
            is crafted for your ultimate relaxation.
          </p>
        </div>

        <div className="db-room-grid">
          {rooms.map((room) => (
            <div key={room.id} className="db-room-card" id={`room-card-${room.id}`}>
              <div className="db-room-img-wrap">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="db-room-badge">{room.badge}</span>
              </div>
              <div className="db-room-body">
                <h3 className="db-room-name">{room.name}</h3>
                <p className="db-room-price">{room.price}</p>
                <p className="db-room-desc">{room.description}</p>
                <div className="db-room-avail">
                  <span className="db-dot" /> Available
                </div>
                <a
                  href="/rooms"
                  id={`book-btn-${room.id}`}
                  className="db-btn-book"
                >
                  Book Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="db-footer">
        <p>© 2026 Empire Royal Hotel. All rights reserved.</p>
      </footer>
    </div>
  );
}
