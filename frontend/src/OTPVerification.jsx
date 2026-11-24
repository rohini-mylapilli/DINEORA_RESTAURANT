
import { useState, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import './AuthPages.css'

function OTPVerification() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  const firstName = location.state?.firstName || 'Guest'
  const phoneNumber = location.state?.phoneNumber || ''
  const devOtp = location.state?.devOtp || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputRefs = useRef([])

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)

    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError('')

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (event.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()

    const pastedData = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)

    if (!pastedData) return

    const newOtp = [...otp]

    pastedData.split('').forEach((digit, index) => {
      newOtp[index] = digit
    })

    setOtp(newOtp)
    setError('')

    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleVerifyOTP = async (event) => {
    event.preventDefault()

    const otpValue = otp.join('')

    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'https://dineora-backend-drui.onrender.com/api/accounts/verify-otp/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number: phoneNumber,
            otp: otpValue,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'OTP verification failed.'
        )
      }

      login(data.token, data.customer)
      navigate('/menu')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!phoneNumber) {
    return (
      <div className="otp-page otp-invalid-page">
        <div className="otp-content">
          <span className="otp-brand">DINEORA</span>
          <h2>Session Expired</h2>
          <p>Please register or login again to continue.</p>
          <Link to="/login" className="otp-back-link">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="otp-page">
      <div className="otp-split-layout">

        {/* LEFT SIDE - OTP FORM */}
        <section className="otp-content">

          <Link to="/" className="otp-brand">
            DINEORA<span>.</span>
          </Link>

          <div className="otp-form-wrapper">

            <div className="otp-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01" />
                <path d="M9 6h6" />
              </svg>
            </div>

            <p className="otp-eyebrow">ACCOUNT VERIFICATION</p>

            <h1>Verify your number</h1>

            <p className="otp-description">
              Welcome, <strong>{firstName}</strong>. We've sent a
              verification code to your registered mobile number.
            </p>

            <p className="otp-phone">
              +91 {phoneNumber}
            </p>

            {devOtp && (
              <p className="otp-dev-code">
                Development OTP: <strong>{devOtp}</strong>
              </p>
            )}

            <form onSubmit={handleVerifyOTP}>

              <label className="otp-label">
                ENTER 6-DIGIT CODE
              </label>

              <div className="otp-input-group">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(event) =>
                      handleOtpChange(index, event.target.value)
                    }
                    onKeyDown={(event) =>
                      handleKeyDown(index, event)
                    }
                    onPaste={handlePaste}
                    className="otp-digit"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              {error && (
                <p className="otp-error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="otp-verify-btn"
                disabled={loading}
              >
                {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
                {!loading && <span>→</span>}
              </button>

            </form>

            <p className="otp-bottom-text">
              Didn't receive the code?
              <span> Please check your mobile number.</span>
            </p>

            <Link to="/login" className="otp-back-link">
              ← Back to Login
            </Link>

          </div>

          <p className="otp-footer">
            © {new Date().getFullYear()} DINEORA. ALL RIGHTS RESERVED.
          </p>

        </section>

        {/* RIGHT SIDE - FOOD IMAGE */}
        <section className="otp-image-side">
          <div className="otp-image-overlay">

            <div className="otp-image-caption">
              <span className="otp-image-eyebrow">
                THE ART OF GREAT FOOD
              </span>

              <h2>
                A Taste Worth
                <br />
                Remembering.
              </h2>

              <div className="otp-gold-line"></div>

              <p>
                Crafted with passion. Served with love.
                Experience the finest flavours at DINEORA.
              </p>
            </div>

            <span className="otp-image-number">
              DINEORA — EST. 2026
            </span>

          </div>
        </section>

      </div>
    </div>
  )
}

export default OTPVerification
