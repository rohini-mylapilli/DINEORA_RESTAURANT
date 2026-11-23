
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from './CartContext'
import './App.css'

function CheckoutPage() {
    const { cartItems, cartTotal } = useCart()

    const [customerName, setCustomerName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [pincode, setPincode] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('COD')

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successOrder, setSuccessOrder] = useState(null)

    const handleSubmit = async (event) => {
        event.preventDefault()

        setErrorMessage('')

        if (cartItems.length === 0) {
            setErrorMessage('Your cart is empty!')
            return
        }

        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            setErrorMessage('Please enter a valid 10-digit mobile number.')
            return
        }

        if (!/^[0-9]{6}$/.test(pincode)) {
            setErrorMessage('Please enter a valid 6-digit PIN code.')
            return
        }

        if (!customerName.trim() || !address.trim() || !city.trim()) {
            setErrorMessage('Please fill all delivery details.')
            return
        }

        // Get login token
        const token = localStorage.getItem('dineora_token')

        if (!token) {
            setErrorMessage('Please login before placing your order.')
            return
        }

        // Convert cart items into backend format
        const orderData = {
            customer_name: customerName.trim(),
            phone_number: phoneNumber,
            delivery_address: address.trim(),
            city: city.trim(),
            pincode: pincode,
            payment_method: paymentMethod,
            items: cartItems.map((item) => ({
                food_item_id: Number(item.id),
                quantity: Number(item.quantity)
            }))
        }

        try {
            setLoading(true)

            const response = await fetch(
                'http://127.0.0.1:8000/api/orders/create/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`
                    },
                    body: JSON.stringify(orderData)
                }
            )

            const data = await response.json()

            if (!response.ok) {
                const errorText = data.errors
                    ? JSON.stringify(data.errors)
                    : data.detail || data.message || 'Unable to place your order.'

                throw new Error(errorText)
            }

            setSuccessOrder(data.order)

        } catch (error) {
            console.error('Order placement error:', error)
            setErrorMessage(
                error.message || 'Something went wrong. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    // Empty cart screen
    if (cartItems.length === 0 && !successOrder) {
        return (
            <section className="checkout-page">
                <div className="empty-cart">
                    <h2>Your Cart is Empty!</h2>
                    <p>Please add food items before checkout.</p>

                    <Link to="/menu" className="primary-button">
                        Explore Menu
                    </Link>
                </div>
            </section>
        )
    }

    // Order success screen
    if (successOrder) {
        return (
            <section className="checkout-page">
                <div className="empty-cart">
                    <h1>Thank You!</h1>
                    <h2>Your Order Has Been Placed Successfully.</h2>

                    <p>
                        Order ID: <strong>#{successOrder.id}</strong>
                    </p>

                    <p>
                        Customer: {successOrder.customer_name}
                    </p>

                    <p>
                        Total Amount: ₹{successOrder.total_amount}
                    </p>

                    <p>
                        Payment Method: {successOrder.payment_method}
                    </p>

                    <p>
                        Order Status: {successOrder.order_status}
                    </p>

                    <Link to="/menu" className="primary-button">
                        Continue Shopping
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section className="checkout-page">

            <div className="page-heading">
                <p className="eyebrow">ALMOST THERE</p>

                <h1>
                    Secure <span>Checkout</span>
                </h1>

                <p>
                    Enter your delivery details to complete your order.
                </p>
            </div>

            <div className="checkout-layout">

                {/* DELIVERY FORM */}

                <form
                    className="checkout-form"
                    onSubmit={handleSubmit}
                >
                    <h2>Delivery Information</h2>

                    <label>Customer Name</label>
                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                    />

                    <label>Mobile Number</label>
                    <input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                    />

                    <label>Delivery Address</label>
                    <textarea
                        placeholder="House number, street, area"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={4}
                        required
                    />

                    <div className="checkout-two-columns">

                        <div>
                            <label>City</label>
                            <input
                                type="text"
                                placeholder="Enter city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>PIN Code</label>
                            <input
                                type="text"
                                placeholder="6-digit PIN"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                pattern="[0-9]{6}"
                                maxLength={6}
                                required
                            />
                        </div>

                    </div>

                    {/* PAYMENT METHODS */}

                    <h2 className="payment-heading">
                        Payment Method
                    </h2>

                    <label className="payment-option">
                        <input
                            type="radio"
                            name="payment"
                            value="COD"
                            checked={paymentMethod === 'COD'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />

                        <span>
                            <strong>Cash on Delivery</strong>
                            <small>
                                Pay when your order arrives.
                            </small>
                        </span>
                    </label>

                    <label className="payment-option">
                        <input
                            type="radio"
                            name="payment"
                            value="UPI"
                            checked={paymentMethod === 'UPI'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />

                        <span>
                            <strong>UPI Payment</strong>
                            <small>
                                Google Pay, PhonePe, Paytm and other UPI apps.
                            </small>
                        </span>
                    </label>

                    <label className="payment-option">
                        <input
                            type="radio"
                            name="payment"
                            value="CARD"
                            checked={paymentMethod === 'CARD'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />

                        <span>
                            <strong>Credit / Debit Card</strong>
                            <small>
                                Online payment gateway integration will be added separately.
                            </small>
                        </span>
                    </label>

                    {errorMessage && (
                        <p style={{ color: '#ff6b6b', marginTop: '15px' }}>
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="primary-button place-order-button"
                        disabled={loading}
                    >
                        {loading ? 'Placing Your Order...' : 'Place Order'}
                    </button>

                </form>

                {/* ORDER SUMMARY */}

                <div className="checkout-summary">

                    <h2>Your Order Summary</h2>

                    {cartItems.map((item) => (
                        <div
                            className="checkout-item"
                            key={item.id}
                        >
                            <div>
                                <h4>{item.name}</h4>
                                <p>Quantity: {item.quantity}</p>
                            </div>

                            <strong>
                                ₹{(
                                    Number(item.price) * item.quantity
                                ).toFixed(2)}
                            </strong>
                        </div>
                    ))}

                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{Number(cartTotal).toFixed(2)}</span>
                    </div>

                    <div className="summary-row">
                        <span>Delivery Charge</span>
                        <span>Calculated later</span>
                    </div>

                    <div className="summary-row summary-total">
                        <span>Food Total</span>
                        <span>₹{Number(cartTotal).toFixed(2)}</span>
                    </div>

                    <p className="checkout-note">
                        Final delivery charges, if applicable,
                        will be confirmed before order placement.
                    </p>

                </div>

            </div>

        </section>
    )
}

export default CheckoutPage
