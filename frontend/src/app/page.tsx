import Carousel from './Carousel';

export default function Home() {
  return (
    <>
      <Carousel />
      <nav className="navbar">
        <div className="logo">Empire Royal Hotel</div>
        <div className="nav-links">
          {/* We can add main links here in the future */}
        </div>
      </nav>

      <main className="hero-container">
        <h1>Welcome to Empire Royal Hotel</h1>
        <p className="subtitle">
          Experience the finest hospitality. Manage your bookings, discover new properties, and enjoy a seamless stay with our premium hotel management platform.
        </p>
        
        <div className="button-group">
          <a href="/signin" className="btn btn-secondary">Sign In</a>
          <a href="/signup" className="btn btn-black">Create Account</a>
        </div>
      </main>
    </>
  );
}
