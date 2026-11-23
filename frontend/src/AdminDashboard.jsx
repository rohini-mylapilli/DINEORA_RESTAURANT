
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminFoodManagement from './AdminFoodManagement'
import './AdminDashboard.css'

const API_URL = 'http://127.0.0.1:8000/api/accounts/admin/'
const ORDERS_API = 'http://127.0.0.1:8000/api/orders/admin/'
const REPORTS_API = 'http://127.0.0.1:8000/api/orders/admin/reports/'
const CUSTOMERS_API = 'http://127.0.0.1:8000/api/accounts/admin/customers/'

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED',
]

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [updatingOrder, setUpdatingOrder] = useState(null)

  const [reports, setReports] = useState(null)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsError, setReportsError] = useState('')

  // CUSTOMERS STATE
  const [customers, setCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customersError, setCustomersError] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [totalCustomers, setTotalCustomers] = useState(0)

  const [activePage, setActivePage] = useState('Dashboard')

  const getToken = () =>
    localStorage.getItem('dineora_admin_token')

  // VERIFY ADMIN
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = getToken()

      if (!token) {
        navigate('/admin', { replace: true })
        return
      }

      try {
        const response = await fetch(`${API_URL}dashboard/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error('Admin verification failed')
        }

        setAdmin(data.admin)
      } catch (error) {
        localStorage.removeItem('dineora_admin_token')
        localStorage.removeItem('dineora_admin')
        navigate('/admin', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    verifyAdmin()
  }, [navigate])

  // FETCH CUSTOMER ORDERS
  const fetchOrders = async () => {
    const token = getToken()

    if (!token) {
      navigate('/admin', { replace: true })
      return
    }

    setOrdersLoading(true)
    setOrdersError('')

    try {
      const response = await fetch(ORDERS_API, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.status === 401 || response.status === 403) {
        throw new Error('Admin authentication failed. Please login again.')
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load orders.')
      }

      setOrders(data.orders || [])
    } catch (error) {
      setOrdersError(error.message || 'Unable to load orders.')
    } finally {
      setOrdersLoading(false)
    }
  }

  // FETCH REPORTS
  const fetchReports = async () => {
    const token = getToken()

    if (!token) {
      navigate('/admin', { replace: true })
      return
    }

    setReportsLoading(true)
    setReportsError('')

    try {
      const response = await fetch(REPORTS_API, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.status === 401 || response.status === 403) {
        throw new Error('Admin authentication failed. Please login again.')
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load reports.')
      }

      setReports(data)
    } catch (error) {
      setReportsError(error.message || 'Unable to load reports.')
    } finally {
      setReportsLoading(false)
    }
  }

  // FETCH CUSTOMERS
  const fetchCustomers = async (searchValue = '') => {
    const token = getToken()

    if (!token) {
      navigate('/admin', { replace: true })
      return
    }

    setCustomersLoading(true)
    setCustomersError('')

    try {
      const query = new URLSearchParams()

      if (searchValue.trim()) {
        query.set('search', searchValue.trim())
      }

      const url = query.toString()
        ? `${CUSTOMERS_API}?${query.toString()}`
        : CUSTOMERS_API

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.status === 401 || response.status === 403) {
        throw new Error('Admin authentication failed. Please login again.')
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load customers.')
      }

      setCustomers(data.customers || [])
      setTotalCustomers(data.total_customers || 0)
    } catch (error) {
      setCustomersError(error.message || 'Unable to load customers.')
    } finally {
      setCustomersLoading(false)
    }
  }

  // LOAD ORDERS AFTER ADMIN VERIFICATION
  useEffect(() => {
    if (admin) {
      fetchOrders()
    }
  }, [admin])

  // LOAD REPORTS WHEN REPORTS PAGE OPENS
  useEffect(() => {
    if (admin && activePage === 'Reports & Analytics') {
      fetchReports()
    }
  }, [admin, activePage])

  // LOAD CUSTOMERS WHEN CUSTOMERS PAGE OPENS
  useEffect(() => {
    if (admin && activePage === 'Customers') {
      fetchCustomers(customerSearch)
    }
  }, [admin, activePage])

  // SEARCH CUSTOMERS
  const handleCustomerSearch = (event) => {
    event.preventDefault()
    fetchCustomers(customerSearch)
  }

  const handleClearCustomerSearch = () => {
    setCustomerSearch('')
    fetchCustomers('')
  }

  // UPDATE ORDER STATUS
  const handleStatusUpdate = async (orderId, newStatus) => {
    const token = getToken()

    if (!token) {
      navigate('/admin', { replace: true })
      return
    }

    setUpdatingOrder(orderId)
    setOrdersError('')

    try {
      const response = await fetch(
        `${ORDERS_API}${orderId}/status/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_status: newStatus,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Status update failed.')
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? { ...order, order_status: data.order_status }
            : order
        )
      )

      if (activePage === 'Reports & Analytics') {
        fetchReports()
      }
    } catch (error) {
      setOrdersError(error.message || 'Unable to update order.')
    } finally {
      setUpdatingOrder(null)
    }
  }

  // ADMIN LOGOUT
  const handleLogout = async () => {
    const token = getToken()

    try {
      if (token) {
        await fetch(`${API_URL}logout/`, {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      localStorage.removeItem('dineora_admin_token')
      localStorage.removeItem('dineora_admin')
      navigate('/admin', { replace: true })
    }
  }

  // FORMAT AMOUNT
  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return 'N/A'

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  // STATUS CLASS
  const getStatusClass = (status) =>
    (status || 'PENDING').toLowerCase()

  const pendingOrders = orders.filter(
    (order) => order.order_status === 'PENDING'
  ).length

  const deliveredOrders = orders.filter(
    (order) => order.order_status === 'DELIVERED'
  ).length

  const revenue = orders
    .filter((order) => order.order_status !== 'CANCELLED')
    .reduce(
      (total, order) => total + Number(order.total_amount || 0),
      0
    )

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        Verifying admin access...
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="admin-dashboard-page">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        <div className="admin-sidebar-brand">
          DINEORA<span>.</span>
          <small>ADMINISTRATION</small>
        </div>

        <nav className="admin-sidebar-nav">
          {[
            ['Dashboard', '▦'],
            ['Orders', '▤'],
            ['Food Management', '♨'],
            ['Customers', '♙'],
            ['Reports & Analytics', '▥'],
          ].map(([label, icon]) => (
            <button
              key={label}
              type="button"
              className={`admin-nav-item ${
                activePage === label ? 'active' : ''
              }`}
              onClick={() => setActivePage(label)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <button
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-dashboard-main">

        {/* HEADER */}
        <header className="admin-dashboard-header">

          <div>
            <span className="admin-dashboard-label">
              RESTAURANT MANAGEMENT
            </span>

            <h1>{activePage}</h1>

            <p>
              Welcome to your DINEORA administration panel.
            </p>
          </div>

          <div className="admin-profile">

            <div className="admin-profile-avatar">
              {(admin.name || admin.username || 'A')
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>{admin.name || admin.username}</strong>
              <small>Administrator</small>
            </div>

          </div>

        </header>

        {/* DASHBOARD PAGE */}
        {activePage === 'Dashboard' && (
          <>
            <section className="admin-welcome-card">
              <span>WELCOME TO DINEORA</span>

              <h2>Your Restaurant Control Centre</h2>

              <p>
                Your admin authentication is successful.
                You can manage your restaurant operations from here.
              </p>
            </section>

            <section className="admin-dashboard-section">

              <h2>Restaurant Overview</h2>

              <div className="admin-module-grid admin-revenue-grid">

                <div className="admin-module-card">
                  <span>▤</span>
                  <h3>Total Orders</h3>
                  <h2>{ordersLoading ? '...' : orders.length}</h2>
                  <p>Total customer orders in database.</p>
                </div>

                <div className="admin-module-card">
                  <span>◷</span>
                  <h3>Pending Orders</h3>
                  <h2>{ordersLoading ? '...' : pendingOrders}</h2>
                  <p>Orders waiting for confirmation.</p>
                </div>

                <div className="admin-module-card">
                  <span>✓</span>
                  <h3>Delivered Orders</h3>
                  <h2>{ordersLoading ? '...' : deliveredOrders}</h2>
                  <p>Successfully delivered orders.</p>
                </div>

                <div className="admin-module-card">
                  <span>₹</span>
                  <h3>Order Value</h3>
                  <h2>{ordersLoading ? '...' : formatAmount(revenue)}</h2>
                  <p>Value of non-cancelled orders.</p>
                </div>

              </div>

            </section>

            <section className="admin-dashboard-section">

              <h2>Management Modules</h2>

              <div className="admin-module-grid">

                <button
                  className="admin-module-card admin-module-action"
                  onClick={() => setActivePage('Orders')}
                >
                  <span>▤</span>
                  <h3>Orders Management</h3>
                  <p>Manage and monitor customer orders.</p>
                </button>

                <button
                  className="admin-module-card admin-module-action"
                  onClick={() => setActivePage('Food Management')}
                >
                  <span>♨</span>
                  <h3>Food Management</h3>
                  <p>Manage restaurant food items and menus.</p>
                </button>

                <button
                  className="admin-module-card admin-module-action"
                  onClick={() => setActivePage('Customers')}
                >
                  <span>♙</span>
                  <h3>Customers</h3>
                  <p>View registered customer information.</p>
                </button>

                <button
                  className="admin-module-card admin-module-action"
                  onClick={() => setActivePage('Reports & Analytics')}
                >
                  <span>▥</span>
                  <h3>Reports & Analytics</h3>
                  <p>Review restaurant performance reports.</p>
                </button>

              </div>

            </section>
          </>
        )}

        {/* ORDERS MANAGEMENT PAGE - PROFESSIONAL TABLE */}
        {activePage === 'Orders' && (
          <section className="admin-dashboard-section">

            <div className="admin-orders-heading">
              <div>
                <h2>Customer Orders</h2>
                <p>View and manage actual customer orders.</p>
              </div>

              <button
                className="admin-refresh-btn"
                onClick={fetchOrders}
                disabled={ordersLoading}
              >
                {ordersLoading ? 'Loading...' : '↻ Refresh Orders'}
              </button>
            </div>

            {ordersError && (
              <div className="admin-orders-error">
                {ordersError}
              </div>
            )}

            {ordersLoading ? (
              <div className="admin-orders-message">
                Loading customer orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="admin-orders-message">
                <h3>No Orders Found</h3>
                <p>
                  Customer orders will appear here after they are placed.
                </p>
              </div>
            ) : (
              <>
                <div className="admin-orders-table-container">
                  <table className="admin-orders-table">

                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Details</th>
                        <th>Ordered Items</th>
                        <th>Payment</th>
                        <th>Amount</th>
                        <th>Order Date</th>
                        <th>Status</th>
                        <th>Update Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>

                          <td>
                            <strong className="admin-table-order-id">
                              #{order.id}
                            </strong>
                          </td>

                          <td>
                            <div className="admin-table-customer">
                              <strong>
                                {order.customer_name || 'N/A'}
                              </strong>

                              <span>
                                {order.phone_number || 'N/A'}
                              </span>

                              <small>
                                {order.delivery_address || 'N/A'}
                              </small>
                            </div>
                          </td>

                          <td>
                            <div className="admin-table-items">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                  <div
                                    className="admin-table-item"
                                    key={item.id || `${order.id}-${index}`}
                                  >
                                    <span>{item.food_name}</span>
                                    <small>Qty: {item.quantity}</small>
                                    <strong>
                                      {formatAmount(item.price)}
                                    </strong>
                                  </div>
                                ))
                              ) : (
                                <span className="admin-table-muted">
                                  No items available
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="admin-table-payment">
                              {order.payment_method || 'N/A'}
                            </span>
                          </td>

                          <td>
                            <strong className="admin-table-amount">
                              {formatAmount(order.total_amount)}
                            </strong>
                          </td>

                          <td>
                            <span className="admin-table-date">
                              {formatDate(order.created_at)}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`admin-order-status ${getStatusClass(
                                order.order_status
                              )}`}
                            >
                              {order.order_status || 'PENDING'}
                            </span>
                          </td>

                          <td>
                            <div className="admin-table-status-control">
                              <select
                                value={order.order_status || 'PENDING'}
                                disabled={updatingOrder === order.id}
                                onChange={(event) =>
                                  handleStatusUpdate(
                                    order.id,
                                    event.target.value
                                  )
                                }
                              >
                                {ORDER_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>

                              {updatingOrder === order.id && (
                                <small>Updating...</small>
                              )}
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

                <div className="admin-orders-table-footer">
                  <span>
                    Total Orders: <strong>{orders.length}</strong>
                  </span>

                  <span>
                    Showing all customer orders
                  </span>
                </div>
              </>
            )}

          </section>
        )}

        {/* FOOD MANAGEMENT PAGE */}
        {activePage === 'Food Management' && (
          <AdminFoodManagement />
        )}

        {/* REPORTS & ANALYTICS PAGE */}
        {activePage === 'Reports & Analytics' && (
          <section className="admin-dashboard-section">

            <div className="admin-orders-heading">
              <div>
                <h2>Reports & Analytics</h2>
                <p>
                  Restaurant performance from actual database records.
                </p>
              </div>

              <button
                className="admin-refresh-btn"
                onClick={fetchReports}
                disabled={reportsLoading}
              >
                {reportsLoading ? 'Loading...' : '↻ Refresh Reports'}
              </button>
            </div>

            {reportsError && (
              <div className="admin-orders-error">
                {reportsError}
              </div>
            )}

            {reportsLoading && (
              <div className="admin-orders-message">
                Loading reports...
              </div>
            )}

            {!reportsLoading && !reportsError && reports && (
              <>
                <h2>Restaurant Overview</h2>

                <div className="admin-module-grid">

                  <div className="admin-module-card">
                    <span>▤</span>
                    <h3>Total Orders</h3>
                    <h2>{reports.summary.total_orders}</h2>
                  </div>

                  <div className="admin-module-card">
                    <span>₹</span>
                    <h3>Total Revenue</h3>
                    <h2>
                      {formatAmount(reports.summary.total_revenue)}
                    </h2>
                  </div>

                  <div className="admin-module-card">
                    <span>◷</span>
                    <h3>Pending Orders</h3>
                    <h2>{reports.summary.pending_orders}</h2>
                  </div>

                  <div className="admin-module-card">
                    <span>✓</span>
                    <h3>Delivered Orders</h3>
                    <h2>{reports.summary.delivered_orders}</h2>
                  </div>

                </div>

                <section className="admin-dashboard-section">
                  <h2>Order Status Summary</h2>

                  <div className="admin-module-grid">
                    {reports.order_status.map((item) => (
                      <div
                        className="admin-module-card"
                        key={item.status}
                      >
                        <h3>{item.label}</h3>
                        <h2>{item.count}</h2>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="admin-dashboard-section">
                  <h2>Monthly Sales Report</h2>

                  <div className="admin-orders-list">
                    {reports.monthly_sales.length > 0 ? (
                      reports.monthly_sales.map((item) => (
                        <div
                          className="admin-order-item"
                          key={item.month}
                        >
                          <strong>{item.month}</strong>
                          <span>Orders: {item.total_orders}</span>
                          <strong>
                            {formatAmount(item.total_revenue)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <div className="admin-orders-message">
                        No monthly sales data found.
                      </div>
                    )}
                  </div>
                </section>

                <section className="admin-dashboard-section">
                  <h2>Most Popular Food Items</h2>

                  <div className="admin-orders-list">
                    {reports.popular_foods.length > 0 ? (
                      reports.popular_foods.map((item) => (
                        <div
                          className="admin-order-item"
                          key={item.food_name}
                        >
                          <strong>{item.food_name}</strong>
                          <span>
                            Quantity: {item.total_quantity}
                          </span>
                          <span>
                            Orders: {item.total_orders}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="admin-orders-message">
                        No food sales data found.
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

          </section>
        )}

        {/* CUSTOMERS MANAGEMENT PAGE */}
        {activePage === 'Customers' && (
          <section className="admin-dashboard-section">

            <div className="admin-orders-heading">
              <div>
                <h2>Customers Management</h2>
                <p>
                  View registered DINEORA customers.
                </p>
              </div>

              <button
                className="admin-refresh-btn"
                onClick={() => fetchCustomers(customerSearch)}
                disabled={customersLoading}
              >
                {customersLoading ? 'Loading...' : '↻ Refresh Customers'}
              </button>
            </div>

            {customersError && (
              <div className="admin-orders-error">
                {customersError}
              </div>
            )}

            <div className="admin-module-grid">
              <div className="admin-module-card">
                <span>♙</span>
                <h3>Total Registered Customers</h3>
                <h2>
                  {customersLoading ? '...' : totalCustomers}
                </h2>
                <p>Registered customer accounts.</p>
              </div>
            </div>

            <form
              className="admin-customer-search"
              onSubmit={handleCustomerSearch}
            >
              <input
                type="text"
                placeholder="Search by customer name, phone or email..."
                value={customerSearch}
                onChange={(event) =>
                  setCustomerSearch(event.target.value)
                }
              />

              <button
                type="submit"
                disabled={customersLoading}
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClearCustomerSearch}
                disabled={customersLoading}
              >
                Clear
              </button>
            </form>

            {customersLoading ? (
              <div className="admin-orders-message">
                Loading registered customers...
              </div>
            ) : customers.length === 0 ? (
              <div className="admin-orders-message">
                <h3>No Customers Found</h3>
                <p>
                  No registered customers match your search.
                </p>
              </div>
            ) : (
              <div className="admin-orders-list">

                {customers.map((customer) => (
                  <article
                    className="admin-order-card admin-customer-card"
                    key={customer.id}
                  >

                    <div className="admin-order-top">
                      <div>
                        <span className="admin-order-label">
                          CUSTOMER ID
                        </span>
                        <h3>#{customer.id}</h3>
                      </div>

                      <span className="admin-order-status delivered">
                        {customer.role || 'CUSTOMER'}
                      </span>
                    </div>

                    <div className="admin-order-details">

                      <div>
                        <span>Customer Name</span>
                        <strong>
                          {customer.first_name || 'Not provided'}
                        </strong>
                      </div>

                      <div>
                        <span>Phone Number</span>
                        <strong>
                          {customer.phone_number || customer.username || 'N/A'}
                        </strong>
                      </div>

                      <div>
                        <span>Registered Date</span>
                        <strong>
                          {formatDate(customer.registered_at)}
                        </strong>
                      </div>

                    </div>

                    <div className="admin-order-address">
                      <span>Customer Address</span>
                      <p>
                        {customer.address || 'Address not provided'}
                      </p>
                    </div>

                  </article>
                ))}

              </div>
            )}

          </section>
        )}

        <footer className="admin-dashboard-footer">
          DINEORA Restaurant Administration
        </footer>

      </main>

    </div>
  )
}
