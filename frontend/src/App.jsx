// ============================================================
// IMPORTS
// ============================================================

import React, { useEffect, useRef, useState } from 'react'

import {
  BrowserRouter,
  Link,
  Navigate,
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
  Check,
  Mail,
  MessageCircle,

  // Trust / Service section icons
  Gem,
  Truck,
  Package,
  ShieldCheck
} from 'lucide-react'

// Instagram icon
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'

import './styles.css'

// API
import { apiRequest, productService, orderService, cmsService, newsletterService } from './services/api'

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

const defaultHeroSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1800&q=88',
    alt: 'Handmade stoneware arranged on a dining table'
  },
  {
    image:
      'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1800&q=88',
    alt: 'Warm dining table with handcrafted tableware'
  },
  {
    image:
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1800&q=88',
    alt: 'Elegant ceramic tableware collection'
  }
]

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

  // Authentication
  const { user } = useAuth()

  // Cart item count + premium cart micro-interaction
  const { count } = useStore()
  const [cartBump, setCartBump] = useState(false)

  useEffect(() => {
    const handleCartAdded = () => {
      setCartBump(true)

      window.setTimeout(() => {
        setCartBump(false)
      }, 520)
    }

    window.addEventListener(
      'xaaj:cart-added',
      handleCartAdded
    )

    return () => {
      window.removeEventListener(
        'xaaj:cart-added',
        handleCartAdded
      )
    }
  }, [])

  // Announcement bar state
  const [announcementText, setAnnouncementText] = useState(
    'Free shipping on orders above ₹1,000'
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
    'New Arrivals',
    'About Us',
    'Blog',
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
            onClick={() =>
              navigate(
                user?.role === 'admin'
                  ? '/admin'
                  : '/account'
              )
            }
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
            className={`bag ${
              cartBump ? 'cart-bump' : ''
            }`}
            data-xaaj-cart-target="true"
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
                ? '/shop#shop-products'
                : n === 'New Arrivals'
                ? '/#customer-favorites'
                : n === 'About Us'
                ? '/about'
                : n === 'Blog'
                ? '/blog'
                : n === 'Contact'
                ? '/contact'
                : `/${n.toLowerCase().replace(/\s+/g, '-')}`
            }
            onClick={e => {
              setOpen(false)

              if (n === 'Shop') {
                e.preventDefault()

                const scrollToShopProducts = () => {
                  const section = document.getElementById(
                    'shop-products'
                  )

                  if (section) {
                    section.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }
                }

                if (window.location.pathname !== '/shop') {
                  navigate('/shop#shop-products')
                  window.setTimeout(scrollToShopProducts, 120)
                } else {
                  window.history.pushState(
                    null,
                    '',
                    '/shop#shop-products'
                  )
                  window.setTimeout(scrollToShopProducts, 20)
                }

                return
              }

              if (n === 'New Arrivals') {
                e.preventDefault()

                const scrollToFavorites = () => {
                  const section = document.getElementById(
                    'customer-favorites'
                  )

                  if (section) {
                    section.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }
                }

                if (window.location.pathname !== '/') {
                  navigate('/')
                  window.setTimeout(scrollToFavorites, 120)
                } else {
                  window.history.pushState(
                    null,
                    '',
                    '/#customer-favorites'
                  )
                  window.dispatchEvent(new PopStateEvent('popstate'))
                  window.setTimeout(scrollToFavorites, 20)
                }
              }
            }}
          >
            {n}
          </Link>

        ))}


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
  light = false,
  className = ''
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
      } ${className}`}
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
// PRODUCT CARD — PREMIUM REDESIGN
// ============================================================

function ProductCard({
  product
}) {
  const {
    add,
    wish,
    toggleWish
  } = useStore()

  const [wishlistPulse, setWishlistPulse] = useState(false)
  const [cartPulse, setCartPulse] = useState(false)

  // Always prefer the normalized id, with _id as a safe fallback.
  const productId = product.id || product._id

  const liked = wish.includes(productId)

  // Second product image for hover.
  const secondaryImage =
    product.images?.[1] ||
    product.image ||
    ''

  // ----------------------------------------------------------
  // Wishlist
  // ----------------------------------------------------------

  const handleWishlist = event => {
    event.preventDefault()
    event.stopPropagation()

    if (!productId) return

    toggleWish(productId)

    setWishlistPulse(true)

    window.setTimeout(() => {
      setWishlistPulse(false)
    }, 500)
  }

  // ----------------------------------------------------------
  // Add to cart
  // ----------------------------------------------------------

  const handleAddToCart = event => {
    event.preventDefault()
    event.stopPropagation()

    const card =
      event.currentTarget.closest('.product-card')

    const image =
      card?.querySelector('.product-image-primary')

    const cartTarget =
      document.querySelector(
        '[data-xaaj-cart-target="true"]'
      )

    const imageRect =
      image?.getBoundingClientRect()

    const cartRect =
      cartTarget?.getBoundingClientRect()

    add(product)

    setCartPulse(true)

    window.setTimeout(() => {
      setCartPulse(false)
    }, 520)

    window.dispatchEvent(
      new CustomEvent('xaaj:cart-added')
    )

    if (!imageRect || !cartRect) return

    const clone = image.cloneNode(true)

    const startX = imageRect.left
    const startY = imageRect.top

    const endX =
      cartRect.left +
      cartRect.width / 2 -
      25

    const endY =
      cartRect.top +
      cartRect.height / 2 -
      25

    Object.assign(clone.style, {
      position: 'fixed',
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${Math.min(imageRect.width, 82)}px`,
      height: `${Math.min(imageRect.height, 82)}px`,
      objectFit: 'cover',
      borderRadius: '50%',
      zIndex: '20000',
      pointerEvents: 'none',
      margin: '0',
      boxShadow: '0 14px 40px rgba(41,40,37,.20)',
      transform: 'translate3d(0,0,0) scale(1)',
      opacity: '1',
      transition:
        'transform .78s cubic-bezier(.22,1,.36,1), opacity .78s ease'
    })

    document.body.appendChild(clone)

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        clone.style.transform =
          `translate3d(${endX - startX}px, ${endY - startY}px, 0) scale(.12)`

        clone.style.opacity = '0'
      })
    })

    window.setTimeout(() => {
      clone.remove()
    }, 850)
  }

  return (
    <article className="product-card">

      {/* ======================================================
          PRODUCT IMAGE
          ====================================================== */}

      <div className="product-image">

        <Link
          to={`/product/${product.slug}`}
          className="product-image-link"
          aria-label={`View ${product.name}`}
        >

          {/* Original image */}
          <img
            className="product-image-primary"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />

          {/* Second image appears smoothly on hover */}
          {secondaryImage && (
            <img
              className="product-image-secondary"
              src={secondaryImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          )}

        </Link>

        {/* Product tag */}
        {product.tag && (
          <span className="tag">
            {product.tag}
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          className={`heart ${
            liked ? 'liked' : ''
          } ${
            wishlistPulse ? 'wishlist-pop' : ''
          }`}
          onClick={handleWishlist}
          aria-label={
            liked
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={liked}
        >
          <Heart
            size={18}
            strokeWidth={1.45}
            fill={
              liked
                ? 'currentColor'
                : 'none'
            }
          />

          <span className="heart-tooltip">
            {liked
              ? 'Saved'
              : 'Add to wishlist'}
          </span>
        </button>

        {/* Add to cart — kept in the original product-card position */}
        <span className="product-image-bottom-spacer" aria-hidden="true" />

      </div>

      {/* ======================================================
          PRODUCT INFORMATION
          ====================================================== */}

      <div className="product-copy">

        <div className="product-meta">

          <span className="product-category">
            {product.category}
          </span>

          <Rating
            count={product.rating}
            reviews={product.reviews}
          />

        </div>

        <Link
          to={`/product/${product.slug}`}
          className="product-title-link"
        >
          <h3>
            {product.name}
          </h3>
        </Link>

        <div className="price">

          <strong>
            {money(product.price)}
          </strong>

          {Number(product.old || 0) >
            Number(product.price || 0) && (
            <del>
              {money(product.old)}
            </del>
          )}

          {Number(product.old || 0) >
            Number(product.price || 0) && (
            <span className="save-badge">
              {Math.round(
                ((Number(product.old) -
                  Number(product.price)) /
                  Number(product.old)) *
                  100
              )}
              % off
            </span>
          )}

        </div>

        {/* Premium Add to Cart button */}
        <button
          type="button"
          className={`add ${
            cartPulse ? 'add-success' : ''
          }`}
          onClick={handleAddToCart}
          disabled={Number(product.stock ?? 0) <= 0}
          aria-label={
            Number(product.stock ?? 0) <= 0
              ? 'Out of stock'
              : `Add ${product.name} to cart`
          }
        >
          <span className="add-label">
            {Number(product.stock ?? 0) <= 0
              ? 'Out of stock'
              : cartPulse
                ? 'Added to cart'
                : 'Add to cart'}
          </span>

          <span className="add-icon" aria-hidden="true">
            {Number(product.stock ?? 0) <= 0
              ? null
              : cartPulse
                ? <Check size={15} />
                : <Plus size={15} />}
          </span>

          <span className="add-shine" aria-hidden="true" />
        </button>

        {/* Subtle stock cue */}
        {Number(product.stock ?? 0) > 0 &&
          Number(product.stock ?? 0) <= 5 && (
            <span className="low-stock">
              Only {product.stock} left
            </span>
          )}

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

  // ==========================================================
  // HERO SLIDER
  // ==========================================================

  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)

  const heroTouchStart = useRef(null)

  // ==========================================================
  // LOAD HERO SLIDES FROM CMS
  //
  // Admin panel se saved hero images yahan load hongi.
  // Agar API unavailable ho ya koi slide saved na ho,
  // default hero images automatically use hongi.
  // ==========================================================

  useEffect(() => {
    let cancelled = false

    async function loadHeroSlides() {
      try {
        const result = await cmsService.getHero()
        const slides = Array.isArray(result?.data?.slides)
          ? result.data.slides
          : []

        const activeSlides = slides
          .filter(slide => slide?.enabled !== false && slide?.image)
          .map(slide => ({
            image: slide.image,
            mobileImage: slide.mobileImage || slide.image,
            alt: slide.alt || 'XAAJ Crockery'
          }))

        if (!cancelled && activeSlides.length > 0) {
          setHeroSlides(activeSlides)
          setHeroIndex(0)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Hero CMS load error:', error)
          // Keep default hero slides if CMS API is unavailable.
        }
      }
    }

    loadHeroSlides()

    return () => {
      cancelled = true
    }
  }, [])

  // ==========================================================
  // HERO AUTO SLIDER
  // ==========================================================

  useEffect(() => {
    if (heroPaused || heroSlides.length < 2) return undefined

    const timer = window.setInterval(() => {
      setHeroIndex(current =>
        (current + 1) % heroSlides.length
      )
    }, 2000)

    return () => window.clearInterval(timer)
  }, [heroPaused, heroSlides.length])

  // Pause the hero slider as soon as the user starts scrolling.
  // It will remain paused for the rest of this page view.
  useEffect(() => {
    const handleScroll = () => {
      setHeroPaused(true)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const goToHero = index => {
    const total = heroSlides.length

    if (!total) return

    setHeroIndex(
      ((index % total) + total) % total
    )
  }

  // ==========================================================
  // PREMIUM SCROLL REVEAL
  // ==========================================================

  useEffect(() => {
    const elements = document.querySelectorAll(
      '[data-xaaj-reveal]'
    )

    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return

          entry.target.classList.add('xaaj-revealed')
          observer.unobserve(entry.target)
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
      }
    )

    elements.forEach(element => {
      observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>

      {/* Header */}
      <Header />


      <main>


        {/* ====================================================
            HERO SECTION
        ==================================================== */}

        <section
          className="hero hero-slider"
          onTouchStart={event => {
            heroTouchStart.current = event.touches[0]?.clientX ?? null
          }}
          onTouchEnd={event => {
            const startX = heroTouchStart.current
            const endX = event.changedTouches[0]?.clientX ?? null

            if (startX === null || endX === null) return

            const distance = startX - endX

            if (Math.abs(distance) > 45) {
              if (distance > 0) {
                goToHero(heroIndex + 1)
              } else {
                goToHero(heroIndex - 1)
              }
            }

            heroTouchStart.current = null
          }}
          aria-label="XAAJ featured collection"
        >

          {/* ====================================================
              HERO IMAGES
          ==================================================== */}

          <div className="hero-slides" aria-live="polite">

            {heroSlides.map((slide, index) => (
              <img
                key={slide.image}
                className={`hero-slide ${
                  index === heroIndex
                    ? 'hero-slide-active'
                    : ''
                }`}
                src={slide.image}
                alt={slide.alt}
                draggable="false"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}

          </div>


          {/* ====================================================
              HERO CONTENT
              Existing text and button intentionally unchanged.
          ==================================================== */}

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


          {/* ====================================================
              HERO NOTE
          ==================================================== */}

          <div className="hero-note">

            Stores crafted
            <br />

            in earth

            <span>
              ↓
            </span>

          </div>


          {/* ====================================================
              HERO CONTROLS
          ==================================================== */}

          {heroSlides.length > 1 && (
            <div className="hero-controls">

              <button
                type="button"
                className="hero-arrow hero-arrow-prev"
                onClick={() => goToHero(heroIndex - 1)}
                aria-label="Previous hero slide"
              >
                ←
              </button>

              <div
                className="hero-dots"
                aria-label="Hero slide navigation"
              >
                {heroSlides.map((slide, index) => (
                  <button
                    type="button"
                    key={`hero-dot-${index}`}
                    className={`hero-dot ${
                      index === heroIndex
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => goToHero(index)}
                    aria-label={`Go to hero slide ${index + 1}`}
                    aria-current={
                      index === heroIndex
                        ? 'true'
                        : undefined
                    }
                  />
                ))}
              </div>

              <span className="hero-counter">
                {String(heroIndex + 1).padStart(2, '0')}
                {' / '}
                {String(heroSlides.length).padStart(2, '0')}
              </span>

              <button
                type="button"
                className="hero-arrow hero-arrow-next"
                onClick={() => goToHero(heroIndex + 1)}
                aria-label="Next hero slide"
              >
                →
              </button>

            </div>
          )}

        </section>


        {/* ====================================================
            INTRO SECTION
        ==================================================== */}

        <section className="intro" data-xaaj-reveal="up">

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

        <section className="categories wrap" data-xaaj-reveal="up">

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
                data-xaaj-reveal="up"
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

        <section
          id="customer-favorites"
          className="favorites"
          data-xaaj-reveal="up"
          style={{ scrollMarginTop: '120px' }}
        >

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

        <section className="feature" data-xaaj-reveal="up">

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

        <section className="trust-bar" data-xaaj-reveal="up">


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
            BLOG / JOURNAL SECTION
        ==================================================== */}

        <BlogSection />


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

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState(null)

  const closePopup = () => {
    setPopup(null)
  }

  const handleSubmit = async event => {
    event.preventDefault()

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      setPopup({
        type: 'error',
        title: 'Email required',
        message: 'Please enter your email address to subscribe.'
      })
      return
    }

    setLoading(true)

    try {
      const result = await newsletterService.subscribe(cleanEmail)

      setEmail('')

      setPopup({
        type: 'success',
        title: 'Welcome to XAAJ',
        message:
          result?.message ||
          'You’re now part of the XAAJ family. We’ll share thoughtful collections and little stories with you.'
      })

    } catch (error) {

      const code = error?.data?.code

      if (
        code === 'ALREADY_SUBSCRIBED' ||
        error?.status === 409
      ) {
        setPopup({
          type: 'already',
          title: 'You’re already subscribed 💛',
          message:
            'This email is already part of the XAAJ family. We’re glad to have you with us.'
        })
      } else {
        setPopup({
          type: 'error',
          title: 'Something went wrong',
          message:
            error?.data?.message ||
            error?.message ||
            'We could not complete your subscription right now. Please try again.'
        })
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="newsletter" data-xaaj-reveal="up">

        <span className="eyebrow">
          A little note from us
        </span>

        <h2>
          Come, stay awhile.
        </h2>

        <p>
          Thoughtful collections, quiet inspiration
          and little stories from XAAJ — shared with care,
          never too often.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="Your email address"
            disabled={loading}
            aria-label="Your email address"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}

            {!loading && (
              <ArrowRight size={14} />
            )}
          </button>

        </form>

      </section>


      {/* ========================================================
          NEWSLETTER POPUP
      ======================================================== */}

      {popup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="xaaj-newsletter-popup-title"
          onClick={event => {
            if (event.target === event.currentTarget) {
              closePopup()
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(35, 32, 28, 0.48)',
            backdropFilter: 'blur(8px)'
          }}
        >

          <div
            style={{
              position: 'relative',
              width: 'min(100%, 480px)',
              padding: '42px 34px 34px',
              textAlign: 'center',
              background: '#fffdf9',
              border: '1px solid #e8e0d5',
              borderRadius: '24px',
              boxShadow: '0 30px 80px rgba(41,40,37,.22)'
            }}
          >

            <button
              type="button"
              onClick={closePopup}
              aria-label="Close newsletter popup"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                display: 'grid',
                placeItems: 'center',
                padding: 0,
                border: '1px solid #e5ddd2',
                borderRadius: '50%',
                background: '#fff',
                color: '#292824',
                cursor: 'pointer'
              }}
            >
              <X size={17} strokeWidth={1.5} />
            </button>


            <div
              style={{
                width: '54px',
                height: '54px',
                margin: '0 auto 20px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background:
                  popup.type === 'error'
                    ? '#f6ebe6'
                    : '#f5eee4',
                color: '#b84d32',
                fontFamily: 'Georgia, serif',
                fontSize: '23px'
              }}
            >
              {popup.type === 'error' ? '!' : '♡'}
            </div>


            <span
              style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#b84d32',
                fontWeight: 600
              }}
            >
              XAAJ
            </span>


            <h3
              id="xaaj-newsletter-popup-title"
              style={{
                margin: '0 0 14px',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '30px',
                lineHeight: 1.2,
                fontWeight: 400,
                color: '#292824'
              }}
            >
              {popup.title}
            </h3>


            <p
              style={{
                maxWidth: '390px',
                margin: '0 auto',
                fontSize: '15px',
                lineHeight: 1.75,
                color: '#706d67'
              }}
            >
              {popup.message}
            </p>


            <div
              style={{
                width: '54px',
                height: '1px',
                margin: '25px auto 24px',
                background: '#d9d0c5'
              }}
            />


            <button
              type="button"
              onClick={closePopup}
              style={{
                minWidth: '150px',
                padding: '13px 24px',
                border: '1px solid #292824',
                borderRadius: '999px',
                background: '#292824',
                color: '#fff',
                fontSize: '13px',
                letterSpacing: '.5px',
                cursor: 'pointer'
              }}
            >
              Continue shopping
            </button>

          </div>

        </div>
      )}
    </>
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

          <Link to="/about">
            About us
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

          <Link to="/shipping" title="Shipping Policy">
            Shipping Policy
          </Link>

          <Link to="/returns" title="Return & Refund Policy">
            Return & Refund Policy
          </Link>

          <Link to="/cancellation" title="Cancellation Policy">
            Cancellation Policy
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

            {/* WhatsApp */}
            <a
              href="https://wa.me/919899446117"
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with XAAJ on WhatsApp"
              title="WhatsApp"
            >
              <FaWhatsapp size={22} />
            </a>

            {/* Email */}
            <a
              href="mailto:customercare@xaaj.in"
              aria-label="Email XAAJ"
              title="Email"
            >
              <Mail />
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
          <div
            id="shop-products"
            className="product-grid shop-grid"
            style={{ scrollMarginTop: '120px' }}
          >

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
  const [detailCartPulse, setDetailCartPulse] = useState(false)

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

              {/* Add To Cart — reference-style button with premium animation */}
              <button
                type="button"
                className={`detail-add-button ${
                  detailCartPulse ? 'detail-add-success' : ''
                }`}
                onClick={event => {
                  event.preventDefault()

                  for (let i = 0; i < qty; i++) {
                    add(product)
                  }

                  // Premium image-to-cart animation.
                  const image = document.querySelector('.detail-image img')
                  const cartTarget = document.querySelector(
                    '[data-xaaj-cart-target="true"]'
                  )
                  const imageRect = image?.getBoundingClientRect()
                  const cartRect = cartTarget?.getBoundingClientRect()

                  if (imageRect && cartRect) {
                    const flyingImage = image.cloneNode(true)
                    const startX = imageRect.left + imageRect.width / 2 - 30
                    const startY = imageRect.top + imageRect.height / 2 - 30
                    const endX = cartRect.left + cartRect.width / 2 - 30
                    const endY = cartRect.top + cartRect.height / 2 - 30

                    flyingImage.className = 'xaaj-flying-cart-image'
                    flyingImage.style.left = `${startX}px`
                    flyingImage.style.top = `${startY}px`
                    flyingImage.style.setProperty('--xaaj-x', `${endX - startX}px`)
                    flyingImage.style.setProperty('--xaaj-y', `${endY - startY}px`)

                    document.body.appendChild(flyingImage)
                    flyingImage.addEventListener(
                      'animationend',
                      () => flyingImage.remove(),
                      { once: true }
                    )
                  }

                  window.dispatchEvent(new CustomEvent('xaaj:cart-added'))
                  setDetailCartPulse(true)
                  window.setTimeout(() => setDetailCartPulse(false), 650)
                }}
              >
                <span className="detail-add-label">
                  ADD TO CART
                </span>
                <span className="detail-add-shine" aria-hidden="true" />
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
                Free shipping on orders of ₹1,000 or more
                <br />
              Secure packaging · 48-hour damage reporting
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

                      {total >= 1000
                        ? 'FREE'
                        : money(99)}

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
                        total >= 1000
                          ? total
                          : total + 99
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
// PREMIUM POLICY ACCORDION
// ============================================================

function PolicyAccordion({ sections }) {
  return (
    <div className="policy-accordion">
      {sections.map((section, index) => (
        <details className="policy-item" key={section.title} open={index === 0}>
          <summary>
            <span>{section.title}</span>
            <span className="policy-plus" aria-hidden="true">+</span>
          </summary>
          <div className="policy-answer">
            {section.content}
          </div>
        </details>
      ))}
    </div>
  )
}

const policyAccordionStyles = `
  .policy-page {
    background: #f7f3ed;
  }
  .policy-page .wrap.narrow {
    max-width: 900px;
  }
  .policy-hero {
    padding: 78px 0 46px;
  }
  .policy-hero .eyebrow {
    display: block;
    margin-bottom: 18px;
    letter-spacing: .24em;
  }
  .policy-hero h1 {
    max-width: 760px;
    margin: 0 0 20px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(48px, 7vw, 82px);
    line-height: .98;
    font-weight: 400;
    letter-spacing: -.035em;
  }
  .policy-hero .policy-intro {
    max-width: 720px;
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(20px, 2.2vw, 27px);
    line-height: 1.45;
    color: #393632;
  }
  .policy-effective {
    margin-top: 18px;
    font-family: Arial, sans-serif;
    font-size: 13px;
    color: #77716a;
  }
  .policy-accordion {
    border-top: 1px solid rgba(45, 42, 38, .16);
    margin: 10px 0 80px;
  }
  .policy-item {
    border-bottom: 1px solid rgba(45, 42, 38, .16);
  }
  .policy-item summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 27px 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(22px, 2.2vw, 29px);
    line-height: 1.25;
    color: #292724;
    transition: opacity .25s ease;
  }
  .policy-item summary::-webkit-details-marker { display: none; }
  .policy-item summary:hover { opacity: .68; }
  .policy-plus {
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    font-family: Arial, sans-serif;
    font-size: 24px;
    font-weight: 300;
    line-height: 1;
    transition: transform .3s ease;
  }
  .policy-item[open] .policy-plus {
    transform: rotate(45deg);
  }
  .policy-answer {
    max-width: 790px;
    padding: 0 46px 30px 0;
    color: #68635d;
    font-family: Arial, sans-serif;
    font-size: 15px;
    line-height: 1.8;
    animation: policyReveal .35s ease both;
  }
  .policy-answer p { margin: 0 0 16px; }
  .policy-answer p:last-child { margin-bottom: 0; }
  .policy-answer ul { margin: 0 0 16px; padding-left: 22px; }
  .policy-answer li { margin: 0 0 8px; }
  .policy-answer strong { color: #36322e; }
  .policy-answer a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
  @keyframes policyReveal {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 700px) {
    .policy-hero { padding: 54px 0 34px; }
    .policy-hero h1 { font-size: 48px; }
    .policy-item summary { padding: 22px 0; font-size: 23px; }
    .policy-answer { padding: 0 0 25px; font-size: 14px; }
  }
`

// ============================================================
// SIMPLE PAGE
// ============================================================

function SimplePage({
  title,
  eyebrow,
  children,
  policy = false,
  intro = '',
  effectiveDate = ''
}) {

  if (policy) {
    return (
      <>
        <Header />
        <style>{policyAccordionStyles}</style>
        <main className="page simple policy-page">
          <div className="wrap narrow">
            <div className="policy-hero">
              <span className="eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p className="policy-intro">{intro}</p>
              {effectiveDate && (
                <p className="policy-effective">Effective date: {effectiveDate}</p>
              )}
            </div>
            {children}
          </div>
        </main>
        <Newsletter />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="page simple">
        <div className="wrap narrow">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {children}
        </div>
      </main>
      <Newsletter />
      <Footer />
    </>
  )
}


// ============================================================
// BLOG — PREMIUM EDITORIAL DESIGN
// ============================================================

const fallbackBlogPosts = [
  {
    id: 'blog-1',
    title: '5 Ways to Create a Beautiful Dining Table',
    slug: '5-ways-to-create-a-beautiful-dining-table',
    coverImage: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1600&q=88',
    category: 'Table Styling',
    excerpt: 'Simple ideas to elevate your dining experience with timeless crockery, thoughtful placement and beautiful details.',
    content: 'A beautiful dining table is not only about the food you serve. The right crockery, placement and small details can completely transform the experience.\n\nStart with the right dinnerware. Choose pieces that complement your table and the occasion, while keeping the setting practical enough for everyday use.\n\nAdd layers with plates, bowls and serving pieces to create visual depth. Keep colours balanced and let natural textures do the talking.\n\nFinally, leave a little room for imperfection. A table should feel lived in, warm and inviting — never overly precious.',
    author: 'XAAJ Editorial',
    publishDate: '2026-09-15',
    isPublished: true
  },
  {
    id: 'blog-2',
    title: 'How to Care for Your Ceramic Dinnerware',
    slug: 'how-to-care-for-your-ceramic-dinnerware',
    coverImage: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1600&q=88',
    category: 'Crockery Care',
    excerpt: 'Keep your favourite XAAJ pieces beautiful for years with a few simple care habits.',
    content: 'Good ceramic dinnerware is made to be used. With a little everyday care, your favourite pieces can remain part of your table for years.\n\nWash pieces gently and avoid sudden temperature changes wherever possible. Stack thoughtfully and give delicate rims a little extra space.\n\nFor daily meals, use your pieces freely. Their beauty comes from becoming part of the rituals and moments that make a home feel like yours.',
    author: 'XAAJ Editorial',
    publishDate: '2026-09-12',
    isPublished: true
  },
  {
    id: 'blog-3',
    title: 'Creating a Cozy Corner at Home',
    slug: 'creating-a-cozy-corner-at-home',
    coverImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1600&q=88',
    category: 'Home Decor',
    excerpt: 'Small styling ideas to make an everyday corner feel warmer, calmer and more inviting.',
    content: 'A home does not need a complete makeover to feel different. Sometimes, a few thoughtful objects are enough.\n\nStart with one useful piece you genuinely love, then build around it with natural textures, soft light and a little greenery.\n\nThe goal is not perfection. It is creating a corner that feels comfortable enough to pause, gather and stay awhile.',
    author: 'XAAJ Editorial',
    publishDate: '2026-09-10',
    isPublished: true
  }
]

function normalizeBlogPost(post, index = 0) {
  if (!post || typeof post !== 'object') return null

  return {
    ...post,
    id: post.id || post._id || `blog-${index}`,
    title: post.title || 'XAAJ Story',
    slug: post.slug || '',
    coverImage: post.coverImage || post.image || post.featuredImage || '',
    category: post.category || 'XAAJ Stories',
    excerpt: post.excerpt || post.shortExcerpt || '',
    content: post.content || post.article || '',
    author: post.author || 'XAAJ Editorial',
    publishDate: post.publishDate || post.publishedAt || post.createdAt || '',
    isPublished: post.isPublished !== false && post.published !== false
  }
}

function formatBlogDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function BlogDesignStyles() {
  return (
    <style>{`
      .xaaj-blog-shell,
      .xaaj-blog-article-shell {
        --blog-ink: #292825;
        --blog-muted: #77736b;
        --blog-line: rgba(41,40,37,.14);
        --blog-soft: #f4f1eb;
        --blog-paper: #faf9f6;
        --blog-serif: Georgia, 'Times New Roman', serif;
      }

      .xaaj-blog-shell {
        position: relative;
        overflow: hidden;
        background: var(--blog-paper);
        padding: 0 0 110px;
      }

      .xaaj-blog-hero {
        position: relative;
        min-height: 520px;
        display: flex;
        align-items: flex-end;
        overflow: hidden;
        background: #292825;
      }

      .xaaj-blog-hero-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: .62;
        transform: scale(1.02);
        transition: transform 1.2s cubic-bezier(.22,1,.36,1);
      }

      .xaaj-blog-hero:hover .xaaj-blog-hero-bg { transform: scale(1.06); }

      .xaaj-blog-hero::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(25,24,22,.05) 15%, rgba(25,24,22,.74) 100%);
      }

      .xaaj-blog-hero-content {
        position: relative;
        z-index: 1;
        width: min(1180px, calc(100% - 44px));
        margin: 0 auto;
        padding: 92px 0 74px;
        color: #fff;
      }

      .xaaj-blog-kicker {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        font-size: 10px;
        letter-spacing: .2em;
        text-transform: uppercase;
        font-weight: 700;
      }

      .xaaj-blog-kicker::before {
        content: '';
        width: 34px;
        height: 1px;
        background: currentColor;
        opacity: .7;
      }

      .xaaj-blog-hero h1 {
        max-width: 780px;
        margin: 0;
        font-family: var(--blog-serif);
        font-size: clamp(48px, 7vw, 88px);
        font-weight: 400;
        line-height: .96;
        letter-spacing: -.045em;
      }

      .xaaj-blog-hero p {
        max-width: 570px;
        margin: 26px 0 0;
        font-size: 15px;
        line-height: 1.75;
        color: rgba(255,255,255,.82);
      }

      .xaaj-blog-feature-wrap {
        width: min(1180px, calc(100% - 44px));
        margin: -62px auto 0;
        position: relative;
        z-index: 3;
      }

      .xaaj-blog-feature {
        display: grid;
        grid-template-columns: minmax(0, 1.18fr) minmax(360px, .82fr);
        min-height: 440px;
        background: #fff;
        box-shadow: 0 24px 70px rgba(36,34,30,.13);
      }

      .xaaj-blog-feature-image {
        position: relative;
        min-height: 440px;
        overflow: hidden;
      }

      .xaaj-blog-feature-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 1s cubic-bezier(.22,1,.36,1);
      }

      .xaaj-blog-feature:hover .xaaj-blog-feature-image img { transform: scale(1.045); }

      .xaaj-blog-feature-copy {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 54px clamp(30px, 5vw, 70px);
      }

      .xaaj-blog-category {
        display: inline-flex;
        width: fit-content;
        color: var(--blog-muted);
        font-size: 10px;
        line-height: 1;
        font-weight: 700;
        letter-spacing: .16em;
        text-transform: uppercase;
      }

      .xaaj-blog-feature-copy h2 {
        margin: 20px 0 18px;
        font-family: var(--blog-serif);
        color: var(--blog-ink);
        font-size: clamp(31px, 4vw, 49px);
        font-weight: 400;
        line-height: 1.04;
        letter-spacing: -.035em;
      }

      .xaaj-blog-feature-copy p {
        margin: 0;
        color: var(--blog-muted);
        font-size: 14px;
        line-height: 1.8;
      }

      .xaaj-blog-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 28px;
        color: #98938a;
        font-size: 11px;
      }

      .xaaj-blog-read {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        width: fit-content;
        margin-top: 34px;
        color: var(--blog-ink);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .13em;
        text-transform: uppercase;
        text-decoration: none;
      }

      .xaaj-blog-read svg { transition: transform .35s ease; }
      .xaaj-blog-read:hover svg { transform: translateX(6px); }
      .xaaj-blog-read::after {
        content: '';
        position: absolute;
        left: 0;
        right: 28px;
        bottom: -8px;
        height: 1px;
        background: var(--blog-ink);
        transform-origin: left;
        transition: transform .35s ease;
      }
      .xaaj-blog-read:hover::after { transform: scaleX(.55); }

      .xaaj-blog-content {
        width: min(1180px, calc(100% - 44px));
        margin: 108px auto 0;
      }

      .xaaj-blog-content-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 30px;
        margin-bottom: 34px;
      }

      .xaaj-blog-content-head h2 {
        margin: 8px 0 0;
        font-family: var(--blog-serif);
        font-size: clamp(30px, 4vw, 46px);
        font-weight: 400;
        line-height: 1;
        letter-spacing: -.035em;
        color: var(--blog-ink);
      }

      .xaaj-blog-content-head p {
        max-width: 410px;
        margin: 10px 0 0;
        color: var(--blog-muted);
        font-size: 13px;
        line-height: 1.7;
      }

      .xaaj-blog-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 42px;
        padding-bottom: 18px;
        border-bottom: 1px solid var(--blog-line);
      }

      .xaaj-blog-filter {
        border: 1px solid var(--blog-line);
        background: transparent;
        color: #6f6b64;
        padding: 10px 17px;
        border-radius: 999px;
        font: inherit;
        font-size: 10px;
        letter-spacing: .11em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all .3s ease;
      }

      .xaaj-blog-filter:hover,
      .xaaj-blog-filter.active {
        background: var(--blog-ink);
        color: #fff;
        border-color: var(--blog-ink);
        transform: translateY(-1px);
      }

      .xaaj-blog-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 30px;
      }

      .xaaj-blog-card {
        min-width: 0;
        background: #fff;
        border: 1px solid rgba(44,42,38,.06);
        box-shadow: 0 8px 30px rgba(44,42,38,.07);
        overflow: hidden;
        transition: transform .45s cubic-bezier(.22,1,.36,1), box-shadow .45s ease;
      }

      .xaaj-blog-card:hover {
        transform: translateY(-7px);
        box-shadow: 0 18px 46px rgba(44,42,38,.13);
      }

      .xaaj-blog-card-image {
        position: relative;
        display: block;
        aspect-ratio: 1.58 / 1;
        overflow: hidden;
        background: #eeeae3;
      }

      .xaaj-blog-card-image img,
      .xaaj-blog-card-placeholder {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        transition: transform .8s cubic-bezier(.22,1,.36,1);
      }

      .xaaj-blog-card:hover .xaaj-blog-card-image img { transform: scale(1.045); }

      .xaaj-blog-card-number {
        display: none;
      }

      .xaaj-blog-card-copy {
        padding: 24px 27px 27px;
      }

      .xaaj-blog-category {
        display: inline-block;
        color: #b96f60;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .13em;
        line-height: 1.2;
        text-transform: uppercase;
      }

      .xaaj-blog-card-copy h3 {
        margin: 12px 0 12px;
        font-family: var(--blog-serif);
        color: var(--blog-ink);
        font-size: 26px;
        font-weight: 400;
        line-height: 1.12;
        letter-spacing: -.025em;
      }

      .xaaj-blog-card-copy h3 a {
        color: inherit;
        text-decoration: none;
      }

      .xaaj-blog-card-copy p {
        margin: 0;
        color: #77736d;
        font-size: 14px;
        line-height: 1.55;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .xaaj-blog-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-top: 18px;
        padding-top: 0;
        border-top: 0;
        color: #8b867e;
        font-size: 12px;
      }

      .xaaj-blog-card-footer .xaaj-blog-read {
        margin-top: 0;
        color: #b96f60;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0;
        text-transform: none;
      }

      .xaaj-blog-skeleton {
        aspect-ratio: 1.12 / 1;
        background: linear-gradient(100deg,#eeeae3 20%,#f7f5f1 40%,#eeeae3 60%);
        background-size: 200% 100%;
        animation: xaajBlogShimmer 1.5s linear infinite;
      }

      @keyframes xaajBlogShimmer { to { background-position: -200% 0; } }

      .xaaj-blog-empty {
        padding: 80px 20px;
        border-top: 1px solid var(--blog-line);
        text-align: center;
      }

      .xaaj-blog-empty h2 {
        margin: 0 0 10px;
        font-family: var(--blog-serif);
        font-weight: 400;
        font-size: 34px;
      }
      .xaaj-blog-empty p { color: var(--blog-muted); font-size: 13px; }

      .xaaj-blog-article-shell {
        background: var(--blog-paper);
        padding: 45px 0 110px;
      }

      .xaaj-blog-article {
        width: min(1040px, calc(100% - 44px));
        margin: 0 auto;
      }

      .xaaj-blog-breadcrumbs {
        display: flex;
        gap: 9px;
        flex-wrap: wrap;
        margin-bottom: 62px;
        color: #9b968e;
        font-size: 10px;
      }
      .xaaj-blog-breadcrumbs a { color: inherit; text-decoration: none; }
      .xaaj-blog-breadcrumbs a:hover { color: var(--blog-ink); }

      .xaaj-blog-article-header {
        max-width: 860px;
        margin: 0 auto 45px;
        text-align: center;
      }

      .xaaj-blog-article-header h1 {
        margin: 17px 0 20px;
        font-family: var(--blog-serif);
        font-size: clamp(42px, 6vw, 76px);
        font-weight: 400;
        line-height: 1;
        letter-spacing: -.045em;
        color: var(--blog-ink);
      }

      .xaaj-blog-article-meta {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        color: #918c84;
        font-size: 11px;
      }

      .xaaj-blog-article-cover {
        width: 100%;
        aspect-ratio: 1.8 / 1;
        overflow: hidden;
        background: var(--blog-soft);
      }

      .xaaj-blog-article-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .xaaj-blog-article-body {
        max-width: 720px;
        margin: 58px auto 0;
      }

      .xaaj-blog-article-excerpt {
        margin: 0 0 42px;
        font-family: var(--blog-serif);
        font-size: 23px;
        line-height: 1.55;
        color: var(--blog-ink);
      }

      .xaaj-blog-article-content p {
        margin: 0 0 25px;
        color: #5f5b54;
        font-size: 15px;
        line-height: 2;
      }

      .xaaj-blog-article-content h2 {
        margin: 48px 0 18px;
        font-family: var(--blog-serif);
        color: var(--blog-ink);
        font-size: 30px;
        font-weight: 400;
      }

      .xaaj-blog-article-back {
        max-width: 720px;
        margin: 58px auto 0;
        padding-top: 24px;
        border-top: 1px solid var(--blog-line);
      }

      .xaaj-blog-article-back a {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: var(--blog-ink);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        text-decoration: none;
      }

      .xaaj-blog-fade {
        animation: xaajBlogFade .8s cubic-bezier(.22,1,.36,1) both;
      }
      .xaaj-blog-fade-delay { animation-delay: .1s; }

      @keyframes xaajBlogFade {
        from { opacity: 0; transform: translateY(22px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 900px) {
        .xaaj-blog-hero { min-height: 460px; }
        .xaaj-blog-feature { grid-template-columns: 1fr; }
        .xaaj-blog-feature-image { min-height: 390px; }
        .xaaj-blog-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 24px; }
      }

      @media (max-width: 620px) {
        .xaaj-blog-shell { padding-bottom: 72px; }
        .xaaj-blog-hero { min-height: 470px; }
        .xaaj-blog-hero-content { width: min(100% - 30px,1180px); padding: 70px 0 62px; }
        .xaaj-blog-hero h1 { font-size: clamp(46px, 14vw, 68px); }
        .xaaj-blog-feature-wrap,
        .xaaj-blog-content,
        .xaaj-blog-article { width: min(100% - 30px,1180px); }
        .xaaj-blog-feature-wrap { margin-top: -36px; }
        .xaaj-blog-feature-image { min-height: 300px; }
        .xaaj-blog-feature-copy { padding: 35px 26px 38px; }
        .xaaj-blog-content { margin-top: 72px; }
        .xaaj-blog-content-head { display: block; }
        .xaaj-blog-filters { margin-bottom: 30px; }
        .xaaj-blog-grid { grid-template-columns: 1fr; gap: 42px; }
        .xaaj-blog-card-image { aspect-ratio: 1.5 / 1; }
        .xaaj-blog-card-copy { padding: 21px 20px 23px; }
        .xaaj-blog-card-copy h3 { font-size: 23px; }
        .xaaj-blog-article-shell { padding-top: 28px; }
        .xaaj-blog-breadcrumbs { margin-bottom: 44px; }
        .xaaj-blog-article-header { margin-bottom: 34px; }
        .xaaj-blog-article-cover { aspect-ratio: 1.08 / 1; }
        .xaaj-blog-article-body { margin-top: 38px; }
        .xaaj-blog-article-excerpt { font-size: 20px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .xaaj-blog-hero-bg,
        .xaaj-blog-feature-image img,
        .xaaj-blog-card-image img,
        .xaaj-blog-read svg,
        .xaaj-blog-filter { transition: none; }
        .xaaj-blog-fade { animation: none; }
      }
    `}</style>
  )
}

function BlogCard({ post, index = 0 }) {
  return (
    <article className="xaaj-blog-card xaaj-blog-fade" style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}>
      <Link to={`/blog/${post.slug}`} className="xaaj-blog-card-image" aria-label={`Read ${post.title}`}>
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} loading="lazy" />
        ) : (
          <div className="xaaj-blog-card-placeholder" />
        )}
        <span className="xaaj-blog-card-number">{String(index + 1).padStart(2, '0')}</span>
      </Link>

      <div className="xaaj-blog-card-copy">
        <span className="xaaj-blog-category">{post.category}</span>
        <h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3>
        {post.excerpt && <p>{post.excerpt}</p>}

        <div className="xaaj-blog-card-footer">
          <span>{formatBlogDate(post.publishDate)}</span>
          <Link to={`/blog/${post.slug}`} className="xaaj-blog-read">
            Read article <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function useBlogPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadBlogs() {
      try {
        const result = await apiRequest('/blogs')
        const rawPosts = result?.data?.blogs || result?.blogs || result?.data || []
        const livePosts = Array.isArray(rawPosts)
          ? rawPosts.map((post, index) => normalizeBlogPost(post, index)).filter(post => post && post.isPublished)
          : []

        if (!cancelled) setPosts(livePosts.length ? livePosts : fallbackBlogPosts)
      } catch (error) {
        if (!cancelled) {
          console.error('Blog load error:', error)
          setPosts(fallbackBlogPosts)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadBlogs()
    return () => { cancelled = true }
  }, [])

  return { posts, loading }
}

function BlogSection() {
  const { posts, loading } = useBlogPosts()
  const visiblePosts = posts.filter(post => post?.isPublished !== false).slice(0, 3)

  return (
    <section className="xaaj-blog-shell" data-xaaj-reveal="up">
      <BlogDesignStyles />

      <div className="xaaj-blog-content xaaj-blog-home-content">
        <div className="xaaj-blog-content-head">
          <div>
            <span className="xaaj-blog-kicker" style={{ color: '#77736b' }}>From our blog</span>
            <h2>Stories for beautiful living</h2>
            <p>Ideas, inspiration and thoughtful rituals for a more beautiful everyday.</p>
          </div>
          <Link to="/blog" className="xaaj-blog-read">View all stories <ArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div className="xaaj-blog-grid">
            {[1, 2, 3].map(item => <div className="xaaj-blog-skeleton" key={item} />)}
          </div>
        ) : visiblePosts.length ? (
          <div className="xaaj-blog-grid">
            {visiblePosts.map((post, index) => (
              <BlogCard key={post.id || post.slug || index} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="xaaj-blog-empty">
            <h2>No stories yet.</h2>
            <p>New XAAJ stories will appear here soon.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function BlogPage() {
  const { posts, loading } = useBlogPosts()
  const [category, setCategory] = useState('All')

  const categoryList = [
    'All',
    ...Array.from(new Set(posts.map(post => post.category).filter(Boolean)))
  ]

  const filteredPosts = category === 'All'
    ? posts
    : posts.filter(post => post.category === category)

  const heroPost = filteredPosts[0] || posts[0]

  return (
    <>
      <Header />
      <BlogDesignStyles />

      <main className="xaaj-blog-shell">
        <section className="xaaj-blog-hero">
          {heroPost?.coverImage && (
            <img className="xaaj-blog-hero-bg" src={heroPost.coverImage} alt="" aria-hidden="true" />
          )}
          <div className="xaaj-blog-hero-content xaaj-blog-fade">
            <span className="xaaj-blog-kicker">The XAAJ Blog</span>
            <h1>Beautiful things.<br />Thoughtfully lived.</h1>
            <p>Stories, inspiration and practical rituals for tables, homes and the everyday objects we choose to live with.</p>
          </div>
        </section>

        <div className="xaaj-blog-content">
          <div className="xaaj-blog-filters" aria-label="Blog categories">
            {categoryList.map(item => (
              <button
                type="button"
                key={item}
                className={`xaaj-blog-filter ${category === item ? 'active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="xaaj-blog-grid">
              {[1, 2, 3].map(item => <div className="xaaj-blog-skeleton" key={item} />)}
            </div>
          ) : filteredPosts.length ? (
            <div className="xaaj-blog-grid xaaj-blog-page-grid">
              {filteredPosts.map((post, index) => (
                <BlogCard key={post.id || post.slug || index} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="xaaj-blog-empty">
              <h2>No stories yet.</h2>
              <p>New XAAJ stories will appear here soon.</p>
            </div>
          )}
        </div>
      </main>

      <Newsletter />
      <Footer />
    </>
  )
}

function BlogArticle({ slug }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadBlog() {
      try {
        const result = await apiRequest(`/blogs/${encodeURIComponent(slug)}`)
        const rawPost = result?.data?.blog || result?.blog || result?.data || result
        const livePost = normalizeBlogPost(rawPost)

        if (!cancelled && livePost?.title) {
          setPost(livePost)
          return
        }

        const fallback = fallbackBlogPosts.find(item => item.slug === slug)
        if (!cancelled) setPost(fallback || null)
      } catch (error) {
        if (!cancelled) {
          console.error('Blog article load error:', error)
          const fallback = fallbackBlogPosts.find(item => item.slug === slug)
          setPost(fallback || null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadBlog()
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />
        <BlogDesignStyles />
        <main className="xaaj-blog-article-shell">
          <div className="xaaj-blog-article"><span className="xaaj-blog-category">Blog</span><h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>Loading story...</h1></div>
        </main>
        <Footer />
      </>
    )
  }

  if (!post) {
    return (
      <>
        <Header />
        <BlogDesignStyles />
        <main className="xaaj-blog-article-shell">
          <div className="xaaj-blog-article">
            <span className="xaaj-blog-category">Blog</span>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>Story not found.</h1>
            <p style={{ color: '#77736b', marginTop: 14 }}>This story may have been unpublished or the link may be incorrect.</p>
            <Button to="/blog">Back to blog</Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const contentParts = String(post.content || '').split(/\n{2,}/).map(part => part.trim()).filter(Boolean)

  return (
    <>
      <Header />
      <BlogDesignStyles />

      <main className="xaaj-blog-article-shell">
        <article className="xaaj-blog-article">
          <div className="xaaj-blog-breadcrumbs">
            <Link to="/">Home</Link><span>/</span><Link to="/blog">Blog</Link><span>/</span><span>{post.title}</span>
          </div>

          <header className="xaaj-blog-article-header xaaj-blog-fade">
            <span className="xaaj-blog-category">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="xaaj-blog-article-meta">
              <span>By {post.author}</span><span>•</span><span>{formatBlogDate(post.publishDate)}</span>
            </div>
          </header>

          {post.coverImage && (
            <div className="xaaj-blog-article-cover xaaj-blog-fade xaaj-blog-fade-delay">
              <img src={post.coverImage} alt={post.title} />
            </div>
          )}

          <div className="xaaj-blog-article-body">
            {post.excerpt && <p className="xaaj-blog-article-excerpt">{post.excerpt}</p>}
            <div className="xaaj-blog-article-content">
              {contentParts.map((paragraph, index) => (
                <div key={index}>
                  {paragraph.split('\n').map((line, lineIndex) => {
                    const trimmed = line.trim()
                    if (!trimmed) return null
                    if (/^#{1,3}\s/.test(trimmed)) {
                      return <h2 key={lineIndex}>{trimmed.replace(/^#{1,3}\s/, '')}</h2>
                    }
                    return <p key={lineIndex}>{trimmed}</p>
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="xaaj-blog-article-back">
            <Link to="/blog"><ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to all stories</Link>
          </div>
        </article>
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
  // PAYMENT METHOD
  // ==========================================================
  // razorpay = Online Payment
  // cod = Cash on Delivery
  // ==========================================================

  const [paymentMethod, setPaymentMethod] = useState('razorpay')

  // ==========================================================
  // MY ORDERS STATE
  // ==========================================================

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [cancellingOrderId, setCancellingOrderId] = useState('')

  // ==========================================================
  // CANCEL ORDER
  // ==========================================================

  const handleCancelOrder = async order => {
    const orderId = order?._id || order?.id

    if (!orderId) return

    if (order.status !== 'pending') {
      window.alert(
        'This order can no longer be cancelled online.\n\nPlease contact Customer Care at customercare@xaaj.in or +91 9899446117.'
      )
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${String(orderId).slice(-8).toUpperCase()}?`
    )

    if (!confirmed) return

    try {
      setCancellingOrderId(orderId)
      setOrdersError('')

      const result = await apiRequest(`/orders/${orderId}/cancel`, {
        method: 'PATCH'
      })

      const updatedOrder = result?.data || result?.order

      setOrders(currentOrders =>
        currentOrders.map(item =>
          String(item._id || item.id) === String(orderId)
            ? updatedOrder || { ...item, status: 'cancelled' }
            : item
        )
      )

      window.alert('Order cancelled successfully.')
    } catch (error) {
      console.error('Order cancellation error:', error)

      window.alert(
        error?.message ||
        'Unable to cancel this order. Please contact Customer Care at customercare@xaaj.in or +91 9899446117.'
      )
    } finally {
      setCancellingOrderId('')
    }
  }

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

    // --------------------------------------------------------
    // Login required
    // --------------------------------------------------------

    if (!user) {
      navigate('/account')
      return
    }

    // --------------------------------------------------------
    // Cart validation
    // --------------------------------------------------------

    if (!cart.length) {
      setPaymentError('Your cart is empty.')
      return
    }

    // --------------------------------------------------------
    // Checkout validation
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Phone validation
    // --------------------------------------------------------

    if (
      checkoutPhone
        .replace(/\D/g, '')
        .length !== 10
    ) {
      setPaymentError(
        'Please enter a valid 10-digit phone number.'
      )
      return
    }

    // --------------------------------------------------------
    // PIN validation
    // --------------------------------------------------------

    if (!/^\d{6}$/.test(checkoutPin.trim())) {
      setPaymentError(
        'Please enter a valid 6-digit PIN code.'
      )
      return
    }

    try {
      setPaymentLoading(true)

      // ======================================================
      // COMMON ORDER DATA
      // ======================================================

      const orderData = {
        items: cart.map(item => ({
          product: item.id,
          quantity: item.qty || 1
        })),

        paymentMethod,

        shippingAddress: {
          name: checkoutName.trim(),
          email: checkoutEmail.trim().toLowerCase(),
          phone: checkoutPhone.trim(),
          address: checkoutAddress.trim(),
          city: checkoutCity.trim(),
          state: checkoutState.trim(),
          pin: checkoutPin.trim()
        }
      }

      // ======================================================
      // CASH ON DELIVERY
      // ======================================================

      if (paymentMethod === 'cod') {
        const orderResult = await apiRequest(
          '/orders',
          {
            method: 'POST',
            body: JSON.stringify(orderData)
          }
        )

        if (!orderResult?.success) {
          throw new Error(
            orderResult?.message ||
            'Unable to place COD order.'
          )
        }

        // Save latest order for confirmation page.
        window.sessionStorage.setItem(
          'xaaj-payment-success',
          'true'
        )

        window.sessionStorage.setItem(
          'xaaj-last-order',
          JSON.stringify(orderResult.data)
        )

        navigate('/order-confirmation')
        return
      }

      // ======================================================
      // ONLINE PAYMENT - RAZORPAY
      // ======================================================

      await loadRazorpay()

      const orderResult = await apiRequest(
        '/payment/create-order',
        {
          method: 'POST',
          body: JSON.stringify({
            ...orderData,
            paymentMethod: 'razorpay'
          })
        }
      )

      const razorpayOrder = orderResult?.data

      if (
        !razorpayOrder?.id ||
        !razorpayOrder?.keyId
      ) {
        throw new Error(
          orderResult?.message ||
          'Unable to create Razorpay order.'
        )
      }

      // ======================================================
      // RAZORPAY OPTIONS
      // ======================================================

      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'XAAJ',
        description: 'XAAJ Store Order',
        order_id: razorpayOrder.id,

        prefill: {
          name: checkoutName.trim(),
          email: checkoutEmail.trim().toLowerCase(),
          contact: checkoutPhone.trim()
        },

        notes: {
          address: checkoutAddress.trim(),
          city: checkoutCity.trim(),
          state: checkoutState.trim(),
          pin: checkoutPin.trim()
        },

        theme: {
          color: '#2b2a27'
        },

        // ====================================================
        // PAYMENT SUCCESS
        // ====================================================

        handler: async response => {
          try {
            const verifyResult = await apiRequest(
              '/payment/verify',
              {
                method: 'POST',
                body: JSON.stringify(response)
              }
            )

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

        // ====================================================
        // RAZORPAY MODAL CLOSED
        // ====================================================

        modal: {
          ondismiss: () => {
            setPaymentLoading(false)
          }
        }
      }

      // ======================================================
      // OPEN RAZORPAY
      // ======================================================

      const razorpay = new window.Razorpay(options)

      // ======================================================
      // PAYMENT FAILED
      // ======================================================

      razorpay.on(
        'payment.failed',
        response => {
          console.error(
            'Razorpay payment failed:',
            response?.error
          )

          setPaymentError(
            response?.error?.description ||
            'Payment failed. Please try again.'
          )

          setPaymentLoading(false)
        }
      )

      razorpay.open()
    } catch (paymentErr) {
      console.error(
        'Checkout error:',
        paymentErr
      )

      setPaymentError(
        paymentErr?.message ||
        'Unable to process your order. Please try again.'
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
        // Replace /account in browser history so
        // Back does not return to the customer account page.
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
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
  // BLOG
  // ==========================================================

  if (path === '/blog') {
    return <BlogPage />
  }

  if (path.startsWith('/blog/')) {
    const blogSlug = decodeURIComponent(
      path.slice('/blog/'.length)
    )

    return <BlogArticle slug={blogSlug} />
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
  // ABOUT US — PREMIUM EDITORIAL DESIGN
  // ==========================================================

  if (path === '/about') {
    return (
      <>
        <Header />

        <style>{`
          .xaaj-about-page {
            background: #f7f4ee;
            color: #292825;
          }

          .xaaj-about-hero {
            position: relative;
            min-height: 680px;
            display: grid;
            align-items: end;
            overflow: hidden;
            background: #292825;
          }

          .xaaj-about-hero-image {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: .76;
            transform: scale(1.02);
          }

          .xaaj-about-hero-overlay {
            position: absolute;
            inset: 0;
            background:
              linear-gradient(180deg, rgba(20,19,17,.12) 0%, rgba(20,19,17,.2) 35%, rgba(20,19,17,.82) 100%);
          }

          .xaaj-about-hero-content {
            position: relative;
            z-index: 1;
            width: min(1180px, calc(100% - 40px));
            margin: 0 auto;
            padding: 90px 0 82px;
            color: #fff;
          }

          .xaaj-about-kicker {
            display: inline-block;
            margin-bottom: 22px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .28em;
            text-transform: uppercase;
            color: #f1c2b4;
          }

          .xaaj-about-hero h1 {
            max-width: 850px;
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(58px, 8vw, 108px);
            font-weight: 400;
            line-height: .94;
            letter-spacing: -.045em;
          }

          .xaaj-about-hero p {
            max-width: 620px;
            margin: 30px 0 0;
            font-size: 18px;
            line-height: 1.75;
            color: rgba(255,255,255,.82);
          }

          .xaaj-about-intro {
            width: min(1180px, calc(100% - 40px));
            margin: 0 auto;
            padding: 100px 0;
            display: grid;
            grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr);
            gap: 90px;
            align-items: start;
          }

          .xaaj-about-label {
            display: block;
            margin-bottom: 18px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .24em;
            text-transform: uppercase;
            color: #b54d36;
          }

          .xaaj-about-intro h2,
          .xaaj-about-story h2 {
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(38px, 5vw, 66px);
            font-weight: 400;
            line-height: 1.04;
            letter-spacing: -.035em;
          }

          .xaaj-about-intro-copy p {
            margin: 28px 0 0;
            max-width: 650px;
            font-size: 18px;
            line-height: 1.85;
            color: #69645d;
          }

          .xaaj-about-aside {
            padding-top: 12px;
          }

          .xaaj-about-aside-item {
            padding: 24px 0;
            border-top: 1px solid rgba(41,40,37,.14);
          }

          .xaaj-about-aside-item:last-child {
            border-bottom: 1px solid rgba(41,40,37,.14);
          }

          .xaaj-about-aside-item strong {
            display: block;
            margin-bottom: 7px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 23px;
            font-weight: 400;
          }

          .xaaj-about-aside-item span {
            font-size: 13px;
            line-height: 1.6;
            color: #777169;
          }

          .xaaj-about-story {
            width: min(1180px, calc(100% - 40px));
            margin: 0 auto;
            padding: 0 0 110px;
            display: grid;
            grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
            gap: 80px;
            align-items: center;
          }

          .xaaj-about-story-image {
            width: 100%;
            aspect-ratio: 4 / 5;
            object-fit: cover;
            border-radius: 24px;
            display: block;
          }

          .xaaj-about-story-copy p {
            margin: 28px 0 0;
            font-size: 17px;
            line-height: 1.85;
            color: #69645d;
          }

          .xaaj-about-values {
            background: #292825;
            color: #fff;
            padding: 100px 0;
          }

          .xaaj-about-values-inner {
            width: min(1180px, calc(100% - 40px));
            margin: 0 auto;
          }

          .xaaj-about-values h2 {
            margin: 0;
            max-width: 700px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(42px, 5vw, 68px);
            font-weight: 400;
            line-height: 1;
            letter-spacing: -.035em;
          }

          .xaaj-about-value-grid {
            margin-top: 70px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0;
            border-top: 1px solid rgba(255,255,255,.16);
          }

          .xaaj-about-value {
            padding: 34px 34px 10px 0;
            border-right: 1px solid rgba(255,255,255,.16);
          }

          .xaaj-about-value:not(:first-child) {
            padding-left: 34px;
          }

          .xaaj-about-value:last-child {
            border-right: 0;
          }

          .xaaj-about-value-number {
            display: block;
            margin-bottom: 45px;
            font-size: 11px;
            letter-spacing: .2em;
            color: #d58b76;
          }

          .xaaj-about-value h3 {
            margin: 0 0 12px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 27px;
            font-weight: 400;
          }

          .xaaj-about-value p {
            margin: 0;
            font-size: 14px;
            line-height: 1.75;
            color: rgba(255,255,255,.62);
          }

          .xaaj-about-contact {
            width: min(1180px, calc(100% - 40px));
            margin: 0 auto;
            padding: 110px 0 120px;
            text-align: center;
          }

          .xaaj-about-contact h2 {
            margin: 0 auto;
            max-width: 800px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(45px, 6vw, 78px);
            font-weight: 400;
            line-height: .98;
            letter-spacing: -.04em;
          }

          .xaaj-about-contact p {
            max-width: 560px;
            margin: 24px auto 0;
            color: #777169;
            line-height: 1.8;
          }

          .xaaj-about-contact-links {
            margin-top: 34px;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
          }

          .xaaj-about-contact-links a {
            display: inline-flex;
            align-items: center;
            min-height: 46px;
            padding: 0 20px;
            border: 1px solid rgba(41,40,37,.18);
            border-radius: 999px;
            color: #292825;
            text-decoration: none;
            transition: .25s ease;
          }

          .xaaj-about-contact-links a:hover {
            background: #292825;
            color: #fff;
            border-color: #292825;
            transform: translateY(-2px);
          }

          @media (max-width: 800px) {
            .xaaj-about-hero {
              min-height: 600px;
            }

            .xaaj-about-hero-content {
              width: min(100% - 30px, 1180px);
              padding-bottom: 58px;
            }

            .xaaj-about-intro,
            .xaaj-about-story {
              width: min(100% - 30px, 1180px);
              grid-template-columns: 1fr;
              gap: 48px;
              padding-top: 70px;
              padding-bottom: 75px;
            }

            .xaaj-about-value-grid {
              grid-template-columns: 1fr;
            }

            .xaaj-about-value,
            .xaaj-about-value:not(:first-child) {
              padding: 28px 0;
              border-right: 0;
              border-bottom: 1px solid rgba(255,255,255,.16);
            }

            .xaaj-about-value:last-child {
              border-bottom: 0;
            }
          }
        `}</style>

        <main className="xaaj-about-page">
          <section className="xaaj-about-hero">
            <img
              className="xaaj-about-hero-image"
              src={tableImage}
              alt="XAAJ handcrafted tableware arranged for a shared table"
            />
            <div className="xaaj-about-hero-overlay" />

            <div className="xaaj-about-hero-content">
              <span className="xaaj-about-kicker">About XAAJ</span>
              <h1>Objects made to become part of your life.</h1>
              <p>
                Thoughtful tableware, shaped by Indian craftsmanship and
                designed for the everyday rituals that make a house feel like home.
              </p>
            </div>
          </section>

          <section className="xaaj-about-intro">
            <div className="xaaj-about-intro-copy">
              <span className="xaaj-about-label">Our philosophy</span>
              <h2>Beautiful is better when it is meant to be used.</h2>
              <p>
                XAAJ began with a simple belief: the things we reach for every
                day deserve the same care as the things we keep for special moments.
                We create pieces that feel considered without feeling precious.
              </p>
            </div>

            <div className="xaaj-about-aside">
              <div className="xaaj-about-aside-item">
                <strong>Made in India</strong>
                <span>Working with makers and materials rooted in local craft.</span>
              </div>
              <div className="xaaj-about-aside-item">
                <strong>Small-batch thinking</strong>
                <span>Collections designed with intention, not endless excess.</span>
              </div>
              <div className="xaaj-about-aside-item">
                <strong>Everyday objects</strong>
                <span>Pieces created to be used, washed, shared and loved.</span>
              </div>
            </div>
          </section>

          <section className="xaaj-about-story">
            <img
              className="xaaj-about-story-image"
              src={tableImage}
              alt="Warm XAAJ table setting with handcrafted tableware"
            />

            <div className="xaaj-about-story-copy">
              <span className="xaaj-about-label">The XAAJ way</span>
              <h2>For morning tea, long lunches and everything in between.</h2>
              <p>
                We work with makers across India to create objects that hold
                space for your rituals — morning tea, long lunches and the last
                glass of wine. Each collection is designed to bring warmth,
                texture and a quiet sense of occasion to the everyday table.
              </p>
              <p>
                Natural variation is part of the character. Small differences in
                colour, texture and form are reminders that these pieces are made
                by people, not machines alone.
              </p>
            </div>
          </section>

          <section className="xaaj-about-values">
            <div className="xaaj-about-values-inner">
              <span className="xaaj-about-kicker">What we believe</span>
              <h2>Less noise. More meaning. Better things.</h2>

              <div className="xaaj-about-value-grid">
                <div className="xaaj-about-value">
                  <span className="xaaj-about-value-number">01</span>
                  <h3>Craft over clutter</h3>
                  <p>We favour thoughtful pieces that earn their place at your table.</p>
                </div>
                <div className="xaaj-about-value">
                  <span className="xaaj-about-value-number">02</span>
                  <h3>Beauty with purpose</h3>
                  <p>Form follows the way a piece feels in your hands and lives in your home.</p>
                </div>
                <div className="xaaj-about-value">
                  <span className="xaaj-about-value-number">03</span>
                  <h3>Made to keep</h3>
                  <p>Our aim is simple: objects you reach for often and keep for years.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="xaaj-about-contact">
            <span className="xaaj-about-label">Come say hello</span>
            <h2>Have a question? We are here.</h2>
            <p>
              For orders, products or anything else, reach out to the XAAJ team.
              We would love to hear from you.
            </p>
            <div className="xaaj-about-contact-links">
              <a href="mailto:customercare@xaaj.in">customercare@xaaj.in</a>
              <a href="tel:+919899446117">+91 9899446117</a>
              <Link to="/contact">Contact us <ArrowRight size={14} style={{ marginLeft: 7 }} /></Link>
            </div>
          </section>
        </main>

        <Newsletter />
        <Footer />
      </>
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

          {/* ==========================================================
              PAYMENT METHOD
          ========================================================== */}

          <div className="checkout-payment-method">

            <h3>
              Payment Method
            </h3>

            {/* Online Payment */}
            <label
              className={`payment-option ${
                paymentMethod === 'razorpay'
                  ? 'selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={
                  paymentMethod === 'razorpay'
                }
                onChange={() =>
                  setPaymentMethod('razorpay')
                }
              />

              <span>
                <strong>
                  Online Payment
                </strong>

                <small>
                  Pay securely using Razorpay
                </small>
              </span>
            </label>

            {/* Cash on Delivery */}
            <label
              className={`payment-option ${
                paymentMethod === 'cod'
                  ? 'selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={
                  paymentMethod === 'cod'
                }
                onChange={() =>
                  setPaymentMethod('cod')
                }
              />

              <span>
                <strong>
                  Cash on Delivery
                </strong>

                <small>
                  Pay when your order is delivered
                </small>
              </span>
            </label>

          </div>

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
              ? paymentMethod === 'cod'
                ? 'Placing Order...'
                : 'Opening Razorpay...'
              : paymentMethod === 'cod'
                ? 'Place Order - COD'
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

    // ----------------------------------------------------------
    // ADMIN GUARD
    // ----------------------------------------------------------
    // Admin accounts must never see the customer account page
    // or its My Orders section.
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />
    }

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

          <style>{`
            .xaaj-account-actions {
              display: flex;
              align-items: center;
              gap: 12px;
              flex-wrap: wrap;
              margin-top: 24px;
            }

            .xaaj-account-action {
              min-height: 46px;
              padding: 0 19px !important;
              border-radius: 999px !important;
              border: 1px solid rgba(41,40,37,.14) !important;
              box-shadow: 0 6px 18px rgba(41,40,37,.06);
              transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
            }

            .xaaj-account-action:hover {
              transform: translateY(-1px);
              box-shadow: 0 10px 24px rgba(41,40,37,.10);
            }

            .xaaj-account-action-light {
              background: #fff !important;
            }

            .xaaj-account-action-danger {
              color: #b42318 !important;
              border-color: rgba(180,35,24,.20) !important;
              background: #fff !important;
            }

            .xaaj-account-action-danger:hover {
              color: #fff !important;
              background: #b42318 !important;
              border-color: #b42318 !important;
            }

            .xaaj-orders-heading {
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              gap: 20px;
              flex-wrap: wrap;
            }

            .xaaj-orders-heading h2 { margin-bottom: 0; }

            .xaaj-orders-count {
              display: inline-flex;
              align-items: center;
              min-height: 30px;
              padding: 0 11px;
              border-radius: 999px;
              background: rgba(41,40,37,.055);
              border: 1px solid rgba(41,40,37,.08);
              font-size: 11px;
              font-weight: 700;
              letter-spacing: .06em;
              text-transform: uppercase;
            }

            @media (max-width: 640px) {
              .xaaj-account-actions {
                display: grid;
                grid-template-columns: 1fr;
              }

              .xaaj-account-action {
                width: 100%;
                justify-content: center;
              }
            }
          `}</style>

          <div className="xaaj-account-actions">
            <Button to="/checkout" className="xaaj-account-action">
              Continue to checkout
            </Button>

            <button
              type="button"
              className="button button-light xaaj-account-action xaaj-account-action-light"
              onClick={() => {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: 'smooth'
                })
              }}
            >
              My Orders
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              className="button button-light xaaj-account-action xaaj-account-action-danger"
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

            <div className="xaaj-orders-heading">
              <h2 style={{ marginTop: '8px' }}>
                My Orders
              </h2>
              <span className="xaaj-orders-count">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

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
                <>
                  <style>{`
                    .xaaj-account-actions {
                      display: flex;
                      align-items: center;
                      gap: 12px;
                      flex-wrap: wrap;
                      margin-top: 24px;
                    }

                    .xaaj-account-action {
                      min-height: 46px;
                      padding: 0 19px;
                      border-radius: 999px !important;
                      border: 1px solid rgba(41,40,37,.14);
                      box-shadow: 0 6px 18px rgba(41,40,37,.06);
                      transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
                    }

                    .xaaj-account-action:hover {
                      transform: translateY(-1px);
                      box-shadow: 0 10px 24px rgba(41,40,37,.10);
                    }

                    .xaaj-account-action-light {
                      background: #fff;
                    }

                    .xaaj-account-action-danger {
                      color: #b42318;
                      border-color: rgba(180,35,24,.20);
                      background: #fff;
                    }

                    .xaaj-account-action-danger:hover {
                      color: #fff;
                      background: #b42318;
                      border-color: #b42318;
                    }

                    .xaaj-orders-heading {
                      display: flex;
                      align-items: flex-end;
                      justify-content: space-between;
                      gap: 20px;
                      flex-wrap: wrap;
                    }

                    .xaaj-orders-heading h2 {
                      margin-bottom: 0;
                    }

                    .xaaj-orders-count {
                      display: inline-flex;
                      align-items: center;
                      min-height: 30px;
                      padding: 0 11px;
                      border-radius: 999px;
                      background: rgba(41,40,37,.055);
                      border: 1px solid rgba(41,40,37,.08);
                      font-size: 11px;
                      font-weight: 700;
                      letter-spacing: .06em;
                      text-transform: uppercase;
                    }

                    .xaaj-orders-grid {
                      display: grid;
                      grid-template-columns: 1fr;
                      gap: 20px;
                      margin-top: 22px;
                    }

                    .xaaj-order-card {
                      position: relative;
                      overflow: hidden;
                      padding: 24px;
                      border: 1px solid rgba(41,40,37,.10);
                      border-radius: 20px;
                      background: linear-gradient(145deg, #ffffff 0%, #faf9f6 100%);
                      box-shadow: 0 12px 35px rgba(41,40,37,.07);
                      transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
                    }

                    .xaaj-order-card:hover {
                      transform: translateY(-2px);
                      border-color: rgba(41,40,37,.16);
                      box-shadow: 0 18px 45px rgba(41,40,37,.10);
                    }

                    .xaaj-order-card::before {
                      content: '';
                      position: absolute;
                      inset: 0 0 auto 0;
                      height: 3px;
                      background: currentColor;
                      opacity: .12;
                    }

                    .xaaj-order-top {
                      display: flex;
                      align-items: flex-start;
                      justify-content: space-between;
                      gap: 18px;
                      padding-bottom: 18px;
                      border-bottom: 1px solid rgba(0,0,0,.07);
                    }

                    .xaaj-order-number {
                      margin: 0;
                      font-size: 14px;
                      letter-spacing: .07em;
                      text-transform: uppercase;
                    }

                    .xaaj-order-total {
                      margin: 0;
                      font-size: 19px;
                      letter-spacing: -.02em;
                      white-space: nowrap;
                    }

                    .xaaj-order-meta {
                      display: grid;
                      grid-template-columns: repeat(3, minmax(0, 1fr));
                      gap: 10px;
                      margin-top: 18px;
                    }

                    .xaaj-order-meta-item {
                      min-width: 0;
                      padding: 13px 14px;
                      border: 1px solid rgba(0,0,0,.065);
                      border-radius: 14px;
                      background: rgba(255,255,255,.68);
                    }

                    .xaaj-order-meta-label {
                      display: block;
                      margin-bottom: 5px;
                      font-size: 10px;
                      letter-spacing: .10em;
                      text-transform: uppercase;
                      opacity: .55;
                    }

                    .xaaj-order-meta-value {
                      font-size: 13px;
                      font-weight: 600;
                      text-transform: capitalize;
                    }

                    .xaaj-order-summary {
                      margin-top: 18px;
                      padding: 16px 17px;
                      border-radius: 15px;
                      background: rgba(41,40,37,.035);
                    }

                    .xaaj-order-summary-row {
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      gap: 15px;
                      padding: 6px 0;
                      font-size: 13px;
                    }

                    .xaaj-order-summary-row.total {
                      margin-top: 7px;
                      padding-top: 12px;
                      border-top: 1px solid rgba(0,0,0,.09);
                      font-size: 15px;
                    }

                    .xaaj-free-shipping {
                      font-weight: 700;
                    }

                    .xaaj-order-tracking {
                      display: flex;
                      align-items: center;
                      gap: 10px;
                      margin-top: 16px;
                      padding: 12px 14px;
                      border: 1px solid rgba(0,0,0,.07);
                      border-radius: 14px;
                      font-size: 12px;
                    }

                    .xaaj-order-actions {
                      display: flex;
                      align-items: center;
                      gap: 10px;
                      flex-wrap: wrap;
                      margin-top: 18px;
                    }

                    .xaaj-cancel-button {
                      min-height: 44px;
                      padding: 0 18px;
                      border: 1px solid rgba(180,35,24,.28);
                      border-radius: 999px;
                      background: #fff;
                      color: #b42318;
                      font: inherit;
                      font-size: 12px;
                      font-weight: 700;
                      letter-spacing: .02em;
                      cursor: pointer;
                      transition: all .2s ease;
                    }

                    .xaaj-cancel-button:hover:not(:disabled) {
                      background: #b42318;
                      color: #fff;
                      border-color: #b42318;
                      transform: translateY(-1px);
                    }

                    .xaaj-cancel-button:disabled {
                      cursor: wait;
                      opacity: .55;
                    }

                    .xaaj-cancel-help {
                      margin: 0;
                      padding: 13px 15px;
                      border: 1px solid rgba(0,0,0,.07);
                      border-radius: 14px;
                      background: rgba(0,0,0,.025);
                      font-size: 12px;
                      line-height: 1.55;
                    }

                    .xaaj-cancel-help strong {
                      display: block;
                      margin-bottom: 3px;
                      font-size: 12px;
                    }

                    .xaaj-cancel-help a {
                      color: inherit;
                      font-weight: 600;
                    }

                    @media (max-width: 640px) {
                      .xaaj-order-card {
                        padding: 18px;
                        border-radius: 17px;
                      }

                      .xaaj-order-top {
                        gap: 10px;
                      }

                      .xaaj-order-total {
                        font-size: 17px;
                      }

                      .xaaj-order-meta {
                        grid-template-columns: 1fr 1fr;
                      }

                      .xaaj-order-meta-item:last-child {
                        grid-column: 1 / -1;
                      }
                    }
                  `}</style>

                  <div className="xaaj-orders-grid">
                    {orders.map(order => {
                      const orderId = order._id || order.id
                      const subtotal = Number(order.subtotal || 0)
                      const shippingFee =
                        order.shippingFee !== undefined &&
                        order.shippingFee !== null
                          ? Number(order.shippingFee)
                          : subtotal >= 1000
                            ? 0
                            : 99
                      const total = Number(
                        order.total ?? subtotal + shippingFee - Number(order.discount || 0)
                      )
                      const status = String(order.status || 'pending')
                      const statusLabel = status.replaceAll('_', ' ')
                      const paymentLabel = String(
                        order.paymentStatus || 'pending'
                      ).replaceAll('_', ' ')

                      return (
                        <article
                          key={orderId}
                          className="xaaj-order-card"
                        >
                          <div className="xaaj-order-top">
                            <div>
                              <p className="xaaj-order-number">
                                Order #{String(orderId || '').slice(-8).toUpperCase()}
                              </p>
                              <small style={{ opacity: .58 }}>
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : ''}
                              </small>
                            </div>

                            <strong className="xaaj-order-total">
                              {money(total)}
                            </strong>
                          </div>

                          <div className="xaaj-order-meta">
                            <div className="xaaj-order-meta-item">
                              <span className="xaaj-order-meta-label">Status</span>
                              <span className="xaaj-order-meta-value">
                                {statusLabel}
                              </span>
                            </div>

                            <div className="xaaj-order-meta-item">
                              <span className="xaaj-order-meta-label">Payment</span>
                              <span className="xaaj-order-meta-value">
                                {paymentLabel}
                              </span>
                            </div>

                            <div className="xaaj-order-meta-item">
                              <span className="xaaj-order-meta-label">Items</span>
                              <span className="xaaj-order-meta-value">
                                {order.items?.length || 0} item(s)
                              </span>
                            </div>
                          </div>

                          <div className="xaaj-order-summary">
                            <div className="xaaj-order-summary-row">
                              <span>Subtotal</span>
                              <strong>{money(subtotal)}</strong>
                            </div>

                            <div className="xaaj-order-summary-row">
                              <span>Shipping</span>
                              <strong className={shippingFee === 0 ? 'xaaj-free-shipping' : ''}>
                                {shippingFee === 0 ? 'FREE' : money(shippingFee)}
                              </strong>
                            </div>

                            {Number(order.discount || 0) > 0 && (
                              <div className="xaaj-order-summary-row">
                                <span>Discount</span>
                                <strong>-{money(order.discount)}</strong>
                              </div>
                            )}

                            <div className="xaaj-order-summary-row total">
                              <strong>Total paid / payable</strong>
                              <strong>{money(total)}</strong>
                            </div>
                          </div>

                          {order.trackingNumber && (
                            <div className="xaaj-order-tracking">
                              <Package size={16} strokeWidth={1.5} />
                              <span>
                                Tracking: <strong>{order.trackingNumber}</strong>
                                {order.courierName ? ` · ${order.courierName}` : ''}
                              </span>
                            </div>
                          )}

                          <div className="xaaj-order-actions">
                            {status === 'pending' && (
                              <button
                                type="button"
                                className="xaaj-cancel-button"
                                onClick={() => handleCancelOrder(order)}
                                disabled={cancellingOrderId === orderId}
                              >
                                {cancellingOrderId === orderId
                                  ? 'Cancelling...'
                                  : 'Cancel Order'}
                              </button>
                            )}

                            {status !== 'pending' && status !== 'cancelled' && (
                              <p className="xaaj-cancel-help">
                                <strong>Cancellation unavailable online</strong>
                                This order has moved beyond the pending stage. Please contact Customer Care for assistance.<br />
                                <a href="mailto:customercare@xaaj.in">customercare@xaaj.in</a>
                                {' · '}
                                <a href="tel:+919899446117">+91 9899446117</a>
                              </p>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </>
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
  // SHIPPING POLICY — PREMIUM ACCORDION
  // ==========================================================

  if (path === '/shipping') {
    const sections = [
      {
        title: 'How long does delivery take?',
        content: (
          <>
            <p>Because every XAAJ piece is handmade, hand-glazed and individually quality-checked, please allow a short window to prepare your order with care before it ships.</p>
            <ul>
              <li><strong>In-stock items:</strong> Dispatched within 2–4 business days of order confirmation and payment realisation.</li>
              <li><strong>Made-to-order / pre-order collections:</strong> Dispatch timelines are specified on the product page, typically 2–4 weeks.</li>
              <li><strong>Custom or personalised orders:</strong> Timelines are confirmed separately in writing and are non-cancellable once production has commenced.</li>
              <li>Orders are not processed, packed or dispatched on Sundays and gazetted national holidays.</li>
            </ul>
            <p>You will receive an order confirmation email/SMS immediately, and a dispatch confirmation with tracking details once your order leaves our facility.</p>
            <p><strong>Estimated delivery after dispatch:</strong> Metro cities 3–5 business days; Rest of India 5–8 business days; Remote / hilly / North-East regions 7–12 business days.</p>
          </>
        )
      },
      {
        title: 'What is the shipping charge?',
        content: (
          <>
            <p>All shipping charges, if any, are displayed transparently at checkout before payment and included in the total payable amount shown before order confirmation.</p>
            <ul>
              <li><strong>Above ₹1000:</strong> Free shipping.</li>
              <li><strong>Below ₹999.99:</strong> Shipping charge calculated at checkout.</li>
              <li><strong>Express / Priority:</strong> Available at checkout for eligible pin codes and products; charges are dynamically calculated.</li>
            </ul>
            <p>Express or priority delivery may not be available for fragile, oversized or heavy items. Express timelines are estimates and can be affected by courier delays, weather, regional restrictions, strikes and other events beyond XAAJ's reasonable control.</p>
          </>
        )
      },
      {
        title: 'Where do you deliver?',
        content: (
          <>
            <p>We currently ship to all serviceable pin codes across India through our logistics partners.</p>
            <p>International shipping is currently unavailable.</p>
          </>
        )
      },
      {
        title: 'How are fragile ceramics packed?',
        content: (
          <>
            <p>Every order is packed using multi-layer protective wrapping, corner reinforcement and cushioning material designed for breakage-resistant transit.</p>
            <ul>
              <li>Inspect the outer packaging at delivery and note visible damage to the delivery executive where possible.</li>
              <li>Record an unboxing video without pause/edit from the moment the sealed package is opened. This is strongly recommended for any damage-related claim.</li>
              <li>Retain the original packaging until you have inspected all items.</li>
            </ul>
          </>
        )
      },
      {
        title: 'How do I track my order?',
        content: (
          <p>Once dispatched, a tracking link will be shared via email/SMS/WhatsApp. You may also track your order by logging into your XAAJ account or by contacting us with your order number.</p>
        )
      },
      {
        title: 'What if delivery fails or is delayed?',
        content: (
          <>
            <ul>
              <li>If delivery fails due to an incorrect/incomplete address or recipient unavailability, the courier partner will typically make up to 2–3 re-attempts before returning the shipment.</li>
              <li>Shipments returned as undeliverable through no fault of XAAJ may be re-shipped at an additional delivery charge, or refunded after deducting original outbound and return shipping costs, at XAAJ's discretion.</li>
              <li>Please ensure your shipping address, pin code and phone number are accurate at checkout.</li>
            </ul>
          </>
        )
      },
      {
        title: 'What if my order arrives damaged, broken or incomplete?',
        content: (
          <p>Please report transit damage, breakage or missing items within <strong>48 hours of delivery</strong> by writing to <strong>customercare@xaaj.in</strong> with your order number and photographs/video of the damaged item and outer packaging. Full resolution details are set out in our Return & Refund Policy.</p>
        )
      },
      {
        title: 'When does risk in the product pass to me?',
        content: (
          <p>Title and risk in the goods, including risk of loss or damage, passes to the customer only upon delivery to the address provided at checkout, except where damage is reported and substantiated in accordance with the damaged-item process.</p>
        )
      },
      {
        title: 'How do I contact the Grievance Officer?',
        content: (
          <p><strong>Mr Ashish Chaudhary</strong><br />Email: grievance@xaaj.in<br />Phone: 989946117, Mon–Sat, 10:00 AM – 6:00 PM IST</p>
        )
      }
    ]

    return (
      <SimplePage
        policy
        eyebrow="Shipping Policy"
        title="Shipping made simple."
        intro="We carefully pack every XAAJ order and deliver across India."
        effectiveDate="12/09/2026"
      >
        <PolicyAccordion sections={sections} />
      </SimplePage>
    )
  }

  // ==========================================================
  // RETURN & REFUND POLICY — PREMIUM ACCORDION
  // ==========================================================

  if (path === '/returns') {
    const sections = [
      {
        title: 'When is my order eligible for a return or replacement?',
        content: (
          <>
            <p>You may request a return, replacement or refund when:</p>
            <ul>
              <li>The product arrives broken, cracked or chipped due to shipping/handling.</li>
              <li>The wrong item is delivered, including wrong design, size, quantity or colour.</li>
              <li>Part of a set, such as a dinner set, is missing from the package.</li>
            </ul>
          </>
        )
      },
      {
        title: 'How quickly do I need to report a problem?',
        content: (
          <>
            <p>Damage, wrong-item and missing-item claims must be reported <strong>within 48 hours of delivery</strong>.</p>
            <p>Email <strong>customercare@xaaj.in</strong> or WhatsApp <strong>+91-9899446117</strong> with your order number.</p>
            <p>Please provide clear photos of the damaged/defective item, shipping label and outer packaging. An unboxing video is preferred. Resolution is communicated within 5–7 business days of receiving complete evidence.</p>
            <p>Claims after 48 hours, or without adequate photographic/video evidence, may not be eligible except where the issue is a latent manufacturing defect covered by the policy.</p>
          </>
        )
      },
      {
        title: 'Which items are not eligible for return?',
        content: (
          <ul>
            <li>Products that have been used, washed, or show signs of handling beyond inspection.</li>
            <li>Clearance/final-sale products marked "non-returnable" on the product page.</li>
            <li>Customised, personalised or made-to-order pieces.</li>
            <li>Minor glaze, texture, hand-painted pattern or size variations inherent to handmade ceramics.</li>
            <li>Products without original packaging, tags or accompanying documentation, where applicable.</li>
            <li>Change-of-mind returns on made-to-order or bespoke items once production has commenced.</li>
          </ul>
        )
      },
      {
        title: 'Do you offer change-of-mind returns?',
        content: (
          <p>For ready-to-ship, unused products in original condition and packaging, XAAJ <strong>[offers / does not offer]</strong> change-of-mind returns within <strong>[7]</strong> days of delivery. Where offered, return shipping costs are borne by the customer, and the item will be inspected before a refund or store credit is issued. Qualifying items should be stated clearly on the product page.</p>
        )
      },
      {
        title: 'Are handmade variations considered defects?',
        content: (
          <p>XAAJ products are handmade using traditional techniques. Minor irregularities in shape, glaze pooling, colour depth, surface texture or size are intentional characteristics of handcrafted ceramics and are not treated as manufacturing defects.</p>
        )
      },
      {
        title: 'How and when will I receive my refund?',
        content: (
          <>
            <ul>
              <li>Refunds are processed to the original payment method used at checkout, or as store credit where opted by the customer.</li>
              <li>Once a return is approved and, where applicable, the item is received and inspected, refunds are initiated within 7 business days.</li>
              <li>After initiation, funds typically reflect in 10–15 business days depending on the bank or card issuer.</li>
              <li>COD orders are refunded via bank transfer/UPI to an account provided by the customer, or as store credit.</li>
            </ul>
          </>
        )
      },
      {
        title: 'Can I get a replacement instead of a refund?',
        content: (
          <p>For damaged, defective or wrongly delivered items, XAAJ may, at the customer's choice and subject to stock availability, offer a free replacement instead of a refund. If the item is out of stock, a full refund or store credit valid for 12 months will be offered.</p>
        )
      },
      {
        title: 'Who pays for return shipping?',
        content: (
          <ul>
            <li>For approved damage/defect/wrong-item claims, XAAJ will arrange a free reverse pickup where serviceable.</li>
            <li>Where reverse pickup is unavailable in your pin code, XAAJ will reimburse reasonable actual courier charges for self-shipping.</li>
            <li>For permitted change-of-mind returns, return shipping is borne by the customer unless stated otherwise.</li>
          </ul>
        )
      },
      {
        title: 'How do I request a return?',
        content: (
          <>
            <p>Email <strong>customercare@xaaj.in</strong> or use the 'Returns' section of your account with your order number, reason for return and supporting photos/video.</p>
            <p>Our team will review and respond with a resolution or request for further information within 2 business days. Once approved, we will share pickup/drop-off instructions.</p>
          </>
        )
      },
      {
        title: 'How do I contact the Grievance Officer?',
        content: (
          <p><strong>Ashish Chaudhary</strong><br />Email: grievance@xaaj.in<br />Phone: +91-9899446117, Mon–Fri, 10:00 AM – 5:00 PM IST</p>
        )
      }
    ]

    return (
      <SimplePage
        policy
        eyebrow="Return & Refund Policy"
        title="Returns made simple."
        intro="If something isn't right with your XAAJ order, here's exactly what to do."
        effectiveDate="12/09/2026"
      >
        <PolicyAccordion sections={sections} />
      </SimplePage>
    )
  }

  // ==========================================================
  // CANCELLATION POLICY — PREMIUM ACCORDION
  // ==========================================================

  if (path === '/cancellation') {
    const sections = [
      {
        title: 'Can I cancel my order before dispatch?',
        content: (
          <>
            <p>Ready-to-ship items may be cancelled free of charge any time before the order status changes to <strong>"Dispatched"</strong>.</p>
            <p>Write to <strong>customercare@xaaj.in</strong> or use the "Cancel Order" option in your account where available.</p>
            <p>100% of the amount paid, including shipping charges if any, will be refunded to the original payment method within 10–15 business days.</p>
          </>
        )
      },
      {
        title: 'Can I cancel after my order has been dispatched?',
        content: (
          <p>Once an order has been dispatched, it cannot be cancelled. You may refuse delivery or initiate a return after delivery in accordance with the Return & Refund Policy, where eligible. For prepaid orders refused after dispatch, the refund will be processed after deducting actual outbound and return shipping costs.</p>
        )
      },
      {
        title: 'When can XAAJ cancel an order?',
        content: (
          <>
            <p>XAAJ may cancel an order, in whole or in part, with a full refund of the amount paid for the cancelled portion when:</p>
            <ul>
              <li>The product is out of stock or discontinued after order placement.</li>
              <li>There are pricing or product-information inaccuracies due to technical or human error.</li>
              <li>A fraudulent transaction is suspected, or payment/delivery details cannot be verified.</li>
              <li>The delivery address falls outside the current serviceable area.</li>
              <li>Force majeure events prevent fulfilment.</li>
            </ul>
            <p>XAAJ will notify you by email/SMS promptly and any amount paid will be refunded within 7 business days.</p>
          </>
        )
      },
      {
        title: 'What happens with repeated COD cancellations?',
        content: (
          <p>Repeated non-acceptance or cancellation of COD orders may result in COD being disabled for your account, at XAAJ's discretion, to prevent misuse.</p>
        )
      },
      {
        title: 'Can I modify my order before dispatch?',
        content: (
          <p>Requests to modify an order, including address, item or quantity, can only be accommodated before dispatch, subject to feasibility. Contact <strong>customercare@xaaj.in</strong> with your order number as soon as possible.</p>
        )
      },
      {
        title: 'How do I request a cancellation?',
        content: (
          <ul>
            <li><strong>Email:</strong> customercare@xaaj.in with subject line "Cancel Order – [Order Number]".</li>
            <li><strong>Phone/WhatsApp:</strong> 9899446117, Mon–Fri, 10:00 AM – 5:00 PM IST.</li>
            <li><strong>My Orders:</strong> Use your XAAJ account where the self-service option is available.</li>
          </ul>
        )
      },
      {
        title: 'How do I contact the Grievance Officer?',
        content: (
          <p><strong>Mr Ashish Chuadhary</strong><br />Email: grievance@xaaj.in<br />Complaints regarding cancellations are acknowledged within 48 hours and resolved within one month, in accordance with the Consumer Protection (E-Commerce) Rules, 2020.</p>
        )
      }
    ]

    return (
      <SimplePage
        policy
        eyebrow="Cancellation Policy"
        title="Cancellation made simple."
        intro="Need to cancel an order? Here's when and how you can do it."
        effectiveDate="12/09/2026"
      >
        <PolicyAccordion sections={sections} />
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
          For privacy questions, contact us at customercare@xaaj.in.
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
        eyebrow="Legal"
        title="Terms & conditions."
      >
        <p className="lead">
          Please read carefully before using xaaj.in.
        </p>

        <p>
          <strong>Effective date:</strong> 12/09/2026
        </p>

        <p>
          These Terms and Conditions ("Terms") govern your access to and use
          of www.xaaj.in and any related mobile application (together, the
          "Platform"), owned and operated by APNP Ventures Pvt Ltd, having its
          registered office at G6/4C DLF GARDEN CITY SECTOR 92 GURGAON 122505
          Haryana and GSTIN 06ABGCA0842A1ZC ("XAAJ", "we", "us", "our").
        </p>

        <p>
          By accessing or using the Platform, placing an order, or creating an
          account, you agree to be bound by these Terms, our Privacy Policy,
          Shipping Policy, Return &amp; Refund Policy and Cancellation Policy.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 18 years of age and competent to contract under
          the Indian Contract Act, 1872 to use the Platform and place orders.
          If you are using the Platform on behalf of an entity, you represent
          that you have authority to bind that entity.
        </p>

        <h2>2. Account Registration</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
          <li>You agree to provide accurate, current and complete information at registration and checkout, and to update it as necessary.</li>
          <li>XAAJ reserves the right to suspend or terminate accounts found to be fraudulent, abusive, or in breach of these Terms.</li>
        </ul>

        <h2>3. Products and Product Descriptions</h2>
        <ul>
          <li>XAAJ sells handcrafted ceramic tableware and home products. As each piece is handmade, minor variation in colour, glaze, texture, weight and dimensions between the product image and the item received is normal and not a defect.</li>
          <li>We make reasonable efforts to display product colours, dimensions and details accurately; however, actual colours may vary slightly due to screen/display settings and the handcrafted, hand-glazed nature of the products.</li>
          <li>Country of origin, materials used and care instructions are provided on individual product pages, in accordance with applicable Legal Metrology and consumer protection requirements.</li>
          <li>Products are microwave/dishwasher safe only where expressly stated on the product page; please follow the specific care instructions provided with your order.</li>
        </ul>

        <h2>4. Pricing and Payment</h2>
        <ul>
          <li>All prices are listed in Indian Rupees (₹) and are inclusive of applicable Goods and Services Tax (GST) unless stated otherwise. The total price payable, including all applicable charges, is displayed at checkout before you confirm payment.</li>
          <li>We accept payment via credit/debit cards, UPI, net banking, wallets and Cash on Delivery (where available), processed through third-party payment gateways. XAAJ does not store your full card details.</li>
          <li>In the event of a pricing or product-information error due to technical glitch or human error, XAAJ reserves the right to cancel the affected order and issue a full refund, even after order confirmation.</li>
          <li>XAAJ reserves the right to modify prices at any time; changes will not affect orders already confirmed.</li>
        </ul>

        <h2>5. Order Acceptance</h2>
        <p>
          Your order constitutes an offer to purchase. A contract of sale is
          formed only when XAAJ sends a dispatch confirmation for the relevant
          item(s); an order confirmation email/SMS is an acknowledgment of
          receipt of your order, not acceptance. XAAJ reserves the right to
          refuse or cancel any order for reasons including product
          unavailability, pricing errors, suspected fraud, or delivery-area
          restrictions, as detailed in our Cancellation Policy.
        </p>

        <h2>6. Shipping, Cancellation, Return &amp; Refunds</h2>
        <p>
          Shipping timelines, cancellation windows and return/refund
          eligibility are governed by our Shipping Policy, Cancellation Policy
          and Return &amp; Refund Policy, which form an integral part of these
          Terms.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          All content on the Platform — including the XAAJ name, logo, product
          designs, photography, graphics, text and layout — is the exclusive
          property of XAAJ or its licensors and is protected under applicable
          intellectual property laws. You may not reproduce, distribute,
          modify, or create derivative works from any Platform content without
          our prior written consent.
        </p>

        <h2>8. User Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Platform for any unlawful purpose or in violation of these Terms.</li>
          <li>Post or transmit any content that is defamatory, obscene, infringing, or otherwise objectionable.</li>
          <li>Attempt to gain unauthorised access to the Platform, other users' accounts, or our systems.</li>
          <li>Use any automated means (bots, scrapers) to access or extract data from the Platform without permission.</li>
          <li>Engage in fraudulent transactions, chargebacks without valid cause, or misuse of promotional offers.</li>
        </ul>

        <h2>9. Reviews and User-Generated Content</h2>
        <p>
          If you submit reviews, photos or other content, you grant XAAJ a
          non-exclusive, royalty-free, worldwide licence to use, reproduce and
          display such content for marketing and promotional purposes. XAAJ
          does not permit fake or incentivised reviews that misrepresent
          genuine user experience.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, XAAJ's aggregate liability
          arising from your use of the Platform or purchase of products shall
          not exceed the amount paid by you for the specific order giving rise
          to the claim. XAAJ shall not be liable for any indirect, incidental
          or consequential damages. Nothing in these Terms limits any liability
          that cannot be excluded under the Consumer Protection Act, 2019, or
          excludes your statutory rights as a consumer.
        </p>

        <h2>11. Indemnity</h2>
        <p>
          You agree to indemnify and hold XAAJ, its directors, employees and
          affiliates harmless from any claims, losses or damages arising from
          your breach of these Terms or misuse of the Platform.
        </p>

        <h2>12. Force Majeure</h2>
        <p>
          XAAJ shall not be liable for any delay or failure to perform
          resulting from causes beyond its reasonable control, including
          natural disasters, strikes, pandemics, government action, or
          logistics/network disruptions.
        </p>

        <h2>13. Grievance Redressal Mechanism</h2>
        <p>
          In accordance with applicable law, the name and contact details of
          our Grievance Officer are:
        </p>
        <ul>
          <li><strong>Name:</strong> Ashish Chaudhary</li>
          <li><strong>Designation:</strong> Director</li>
          <li><strong>Email:</strong> grievance@xaaj.in</li>
          <li><strong>Address:</strong> G6/4C DLF GARDEN CITY SECTOR 92 GURGAON 122505 HARYANA</li>
          <li><strong>Working hours:</strong> Mon–Fri, 10:00 AM – 5:00 PM IST</li>
        </ul>
        <p>
          The Grievance Officer will acknowledge complaints within 48 hours
          and resolve them within one month of receipt.
        </p>

        <h2>14. Governing Law and Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of India. Subject to the
          dispute-resolution mechanisms available under the Consumer
          Protection Act, 2019, the courts at Gurugram, Haryana shall have
          exclusive jurisdiction over disputes not resolved through such
          consumer fora.
        </p>

        <h2>15. Amendments</h2>
        <p>
          XAAJ may revise these Terms from time to time. Continued use of the
          Platform after changes are posted constitutes acceptance of the
          revised Terms. Material changes will be highlighted via the Platform
          or email where feasible.
        </p>

        <h2>16. Contact Us</h2>
        <ul>
          <li><strong>Email:</strong> customercare@xaaj.in</li>
          <li><strong>Phone:</strong> 9899446117</li>
          <li><strong>Registered Address:</strong> G6/4C DLF GARDEN CITY SECTOR 92 GURGAON 122505 HARYANA</li>
        </ul>
      </SimplePage>
    )
  }

  // ==========================================================
  // CONTACT
  // ==========================================================

  if (path === '/contact') {
    return (
      <SimplePage
        eyebrow="Contact XAAJ"
        title="We'd love to hear from you."
      >
        <p className="lead">
          For questions about an order, our products or anything else,
          reach out to the XAAJ team using the details below.
        </p>

        <div
          style={{
            display: 'grid',
            gap: '18px',
            marginTop: '32px'
          }}
        >
          <div>
            <span className="eyebrow">Phone / WhatsApp</span>
            <p>
              <a href="tel:+919899446117">+91-9899446117</a>
            </p>
          </div>

          <div>
            <span className="eyebrow">Email</span>
            <p>
              <a href="mailto:customercare@xaaj.in">
                customercare@xaaj.in
              </a>
            </p>
          </div>

          <div>
            <span className="eyebrow">Business address</span>
            <p>
              G6/4C DLF Garden City, Sector 92, Gurugram 122505
            </p>
          </div>
        </div>
      </SimplePage>
    )
  }

  // FAQ content is kept unchanged until the client supplies final copy.
  if (path === '/faq') {
    return (
      <SimplePage
        eyebrow="We are here"
        title="How can we help?"
      >
        <p className="lead">
          Questions about an order, a piece
          or the making process? Write to
          customercare@xaaj.in and we’ll get back
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