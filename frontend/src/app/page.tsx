export default function Home() {
  return (
    <>
      <nav className="navbar">
        <div className="logo">LuxeStays</div>
        <div className="nav-links">
          {/* We can add main links here in the future */}
        </div>
      </nav>

      <main className="hero-container">
        <h1>Welcome to LuxeStays</h1>
        <p className="subtitle">
          Experience the finest hospitality. Manage your bookings, discover new properties, and enjoy a seamless stay with our premium hotel management platform.
        </p>
        
        <div className="button-group">
          <a href="/signin" className="btn btn-primary">Sign In</a>
          <a href="/signup" className="btn btn-secondary">Create Account</a>
        </div>
      </main>
    </>
  );
}
