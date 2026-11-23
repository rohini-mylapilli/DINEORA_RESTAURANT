import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './AdminLogin.css'

export default function AdminLogin() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Please enter username and password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/accounts/admin/login/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.detail || 'Admin login failed.'
        )
      }

      if (!data.success || !data.token) {
        throw new Error('Invalid server response.')
      }

      localStorage.setItem('dineora_admin_token', data.token)
      localStorage.setItem(
        'dineora_admin',
        JSON.stringify(data.admin)
      )

      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-shell">

        {/* LEFT: RESTAURANT BRANDING */}
        <section className="admin-login-visual">
          <div className="admin-visual-overlay" />

          <div className="admin-visual-content">
            <Link to="/" className="admin-login-logo">
              DINEORA<span>.</span>
            </Link>

            <div className="admin-visual-message">
              <span className="admin-login-label">
                THE ART OF FINE DINING
              </span>

              <h1>
                Every Dish
                <br />
                Tells a <span>Story.</span>
              </h1>

              <p>
                Bringing exceptional flavours and memorable
                dining experiences to every table.
              </p>

              <div className="admin-visual-divider" />

              <span className="admin-visual-caption">
                MULTI-CUISINE RESTAURANT
              </span>
            </div>

            <div className="admin-visual-bottom">
              <span>CRAFTED WITH PASSION</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </section>

        {/* RIGHT: LOGIN FORM */}
        <section className="admin-login-panel">
          <div className="admin-login-form-container">

            <div className="admin-mobile-brand">
              <Link to="/" className="admin-login-logo">
                DINEORA<span>.</span>
              </Link>
            </div>

            <div className="admin-login-heading">
              <span className="admin-login-label">
                ADMINISTRATION PORTAL
              </span>

              <h2>Welcome Back</h2>

              <p>
                Sign in to manage your restaurant operations.
              </p>
            </div>

            <form onSubmit={handleLogin} className="admin-login-form">

              <div className="admin-form-group">
                <label htmlFor="admin-username">
                  Username
                </label>

                <input
                  id="admin-username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-password">
                  Password
                </label>

                <div className="admin-password-wrapper">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="admin-show-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="admin-login-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="admin-login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="admin-login-spinner" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <span className="admin-login-arrow">→</span>
                  </>
                )}
              </button>

            </form>

            <div className="admin-login-security">
              <span className="admin-security-icon">◆</span>
              <span>Protected & Secure Admin Access</span>
            </div>

            <footer className="admin-login-footer">
              <p>© 2026 DINEORA Restaurant. All rights reserved.</p>
              <Link to="/">Back to Website</Link>
            </footer>

          </div>
        </section>

      </div>
    </main>
  )
}