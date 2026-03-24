export default function SignIn() {
  return (
    <>
      <nav className="navbar">
        <a href="/" className="logo">Ayodhdya Hotel</a>
        <div className="nav-links">
          <a href="/signup" className="btn btn-black" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>Create Account</a>
        </div>
      </nav>

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your Ayodhdya Hotel account</p>
          </div>
          
          <form>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" placeholder="••••••••" required />
            </div>
            
            <button type="submit" className="btn btn-black auth-btn">Sign In</button>
          </form>
          
          <div className="auth-footer">
            Don't have an account? <a href="/signup">Sign up</a>
          </div>
        </div>
      </main>
    </>
  );
}
