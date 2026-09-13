// ============================================================
// IMPORTS
// ============================================================

import React, { useEffect, useState } from 'react'

import {
  BrowserRouter,
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom'

import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  Star,
  Minus,
  Plus,
  Globe,
  MessageCircle,

  // Trust / Service section icons
  Gem,
  Truck,
  Package,
  ShieldCheck
} from 'lucide-react'

// Instagram icon
import { FaInstagram } from 'react-icons/fa'

import './styles.css'

// API
import { apiRequest, productService, orderService } from './services/api'

// Authentication / Context
import {
  AuthProvider,
  useAuth
} from './context/AuthContext'

// Store / Context
import {
  StoreProvider,
  useStore
} from './context/StoreContext'

// Admin page
import Admin from './pages/Admin'

// Product data
import {
  images,
  products
} from './data/products'

// Category data
import {
  categories
} from './data/categories'

// Currency formatter
import {
  money
} from './utils/formatters'


// ============================================================
// IMAGE URLs
// ============================================================

const logoUrl =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/XAAJ-2yUrpJO9vc2pmdbPlcTgeW8taxlHLN.png'

const heroImage =
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1800&q=88'

const tableImage =
  'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1200&q=86'


// ============================================================
// HEADER
// ============================================================

function Header() {

  // Mobile menu state
  const [open, setOpen] = useState(false)

  // Search bar state
  const [search, setSearch] = useState(false)

  // Cart item count
  const { count } = useStore()

  // Announcement bar state
  const [announcementText, setAnnouncementText] = useState(
    'Free shipping on orders above ₹5,000'
  )
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)

  // Load announcement from backend
  useEffect(() => {
    let cancelled = false

    async function loadAnnouncement() {
      try {
        const result = await apiRequest('/cms/announcement')
        const data = result?.data || result?.announcement || result || {}

        if (cancelled) return

        if (data?.text || data?.message) {
          setAnnouncementText(data.text || data.message)
        }

        if (data?.enabled !== undefined) {
          setAnnouncementEnabled(Boolean(data.enabled))
        }
      } catch (error) {
        console.error('Announcement load error:', error)
        // Keep default announcement if API is unavailable.
      }
    }

    loadAnnouncement()

    return () => {
      cancelled = true
    }
  }, [])

  // Navigation
  const navigate = useNavigate()

  // Navigation links
  const nav = [
    'Shop',
    'Collections',
    'Our Story',
    'Journal',
    'Contact'
  ]

  return (
    <>

      {/* Announcement Bar */}
      {announcementEnabled && announcementText && (
        <div
          className="announcement"
          role="status"
          aria-label="Store announcement"
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          <div
            style={{
              display: 'inline-block',
              minWidth: '100%',
              animation: 'xaajAnnouncement 18s linear infinite'
            }}
          >
            <span style={{ marginRight: '60px' }}>
              {announcementText}
            </span>
            <span style={{ marginRight: '60px' }}>
              {announcementText}
            </span>
          </div>

          <style>{`
            @keyframes xaajAnnouncement {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      )}


      {/* Main Header */}
      <header className="header">

        {/* Mobile Menu Button */}
        <button
          className="icon mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
        >
          {open ? <X /> : <Menu />}
        </button>


        {/* Desktop Search Button */}
        <button
          className="icon desktop-search"
          onClick={() => setSearch(!search)}
          aria-label="Search"
        >
          <Search />
        </button>


        {/* Logo */}
        <Link
          to="/"
          className="brand"
        >
          <img
            src={logoUrl}
            alt="XAAJ Stores Crafted in Earth"
          />

          <span>
            STORES CRAFTED IN EARTH
          </span>
        </Link>


        {/* Header Actions */}
        <div className="header-actions">

          {/* Account */}
          <button
            className="icon"
            aria-label="Account"
            onClick={() => navigate('/account')}
          >
            <UserRound />
          </button>


          {/* Wishlist */}
          <button
            className="icon"
            aria-label="Wishlist"
            onClick={() => navigate('/wishlist')}
          >
            <Heart />
          </button>


          {/* Cart */}
          <button
            className="bag"
            aria-label="Cart"
            onClick={() => navigate('/cart')}
          >
            <ShoppingBag />

            {count > 0 && (
              <b>{count}</b>
            )}
          </button>

        </div>

      </header>


      {/* Search Bar */}
      {search && (
        <form
          className="searchbar"
          onSubmit={e => {

            e.preventDefault()

            navigate(
              `/shop?search=${e.target.q.value}`
            )

            setSearch(false)
          }}
        >

          <Search />

          <input
            name="q"
            autoFocus
            placeholder="Search for plates, mugs, vessels..."
          />

          <button>
            Search
          </button>

        </form>
      )}


      {/* Navigation */}
      <nav
        className={`nav ${
          open ? 'nav-open' : ''
        }`}
      >

        {nav.map(n => (

          <Link
            key={n}
            to={
              n === 'Shop'
                ? '/shop'
                : n === 'Our Story'
                ? '/story'
                : `/${n.toLowerCase()}`
            }
            onClick={() => setOpen(false)}
          >
            {n}
          </Link>

        ))}


        {/* New Arrivals */}
        <Link to="/shop?filter=new">
          New Arrivals
        </Link>

      </nav>

    </>
  )
}


// ============================================================
// BUTTON COMPONENT
// ============================================================

function Button({
  children,
  to,
  onClick,
  light = false
}) {

  // If "to" exists, use Link.
  // Otherwise use normal button.
  const Tag = to ? Link : 'button'

  return (
    <Tag
      to={to}
      onClick={onClick}
      className={`button ${
        light ? 'button-light' : ''
      }`}
    >

      {children}

      <ArrowRight size={15} />

    </Tag>
  )
}


// ============================================================
// RATING COMPONENT
// ============================================================

function Rating({
  count = 5,
  reviews
}) {
  const rating = Math.max(
    0,
    Math.min(5, Number(count) || 0)
  )

  return (
    <span className="rating">
      <span>
        {'★'.repeat(rating)}
      </span>

      {reviews > 0 ? (
        <small>
          ({reviews})
        </small>
      ) : (
        <small>
          No reviews yet
        </small>
      )}
    </span>
  )
}


// ============================================================
// PRODUCT CARD
// ============================================================

function ProductCard({
  product
}) {

  const {
    add,
    wish,
    toggleWish
  } = useStore()

  // Check if product is already in wishlist
  const liked =
    wish.includes(product.id)

  return (
    <article className="product-card">


      {/* Product Image */}
      <div className="product-image">

        <Link
          to={`/product/${product.slug}`}
        >
          <img
            src={product.image}
            alt={product.name}
          />
        </Link>


        {/* Product Tag */}
        <span className="tag">
          {product.tag}
        </span>


        {/* Wishlist Button */}
        <button
          className={`heart ${
            liked ? 'liked' : ''
          }`}
          onClick={() =>
            toggleWish(product.id)
          }
          aria-label="Add to wishlist"
        >

          <Heart
            size={17}
            fill={
              liked
                ? 'currentColor'
                : 'none'
            }
          />

        </button>

      </div>


      {/* Product Details */}
      <div className="product-copy">

        <Link
          to={`/product/${product.slug}`}
        >
          <h3>
            {product.name}
          </h3>
        </Link>


        {/* Category */}
        <p>
          {product.category}
        </p>


        {/* Rating */}
        <Rating
          count={product.rating}
          reviews={product.reviews}
        />


        {/* Price */}
        <div className="price">

          <strong>
            {money(product.price)}
          </strong>

          {Number(product.old || 0) > Number(product.price || 0) && (
            <del>
              {money(product.old)}
            </del>
          )}

        </div>


        {/* Add To Cart */}
        <button
          className="add"
          onClick={() =>
            add(product)
          }
        >
          Add to cart
        </button>

      </div>

    </article>
  )
}


// ============================================================
// SECTION HEADING
// ============================================================

function SectionHeading({
  eyebrow,
  title,
  action
}) {

  return (
    <div className="section-heading">

      <div>

        <span className="eyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

      </div>


      {/* Optional Action Link */}
      {action && (
        <Link to={action.to}>

          {action.label}

          <ArrowRight
            size={14}
          />

        </Link>
      )}

    </div>
  )
}


// ============================================================
// HOME PAGE
// ============================================================

function Home() {

  // Get live products from store
  const {
    products: liveProducts
  } = useStore()

  return (
    <>

      {/* Header */}
      <Header />


      <main>


        {/* ====================================================
            HERO SECTION
        ==================================================== */}

        <section className="hero">

          <img
            src={heroImage}
            alt="Handmade stoneware arranged on a dining table"
          />


          {/* Hero Content */}
          <div className="hero-overlay">

            <span className="eyebrow">
              Quiet objects for everyday rituals
            </span>

            <h1>
              Made for the
              <br />
              <em>
                way you live.
              </em>
            </h1>

            <p>
              Timeless tableware, shaped slowly
              and thoughtfully in India.
            </p>

            <Button to="/shop">
              Explore the collection
            </Button>

          </div>


          {/* Hero Note */}
          <div className="hero-note">

            Stores crafted
            <br />

            in earth

            <span>
              ↓
            </span>

          </div>

        </section>


        {/* ====================================================
            INTRO SECTION
        ==================================================== */}

        <section className="intro">

          <span className="eyebrow">
            The everyday, elevated
          </span>

          <h2>
            Objects with a sense
            <br />
            of <em>place.</em>
          </h2>

          <p>
            We make useful, beautiful things
            that carry the marks of the hands
            that made them. Designed to be
            lived with, not put away.
          </p>

        </section>


        {/* ====================================================
            CATEGORIES SECTION
        ==================================================== */}

        <section className="categories wrap">

          <SectionHeading
            eyebrow="Shop by form"
            title="Find your everyday"
            action={{
              label: 'View all',
              to: '/shop'
            }}
          />


          <div className="category-grid">

            {categories.map(c => (

              <Link
                to={`/shop?category=${c.name}`}
                className="category"
                key={c.name}
              >

                <img
                  src={c.image}
                  alt={c.name}
                />

                <div>

                  <h3>
                    {c.name}
                  </h3>

                  <span>
                    Shop now
                    <ArrowRight
                      size={13}
                    />
                  </span>

                </div>

              </Link>

            ))}

          </div>

        </section>


        {/* ====================================================
            CUSTOMER FAVORITES
        ==================================================== */}

        <section className="favorites">

          <div className="wrap">

            <SectionHeading
              eyebrow="Made to be used"
              title="Customer favorites"
              action={{
                label: 'View all',
                to: '/shop'
              }}
            />


            <div className="product-grid">

              {liveProducts
                .slice(0, 4)
                .map(product => (

                  <ProductCard
                    product={product}
                    key={product.id}
                  />

                ))}

            </div>

          </div>

        </section>


        {/* ====================================================
            FEATURE SECTION
        ==================================================== */}

        <section className="feature">

          <div className="feature-copy">

            <span className="eyebrow">
              The XAAJ way
            </span>

            <h2>
              Beauty is in
              <br />
              <em>
                the details.
              </em>
            </h2>

            <p>
              From the slight variation in a rim
              to the warmth of clay under your palm,
              our pieces are made to bring more
              intention to the everyday.
            </p>

            <Button
              to="/story"
              light
            >
              Our story
            </Button>

          </div>


          <img
            src={tableImage}
            alt="A warm dinner table with handmade tableware"
          />

        </section>


        {/* ====================================================
            TRUST / SERVICE SECTION
            Premium Quality
            Fast & Reliable Shipping
            Easy Returns
            Secure Payments
        ==================================================== */}

        <section className="trust-bar">


          {/* Premium Quality */}
          <div className="trust-item">

            <Gem
              className="trust-icon"
              size={25}
              strokeWidth={1.4}
            />

            <div className="trust-content">

              <h4>
                Premium Quality
              </h4>

              <p>
                Crafted to last
              </p>

            </div>

          </div>


          {/* Fast & Reliable Shipping */}
          <div className="trust-item">

            <Truck
              className="trust-icon"
              size={25}
              strokeWidth={1.4}
            />

            <div className="trust-content">

              <h4>
                Fast &amp; Reliable Shipping
              </h4>

              <p>
                At your doorstep
              </p>

            </div>

          </div>


          {/* Easy Returns */}
          <div className="trust-item">

            <Package
              className="trust-icon"
              size={25}
              strokeWidth={1.4}
            />

            <div className="trust-content">

              <h4>
                Easy Returns
              </h4>

              <p>
                Hassle-free process
              </p>

            </div>

          </div>


          {/* Secure Payments */}
          <div className="trust-item">

            <ShieldCheck
              className="trust-icon"
              size={25}
              strokeWidth={1.4}
            />

            <div className="trust-content">

              <h4>
                Secure Payments
              </h4>

              <p>
                Shop with confidence
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            CUSTOMER QUOTES
        ==================================================== */}

        <section className="quotes">

          <span className="eyebrow">
            Notes from home
          </span>

          <h2>
            Loved by homes like yours
          </h2>


          <div className="quote-grid">


            {/* Review 1 */}
            <blockquote>

              “The dinner set feels like it has
              always belonged on our table.”

              <footer>
                — Priya S.
              </footer>

            </blockquote>


            {/* Review 2 */}
            <blockquote>

              “Beautiful, durable and perfect
              for daily use. Highly recommend.”

              <footer>
                — Rohan K.
              </footer>

            </blockquote>


            {/* Review 3 */}
            <blockquote>

              “The nicest packaging and the pieces
              are even better in person.”

              <footer>
                — Megha T.
              </footer>

            </blockquote>

          </div>

        </section>


        {/* Newsletter */}
        <Newsletter />

      </main>


      {/* Footer */}
      <Footer />

    </>
  )
}


// ============================================================
// NEWSLETTER
// ============================================================

function Newsletter() {

  return (
    <section className="newsletter">

      <span className="eyebrow">
        A little note from us
      </span>

      <h2>
        Come, stay awhile.
      </h2>

      <p>
        New collections, quiet inspiration
        and 10% off your first order.
      </p>


      <form
        onSubmit={e => {

          e.preventDefault()

          e.currentTarget.reset()

        }}
      >

        <input
          type="email"
          required
          placeholder="Your email address"
        />

        <button>
          Subscribe

          <ArrowRight
            size={14}
          />
        </button>

      </form>

    </section>
  )
}


// ============================================================
// FOOTER
// ============================================================

function Footer() {

  return (
    <>
      <style>{`
        .footer .social a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: inherit;
          text-decoration: none;
        }
        .footer .footer-bottom a {
          color: inherit;
          text-decoration: none;
        }
        .footer .footer-bottom a:hover {
          text-decoration: underline;
        }
      `}</style>

      <footer className="footer">


        {/* Footer Main */}
      <div className="footer-main">


        {/* Footer Logo */}
        <Link
          to="/"
          className="brand footer-brand"
        >

          <img
            src={logoUrl}
            alt="XAAJ"
          />

          <span>
            STORES CRAFTED IN EARTH
          </span>

        </Link>


        {/* Explore Links */}
        <div>

          <h4>
            Explore
          </h4>

          <Link to="/shop">
            Shop all
          </Link>

          <Link to="/shop?filter=new">
            New arrivals
          </Link>

          <Link to="/story">
            Our story
          </Link>

        </div>


        {/* Help Links */}
        <div>

          <h4>
            Help
          </h4>

          <Link to="/contact">
            Contact us
          </Link>

          <Link to="/shipping" title="Shipping & Returns">
            Shipping & returns
          </Link>

          <Link to="/faq">
            FAQs
          </Link>

        </div>


        {/* Social Links */}
        <div>

          <h4>
            Follow along
          </h4>

          <div className="social">

            {/* Website */}
            <a
              href="/"
              aria-label="XAAJ website"
              title="XAAJ Website"
            >
              <Globe />
            </a>

            {/* WhatsApp / Chat */}
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with XAAJ"
              title="WhatsApp"
            >
              <MessageCircle />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/xaajstories?stkn=MWxkMzRscjAzaXVjZQ%3D%3D&utm_source=qr"
              target="_blank"
              rel="noreferrer"
              aria-label="XAAJ on Instagram"
              title="Instagram"
            >
              <FaInstagram size={22} />
            </a>

          </div>

        </div>

      </div>


      {/* Footer Bottom */}
      <div className="footer-bottom">

        <span>
          © 2026 XAAJ. Made for everyday.
        </span>

        <span>
          <Link to="/privacy" title="Privacy Policy">Privacy</Link>
          {' · '}
          <Link to="/terms" title="Terms & Conditions">Terms</Link>
        </span>

      </div>

      </footer>
    </>
  )
}


// ============================================================
// SHOP PAGE
// ============================================================

function Shop() {

  const {
    products: liveProducts
  } = useStore()

  // Read URL query parameters
  const query =
    new URLSearchParams(
      useLocation().search
    )

  // Sorting state
  const [sort, setSort] =
    useState('featured')

  // Category filter
  const category =
    query.get('category')

  // Search query
  const search =
    query.get('search')


  // Filter products
  let list =
    liveProducts.filter(product => (

      (
        !category ||

        product.name
          .toLowerCase()
          .includes(
            category.toLowerCase()
          ) ||

        product.category
          .toLowerCase()
          .includes(
            category.toLowerCase()
          )
      )

      &&

      (
        !search ||

        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )

    ))


  // Sort: Low to High
  if (sort === 'low') {

    list = [...list].sort(
      (a, b) =>
        a.price - b.price
    )

  }


  // Sort: High to Low
  if (sort === 'high') {

    list = [...list].sort(
      (a, b) =>
        b.price - a.price
    )

  }


  return (
    <>

      <Header />


      <main className="page">

        <div className="wrap">


          {/* Breadcrumbs */}
          <div className="breadcrumbs">

            Home

            <span>
              /
            </span>

            Shop

          </div>


          {/* Shop Title */}
          <div className="shop-title">

            <div>

              <span className="eyebrow">
                The collection
              </span>

              <h1>

                {category ||

                  (
                    search
                      ? `Search: ${search}`
                      : 'Everything for the everyday'
                  )

                }

              </h1>

              <p>
                Objects made to be used,
                loved and lived with.
              </p>

            </div>


            {/* Sorting */}
            <select
              value={sort}
              onChange={e =>
                setSort(
                  e.target.value
                )
              }
            >

              <option value="featured">
                Sort: Featured
              </option>

              <option value="low">
                Price: low to high
              </option>

              <option value="high">
                Price: high to low
              </option>

            </select>

          </div>


          {/* Filters */}
          <div className="filter-row">

            {[
              'All',
              'Tableware',
              'Plates',
              'Bowls',
              'Cups & Mugs',
              'Glassware'
            ].map(categoryName => (

              <Link
                className={
                  !category &&
                  categoryName === 'All'
                    ? 'active'
                    : ''
                }
                to={
                  categoryName === 'All'
                    ? '/shop'
                    : `/shop?category=${categoryName}`
                }
                key={categoryName}
              >

                {categoryName}

              </Link>

            ))}

          </div>


          {/* Product Grid */}
          <div className="product-grid shop-grid">

            {list.map(product => (

              <ProductCard
                product={product}
                key={product.id}
              />

            ))}

          </div>

        </div>

      </main>


      <Newsletter />

      <Footer />

    </>
  )
}


// ============================================================
// PRODUCT DETAILS PAGE
// ============================================================

function Product() {

  const { add } = useStore()
  const { pathname } = useLocation()

  // This app uses manual pathname routing (not <Route> components),
  // so useParams() cannot read /product/:id here.
  const slug = decodeURIComponent(
    pathname.split('/product/')[1] || ''
  )

  const [product, setProduct] = useState(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      if (!slug) {
        setProduct(null)
        setLoadingProduct(false)
        return
      }

      setLoadingProduct(true)

      try {
        // Always fetch the exact product by slug. This also works
        // when the user opens/refreses the product URL directly.
        const result = await productService.get(slug)
        const raw = result?.data

        if (cancelled) return

        if (!raw) {
          setProduct(null)
          return
        }

        const productImages = Array.isArray(raw.images)
          ? raw.images.filter(Boolean)
          : []

        setProduct({
          ...raw,
          id: raw._id,
          image: productImages[0] || '',
          images: productImages,
          old: raw.mrp ?? raw.compareAtPrice ?? null,
          tag: raw.tags?.[0] || 'New',
          reviews: raw.reviewCount || 0
        })

        setSelectedImage(productImages[0] || '')
      } catch (error) {
        if (!cancelled) {
          console.error('Product load error:', error)
          setProduct(null)
        }
      } finally {
        if (!cancelled) setLoadingProduct(false)
      }
    }

    loadProduct()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loadingProduct) {
    return (
      <>
        <Header />

        <main className="page">
          <div className="wrap narrow">
            <span className="eyebrow">
              Product
            </span>

            <h1>
              Loading product...
            </h1>

            <p className="lead">
              Please wait while we load the product details.
            </p>
          </div>
        </main>

        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />

        <main className="page">
          <div className="wrap narrow">
            <span className="eyebrow">
              Product
            </span>

            <h1>
              Product not found
            </h1>

            <p className="lead">
              This product may be unavailable or the link may be incorrect.
            </p>

            <Button to="/shop">
              Back to shop
            </Button>
          </div>
        </main>

        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />

      <main className="page">
        <div className="wrap">

          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            Home
            <span>/</span>
            Shop
            <span>/</span>
            {product.name}
          </div>

          {/* Product Details */}
          <div className="detail">

            {/* Product Images */}
            <div>
              <div
                className="detail-image"
                style={{
                  position: 'relative',
                  marginBottom: '14px'
                }}
              >
                <img
                  src={selectedImage || product.images?.[0] || product.image}
                  alt={product.name}
                />
              </div>

              {/* Thumbnail Gallery */}
              {product.images?.length > 1 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 88px))',
                    gap: '10px'
                  }}
                >
                  {product.images.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(image)}
                      aria-label={`View product image ${index + 1}`}
                      style={{
                        padding: 0,
                        border: image === selectedImage
                          ? '2px solid currentColor'
                          : '1px solid #ddd',
                        background: 'transparent',
                        cursor: 'pointer',
                        aspectRatio: '1 / 1',
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="detail-copy">

              <span className="eyebrow">
                {product.category}
              </span>

              <h1>
                {product.name}
              </h1>

              {/* Rating */}
              <Rating
                count={Number(product.rating) || 0}
                reviews={product.reviews}
              />

              {/* Selling Price + MRP */}
              <div className="detail-price">
                <strong>
                  {money(product.price)}
                </strong>

                {Number(product.old || 0) > Number(product.price || 0) && (
                  <del style={{ marginLeft: '10px' }}>
                    MRP {money(product.old)}
                  </del>
                )}
              </div>

              {/* Main Product Description */}
              <p>
                {product.description ||
                  product.desc ||
                  'Beautifully crafted for everyday use.'}
              </p>

              <hr />

              {/* Quantity */}
              <label>
                Quantity
              </label>

              <div className="quantity">
                <button
                  type="button"
                  onClick={() =>
                    setQty(Math.max(1, qty - 1))
                  }
                >
                  <Minus size={15} />
                </button>

                <span>
                  {qty}
                </span>

                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Add To Cart */}
              <button
                className="button full"
                onClick={() => {
                  for (let i = 0; i < qty; i++) {
                    add(product)
                  }
                }}
              >
                Add to cart
                <ShoppingBag size={16} />
              </button>

              {/* Product Information Accordions */}
              <div
                className="faq-list"
                style={{ marginTop: '28px' }}
              >
                <details open>
                  <summary>
                    Description
                  </summary>
                  <p>
                    {product.description ||
                      product.desc ||
                      'Beautifully crafted for everyday use.'}
                  </p>
                </details>

                <details>
                  <summary>
                    Product Details &amp; Care
                  </summary>
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {product.productDetails ||
                      'Product details and care instructions will be updated soon.'}
                  </p>
                </details>

                <details>
                  <summary>
                    Shipping &amp; Payment
                  </summary>
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {product.shippingPayment ||
                      'Secure online payments. Shipping details will be provided at checkout.'}
                  </p>
                </details>

                <details>
                  <summary>
                    Return &amp; Exchange
                  </summary>
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {product.returnExchange ||
                      'Return and exchange information will be updated soon.'}
                  </p>
                </details>
              </div>

              <div className="detail-note">
                Free shipping on orders over ₹5,000
                <br />
                7-day easy returns · Secure packaging
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}

// ============================================================
// CART / WISHLIST PAGE
// ============================================================

function Cart({
  wishlist = false
}) {

  const {
    products: liveProducts,
    cart,
    remove,
    change,
    total,
    wish,
    toggleWish
  } = useStore()


  // If wishlist page, show wishlist products.
  // Otherwise show cart products.
  const items = wishlist
    ? liveProducts.filter(
        product =>
          wish.includes(product.id)
      )
    : cart


  return (
    <>

      <Header />


      <main className="page">

        <div className="wrap narrow">


          {/* Breadcrumbs */}
          <div className="breadcrumbs">

            Home

            <span>
              /
            </span>

            {wishlist
              ? 'Wishlist'
              : 'Your cart'}

          </div>


          {/* Page Heading */}
          <div className="shop-title">

            <div>

              <span className="eyebrow">

                {wishlist
                  ? 'Saved for later'
                  : 'Your selections'}

              </span>

              <h1>

                {wishlist
                  ? 'Your wishlist'
                  : 'Your cart'}

              </h1>

            </div>

          </div>


          {/* Empty State */}
          {items.length === 0 ? (

            <div className="empty">

              <Heart
                size={35}
              />

              <h2>

                {wishlist
                  ? 'Nothing saved yet'
                  : 'Your cart is waiting'}

              </h2>

              <p>
                Find something beautiful
                for your everyday.
              </p>

              <Button to="/shop">
                Explore the collection
              </Button>

            </div>

          ) : (


            /* Cart Layout */
            <div className="cart-layout">


              {/* Cart Items */}
              <div className="cart-items">

                {items.map(item => (

                  <div
                    className="cart-item"
                    key={item.id}
                  >


                    {/* Product Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                    />


                    {/* Product Information */}
                    <div>

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.category}
                      </p>


                      {/* Quantity */}
                      {!wishlist && (

                        <div className="quantity">

                          <button
                            onClick={() =>
                              change(
                                item.id,
                                -1
                              )
                            }
                          >
                            <Minus
                              size={13}
                            />
                          </button>

                          <span>
                            {item.qty}
                          </span>

                          <button
                            onClick={() =>
                              change(
                                item.id,
                                1
                              )
                            }
                          >
                            <Plus
                              size={13}
                            />
                          </button>

                        </div>

                      )}

                    </div>


                    {/* Price */}
                    <strong>

                      {money(
                        item.price *
                        (item.qty || 1)
                      )}

                    </strong>


                    {/* Remove */}
                    <button
                      className="remove"
                      onClick={() =>
                        wishlist
                          ? toggleWish(item.id)
                          : remove(item.id)
                      }
                    >
                      <X
                        size={16}
                      />
                    </button>

                  </div>

                ))}

              </div>


              {/* Order Summary */}
              {!wishlist && (

                <aside className="summary">

                  <h2>
                    Order summary
                  </h2>


                  {/* Subtotal */}
                  <div>

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {money(total)}
                    </strong>

                  </div>


                  {/* Shipping */}
                  <div>

                    <span>
                      Shipping
                    </span>

                    <span>

                      {total >= 5000
                        ? 'Free'
                        : money(199)}

                    </span>

                  </div>


                  <hr />


                  {/* Total */}
                  <div className="summary-total">

                    <span>
                      Total
                    </span>

                    <strong>

                      {money(
                        total >= 5000
                          ? total
                          : total + 199
                      )}

                    </strong>

                  </div>


                  {/* Checkout */}
                  <Button to="/checkout">
                    Checkout securely
                  </Button>

                </aside>

              )}

            </div>

          )}

        </div>

      </main>


      <Footer />

    </>
  )
}


// ============================================================
// SIMPLE PAGE
// ============================================================

function SimplePage({
  title,
  eyebrow,
  children
}) {

  return (
    <>

      <Header />


      <main className="page simple">

        <div className="wrap narrow">

          <span className="eyebrow">
            {eyebrow}
          </span>

          <h1>
            {title}
          </h1>

          {children}

        </div>

      </main>


      <Newsletter />

      <Footer />

    </>
  )
}


// ============================================================
// MAIN APP ROUTING
// ============================================================

function App() {

  // Authentication context
  const {
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    logout,
    user
  } = useAuth()

  const { cart, total } = useStore()
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()

  // ==========================================================
  // LOGIN STATE
  // ==========================================================

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ==========================================================
  // REGISTRATION STATE
  // ==========================================================

  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerPhone, setRegisterPhone] = useState('')
  const [registerAddress, setRegisterAddress] = useState('')
  const [registerCity, setRegisterCity] = useState('')
  const [registerState, setRegisterState] = useState('')
  const [registerPin, setRegisterPin] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')

  // ==========================================================
  // EMAIL OTP STATE
  // ==========================================================

  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpResending, setOtpResending] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')
  const [otpError, setOtpError] = useState('')

  // ==========================================================
  // FORGOT PASSWORD / RESET PASSWORD STATE
  // ==========================================================

  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [resetToken, setResetToken] = useState(() =>
    window.sessionStorage.getItem('xaaj-reset-token') || ''
  )
  const [resetPasswordValue, setResetPasswordValue] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  // ==========================================================
  // CHECKOUT STATE
  // ==========================================================

  const [checkoutEmail, setCheckoutEmail] = useState('')
  const [checkoutName, setCheckoutName] = useState('')
  const [checkoutPhone, setCheckoutPhone] = useState('')
  const [checkoutAddress, setCheckoutAddress] = useState('')
  const [checkoutCity, setCheckoutCity] = useState('')
  const [checkoutState, setCheckoutState] = useState('')
  const [checkoutPin, setCheckoutPin] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // ==========================================================
  // MY ORDERS STATE
  // ==========================================================

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  useEffect(() => {
    if (!user) {
      setOrders([])
      return
    }

    let cancelled = false

    async function loadOrders() {
      try {
        setOrdersLoading(true)
        setOrdersError('')

        const result = await orderService.list()
        const orderList = result?.data || result?.orders || []

        if (!cancelled) {
          setOrders(Array.isArray(orderList) ? orderList : [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Orders load error:', error)
          setOrdersError(
            error?.message ||
            'Unable to load your orders.'
          )
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      cancelled = true
    }
  }, [user])

  // ==========================================================
  // PREFILL CHECKOUT FROM SAVED USER ADDRESS
  // ==========================================================

  useEffect(() => {
    if (!user) return

    const savedAddress = user.addresses?.[0]

    if (user.email) setCheckoutEmail(user.email)
    if (user.name && !checkoutName) setCheckoutName(user.name)

    if (savedAddress) {
      if (savedAddress.name && !checkoutName) {
        setCheckoutName(savedAddress.name)
      }
      if (savedAddress.phone && !checkoutPhone) {
        setCheckoutPhone(savedAddress.phone)
      }
      if (savedAddress.line1 && !checkoutAddress) {
        setCheckoutAddress(savedAddress.line1)
      }
      if (savedAddress.city && !checkoutCity) {
        setCheckoutCity(savedAddress.city)
      }
      if (savedAddress.state && !checkoutState) {
        setCheckoutState(savedAddress.state)
      }
      if (savedAddress.postalCode && !checkoutPin) {
        setCheckoutPin(savedAddress.postalCode)
      }
    }
  }, [user])

  // ==========================================================
  // RAZORPAY
  // ==========================================================

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()

    const existing = document.querySelector('script[data-razorpay-checkout]')

    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = resolve
    script.onerror = () => reject(new Error('Unable to load Razorpay.'))
    document.body.appendChild(script)
  })

  // ==========================================================
  // CHECKOUT PAYMENT
  // ==========================================================

  const handleCheckoutPayment = async e => {
    e.preventDefault()
    setPaymentError('')

    if (!user) {
      navigate('/account')
      return
    }

    if (!cart.length) {
      setPaymentError('Your cart is empty.')
      return
    }

    if (
      !checkoutEmail.trim() ||
      !checkoutName.trim() ||
      !checkoutPhone.trim() ||
      !checkoutAddress.trim() ||
      !checkoutCity.trim() ||
      !checkoutState.trim() ||
      !checkoutPin.trim()
    ) {
      setPaymentError('Please fill in all checkout details.')
      return
    }

    if (checkoutPhone.replace(/\D/g, '').length < 10) {
      setPaymentError('Please enter a valid phone number.')
      return
    }

    if (checkoutPin.replace(/\D/g, '').length !== 6) {
      setPaymentError('Please enter a valid 6-digit PIN code.')
      return
    }

    try {
      setPaymentLoading(true)
      await loadRazorpay()

      const orderResult = await apiRequest('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map(item => ({
            product: item.id,
            quantity: item.qty || 1
          })),
          shippingAddress: {
            name: checkoutName.trim(),
            email: checkoutEmail.trim(),
            phone: checkoutPhone.trim(),
            address: checkoutAddress.trim(),
            city: checkoutCity.trim(),
            state: checkoutState.trim(),
            pin: checkoutPin.trim()
          }
        })
      })

      const razorpayOrder = orderResult?.data

      if (!razorpayOrder?.id || !razorpayOrder?.keyId) {
        throw new Error(
          orderResult?.message ||
          'Unable to create Razorpay order.'
        )
      }

      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'XAAJ',
        description: 'XAAJ Store Order',
        order_id: razorpayOrder.id,
        prefill: {
          name: checkoutName.trim(),
          email: checkoutEmail.trim(),
          contact: checkoutPhone.trim()
        },
        notes: {
          address: checkoutAddress.trim(),
          city: checkoutCity.trim(),
          state: checkoutState.trim(),
          pin: checkoutPin.trim()
        },
        theme: { color: '#2b2a27' },
        handler: async response => {
          try {
            const verifyResult = await apiRequest('/payment/verify', {
              method: 'POST',
              body: JSON.stringify(response)
            })

            if (!verifyResult?.success) {
              throw new Error(
                verifyResult?.message ||
                'Payment verification failed.'
              )
            }

            window.sessionStorage.setItem(
              'xaaj-payment-success',
              'true'
            )

            window.sessionStorage.setItem(
              'xaaj-last-order',
              JSON.stringify(verifyResult.data)
            )

            navigate('/order-confirmation')
          } catch (verifyError) {
            console.error(
              'Payment verification error:',
              verifyError
            )

            setPaymentError(
              verifyError?.message ||
              'Payment verification failed. Please contact support.'
            )
          } finally {
            setPaymentLoading(false)
          }
        },
        modal: {
          ondismiss: () => setPaymentLoading(false)
        }
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on('payment.failed', response => {
        console.error(
          'Razorpay payment failed:',
          response?.error
        )

        setPaymentError(
          response?.error?.description ||
          'Payment failed. Please try again.'
        )

        setPaymentLoading(false)
      })

      razorpay.open()
    } catch (paymentErr) {
      console.error(
        'Razorpay checkout error:',
        paymentErr
      )

      setPaymentError(
        paymentErr?.message ||
        'Unable to open Razorpay. Please try again.'
      )

      setPaymentLoading(false)
    }
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLogin = async e => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setLoading(true)

      const result = await login(email.trim(), password)

      if (!result?.success) {
        if (result?.requiresEmailVerification) {
          setOtpEmail(result.email || email.trim())
          setOtp('')
          setOtpError('')
          setOtpMessage('Please verify your email before signing in.')
          navigate(
            `/verify-email?email=${encodeURIComponent(
              result.email || email.trim()
            )}`
          )
          return
        }

        setError(
          result?.message ||
          'Invalid email or password.'
        )
        return
      }

      if (result?.requiresEmailVerification) {
        const verificationEmail =
          result.email || email.trim()

        setOtpEmail(verificationEmail)
        setOtp('')
        setOtpError('')
        setOtpMessage('Please verify your email first.')

        navigate(
          `/verify-email?email=${encodeURIComponent(
            verificationEmail
          )}`
        )

        return
      }

      const loggedInUser = result?.user || null

      if (loggedInUser?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error('Login error:', err)

      setError(
        err?.message ||
        'Unable to login. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // REGISTER
  // ==========================================================

  const handleRegister = async e => {
    e.preventDefault()
    setRegisterError('')

    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPassword ||
      !registerPhone.trim() ||
      !registerAddress.trim() ||
      !registerCity.trim() ||
      !registerState.trim() ||
      !registerPin.trim()
    ) {
      setRegisterError('Please fill in all registration details.')
      return
    }

    if (registerPassword.length < 8) {
      setRegisterError(
        'Password must be at least 8 characters.'
      )
      return
    }

    if (registerPhone.replace(/\D/g, '').length < 10) {
      setRegisterError('Please enter a valid phone number.')
      return
    }

    if (!/^\d{6}$/.test(registerPin)) {
      setRegisterError('PIN code must be 6 digits.')
      return
    }

    try {
      setRegisterLoading(true)

      const result = await register({
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        phone: registerPhone.trim(),
        address: registerAddress.trim(),
        city: registerCity.trim(),
        state: registerState.trim(),
        pin: registerPin.trim()
      })

      if (!result?.success) {
        setRegisterError(
          result?.message ||
          'Unable to create your account.'
        )
        return
      }

      const verificationEmail =
        result.email || registerEmail.trim()

      setOtpEmail(verificationEmail)
      setOtp('')
      setOtpError('')
      setOtpMessage(
        'We sent a 6-digit verification code to your email. It is valid for 10 minutes.'
      )

      navigate(
        `/verify-email?email=${encodeURIComponent(
          verificationEmail
        )}`
      )
    } catch (err) {
      console.error('Registration error:', err)

      setRegisterError(
        err?.message ||
        'Unable to create your account. Please try again.'
      )
    } finally {
      setRegisterLoading(false)
    }
  }

  // ==========================================================
  // VERIFY EMAIL OTP
  // ==========================================================

  const handleVerifyEmail = async e => {
    e.preventDefault()
    setOtpError('')
    setOtpMessage('')

    const verificationEmail =
      otpEmail.trim() ||
      new URLSearchParams(location.search).get('email') ||
      ''

    if (!verificationEmail) {
      setOtpError('Email address is required.')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError('Please enter the 6-digit OTP.')
      return
    }

    try {
      setOtpLoading(true)

      const result = await verifyEmail(
        verificationEmail,
        otp
      )

      if (!result?.success) {
        setOtpError(
          result?.message ||
          'Invalid or expired OTP.'
        )
        return
      }

      // Backend returns a token and user after verification.
      // AuthContext saves both and logs the user in.
      navigate('/')
    } catch (err) {
      console.error(
        'Email verification error:',
        err
      )

      setOtpError(
        err?.message ||
        'Unable to verify email. Please try again.'
      )
    } finally {
      setOtpLoading(false)
    }
  }

  // ==========================================================
  // RESEND OTP
  // ==========================================================

  const handleResendOtp = async () => {
    setOtpError('')
    setOtpMessage('')

    const verificationEmail =
      otpEmail.trim() ||
      new URLSearchParams(location.search).get('email') ||
      ''

    if (!verificationEmail) {
      setOtpError('Email address is required.')
      return
    }

    try {
      setOtpResending(true)

      const result = await resendVerification(
        verificationEmail
      )

      if (!result?.success) {
        setOtpError(
          result?.message ||
          'Unable to resend OTP.'
        )
        return
      }

      setOtpMessage(
        'A new OTP has been sent to your email. It is valid for 10 minutes.'
      )
    } catch (err) {
      console.error('Resend OTP error:', err)

      setOtpError(
        err?.message ||
        'Unable to resend OTP. Please try again.'
      )
    } finally {
      setOtpResending(false)
    }
  }

  // ==========================================================
  // FORGOT PASSWORD - SEND OTP
  // ==========================================================

  const handleForgotPassword = async e => {
    e.preventDefault()
    setResetError('')
    setResetMessage('')

    const emailValue = resetEmail.trim().toLowerCase()

    if (!emailValue) {
      setResetError('Please enter your email address.')
      return
    }

    try {
      setResetLoading(true)

      const result = await forgotPassword(emailValue)

      if (!result?.success) {
        setResetError(
          result?.message ||
          'Unable to send password reset OTP.'
        )
        return
      }

      setResetEmail(emailValue)
      setResetOtp('')
      setResetToken('')
      window.sessionStorage.removeItem('xaaj-reset-token')

      setResetMessage(
        'If the account exists, a 6-digit OTP has been sent to your email. It is valid for 10 minutes.'
      )

      navigate(
        `/reset-password?email=${encodeURIComponent(emailValue)}`
      )
    } catch (err) {
      console.error(
        'Forgot password error:',
        err
      )

      setResetError(
        err?.message ||
        'Unable to send password reset OTP. Please try again.'
      )
    } finally {
      setResetLoading(false)
    }
  }


  // ==========================================================
  // VERIFY PASSWORD RESET OTP
  // ==========================================================

  const handleVerifyResetOtp = async e => {
    e.preventDefault()
    setResetError('')
    setResetMessage('')

    const emailValue =
      resetEmail.trim() ||
      new URLSearchParams(location.search).get('email') ||
      ''

    if (!emailValue) {
      setResetError('Email address is required.')
      return
    }

    if (!/^\d{6}$/.test(resetOtp)) {
      setResetError('Please enter the 6-digit OTP.')
      return
    }

    try {
      setResetLoading(true)

      const result = await verifyResetOtp(
        emailValue,
        resetOtp
      )

      if (!result?.success || !result?.resetToken) {
        setResetError(
          result?.message ||
          'Invalid or expired OTP.'
        )
        return
      }

      setResetEmail(emailValue)
      setResetToken(result.resetToken)

      window.sessionStorage.setItem(
        'xaaj-reset-token',
        result.resetToken
      )

      setResetOtp('')
      setResetMessage(
        'OTP verified. Please create your new password.'
      )
    } catch (err) {
      console.error(
        'Reset OTP verification error:',
        err
      )

      setResetError(
        err?.message ||
        'Unable to verify OTP. Please try again.'
      )
    } finally {
      setResetLoading(false)
    }
  }


  // ==========================================================
  // SAVE NEW PASSWORD
  // ==========================================================

  const handleResetPassword = async e => {
    e.preventDefault()
    setResetError('')
    setResetMessage('')

    const emailValue =
      resetEmail.trim() ||
      new URLSearchParams(location.search).get('email') ||
      ''

    const tokenValue =
      resetToken ||
      window.sessionStorage.getItem('xaaj-reset-token') ||
      ''

    if (!emailValue || !tokenValue) {
      setResetError(
        'Your password reset session is missing. Please request a new OTP.'
      )
      return
    }

    if (resetPasswordValue.length < 8) {
      setResetError(
        'Password must be at least 8 characters.'
      )
      return
    }

    if (
      resetPasswordValue !==
      resetConfirmPassword
    ) {
      setResetError(
        'Passwords do not match.'
      )
      return
    }

    try {
      setResetLoading(true)

      const result = await resetPassword(
        emailValue,
        tokenValue,
        resetPasswordValue,
        resetConfirmPassword
      )

      if (!result?.success) {
        setResetError(
          result?.message ||
          'Unable to reset your password.'
        )
        return
      }

      window.sessionStorage.removeItem(
        'xaaj-reset-token'
      )

      setResetToken('')
      setResetOtp('')
      setResetPasswordValue('')
      setResetConfirmPassword('')
      setResetMessage(
        'Password updated successfully. You can now login.'
      )

      setEmail(emailValue)
      setPassword('')

      navigate('/account')
    } catch (err) {
      console.error(
        'Reset password error:',
        err
      )

      setResetError(
        err?.message ||
        'Unable to reset your password. Please try again.'
      )
    } finally {
      setResetLoading(false)
    }
  }


  // ==========================================================
  // ADMIN
  // ==========================================================

  if (path === '/admin') {
    return <Admin />
  }

  // ==========================================================
  // SHOP
  // ==========================================================

  if (path === '/shop') {
    return <Shop />
  }

  // ==========================================================
  // PRODUCT DETAILS
  // ==========================================================

  if (path.startsWith('/product/')) {
    return <Product />
  }

  // ==========================================================
  // CART
  // ==========================================================

  if (path === '/cart') {
    return <Cart />
  }

  // ==========================================================
  // WISHLIST
  // ==========================================================

  if (path === '/wishlist') {
    return <Cart wishlist />
  }

  // ==========================================================
  // OUR STORY
  // ==========================================================

  if (path === '/story') {
    return (
      <SimplePage
        eyebrow="About XAAJ"
        title="Made for the way you live."
      >
        <p className="lead">
          XAAJ began with a simple belief:
          the things we use every day deserve
          to be beautiful, useful and made with care.
        </p>

        <img
          className="story-image"
          src={tableImage}
          alt="A calm table setting"
        />

        <p>
          We work with makers across India
          to create objects that hold space
          for your rituals — morning tea,
          long lunches, the last glass of wine.
          Every collection is designed in small
          batches and made to be kept.
        </p>
      </SimplePage>
    )
  }

  // ==========================================================
  // CHECKOUT
  // ==========================================================

  if (path === '/checkout') {

    // Checkout requires login.
    if (!user) {
      return (
        <SimplePage
          eyebrow="Sign in required"
          title="Please sign in to checkout."
        >
          <p className="lead">
            Your cart is saved. Sign in to continue
            securely with your order and saved address.
          </p>

          <Button to="/account">
            Sign in to continue
          </Button>
        </SimplePage>
      )
    }

    return (
      <SimplePage
        eyebrow="Almost home"
        title="Checkout"
      >
        <form
          className="checkout-form"
          onSubmit={handleCheckoutPayment}
        >

          <input
            value={checkoutEmail}
            onChange={e => setCheckoutEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            autoComplete="email"
            required
          />

          <input
            value={checkoutName}
            onChange={e => setCheckoutName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            required
          />

          <input
            value={checkoutPhone}
            onChange={e =>
              setCheckoutPhone(
                e.target.value.replace(/\D/g, '').slice(0, 10)
              )
            }
            placeholder="Phone number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
          />

          <input
            value={checkoutAddress}
            onChange={e => setCheckoutAddress(e.target.value)}
            placeholder="Full address"
            autoComplete="street-address"
            required
          />

          <div>
            <input
              value={checkoutCity}
              onChange={e => setCheckoutCity(e.target.value)}
              placeholder="City"
              autoComplete="address-level2"
              required
            />

            <input
              value={checkoutState}
              onChange={e => setCheckoutState(e.target.value)}
              placeholder="State"
              autoComplete="address-level1"
              required
            />
          </div>

          <input
            value={checkoutPin}
            onChange={e =>
              setCheckoutPin(
                e.target.value.replace(/\D/g, '').slice(0, 6)
              )
            }
            placeholder="PIN code"
            inputMode="numeric"
            autoComplete="postal-code"
            required
          />

          {paymentError && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {paymentError}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={paymentLoading}
          >
            {paymentLoading
              ? 'Opening Razorpay...'
              : 'Pay securely'}
            <ArrowRight size={15} />
          </button>

        </form>
      </SimplePage>
    )
  }

  // ==========================================================
  // ORDER CONFIRMATION
  // ==========================================================

  if (path === '/order-confirmation') {
    return (
      <SimplePage
        eyebrow="Thank you"
        title="Your order is on its way."
      >
        <p className="lead">
          We have sent a confirmation to your email.
          Your pieces will be carefully packed
          and dispatched soon.
        </p>

        <Button to="/shop">
          Continue shopping
        </Button>
      </SimplePage>
    )
  }

  // ==========================================================
  // EMAIL VERIFICATION
  // ==========================================================

  if (path === '/verify-email') {

    const queryEmail =
      new URLSearchParams(location.search).get('email') || ''

    const verificationEmail =
      otpEmail || queryEmail

    return (
      <SimplePage
        eyebrow="Email verification"
        title="Verify your email."
      >
        <p className="lead">
          Enter the 6-digit OTP sent to{' '}
          <strong>{verificationEmail || 'your email'}</strong>.
          The OTP is valid for 10 minutes.
        </p>

        <form
          className="checkout-form"
          onSubmit={handleVerifyEmail}
        >

          <input
            value={verificationEmail}
            onChange={e => {
              setOtpEmail(e.target.value)
            }}
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
          />

          <input
            value={otp}
            onChange={e =>
              setOtp(
                e.target.value.replace(/\D/g, '').slice(0, 6)
              )
            }
            placeholder="6-digit OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
          />

          {otpError && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {otpError}
            </p>
          )}

          {otpMessage && (
            <p style={{ margin: '0' }}>
              {otpMessage}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={otpLoading}
          >
            {otpLoading
              ? 'Verifying...'
              : 'Verify email'}
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            className="button button-light"
            onClick={handleResendOtp}
            disabled={otpResending}
          >
            {otpResending
              ? 'Sending OTP...'
              : 'Resend OTP'}
            <ArrowRight size={15} />
          </button>

        </form>
      </SimplePage>
    )
  }

  // ==========================================================
  // FORGOT PASSWORD / RESET PASSWORD
  // ==========================================================

  if (path === '/forgot-password') {
    const queryEmail =
      new URLSearchParams(location.search).get('email') || ''

    const currentEmail =
      resetEmail || queryEmail

    return (
      <SimplePage
        eyebrow="Account security"
        title="Forgot your password?"
      >
        <p className="lead">
          Enter your registered email address and we will
          send you a 6-digit OTP to reset your password.
        </p>

        <form
          className="checkout-form"
          onSubmit={handleForgotPassword}
        >
          <input
            value={currentEmail}
            onChange={e => setResetEmail(e.target.value)}
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
          />

          {resetError && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {resetError}
            </p>
          )}

          {resetMessage && (
            <p style={{ margin: '0' }}>
              {resetMessage}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={resetLoading}
          >
            {resetLoading
              ? 'Sending OTP...'
              : 'Send OTP'}
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            className="button button-light"
            onClick={() => navigate('/account')}
          >
            Back to login
            <ArrowRight size={15} />
          </button>
        </form>
      </SimplePage>
    )
  }


  if (path === '/reset-password') {
    const queryEmail =
      new URLSearchParams(location.search).get('email') || ''

    const currentEmail =
      resetEmail || queryEmail

    const hasResetToken =
      Boolean(
        resetToken ||
        window.sessionStorage.getItem('xaaj-reset-token')
      )

    if (!hasResetToken) {
      return (
        <SimplePage
          eyebrow="Password reset"
          title="Verify your email."
        >
          <p className="lead">
            Enter the 6-digit OTP sent to{' '}
            <strong>{currentEmail || 'your email'}</strong>.
            The OTP is valid for 10 minutes.
          </p>

          <form
            className="checkout-form"
            onSubmit={handleVerifyResetOtp}
          >
            <input
              value={currentEmail}
              onChange={e => setResetEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
            />

            <input
              value={resetOtp}
              onChange={e =>
                setResetOtp(
                  e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6)
                )
              }
              placeholder="6-digit OTP"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />

            {resetError && (
              <p style={{ color: '#b42318', margin: '0' }}>
                {resetError}
              </p>
            )}

            {resetMessage && (
              <p style={{ margin: '0' }}>
                {resetMessage}
              </p>
            )}

            <button
              type="submit"
              className="button"
              disabled={resetLoading}
            >
              {resetLoading
                ? 'Verifying...'
                : 'Verify OTP'}
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              className="button button-light"
              onClick={() => navigate('/forgot-password')}
            >
              Request new OTP
              <ArrowRight size={15} />
            </button>
          </form>
        </SimplePage>
      )
    }

    return (
      <SimplePage
        eyebrow="Password reset"
        title="Create a new password."
      >
        <p className="lead">
          Create a new password for{' '}
          <strong>{currentEmail}</strong>.
        </p>

        <form
          className="checkout-form"
          onSubmit={handleResetPassword}
        >
          <input
            value={resetPasswordValue}
            onChange={e =>
              setResetPasswordValue(e.target.value)
            }
            type="password"
            placeholder="New password (minimum 8 characters)"
            autoComplete="new-password"
            required
          />

          <input
            value={resetConfirmPassword}
            onChange={e =>
              setResetConfirmPassword(e.target.value)
            }
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
          />

          {resetError && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {resetError}
            </p>
          )}

          {resetMessage && (
            <p style={{ margin: '0' }}>
              {resetMessage}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={resetLoading}
          >
            {resetLoading
              ? 'Updating password...'
              : 'Update password'}
            <ArrowRight size={15} />
          </button>
        </form>
      </SimplePage>
    )
  }


  // ==========================================================
  // ACCOUNT / LOGIN
  // ==========================================================

  if (path === '/account') {

    if (user) {
      return (
        <SimplePage
          eyebrow="Your XAAJ account"
          title={`Welcome, ${user.name || 'Customer'}.`}
        >
          <p className="lead">
            Your account is verified and ready for checkout.
          </p>

          {user.email && (
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          )}

          {user.addresses?.[0] && (
            <p>
              <strong>Saved address:</strong>{' '}
              {user.addresses[0].line1},{' '}
              {user.addresses[0].city},{' '}
              {user.addresses[0].state} -{' '}
              {user.addresses[0].postalCode}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button to="/checkout">
              Continue to checkout
            </Button>

            <button
              type="button"
              className="button button-light"
              onClick={() => {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: 'smooth'
                })
              }}
            >
              My Orders
            </button>

            <button
              type="button"
              className="button button-light"
              onClick={async () => {
                await logout()
                navigate('/account')
              }}
            >
              Logout
            </button>
          </div>

          <div
            style={{
              marginTop: '40px',
              paddingTop: '28px',
              borderTop: '1px solid rgba(0,0,0,.12)'
            }}
          >
            <span className="eyebrow">
              Order history
            </span>

            <h2 style={{ marginTop: '8px' }}>
              My Orders
            </h2>

            {ordersLoading && (
              <p>Loading your orders...</p>
            )}

            {ordersError && (
              <p style={{ color: '#b42318' }}>
                {ordersError}
              </p>
            )}

            {!ordersLoading &&
              !ordersError &&
              orders.length === 0 && (
                <p>
                  You haven't placed any orders yet.
                </p>
              )}

            {!ordersLoading &&
              orders.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gap: '16px',
                    marginTop: '18px'
                  }}
                >
                  {orders.map(order => (
                    <div
                      key={order._id || order.id}
                      style={{
                        border: '1px solid rgba(0,0,0,.12)',
                        padding: '18px',
                        borderRadius: '8px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <strong>
                          Order #{String(
                            order._id || order.id || ''
                          ).slice(-8).toUpperCase()}
                        </strong>

                        <strong>
                          {money(order.total || 0)}
                        </strong>
                      </div>

                      <p style={{ margin: '8px 0' }}>
                        Status:{' '}
                        <strong>
                          {String(
                            order.status || 'pending'
                          ).replaceAll('_', ' ')}
                        </strong>
                      </p>

                      <p style={{ margin: '8px 0' }}>
                        Payment:{' '}
                        <strong>
                          {order.paymentStatus || 'pending'}
                        </strong>
                      </p>

                      <p style={{ margin: '8px 0' }}>
                        {order.items?.length || 0} item(s)
                      </p>

                      {order.trackingNumber && (
                        <p style={{ margin: '8px 0' }}>
                          Tracking:{' '}
                          <strong>
                            {order.trackingNumber}
                          </strong>
                          {order.courierName
                            ? ` (${order.courierName})`
                            : ''}
                        </p>
                      )}

                      <small>
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : ''}
                      </small>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </SimplePage>
      )
    }

    return (
      <SimplePage
        eyebrow="Welcome back"
        title="Your account"
      >
        <p className="lead">
          Sign in to see your orders,
          saved pieces and details.
        </p>

        <form
          className="checkout-form"
          onSubmit={handleLogin}
        >

          {/* Email */}
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            autoComplete="email"
            required
          />

          {/* Password */}
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            required
          />

          {error && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
            <ArrowRight size={15} />
          </button>

        </form>

        <p style={{ marginTop: '18px', marginBottom: '0' }}>
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </p>

        <p style={{ marginTop: '24px' }}>
          New to XAAJ?{' '}
          <Link to="/register">
            Create an account
          </Link>
        </p>
      </SimplePage>
    )
  }

  // ==========================================================
  // REGISTER
  // ==========================================================

  if (path === '/register') {
    return (
      <SimplePage
        eyebrow="Join XAAJ"
        title="Create your account."
      >
        <p className="lead">
          Create your account to save your details
          and checkout faster. We will verify your
          email with a one-time OTP.
        </p>

        <form
          className="checkout-form"
          onSubmit={handleRegister}
        >

          <input
            value={registerName}
            onChange={e => setRegisterName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            required
          />

          <input
            value={registerEmail}
            onChange={e => setRegisterEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            autoComplete="email"
            required
          />

          <input
            value={registerPassword}
            onChange={e => setRegisterPassword(e.target.value)}
            placeholder="Password (minimum 8 characters)"
            type="password"
            autoComplete="new-password"
            required
          />

          <input
            value={registerPhone}
            onChange={e =>
              setRegisterPhone(
                e.target.value.replace(/\D/g, '').slice(0, 10)
              )
            }
            placeholder="Phone number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
          />

          <input
            value={registerAddress}
            onChange={e => setRegisterAddress(e.target.value)}
            placeholder="Full address"
            autoComplete="street-address"
            required
          />

          <div>
            <input
              value={registerCity}
              onChange={e => setRegisterCity(e.target.value)}
              placeholder="City"
              autoComplete="address-level2"
              required
            />

            <input
              value={registerState}
              onChange={e => setRegisterState(e.target.value)}
              placeholder="State"
              autoComplete="address-level1"
              required
            />
          </div>

          <input
            value={registerPin}
            onChange={e =>
              setRegisterPin(
                e.target.value.replace(/\D/g, '').slice(0, 6)
              )
            }
            placeholder="PIN code"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            required
          />

          {registerError && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {registerError}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={registerLoading}
          >
            {registerLoading
              ? 'Creating account...'
              : 'Create account'}
            <ArrowRight size={15} />
          </button>

        </form>

        <p style={{ marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/account">
            Sign in
          </Link>
        </p>
      </SimplePage>
    )
  }

  // ==========================================================
  // SHIPPING & RETURNS
  // ==========================================================

  if (path === '/shipping') {
    return (
      <SimplePage
        eyebrow="Shipping & returns"
        title="Shipping made simple."
      >
        <p className="lead">
          We carefully pack every XAAJ order and
          deliver across India.
        </p>

        <div className="faq-list">
          <details open>
            <summary>How long does delivery take?</summary>
            <p>
              Most orders arrive within 3–7 working days across India.
            </p>
          </details>

          <details>
            <summary>What is the shipping charge?</summary>
            <p>
              Shipping is free on orders of ₹5,000 or more.
              Orders below ₹5,000 have a shipping fee of ₹199.
            </p>
          </details>

          <details>
            <summary>Can I return my order?</summary>
            <p>
              Yes. We offer easy returns within 7 days of delivery,
              subject to the applicable return conditions.
            </p>
          </details>

          <details>
            <summary>How do I request a return?</summary>
            <p>
              Please contact us with your order details at
              hello@xaaj.in and our support team will guide you.
            </p>
          </details>
        </div>
      </SimplePage>
    )
  }

  // ==========================================================
  // PRIVACY POLICY
  // ==========================================================

  if (path === '/privacy') {
    return (
      <SimplePage
        eyebrow="Privacy"
        title="Your privacy matters."
      >
        <p className="lead">
          We use your information only to provide
          a smooth and secure shopping experience.
        </p>

        <p>
          Information such as your name, email, phone number
          and delivery address may be used to process orders,
          payments, delivery and customer support.
        </p>

        <p>
          For privacy questions, contact us at hello@xaaj.in.
        </p>
      </SimplePage>
    )
  }

  // ==========================================================
  // TERMS & CONDITIONS
  // ==========================================================

  if (path === '/terms') {
    return (
      <SimplePage
        eyebrow="Terms"
        title="Terms & conditions."
      >
        <p className="lead">
          By using the XAAJ website, you agree to use the store
          responsibly and provide accurate information when
          placing an order.
        </p>

        <p>
          Product prices, availability, delivery timelines and
          other store information may change when required.
        </p>

        <p>
          Orders are subject to successful payment verification
          and product availability.
        </p>

        <p>
          Questions? Contact hello@xaaj.in.
        </p>
      </SimplePage>
    )
  }

  // ==========================================================
  // CONTACT / FAQ
  // ==========================================================

  if (path === '/contact' || path === '/faq') {
    return (
      <SimplePage
        eyebrow="We are here"
        title="How can we help?"
      >
        <p className="lead">
          Questions about an order, a piece
          or the making process? Write to
          hello@xaaj.in and we’ll get back
          to you within two working days.
        </p>

        <div className="faq-list">
          <details open>
            <summary>How long does delivery take?</summary>
            <p>
              Most orders arrive within
              3–7 working days across India.
            </p>
          </details>

          <details>
            <summary>Are the pieces dishwasher safe?</summary>
            <p>
              Yes. Our tableware is made for
              everyday use and is dishwasher safe.
            </p>
          </details>

          <details>
            <summary>Can I return my order?</summary>
            <p>
              Absolutely. We offer easy returns
              within 7 days of delivery.
            </p>
          </details>
        </div>
      </SimplePage>
    )
  }

  // ==========================================================
  // DEFAULT ROUTE
  // ==========================================================

  return <Home />
}


// ============================================================
// APP ROOT
// ============================================================

export default function AppRoot() {

  return (

    <AuthProvider>

      <StoreProvider>

        <BrowserRouter>

          <App />

        </BrowserRouter>

      </StoreProvider>

    </AuthProvider>

  )
}