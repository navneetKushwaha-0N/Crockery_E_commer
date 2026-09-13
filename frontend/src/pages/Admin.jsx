import React, { useEffect, useState } from 'react'
import { adminService } from '../services/adminService'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { user, logout } = useAuth()

  // =========================
  // Dashboard State
  // =========================
  const [dashboard, setDashboard] = useState(null)

  // =========================
  // Product State
  // =========================
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // =========================
  // Order State
  // =========================
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [courierName, setCourierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  // =========================
  // General State
  // =========================
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // =========================
  // Announcement Bar State
  // =========================
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(false)
  const [savingAnnouncement, setSavingAnnouncement] = useState(false)

  // =========================
  // Hero Slides State
  // =========================
  const [heroSlides, setHeroSlides] = useState([])
  const [loadingHeroSlides, setLoadingHeroSlides] = useState(false)
  const [savingHeroSlides, setSavingHeroSlides] = useState(false)

  // =========================
  // Product Form State
  // =========================
  const emptyProduct = {
    name: '',
    slug: '',
    description: '',
    category: '',
    mrp: '',
    price: '',
    stock: '',
    images: [''],
    productDetails: '',
    shippingPayment: '',
    returnExchange: ''
  }

  const [form, setForm] = useState(emptyProduct)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // =========================
  // Load Dashboard
  // =========================
  useEffect(() => {
    if (user?.role !== 'admin') return

    loadDashboard()
    loadProducts()
    loadOrders()
    loadAnnouncement()
    loadHeroSlides()
  }, [user])

  // =========================
  // Dashboard API
  // =========================
  const loadDashboard = async () => {
    try {
      setError('')

      const result = await adminService.dashboard()

      setDashboard(result.data)
    } catch (err) {
      setError(err.message || 'Unable to load dashboard')
    }
  }

  // =========================
  // Announcement API
  // =========================
  const loadAnnouncement = async () => {
    try {
      setLoadingAnnouncement(true)
      const result = await apiRequest('/cms/announcement')
      const data = result?.data || result?.announcement || result || {}

      setAnnouncementText(data?.text || data?.message || '')
      setAnnouncementEnabled(
        data?.enabled !== undefined ? Boolean(data.enabled) : true
      )
    } catch (err) {
      setError(err.message || 'Unable to load announcement')
    } finally {
      setLoadingAnnouncement(false)
    }
  }

  const handleSaveAnnouncement = async e => {
    e.preventDefault()

    const text = announcementText.trim()

    if (!text) {
      setError('Announcement message is required.')
      return
    }

    try {
      setSavingAnnouncement(true)
      setError('')
      setMessage('')

      const result = await apiRequest('/cms/announcement', {
        method: 'PUT',
        body: JSON.stringify({
          text,
          enabled: announcementEnabled
        })
      })

      const data = result?.data || result?.announcement || result || {}

      setAnnouncementText(data?.text || data?.message || text)
      setAnnouncementEnabled(
        data?.enabled !== undefined
          ? Boolean(data.enabled)
          : announcementEnabled
      )

      setMessage('Announcement bar updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update announcement')
    } finally {
      setSavingAnnouncement(false)
    }
  }

  // =========================
  // Hero Slides API
  // =========================

  const loadHeroSlides = async () => {
    try {
      setLoadingHeroSlides(true)

      const result = await apiRequest('/cms/hero/admin')
      const data =
        result?.data?.slides ||
        result?.slides ||
        result?.data ||
        []

      setHeroSlides(
        Array.isArray(data)
          ? data.map((slide, index) => ({
              image: slide?.image || slide?.imageUrl || '',
              alt: slide?.alt || slide?.title || `Hero slide ${index + 1}`,
              enabled:
                slide?.enabled !== undefined
                  ? Boolean(slide.enabled)
                  : true
            }))
          : []
      )
    } catch (err) {
      setError(err.message || 'Unable to load hero slides')
    } finally {
      setLoadingHeroSlides(false)
    }
  }

  const addHeroSlide = () => {
    setHeroSlides(prev => [
      ...prev,
      {
        image: '',
        alt: `Hero slide ${prev.length + 1}`,
        enabled: true
      }
    ])
  }

  const updateHeroSlide = (index, field, value) => {
    setHeroSlides(prev =>
      prev.map((slide, slideIndex) =>
        slideIndex === index
          ? { ...slide, [field]: value }
          : slide
      )
    )
  }

  const removeHeroSlide = index => {
    setHeroSlides(prev =>
      prev.filter((_, slideIndex) => slideIndex !== index)
    )
  }

  const moveHeroSlide = (index, direction) => {
    setHeroSlides(prev => {
      const targetIndex = index + direction

      if (
        targetIndex < 0 ||
        targetIndex >= prev.length
      ) {
        return prev
      }

      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(targetIndex, 0, moved)

      return next
    })
  }

  const handleSaveHeroSlides = async () => {
    const cleanedSlides = heroSlides
      .map(slide => ({
        image: String(slide.image || '').trim(),
        alt: String(slide.alt || '').trim(),
        enabled: Boolean(slide.enabled)
      }))
      .filter(slide => slide.image)

    if (!cleanedSlides.length) {
      setError('Please add at least one hero image.')
      return
    }

    try {
      setSavingHeroSlides(true)
      setError('')
      setMessage('')

      const result = await apiRequest('/cms/hero', {
        method: 'PUT',
        body: JSON.stringify({
          slides: cleanedSlides
        })
      })

      const data =
        result?.data?.slides ||
        result?.slides ||
        result?.data ||
        cleanedSlides

      setHeroSlides(
        Array.isArray(data)
          ? data.map((slide, index) => ({
              image: slide?.image || slide?.imageUrl || '',
              alt:
                slide?.alt ||
                slide?.title ||
                `Hero slide ${index + 1}`,
              enabled:
                slide?.enabled !== undefined
                  ? Boolean(slide.enabled)
                  : true
            }))
          : cleanedSlides
      )

      setMessage('Hero images updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update hero images')
    } finally {
      setSavingHeroSlides(false)
    }
  }

  // =========================
  // Products API
  // =========================
  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      setError('')

      const result = await adminService.products()

      setProducts(
        result?.data ||
        result?.products ||
        []
      )
    } catch (err) {
      setError(err.message || 'Unable to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  // =========================
  // Orders API
  // =========================
  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      setError('')

      const result = await apiRequest('/orders?all=true')
      setOrders(result?.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  // =========================
  // Update Order Status
  // =========================
  const handleOrderStatus = async (orderId, status, courier = courierName, tracking = trackingNumber) => {
    try {
      setUpdatingOrderId(orderId)
      setError('')
      setMessage('')

      const result = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          courierName: courier.trim(),
          trackingNumber: tracking.trim()
        })
      })

      if (!result?.success) {
        throw new Error(result?.message || 'Unable to update order')
      }

      const updatedOrder = result.data

      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? updatedOrder : order
        )
      )

      setSelectedOrder(prev =>
        prev?._id === orderId ? updatedOrder : prev
      )

      setMessage(`Order status changed to ${status.replace(/_/g, ' ')}.`)

      setCourierName(updatedOrder?.courierName || courier.trim())
      setTrackingNumber(updatedOrder?.trackingNumber || tracking.trim())
    } catch (err) {
      setError(err.message || 'Unable to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // =========================
  // Order Helpers
  // =========================
  const formatDate = value => {
    if (!value) return '—'
    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  const orderCustomer = order =>
    order?.shippingAddress?.name ||
    order?.user?.name ||
    'Customer'

  const orderEmail = order =>
    order?.shippingAddress?.email ||
    order?.user?.email ||
    '—'

  const orderPhone = order =>
    order?.shippingAddress?.phone || '—'

  const statusOptions = [
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ]

  const statusLabel = status =>
    status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())

  // =========================
  // Form Input Handler
  // =========================
  const handleChange = e => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // =========================
  // Multiple Product Images
  // =========================
  const handleImageChange = (index, value) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((image, imageIndex) =>
        imageIndex === index ? value : image
      )
    }))
  }

  const addImageField = () => {
    setForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const removeImageField = index => {
    setForm(prev => {
      const images = prev.images.filter((_, imageIndex) => imageIndex !== index)
      return {
        ...prev,
        images: images.length ? images : ['']
      }
    })
  }

  // =========================
  // Open Add Product Form
  // =========================
  const handleAddProduct = () => {
    setEditingId(null)
    setForm(emptyProduct)
    setError('')
    setMessage('')
    setShowForm(true)
  }

  // =========================
  // Open Edit Product Form
  // =========================
  const handleEditProduct = product => {
    setEditingId(product._id)

    setForm({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      category: product.category || '',
      mrp: product.mrp ?? product.compareAtPrice ?? '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      images: Array.isArray(product.images) && product.images.length
        ? product.images
        : [''],
      productDetails: product.productDetails || '',
      shippingPayment: product.shippingPayment || '',
      returnExchange: product.returnExchange || ''
    })

    setError('')
    setMessage('')
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // =========================
  // Close Product Form
  // =========================
  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyProduct)
    setError('')
  }

  // =========================
  // Submit Product
  // =========================
  const handleSubmit = async e => {
    e.preventDefault()

    setError('')
    setMessage('')

    // Basic validation
    if (!form.name.trim()) {
      setError('Product name is required.')
      return
    }

    if (!form.slug.trim()) {
      setError('Product slug is required.')
      return
    }

    if (!form.description.trim()) {
      setError('Product description is required.')
      return
    }

    if (!form.category.trim()) {
      setError('Product category is required.')
      return
    }

    if (form.mrp === '' || Number(form.mrp) < 0) {
      setError('Please enter a valid MRP.')
      return
    }

    if (form.price === '' || Number(form.price) < 0) {
      setError('Please enter a valid selling price.')
      return
    }

    if (Number(form.price) > Number(form.mrp)) {
      setError('Selling price cannot be higher than MRP.')
      return
    }

    if (form.stock !== '' && Number(form.stock) < 0) {
      setError('Stock cannot be negative.')
      return
    }

    const productImages = form.images
      .map(url => url.trim())
      .filter(Boolean)

    if (!productImages.length) {
      setError('Please add at least one product image URL.')
      return
    }

    // Convert form data to backend format
    const productData = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim(),
      category: form.category.trim(),
      mrp: Number(form.mrp),
      compareAtPrice: Number(form.mrp),
      price: Number(form.price),
      stock:
        form.stock === ''
          ? 0
          : Number(form.stock),
      images: productImages,
      productDetails: form.productDetails.trim(),
      shippingPayment: form.shippingPayment.trim(),
      returnExchange: form.returnExchange.trim()
    }

    try {
      setSaving(true)

      if (editingId) {
        // Update existing product
        await adminService.updateProduct(
          editingId,
          productData
        )

        setMessage('Product updated successfully.')
      } else {
        // Create new product
        await adminService.createProduct(
          productData
        )

        setMessage('Product added successfully.')
      }

      setForm(emptyProduct)
      setEditingId(null)
      setShowForm(false)

      await loadProducts()
      await loadDashboard()
    } catch (err) {
      setError(
        err.message ||
        'Unable to save product.'
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // Archive Product
  // =========================
  const handleArchive = async product => {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${product.name}"?`
    )

    if (!confirmed) return

    try {
      setError('')
      setMessage('')

      await adminService.archiveProduct(
        product._id
      )

      setMessage(
        'Product archived successfully.'
      )

      await loadProducts()
      await loadDashboard()
    } catch (err) {
      setError(
        err.message ||
        'Unable to archive product.'
      )
    }
  }

  // =========================
  // Admin Access Check
  // =========================
  if (user?.role !== 'admin') {
    return (
      <main className="page">
        <div className="wrap narrow">
          <h1>Admin access required</h1>

          <p>
            Sign in with an administrator
            account to manage the store.
          </p>
        </div>
      </main>
    )
  }

  // =========================
  // Admin UI
  // =========================
  return (
    <main className="page">
      <div className="wrap">

        {/* =========================
            Page Header
        ========================== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '30px'
          }}
        >
          <div>
            <span className="eyebrow">
              Operations
            </span>

            <h1>
              Store dashboard
            </h1>

            <p>
              Manage your XAAJ store,
              products and inventory.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button"
              onClick={handleAddProduct}
            >
              + Add Product
            </button>

            <button
              type="button"
              className="button button-light"
              onClick={async () => {
                await logout()
                window.location.href = '/account'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* =========================
            Success Message
        ========================== */}
        {message && (
          <div
            style={{
              padding: '14px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: '#edf7ed',
              color: '#246b2a'
            }}
          >
            {message}
          </div>
        )}

        {/* =========================
            Error Message
        ========================== */}
        {error && (
          <div
            style={{
              padding: '14px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: '#fff1f0',
              color: '#b42318'
            }}
          >
            {error}
          </div>
        )}

        {/* =========================
            Dashboard Stats
        ========================== */}
        {dashboard && (
          <section
            style={{
              marginBottom: '50px'
            }}
          >
            <div className="product-grid">

              <div className="summary">
                <strong>
                  {dashboard.sales ?? 0}
                </strong>

                <span>
                  Total sales
                </span>
              </div>

              <div className="summary">
                <strong>
                  {dashboard.orders ?? 0}
                </strong>

                <span>
                  Orders
                </span>
              </div>

              <div className="summary">
                <strong>
                  {dashboard.customers ?? 0}
                </strong>

                <span>
                  Customers
                </span>
              </div>

              <div className="summary">
                <strong>
                  {dashboard.lowStock ?? 0}
                </strong>

                <span>
                  Low stock
                </span>
              </div>

            </div>
          </section>
        )}

        {/* =========================
            Announcement Bar Management
        ========================== */}
        <section
          style={{
            marginBottom: '50px',
            padding: '28px',
            border: '1px solid #e5e5e5',
            borderRadius: '12px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}
          >
            <div>
              <span className="eyebrow">Website Content</span>
              <h2>Announcement Bar</h2>
              <p>
                Update the message shown in the announcement bar on the
                customer website.
              </p>
            </div>

            <div
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                background: announcementEnabled ? '#edf7ed' : '#f5f5f5',
                color: announcementEnabled ? '#246b2a' : '#666',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {announcementEnabled ? 'Live on website' : 'Hidden'}
            </div>
          </div>

          {loadingAnnouncement ? (
            <p>Loading announcement...</p>
          ) : (
            <form onSubmit={handleSaveAnnouncement}>
              <label
                htmlFor="announcement-text"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Announcement Message *
              </label>

              <textarea
                id="announcement-text"
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                placeholder="Example: Free shipping on orders above ₹5,000"
                rows={3}
                maxLength={200}
                style={{
                  width: '100%',
                  marginBottom: '8px',
                  resize: 'vertical'
                }}
                required
              />

              <small>
                Maximum 200 characters.
              </small>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '18px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={announcementEnabled}
                  onChange={e => setAnnouncementEnabled(e.target.checked)}
                />
                Show announcement on website
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '18px'
                }}
              >
                <button
                  type="submit"
                  className="button"
                  disabled={savingAnnouncement || loadingAnnouncement}
                >
                  {savingAnnouncement ? 'Saving...' : 'Save Announcement'}
                </button>

                <button
                  type="button"
                  onClick={loadAnnouncement}
                  disabled={savingAnnouncement || loadingAnnouncement}
                >
                  Refresh
                </button>
              </div>
            </form>
          )}
        </section>

        {/* =========================
            Hero Images Management
        ========================== */}
        <section
          style={{
            marginBottom: '50px',
            padding: '28px',
            border: '1px solid #e5e5e5',
            borderRadius: '12px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}
          >
            <div>
              <span className="eyebrow">Website Content</span>
              <h2>Hero Images</h2>
              <p>
                Change the homepage hero photos without changing
                the existing hero text or button.
              </p>
            </div>

            <div
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                background: '#f5f5f5',
                color: '#555',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {heroSlides.length} slide{heroSlides.length === 1 ? '' : 's'}
            </div>
          </div>

          {loadingHeroSlides ? (
            <p>Loading hero images...</p>
          ) : (
            <>
              {heroSlides.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gap: '16px'
                  }}
                >
                  {heroSlides.map((slide, index) => (
                    <div
                      key={`hero-slide-${index}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '140px 1fr auto',
                        gap: '18px',
                        alignItems: 'start',
                        padding: '16px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '10px'
                      }}
                    >
                      <div
                        style={{
                          width: '140px',
                          height: '90px',
                          borderRadius: '7px',
                          overflow: 'hidden',
                          background: '#f5f5f5'
                        }}
                      >
                        {slide.image ? (
                          <img
                            src={slide.image}
                            alt={slide.alt || `Hero slide ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: '11px',
                              color: '#777'
                            }}
                          >
                            Image preview
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gap: '9px'
                        }}
                      >
                        <strong>Slide {index + 1}</strong>

                        <input
                          value={slide.image}
                          onChange={e =>
                            updateHeroSlide(
                              index,
                              'image',
                              e.target.value
                            )
                          }
                          placeholder="Hero image URL"
                        />

                        <input
                          value={slide.alt}
                          onChange={e =>
                            updateHeroSlide(
                              index,
                              'alt',
                              e.target.value
                            )
                          }
                          placeholder="Image alt text"
                        />

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={slide.enabled}
                            onChange={e =>
                              updateHeroSlide(
                                index,
                                'enabled',
                                e.target.checked
                              )
                            }
                          />
                          Active on website
                        </label>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '7px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            moveHeroSlide(index, -1)
                          }
                          disabled={index === 0}
                          title="Move slide up"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveHeroSlide(index, 1)
                          }
                          disabled={
                            index === heroSlides.length - 1
                          }
                          title="Move slide down"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeHeroSlide(index)
                          }
                          title="Remove slide"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {heroSlides.length === 0 && (
                <div
                  style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    border: '1px dashed #d9d3ca',
                    borderRadius: '10px',
                    marginBottom: '15px'
                  }}
                >
                  <p style={{ marginTop: 0 }}>
                    No hero images configured yet.
                  </p>
                </div>
              )}

              <small
                style={{
                  display: 'block',
                  marginTop: '14px',
                  color: '#777'
                }}
              >
                The homepage hero text and “Explore the collection”
                button remain unchanged. Only the hero photos are
                managed here.
              </small>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '18px'
                }}
              >
                <button
                  type="button"
                  onClick={addHeroSlide}
                  disabled={savingHeroSlides}
                >
                  + Add Hero Image
                </button>

                <button
                  type="button"
                  className="button"
                  onClick={handleSaveHeroSlides}
                  disabled={
                    savingHeroSlides ||
                    loadingHeroSlides
                  }
                >
                  {savingHeroSlides
                    ? 'Saving...'
                    : 'Save Hero Images'}
                </button>

                <button
                  type="button"
                  onClick={loadHeroSlides}
                  disabled={
                    savingHeroSlides ||
                    loadingHeroSlides
                  }
                >
                  Refresh
                </button>
              </div>
            </>
          )}
        </section>

        {/* =========================
            Add / Edit Product Form
        ========================== */}
        {showForm && (
          <section
            style={{
              marginBottom: '50px',
              padding: '28px',
              border: '1px solid #e5e5e5',
              borderRadius: '12px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                gap: '20px'
              }}
            >
              <div>
                <span className="eyebrow">
                  Products
                </span>

                <h2>
                  {editingId
                    ? 'Edit Product'
                    : 'Add Product'}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '8px 14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="checkout-form"
            >

              {/* Product Name */}
              <label>
                Product Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Ivory Dinner Set"
                required
              />

              {/* Slug */}
              <label>
                Slug *
              </label>

              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="ivory-dinner-set"
                required
              />

              {/* Category */}
              <label>
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Category
                </option>
                <option value="Dinner Sets">Dinner Sets</option>
                <option value="Plates">Plates</option>
                <option value="Bowls">Bowls</option>
                <option value="Cups & Mugs">Cups & Mugs</option>
                <option value="Serveware">Serveware</option>
                <option value="Glassware">Glassware</option>
              </select>

              {/* MRP */}
              <label>
                MRP (Original Price) *
              </label>

              <input
                name="mrp"
                value={form.mrp}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.01"
                placeholder="4500"
                required
              />

              <small>
                This price will appear crossed out only when it is higher than the selling price.
              </small>

              {/* Selling Price */}
              <label>
                Selling Price *
              </label>

              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.01"
                placeholder="2499"
                required
              />

              {/* Stock */}
              <label>
                Stock
              </label>

              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                type="number"
                min="0"
                step="1"
                placeholder="20"
              />

              {/* Product Description */}
              <label>
                Product Description *
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write the main product description..."
                rows={6}
                required
              />

              {/* Product Details & Care */}
              <label>
                Product Details & Care
              </label>

              <textarea
                name="productDetails"
                value={form.productDetails}
                onChange={handleChange}
                placeholder="Material, size, dimensions, care instructions, what's included, etc."
                rows={6}
              />

              {/* Shipping & Payment */}
              <label>
                Shipping & Payment
              </label>

              <textarea
                name="shippingPayment"
                value={form.shippingPayment}
                onChange={handleChange}
                placeholder="Delivery time, shipping charges, payment information, etc."
                rows={5}
              />

              {/* Return & Exchange */}
              <label>
                Return & Exchange
              </label>

              <textarea
                name="returnExchange"
                value={form.returnExchange}
                onChange={handleChange}
                placeholder="Return window, exchange conditions and process..."
                rows={5}
              />

              {/* Multiple Product Images */}
              <label>
                Product Images *
              </label>

              <div
                style={{
                  display: 'grid',
                  gap: '10px'
                }}
              >
                {form.images.map((image, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      value={image}
                      onChange={e =>
                        handleImageChange(index, e.target.value)
                      }
                      placeholder={`Image URL ${index + 1}`}
                      style={{ flex: 1 }}
                    />

                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      disabled={form.images.length === 1}
                      title="Remove image"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addImageField}
                style={{
                  marginTop: '8px',
                  width: 'fit-content'
                }}
              >
                + Add Another Image
              </button>

              <small>
                Add as many product images as needed. The first image is used as the main product image.
              </small>

              {/* Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '10px'
                }}
              >
                <button
                  type="submit"
                  className="button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update Product'
                      : 'Add Product'}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>

            </form>
          </section>
        )}

        {/* =========================
            Order Management
        ========================== */}
        <section style={{ marginBottom: '50px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <span className="eyebrow">Sales</span>
              <h2>Customer Orders</h2>
              <p>View incoming orders and update their status.</p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loadingOrders}
            >
              {loadingOrders ? 'Loading...' : 'Refresh Orders'}
            </button>
          </div>

          {loadingOrders && <p>Loading customer orders...</p>}

          {!loadingOrders && orders.length === 0 && (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px solid #e5e5e5',
                borderRadius: '12px'
              }}
            >
              <h3>No orders yet</h3>
              <p>Customer orders will appear here after checkout.</p>
            </div>
          )}

          {!loadingOrders && orders.length > 0 && (
            <div style={{ display: 'grid', gap: '14px' }}>
              {orders.map(order => (
                <div
                  key={order._id}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'grid',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div>
                      <strong>
                        Order #{String(order._id).slice(-8).toUpperCase()}
                      </strong>
                      <p style={{ margin: '6px 0 0' }}>
                        {orderCustomer(order)} · {orderEmail(order)}
                      </p>
                      <small>
                        {formatDate(order.createdAt)}
                      </small>
                    </div>

                    <strong>₹{Number(order.total || 0).toLocaleString('en-IN')}</strong>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <small>Payment</small>
                      <div>
                        {order.paymentStatus || 'pending'}
                      </div>
                    </div>

                    <div>
                      <small>Items</small>
                      <div>
                        {order.items?.reduce(
                          (sum, item) => sum + Number(item.quantity || 0),
                          0
                        ) || 0}
                      </div>
                    </div>

                    <div>
                      <small>Phone</small>
                      <div>{orderPhone(order)}</div>
                    </div>

                    <div>
                      <small>Status</small>
                      <select
                        value={order.status || 'pending'}
                        disabled={updatingOrderId === order._id}
                        onChange={e =>
                          handleOrderStatus(order._id, e.target.value)
                        }
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order)
                        setCourierName(order.courierName || '')
                        setTrackingNumber(order.trackingNumber || '')
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedOrder && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,.45)',
                zIndex: 1000,
                padding: '24px',
                overflowY: 'auto'
              }}
              onClick={() => setSelectedOrder(null)}
            >
              <div
                style={{
                  maxWidth: '760px',
                  margin: '30px auto',
                  background: '#fff',
                  borderRadius: '14px',
                  padding: '28px',
                  boxShadow: '0 20px 60px rgba(0,0,0,.18)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                    marginBottom: '24px'
                  }}
                >
                  <div>
                    <span className="eyebrow">Order details</span>
                    <h2 style={{ marginBottom: '6px' }}>
                      #{String(selectedOrder._id).slice(-8).toUpperCase()}
                    </h2>
                    <small>{formatDate(selectedOrder.createdAt)}</small>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '18px'
                  }}
                >
                  <div>
                    <h3>Customer</h3>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Name:</strong> {orderCustomer(selectedOrder)}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Email:</strong> {orderEmail(selectedOrder)}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Phone:</strong> {orderPhone(selectedOrder)}
                    </p>
                  </div>

                  <div>
                    <h3>Shipping Address</h3>
                    <p style={{ margin: '6px 0' }}>
                      {selectedOrder.shippingAddress?.address || '—'}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      {selectedOrder.shippingAddress?.city || '—'},
                      {' '}
                      {selectedOrder.shippingAddress?.state || '—'}
                      {' '}
                      {selectedOrder.shippingAddress?.pin || '—'}
                    </p>
                  </div>

                  <div>
                    <h3>Products</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {selectedOrder.items?.map((item, index) => (
                        <div
                          key={`${item.product}-${index}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '16px',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '10px'
                          }}
                        >
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <strong>
                            ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3>Payment</h3>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Status:</strong>{' '}
                      {selectedOrder.paymentStatus || 'pending'}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Provider:</strong>{' '}
                      {selectedOrder.paymentProvider || '—'}
                    </p>
                    <p style={{ margin: '6px 0', wordBreak: 'break-all' }}>
                      <strong>Razorpay Order ID:</strong>{' '}
                      {selectedOrder.razorpayOrderId || '—'}
                    </p>
                    <p style={{ margin: '6px 0', wordBreak: 'break-all' }}>
                      <strong>Razorpay Payment ID:</strong>{' '}
                      {selectedOrder.razorpayPaymentId || '—'}
                    </p>
                  </div>

                  <div>
                    <h3>Order Total</h3>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Subtotal:</strong> ₹{Number(selectedOrder.subtotal || 0).toLocaleString('en-IN')}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Shipping:</strong> ₹{Number(selectedOrder.shippingFee || 0).toLocaleString('en-IN')}
                    </p>
                    <p style={{ margin: '6px 0', fontSize: '18px' }}>
                      <strong>Total:</strong> ₹{Number(selectedOrder.total || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div>
                    <h3>Delivery & Status</h3>

                    <label style={{ display: 'block', marginBottom: '6px' }}>
                      Courier Name
                    </label>
                    <input
                      value={courierName}
                      onChange={e => setCourierName(e.target.value)}
                      placeholder="Example: Delhivery"
                      style={{ width: '100%', marginBottom: '14px' }}
                    />

                    <label style={{ display: 'block', marginBottom: '6px' }}>
                      Tracking Number
                    </label>
                    <input
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="Example: DL123456789"
                      style={{ width: '100%', marginBottom: '14px' }}
                    />

                    <label style={{ display: 'block', marginBottom: '6px' }}>
                      Order Status
                    </label>
                    <select
                      value={selectedOrder.status || 'pending'}
                      disabled={updatingOrderId === selectedOrder._id}
                      onChange={e =>
                        handleOrderStatus(
                          selectedOrder._id,
                          e.target.value,
                          courierName,
                          trackingNumber
                        )
                      }
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>

                    {(selectedOrder.courierName || selectedOrder.trackingNumber) && (
                      <div style={{ marginTop: '14px', padding: '12px', background: '#f7f7f7', borderRadius: '8px' }}>
                        <small>Current delivery details</small>
                        <p style={{ margin: '6px 0' }}>
                          <strong>Courier:</strong> {selectedOrder.courierName || '—'}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Tracking:</strong> {selectedOrder.trackingNumber || '—'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =========================
            Product Management
        ========================== */}
        <section>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <span className="eyebrow">
                Inventory
              </span>

              <h2>
                Products
              </h2>
            </div>

            <button
              type="button"
              onClick={loadProducts}
              disabled={loadingProducts}
            >
              {loadingProducts
                ? 'Loading...'
                : 'Refresh'}
            </button>
          </div>

          {/* Loading */}
          {loadingProducts && (
            <p>
              Loading products...
            </p>
          )}

          {/* Empty State */}
          {!loadingProducts &&
            products.length === 0 && (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  border: '1px solid #e5e5e5',
                  borderRadius: '12px'
                }}
              >
                <h3>
                  No products yet
                </h3>

                <p>
                  Add your first product to
                  start selling.
                </p>

                <button
                  type="button"
                  className="button"
                  onClick={handleAddProduct}
                >
                  + Add Product
                </button>
              </div>
            )}

          {/* Product List */}
          {!loadingProducts &&
            products.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gap: '16px'
                }}
              >
                {products.map(product => (
                  <div
                    key={product._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '90px 1fr auto',
                      gap: '20px',
                      alignItems: 'center',
                      padding: '18px',
                      border:
                        '1px solid #e5e5e5',
                      borderRadius: '12px'
                    }}
                  >

                    {/* Product Image */}
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#f5f5f5'
                      }}
                    >
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: '100%',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '12px'
                          }}
                        >
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product Information */}
                    <div>
                      <h3
                        style={{
                          margin:
                            '0 0 6px'
                        }}
                      >
                        {product.name}
                      </h3>

                      <p
                        style={{
                          margin:
                            '0 0 6px'
                        }}
                      >
                        {product.category}
                      </p>

                      <div>
                        <strong>
                          ₹{Number(product.price || 0).toLocaleString('en-IN')}
                        </strong>

                        {Number(product.mrp ?? product.compareAtPrice ?? 0) > Number(product.price || 0) && (
                          <del style={{ marginLeft: '10px' }}>
                            ₹{Number(product.mrp ?? product.compareAtPrice).toLocaleString('en-IN')}
                          </del>
                        )}

                        <span
                          style={{
                            marginLeft: '15px'
                          }}
                        >
                          Stock:{' '}
                          {product.stock ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleEditProduct(
                            product
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleArchive(
                            product
                          )
                        }
                      >
                        Archive
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

        </section>

      </div>
    </main>
  )
}