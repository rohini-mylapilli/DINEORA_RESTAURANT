
import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet
} from 'react-router-dom'

import './App.css'

import { CartProvider, useCart } from './CartContext'
import { AuthProvider, useAuth } from './AuthContext'

import CheckoutPage from './CheckoutPage'
import LoginPage from './LoginPage'
import OTPVerification from './OTPVerification'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

const API_URL = 'https://dineora-backend-drui.onrender.com'

// Paste your actual Home Page image URL here
const HERO_IMAGE_URL = 'https://as2.ftcdn.net/v2/jpg/02/84/46/89/1000_F_284468940_1bg6BwgOfjCnE3W0wkMVMVqddJgtMynE.jpg'

// =====================================
// IMAGE URL HELPER
// =====================================

function getImageUrl(image) {
  if (!image) return ''

  return image.startsWith('http')
    ? image
    : `${API_URL}${image}`
}

// =====================================
// CUSTOMER NAVBAR
// =====================================

function Navbar() {
  const { cartCount } = useCart()
  const { customer, isLoggedIn, logout } = useAuth()

  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        DINEORA<span>.</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">Our Story</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/contact">Contact</Link>
      </div>

      <div className="navbar-actions">

        <Link to="/cart" className="cart-link">
          Cart ({cartCount})
        </Link>

        {isLoggedIn ? (
          <div className="profile-wrapper">

            <button
              className="profile-trigger"
              onClick={() => setProfileOpen(!profileOpen)}
              type="button"
            >
              <span className="profile-avatar">
                {customer?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>

              <span className="profile-name">
                {customer?.name || 'Customer'}
              </span>

              <span className="profile-arrow">
                {profileOpen ? '▲' : '▼'}
              </span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">

                <div className="profile-dropdown-header">
                  <strong>{customer?.name || 'Customer'}</strong>
                  <small>{customer?.phone_number || ''}</small>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                >
                  <span>👤</span>
                  My Profile
                </Link>

                <Link
                  to="/my-orders"
                  onClick={() => setProfileOpen(false)}
                >
                  <span>📦</span>
                  My Orders
                </Link>

                <button
                  className="logout-button"
                  type="button"
                  onClick={() => {
                    logout()
                    setProfileOpen(false)
                  }}
                >
                  <span>↪</span>
                  Logout
                </button>

              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-order-button">
            Login
          </Link>
        )}

        <Link to="/menu" className="nav-order-button">
          Order Now
        </Link>

      </div>
    </nav>
  )
}

// =====================================
// CUSTOMER FOOTER
// =====================================

function Footer() {
  return (
    <footer className="footer">

      <Link to="/" className="footer-logo">
        DINEORA.
      </Link>

      <p>GOOD FOOD. GREAT MOMENTS.</p>

      <small>
        © 2026 Dineora Restaurant. All rights reserved.
      </small>

    </footer>
  )
}

// =====================================
// CUSTOMER LAYOUT
// =====================================

function CustomerLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

// =====================================
// CUSTOMER PROTECTED ROUTE
// =====================================

function CustomerProtectedRoute() {
  const { isLoggedIn } = useAuth()

  return isLoggedIn
    ? <Outlet />
    : <Navigate to="/login" replace />
}

// =====================================
// ADMIN PROTECTED ROUTE
// =====================================

function AdminProtectedRoute() {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let active = true

    async function verifyAdmin() {
      const token = localStorage.getItem('dineora_admin_token')

      if (!token) {
        if (active) {
          setAuthorized(false)
          setChecking(false)
        }
        return
      }

      try {
        const response = await fetch(
          `${API_URL}/api/accounts/admin/dashboard/`,
          {
            method: 'GET',
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error('Admin authentication failed')
        }

        if (active) {
          setAuthorized(true)

          localStorage.setItem(
            'dineora_admin',
            JSON.stringify(data.admin)
          )
        }

      } catch (error) {
        localStorage.removeItem('dineora_admin_token')
        localStorage.removeItem('dineora_admin')

        if (active) {
          setAuthorized(false)
        }

      } finally {
        if (active) {
          setChecking(false)
        }
      }
    }

    verifyAdmin()

    return () => {
      active = false
    }
  }, [])

  if (checking) {
    return (
      <main className="page-container simple-page">
        <h2>Verifying Admin Access...</h2>
        <p>Please wait.</p>
      </main>
    )
  }

  if (!authorized) {
    return <Navigate to="/admin" replace />
  }

  return <AdminDashboard />
}

// =====================================
// HOME PAGE
// =====================================

function HomePage() {
  const imageAvailable =
    HERO_IMAGE_URL &&
    HERO_IMAGE_URL !== 'PASTE_YOUR_IMAGE_URL_HERE'

  const [imageError, setImageError] = useState(false)

  return (
    <>
      <section className="hero-section">

        <div className="hero-content">

          <span className="gold-label">
            WELCOME TO DINEORA
          </span>

          <h1>
            Experience The Art
            <br />
            Of <span>Great Taste.</span>
          </h1>

          <p>
            Discover delicious food, crafted with passion
            and served with unforgettable hospitality.
            Every bite is a moment worth remembering.
          </p>

          <Link to="/menu" className="primary-button">
            Explore Menu
          </Link>

          <div className="hero-highlights">
            <span>✦ Fresh Ingredients</span>
            <span>✦ Made With Passion</span>
          </div>

        </div>

        {/* RIGHT SIDE HERO IMAGE */}

        <div className="hero-visual">

          <div className="hero-image-wrapper">

            {imageAvailable && !imageError ? (
              <img
                src={HERO_IMAGE_URL}
                alt="DINEORA Restaurant Special"
                className="hero-food-image"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="hero-image-placeholder">
                <span>✦</span>
                <h2>DINEORA</h2>
                <p>
                  Good Food. Great Moments.
                </p>
              </div>
            )}

            <div className="hero-image-overlay">

              <span>WELCOME TO DINEORA</span>

              <h3>
                A Taste To Remember
              </h3>

              <strong>
                Crafted With Passion
              </strong>

            </div>

          </div>

          <div className="hero-image-decoration">
            <span>✦</span>
          </div>

        </div>

      </section>

      <section className="home-intro">

        <span className="gold-label">
          OUR COLLECTION
        </span>

        <h2>
          Discover Our <span>Specialities</span>
        </h2>

        <p>
          Beautiful flavours. Fresh ingredients. Memorable moments.
        </p>

        <Link to="/menu" className="outline-button">
          View Full Menu
        </Link>

      </section>
    </>
  )
}

// =====================================
// MENU PAGE
// =====================================

function MenuPage() {
  const [categories, setCategories] = useState([])
  const [foods, setFoods] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { addToCart } = useCart()

  useEffect(() => {
    let active = true

    async function loadMenu() {
      try {
        const [categoryResponse, foodResponse] = await Promise.all([
          fetch(`${API_URL}/api/menu/categories/`),
          fetch(`${API_URL}/api/menu/foods/`)
        ])

        if (!categoryResponse.ok || !foodResponse.ok) {
          throw new Error('Unable to load menu')
        }

        const categoryData = await categoryResponse.json()
        const foodData = await foodResponse.json()

        if (active) {
          setCategories(
            Array.isArray(categoryData)
              ? categoryData
              : categoryData.results || []
          )

          setFoods(
            Array.isArray(foodData)
              ? foodData
              : foodData.results || foodData.foods || []
          )
        }

      } catch (err) {
        if (active) {
          setError(
            'Menu loading failed. Please check whether backend server is running.'
          )
        }

      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadMenu()

    return () => {
      active = false
    }
  }, [])

  const filteredFoods =
    selectedCategory === 'all'
      ? foods
      : foods.filter(
          food => String(food.category) === String(selectedCategory)
        )

  return (
    <main className="page-container">

      <section className="page-heading">

        <span className="gold-label">
          FRESHLY PREPARED FOR YOU
        </span>

        <h1>
          Explore Our <span>Menu</span>
        </h1>

        <p>
          Discover your favourite flavours at Dineora.
        </p>

      </section>

      <div className="category-list">

        <button
          className={
            selectedCategory === 'all'
              ? 'category-button active'
              : 'category-button'
          }
          onClick={() => setSelectedCategory('all')}
        >
          All Items
        </button>

        {categories.map(category => (
          <button
            key={category.id}
            className={
              String(selectedCategory) === String(category.id)
                ? 'category-button active'
                : 'category-button'
            }
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}

      </div>

      {loading && (
        <p className="status-message">
          Loading delicious food...
        </p>
      )}

      {error && (
        <p className="status-message">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="food-grid">

          {filteredFoods.map(food => (
            <article className="food-card" key={food.id}>

              {food.image ? (
                <img
                  src={getImageUrl(food.image)}
                  alt={food.name}
                  className="food-image"
                />
              ) : (
                <div className="food-image food-image-placeholder">
                  🍽️
                </div>
              )}

              <div className="food-info">

                <span className="food-category">
                  {food.category_name || 'DINEORA SPECIAL'}
                </span>

                <h3>{food.name}</h3>

                <p>{food.description}</p>

                <div className="food-card-bottom">

                  <strong>
                    ₹{Number(food.price).toFixed(2)}
                  </strong>

                  <button
                    className="add-cart-button"
                    onClick={() => addToCart(food)}
                  >
                    Add to Cart +
                  </button>

                </div>

              </div>

            </article>
          ))}

        </div>
      )}

      {!loading && !error && filteredFoods.length === 0 && (
        <p className="status-message">
          No food items available in this category.
        </p>
      )}

    </main>
  )
}

// =====================================
// CART PAGE
// =====================================

function CartPage() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    cartTotal
  } = useCart()

  return (
    <main className="page-container cart-page">

      <section className="page-heading">

        <span className="gold-label">
          YOUR DINEORA SELECTION
        </span>

        <h1>
          Shopping <span>Cart</span>
        </h1>

        <p>
          Review your delicious selection.
        </p>

      </section>

      {cartItems.length === 0 ? (
        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>Your Cart is Empty!</h2>

          <p>
            Looks like you haven't added any delicious food yet.
          </p>

          <Link to="/menu" className="primary-button">
            Explore Menu
          </Link>

        </div>
      ) : (
        <div className="cart-layout">

          <div className="cart-items">

            {cartItems.map(item => (
              <div className="cart-item" key={item.id}>

                {item.image ? (
                  <img
                    className="cart-item-image"
                    src={getImageUrl(item.image)}
                    alt={item.name}
                  />
                ) : (
                  <div className="cart-item-image food-image-placeholder">
                    🍽️
                  </div>
                )}

                <div className="cart-item-details">

                  <h3>{item.name}</h3>

                  <p>
                    ₹{Number(item.price).toFixed(2)}
                  </p>

                  <div className="quantity-controls">

                    <button onClick={() => decreaseQuantity(item.id)}>
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button onClick={() => increaseQuantity(item.id)}>
                      +
                    </button>

                  </div>

                </div>

                <div className="cart-item-actions">

                  <strong>
                    ₹{(
                      Number(item.price) * item.quantity
                    ).toFixed(2)}
                  </strong>

                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>

                </div>

              </div>
            ))}

            <button
              className="clear-cart-button"
              onClick={clearCart}
            >
              Clear Cart
            </button>

          </div>

          <aside className="cart-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="summary-row summary-total">
              <strong>Total</strong>
              <strong>₹{cartTotal.toFixed(2)}</strong>
            </div>

            <Link to="/checkout" className="checkout-button">
              Proceed to Checkout
            </Link>

          </aside>

        </div>
      )}

    </main>
  )
}

// =====================================
// ABOUT PAGE
// =====================================

function AboutPage() {
  return (
    <main className="page-container simple-page">

      <section className="about-hero">

        <span className="gold-label">
          OUR STORY
        </span>

        <h1>
          Made With <span>Passion.</span>
        </h1>

        <p>
          At DINEORA, we believe great food brings people together.
          Every dish is prepared with care, quality ingredients,
          and a passion for creating memorable dining experiences.
        </p>

      </section>

      <section className="about-content">

        <div className="about-story-block">

          <span className="gold-label">
            OUR PHILOSOPHY
          </span>

          <h2>
            More Than Just <span>Food.</span>
          </h2>

          <p>
            Food is more than a meal. It is about sharing moments,
            celebrating happiness, and creating memories with
            the people who matter most.
          </p>

        </div>

        <div className="about-story-block">

          <span className="gold-label">
            OUR COMMITMENT
          </span>

          <h2>
            Quality In Every <span>Bite.</span>
          </h2>

          <p>
            From thoughtfully selected ingredients to careful
            preparation, we focus on bringing you delicious food
            and a delightful experience every time.
          </p>

        </div>

        <div className="about-story-block">

          <span className="gold-label">
            THE DINEORA EXPERIENCE
          </span>

          <h2>
            Creating Moments, <span>Together.</span>
          </h2>

          <p>
            Whether you are enjoying a meal with family,
            celebrating with friends, or simply treating yourself,
            DINEORA welcomes you to enjoy every moment.
          </p>

        </div>

      </section>

      <section className="about-closing">

        <h2>
          Good Food. Great Moments.
        </h2>

        <p>
          Welcome to DINEORA.
        </p>

        <Link to="/menu" className="primary-button">
          Explore Our Menu
        </Link>

      </section>

    </main>
  )
}

// =====================================
// CONTACT PAGE
// =====================================

function ContactPage() {
  return (
    <main className="page-container simple-page">

      <span className="gold-label">
        GET IN TOUCH
      </span>

      <h1>
        Contact <span>Dineora.</span>
      </h1>

      <p>
        We would love to hear from you.
      </p>

      <p>
        Visit us or contact our restaurant team for assistance.
      </p>

    </main>
  )
}

// =====================================
// CUSTOMER PROFILE PAGE
// =====================================

function ProfilePage() {
  const { customer } = useAuth()

  const customerName = customer?.name || 'Customer'
  const phoneNumber = customer?.phone_number || 'Not available'
  const firstLetter = customerName.charAt(0).toUpperCase()

  return (
    <main className="profile-page">

      <section className="profile-page-heading">

        <span className="gold-label">
          CUSTOMER ACCOUNT
        </span>

        <h1>
          My <span>Profile</span>
        </h1>

        <p>
          Welcome to your DINEORA account
        </p>

      </section>

      <section className="profile-dashboard">

        <div className="profile-main-card">

          <div className="profile-large-avatar">
            {firstLetter}
          </div>

          <h2>{customerName}</h2>

          <p className="profile-member-label">
            DINEORA CUSTOMER
          </p>

          <div className="profile-active-status">
            <span className="status-dot"></span>
            Active Account
          </div>

          <div className="profile-welcome-message">
            <span>✦</span>
            Thank you for being a part of DINEORA.
          </div>

        </div>

        <div className="profile-details-card">

          <div className="profile-card-heading">

            <div>
              <span className="gold-label">
                PERSONAL INFORMATION
              </span>

              <h2>Account Details</h2>
            </div>

            <div className="profile-card-icon">
              ✦
            </div>

          </div>

          <div className="profile-detail-row">

            <div className="detail-icon">♙</div>

            <div className="detail-content">
              <small>FULL NAME</small>
              <strong>{customerName}</strong>
            </div>

          </div>

          <div className="profile-detail-row">

            <div className="detail-icon">☎</div>

            <div className="detail-content">
              <small>MOBILE NUMBER</small>
              <strong>+91 {phoneNumber}</strong>
            </div>

            <span className="verified-label">
              Verified
            </span>

          </div>

          <div className="profile-detail-row">

            <div className="detail-icon">♧</div>

            <div className="detail-content">
              <small>ACCOUNT TYPE</small>
              <strong>Customer Account</strong>
            </div>

          </div>

          <div className="profile-detail-note">
            <span>✦</span>
            Your account is connected with DINEORA.
          </div>

        </div>

      </section>

      <section className="profile-quick-links">

        <Link to="/my-orders" className="profile-quick-card">

          <div className="quick-card-icon">📦</div>

          <div>
            <h3>My Orders</h3>
            <p>View your order history and order status.</p>
          </div>

          <span className="quick-card-arrow">→</span>

        </Link>

        <Link to="/menu" className="profile-quick-card">

          <div className="quick-card-icon">🍽️</div>

          <div>
            <h3>Explore Menu</h3>
            <p>Discover delicious food from DINEORA.</p>
          </div>

          <span className="quick-card-arrow">→</span>

        </Link>

      </section>

    </main>
  )
}

// =====================================
// MY ORDERS PAGE
// =====================================

function MyOrdersPage() {
  const { token } = useAuth()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setOrders([])
      setLoading(false)
      return
    }

    let active = true

    async function fetchMyOrders() {
      try {
        const response = await fetch(
          `${API_URL}/api/orders/my-orders/`,
          {
            method: 'GET',
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.detail || data.message || 'Unable to load your orders.'
          )
        }

        if (active) {
          setOrders(data.orders || [])
          setError('')
        }

      } catch (err) {
        if (active) {
          setError(err.message || 'Something went wrong.')
        }

      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchMyOrders()

    const refreshInterval = setInterval(fetchMyOrders, 10000)

    return () => {
      active = false
      clearInterval(refreshInterval)
    }
  }, [token])

  const getStatusClass = (status) => {
    return String(status || 'PENDING').toLowerCase()
  }

  const formatDate = (date) => {
    if (!date) return 'Date unavailable'

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <main className="page-container my-orders-page">

      <section className="page-heading">

        <span className="gold-label">
          YOUR DINEORA ORDERS
        </span>

        <h1>
          My <span>Orders</span>
        </h1>

        <p>
          Track your orders and enjoy every moment with DINEORA.
        </p>

      </section>

      {loading && (
        <div className="my-orders-message">
          <h2>Loading Your Orders...</h2>
          <p>Please wait while we retrieve your order history.</p>
        </div>
      )}

      {error && !loading && (
        <div className="my-orders-message">
          <h2>Unable to Load Orders</h2>
          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="my-orders-empty">

          <div className="my-orders-empty-icon">📦</div>

          <h2>No Orders Found</h2>

          <p>
            You haven't placed any orders yet.
            Explore our menu and discover your favourites.
          </p>

          <Link to="/menu" className="primary-button">
            Explore Menu
          </Link>

        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <section className="my-orders-list">

          <div className="my-orders-count">
            <span>YOUR ORDER HISTORY</span>
            <strong>{orders.length} Orders</strong>
          </div>

          {orders.map(order => (
            <article className="customer-order-card" key={order.id}>

              <div className="customer-order-header">

                <div>
                  <span className="customer-order-label">
                    ORDER ID
                  </span>

                  <h2>#{order.id}</h2>

                  <p>{formatDate(order.created_at)}</p>
                </div>

                <span
                  className={`customer-order-status ${getStatusClass(order.order_status)}`}
                >
                  {String(order.order_status || 'PENDING').replaceAll('_', ' ')}
                </span>

              </div>

              <div className="customer-order-items">

                <h3>Order Items</h3>

                {(order.items || []).map(item => (
                  <div className="customer-order-item" key={item.id}>

                    <div>
                      <strong>
                        {item.food_name || item.name || 'Food Item'}
                      </strong>

                      <span>
                        Quantity: {item.quantity}
                      </span>
                    </div>

                    <strong>
                      ₹{(
                        Number(item.price) * Number(item.quantity)
                      ).toFixed(2)}
                    </strong>

                  </div>
                ))}

              </div>

              <div className="customer-order-footer">

                <div>
                  <span>Payment Method</span>
                  <strong>{order.payment_method}</strong>
                </div>

                <div>
                  <span>Total Amount</span>
                  <strong className="customer-order-total">
                    ₹{Number(order.total_amount).toFixed(2)}
                  </strong>
                </div>

              </div>

              <div className="customer-order-address">
                <span>DELIVERY ADDRESS</span>
                <p>{order.delivery_address}</p>
              </div>

            </article>
          ))}

        </section>
      )}

    </main>
  )
}

// =====================================
// MAIN APP
// =====================================

function AppContent() {
  return (
    <Routes>

      <Route
        path="/admin"
        element={<AdminLogin />}
      />

      <Route element={<AdminProtectedRoute />}>
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Route>

      <Route element={<CustomerLayout />}>

        <Route path="/" element={<HomePage />} />

        <Route path="/menu" element={<MenuPage />} />

        <Route path="/cart" element={<CartPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/verify-otp" element={<OTPVerification />} />

        <Route element={<CustomerProtectedRoute />}>

          <Route path="/checkout" element={<CheckoutPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/my-orders" element={<MyOrdersPage />} />

        </Route>

        <Route path="/about" element={<AboutPage />} />

        <Route path="/contact" element={<ContactPage />} />

        <Route
          path="*"
          element={
            <main className="page-container simple-page">
              <h1>Page Not Found</h1>
              <Link to="/">Go Home</Link>
            </main>
          }
        />

      </Route>

    </Routes>
  )
}

// =====================================
// ROOT APP
// =====================================

export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <CartProvider>

          <AppContent />

        </CartProvider>

      </AuthProvider>

    </BrowserRouter>
  )
}
