export default function SignUp() {
  return (
    <>
      <nav className="navbar">
        <a href="/" className="logo">Ayodhdya Hotel</a>
        <div className="nav-links">
          <a href="/signin" className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>Sign In</a>
        </div>
      </nav>

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create an Account</h2>
            <p>Join Ayodhdya Hotel to unlock premium hospitality</p>
          </div>
          
          <form>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" placeholder="John Doe" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" placeholder="••••••••" required />
            </div>
            
            <button type="submit" className="btn btn-black auth-btn">Create Account</button>
          </form>
          
          <div className="auth-footer">
            Already have an account? <a href="/signin">Sign in</a>
          </div>
        </div>
      </main>
    </>
  );
}
