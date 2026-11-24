
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AuthPages.css'

function LoginPage() {
    const navigate = useNavigate()

    const [firstName, setFirstName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [devOtp, setDevOtp] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setDevOtp('')

        if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
            setError('Please enter a valid 10-digit Indian mobile number.')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(
                'https://dineora-backend-drui.onrender.com/api/accounts/send-otp/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        first_name: firstName.trim(),
                        phone_number: phoneNumber
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.error || 'Unable to send OTP. Please try again.'
                )
            }

            if (data.dev_otp) {
                setDevOtp(data.dev_otp)
            }

            navigate('/verify-otp', {
                state: {
                    firstName: firstName.trim(),
                    phoneNumber,
                    devOtp: data.dev_otp || ''
                }
            })

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">

            <div className="auth-card">

                <div className="auth-brand">
                    DINEORA<span>.</span>
                </div>

                <p className="auth-eyebrow">
                    WELCOME TO DINEORA
                </p>

                <h1>
                    Your Table. <span>Your Moments.</span>
                </h1>

                <p className="auth-description">
                    Enter your details to continue your delicious journey
                    with Dineora.
                </p>

                <form onSubmit={handleSubmit}>

                    <label>Your Name</label>

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />

                    <label>Mobile Number</label>

                    <div className="phone-input-wrapper">
                        <span>+91</span>

                        <input
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={phoneNumber}
                            onChange={(e) =>
                                setPhoneNumber(
                                    e.target.value.replace(/\D/g, '').slice(0, 10)
                                )
                            }
                            maxLength="10"
                            required
                        />
                    </div>

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Sending OTP...' : 'Continue with OTP'}
                    </button>

                </form>

                <p className="auth-footer-text">
                    By continuing, you agree to use Dineora's customer
                    login service.
                </p>

            </div>

        </main>
    )
}

export default LoginPage
