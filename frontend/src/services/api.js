// ============================================================
// API CONFIGURATION
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:7100/api'
).replace(/\/$/, '')


// ============================================================
// COMMON API REQUEST
// ============================================================

export async function apiRequest(path, options = {}) {
  const token =
    window.localStorage.getItem('xaaj_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  // Add JWT token when user is logged in
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
      credentials: 'include'
    }
  )

  const body =
    await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      body.message ||
      'Something went wrong'
    )
  }

  return body
}


// ============================================================
// AUTH SERVICES
// ============================================================

export const authService = {

  // ----------------------------------------------------------
  // Register new customer
  // ----------------------------------------------------------
  register: data =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  // ----------------------------------------------------------
  // Normal login
  // ----------------------------------------------------------
  login: data =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  // ----------------------------------------------------------
  // Verify registration email OTP
  // ----------------------------------------------------------
  verifyEmail: data =>
    apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  // ----------------------------------------------------------
  // Resend registration email OTP
  // ----------------------------------------------------------
  resendVerification: data =>
    apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  // ----------------------------------------------------------
  // Forgot password
  // Sends 6-digit OTP to registered email
  // ----------------------------------------------------------
  forgotPassword: data =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  // ----------------------------------------------------------
  // Verify password reset OTP
  // Returns reset token after OTP verification
  // ----------------------------------------------------------
  verifyResetOtp: data =>
    apiRequest('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  // ----------------------------------------------------------
  // Reset password
  // Requires reset token after OTP verification
  // ----------------------------------------------------------
  resetPassword: data =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  // ----------------------------------------------------------
  // Get currently logged-in user
  // ----------------------------------------------------------
  me: () =>
    apiRequest('/auth/me'),


  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST'
    })
}


// ============================================================
// PRODUCT SERVICES
// ============================================================

export const productService = {

  // Get product list
  list: params => {
    const query = new URLSearchParams(
      params || {}
    ).toString()

    return apiRequest(
      `/products${query ? `?${query}` : ''}`
    )
  },


  // Get single product by slug
  get: slug =>
    apiRequest(
      `/products/${encodeURIComponent(slug)}`
    )
}


// ============================================================
// CART SERVICES
// ============================================================

export const cartService = {

  // Get cart
  get: () =>
    apiRequest('/commerce/cart'),


  // Update cart
  update: items =>
    apiRequest('/commerce/cart', {
      method: 'PUT',
      body: JSON.stringify({ items })
    })
}


// ============================================================
// WISHLIST SERVICES
// ============================================================

export const wishlistService = {

  // Get wishlist
  get: () =>
    apiRequest('/commerce/wishlist'),


  // Add product to wishlist
  add: id =>
    apiRequest(
      `/commerce/wishlist/${id}`,
      {
        method: 'POST'
      }
    ),


  // Remove product from wishlist
  remove: id =>
    apiRequest(
      `/commerce/wishlist/${id}`,
      {
        method: 'DELETE'
      }
    )
}


// ============================================================
// ORDER SERVICES
// ============================================================

export const orderService = {

  // Get logged-in user's orders
  list: () =>
    apiRequest('/orders'),


  // Create order
  create: data =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  // Get single order
  get: id =>
    apiRequest(`/orders/${id}`)
}


// ============================================================
// PAYMENT SERVICES
// ============================================================

export const paymentService = {

  // Create Razorpay + MongoDB pending order
  createOrder: data =>
    apiRequest('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  // Verify Razorpay payment
  verify: data =>
    apiRequest('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    })
}


// ============================================================
// EXPORT
// ============================================================

export { API_URL }