'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: str;
  email: string;
  created_at: string;
}

interface Room {
  id: number;
  name: string;
  room_type: string;
  price_per_night: number;
  is_available: string;
}

interface Stats {
  users: number;
  rooms: number;
  last_updated: string;
}

export default function DatabasePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hotel-management-backend-2xln.onrender.com';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, roomsRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/api/users`),
          fetch(`${apiUrl}/api/rooms`),
          fetch(`${apiUrl}/api/db-stats`)
        ]);

        if (!usersRes.ok || !roomsRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [usersData, roomsData, statsData] = await Promise.all([
          usersRes.json(),
          roomsRes.json(),
          statsRes.json()
        ]);

        setUsers(usersData);
        setRooms(roomsData);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  if (loading) return <div className="loading">Connecting to database...</div>;

  return (
    <div className="container">
      <nav className="navbar">
        <a href="/" className="logo">Ayodhdya Hotel</a>
        <div className="nav-links">
          <a href="/" className="btn btn-secondary">Back to Home</a>
        </div>
      </nav>

      <main className="db-content">
        <h1>Database Management</h1>
        
        {error && <div className="error">{error}</div>}

        <div className="stats-row">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{stats?.users || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Rooms</h3>
            <p className="stat-value">{stats?.rooms || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Last Updated</h3>
            <p className="stat-date">{stats ? new Date(stats.last_updated).toLocaleString() : 'N/A'}</p>
          </div>
        </div>

        <section className="table-section">
          <h2>Registered Users</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="table-section">
          <h2>Available Rooms</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id}>
                    <td>{room.id}</td>
                    <td>{room.name}</td>
                    <td>{room.room_type}</td>
                    <td>${room.price_per_night}</td>
                    <td>
                      <span className={`status-badge ${room.is_available.toLowerCase()}`}>
                        {room.is_available}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background-color: #0f172a;
          color: white;
        }
        .db-content {
          padding: 3rem 5%;
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          margin-bottom: 2rem;
        }
        h2 {
          margin: 2rem 0 1rem;
          color: #94a3b8;
          font-weight: 600;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }
        .stat-card h3 {
          font-size: 0.875rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #818cf8;
        }
        .stat-date {
          font-size: 0.875rem;
          color: #cbd5e1;
        }
        .table-section {
          margin-bottom: 3rem;
        }
        .table-container {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          background: rgba(15, 23, 42, 0.5);
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
          font-size: 0.9375rem;
        }
        tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-badge.available {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.25rem;
          background: #0f172a;
          color: #94a3b8;
        }
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
}
