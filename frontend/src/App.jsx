// ============================================================
// IMPORTS
// ============================================================

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

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
import './xaaj-fonts.css'

// API
import { apiRequest, productService, orderService, reviewService, cmsService, newsletterService, contactService } from './services/api'

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


gsap.registerPlugin(ScrollTrigger, ScrollSmoother)


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

  // Mobile menu + premium mega-menu state
  const [open, setOpen] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState(null)

  // Search bar state
  const [search, setSearch] = useState(false)

  // Authentication
  const { user } = useAuth()

  // Cart item count + premium cart micro-interaction
  const {
    count,
    newArrivals
  } = useStore()

  // Live blog content for the Blog mega menu.
  // useBlogPosts() is declared later in this file and is safe to call here.
  const {
    posts: blogPosts
  } = useBlogPosts()

  const [cartBump, setCartBump] = useState(false)

  // GSAP refs for mega-menu entrance animations.
  const megaMenuRefs = useRef({})
  const megaCloseTimer = useRef(null)

  useEffect(() => {
    const handleCartAdded = () => {
      setCartBump(true)

      window.setTimeout(() => {
        setCartBump(false)
      }, 520)
    }

    window.addEventListener('xaaj:cart-added', handleCartAdded)

    return () => {
      window.removeEventListener('xaaj:cart-added', handleCartAdded)
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
      }
    }

    loadAnnouncement()

    return () => {
      cancelled = true
    }
  }, [])

  // Navigation
  const navigate = useNavigate()
  const location = useLocation()

  // Fixed on every page except Collections.
  // Portal to body so ScrollSmoother cannot transform the fixed header.
  const isCollectionsPage = location.pathname === '/collections'
  const shouldFixHeader = !isCollectionsPage
  const headerShellRef = useRef(null)
  const [headerShellHeight, setHeaderShellHeight] = useState(0)

  useLayoutEffect(() => {
    if (!shouldFixHeader) {
      setHeaderShellHeight(0)
      return undefined
    }

    const element = headerShellRef.current
    if (!element) return undefined

    const updateHeight = () => {
      setHeaderShellHeight(Math.ceil(element.getBoundingClientRect().height))
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    window.addEventListener('resize', updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [shouldFixHeader, announcementEnabled, announcementText, open, activeMegaMenu, search])

  const clearMegaCloseTimer = () => {
    if (megaCloseTimer.current) {
      window.clearTimeout(megaCloseTimer.current)
      megaCloseTimer.current = null
    }
  }

  const openMegaMenu = menu => {
    clearMegaCloseTimer()
    setActiveMegaMenu(menu)
  }

  const scheduleMegaMenuClose = () => {
    clearMegaCloseTimer()

    megaCloseTimer.current = window.setTimeout(() => {
      setActiveMegaMenu(null)
      megaCloseTimer.current = null
    }, 150)
  }

  const closeMenus = () => {
    clearMegaCloseTimer()
    setOpen(false)
    setActiveMegaMenu(null)
  }

  const goToShop = (target = '/shop') => {
    closeMenus()
    navigate(target)
  }

  useEffect(() => {
    return () => clearMegaCloseTimer()
  }, [])

  // GSAP-powered mega-menu entrance. The menu itself remains in React state;
  // GSAP only animates it, so it cannot interfere with the site's content reveal.
  useLayoutEffect(() => {
    if (!activeMegaMenu) return undefined

    const menu = megaMenuRefs.current[activeMegaMenu]

    if (!menu) return undefined

    const items = menu.querySelectorAll('[data-xaaj-mega-item]')

    const ctx = gsap.context(() => {
      gsap.fromTo(
        menu,
        {
          autoAlpha: 0,
          y: -14,
          scaleY: 0.985,
          transformOrigin: 'top center'
        },
        {
          autoAlpha: 1,
          y: 0,
          scaleY: 1,
          duration: 0.42,
          ease: 'power3.out',
          overwrite: true
        }
      )

      if (items.length) {
        gsap.fromTo(
          items,
          {
            autoAlpha: 0,
            y: 10
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.34,
            delay: 0.07,
            stagger: 0.035,
            ease: 'power2.out',
            overwrite: true
          }
        )
      }
    }, menu)

    return () => ctx.revert()
  }, [activeMegaMenu])

  // Keep XAAJ's own categories/content inside the mega menu.
  const shopCategories = Array.isArray(categories)
    ? categories.filter(Boolean)
    : []

  const featuredCategories = shopCategories.slice(0, 2)

  const categoryLink = category =>
    `/shop?category=${encodeURIComponent(category)}`

  const headerContent = (
    <div
      ref={headerShellRef}
      className={`xaaj-header-shell ${shouldFixHeader ? 'is-fixed' : 'is-flow'}`}
    >
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
          onClick={() => {
            setOpen(current => !current)
            setActiveMegaMenu(null)
          }}
          aria-label="Open menu"
          aria-expanded={open}
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
          onClick={closeMenus}
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
            onClick={() => {
              closeMenus()
              navigate(user?.role === 'admin' ? '/admin' : '/account')
            }}
          >
            <UserRound />
          </button>

          {/* Wishlist */}
          <button
            className="icon"
            aria-label="Wishlist"
            onClick={() => {
              closeMenus()
              navigate('/wishlist')
            }}
          >
            <Heart />
          </button>

          {/* Cart */}
          <button
            className={`bag ${cartBump ? 'cart-bump' : ''}`}
            data-xaaj-cart-target="true"
            aria-label="Cart"
            onClick={() => {
              closeMenus()
              navigate('/cart')
            }}
          >
            <ShoppingBag />

            {count > 0 && <b>{count}</b>}
          </button>

        </div>

      </header>

      {/* Search Bar */}
      {search && (
        <form
          className="searchbar"
          onSubmit={e => {
            e.preventDefault()
            navigate(`/shop?search=${e.target.q.value}`)
            closeMenus()
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

      {/* ==========================================================
          NAVIGATION + XAAJ SHOP MEGA MENU
          ========================================================== */}
      <div className="xaaj-navigation-wrap">
        <nav
          className={`nav ${open ? 'nav-open' : ''}`}
          aria-label="Primary navigation"
        >

          {/* SHOP */}
          <div
            className={`xaaj-nav-mega-item ${
              activeMegaMenu === 'shop' ? 'is-open' : ''
            }`}
            onMouseEnter={() => openMegaMenu('shop')}
            onMouseLeave={scheduleMegaMenuClose}
          >
            <button
              type="button"
              className="nav-shop-trigger"
              aria-expanded={activeMegaMenu === 'shop'}
              aria-controls="xaaj-shop-mega-menu"
              onClick={() =>
                setActiveMegaMenu(current =>
                  current === 'shop' ? null : 'shop'
                )
              }
            >
              <span>Shop</span>
              <ChevronDown
                size={13}
                strokeWidth={1.5}
                className="nav-shop-chevron"
              />
            </button>

            {activeMegaMenu === 'shop' && (
              <div
                id="xaaj-shop-mega-menu"
                ref={element => {
                  megaMenuRefs.current.shop = element
                }}
                className="xaaj-shop-mega-menu"
                onMouseEnter={clearMegaCloseTimer}
                onMouseLeave={scheduleMegaMenuClose}
              >
                <div className="xaaj-shop-mega-inner">

                  <div className="xaaj-mega-column xaaj-mega-categories">
                    <span className="xaaj-mega-label">SHOP BY FORM</span>

                    <button
                      type="button"
                      className="xaaj-mega-main-link"
                      data-xaaj-mega-item
                      onClick={() => goToShop('/shop')}
                    >
                      Shop all
                      <ArrowRight size={14} />
                    </button>

                    {shopCategories.map(category => (
                      <Link
                        key={category.name}
                        to={categoryLink(category.name)}
                        data-xaaj-mega-item
                        onClick={closeMenus}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>

                  <div className="xaaj-mega-column xaaj-mega-featured">
                    <span className="xaaj-mega-label">FEATURED</span>

                    <div className="xaaj-mega-feature-grid">
                      {featuredCategories.map(category => (
                        <Link
                          key={`featured-${category.name}`}
                          to={categoryLink(category.name)}
                          className="xaaj-mega-feature-card"
                          data-xaaj-mega-item
                          onClick={closeMenus}
                        >
                          <div className="xaaj-mega-feature-image">
                            <img
                              src={category.image}
                              alt={category.name}
                              loading="lazy"
                            />
                          </div>
                          <span>{category.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="xaaj-mega-column">
                    <span className="xaaj-mega-label">DINING</span>

                    {['Dinner Sets', 'Plates', 'Bowls'].map(name => (
                      <Link
                        key={name}
                        to={categoryLink(name)}
                        data-xaaj-mega-item
                        onClick={closeMenus}
                      >
                        {name}
                      </Link>
                    ))}

                    <span className="xaaj-mega-label xaaj-mega-label-spaced">
                      SERVEWARE
                    </span>

                    {['Serveware', 'Glassware'].map(name => (
                      <Link
                        key={name}
                        to={categoryLink(name)}
                        data-xaaj-mega-item
                        onClick={closeMenus}
                      >
                        {name}
                      </Link>
                    ))}
                  </div>

                  <div className="xaaj-mega-column">
                    <span className="xaaj-mega-label">DRINKWARE</span>

                    <Link
                      to={categoryLink('Cups & Mugs')}
                      data-xaaj-mega-item
                      onClick={closeMenus}
                    >
                      Cups &amp; Mugs
                    </Link>

                    <Link
                      to={categoryLink('Glassware')}
                      data-xaaj-mega-item
                      onClick={closeMenus}
                    >
                      Glassware
                    </Link>

                    <span className="xaaj-mega-label xaaj-mega-label-spaced">
                      XAAJ COLLECTIONS
                    </span>

                    <Link
                      to="/shop?filter=new"
                      data-xaaj-mega-item
                      onClick={closeMenus}
                    >
                      New Arrivals
                    </Link>
                    <Link
                      to="/shop?filter=best-selling"
                      data-xaaj-mega-item
                      onClick={closeMenus}
                    >
                      Best Sellers
                    </Link>
                    <Link
                      to="/shop"
                      data-xaaj-mega-item
                      onClick={closeMenus}
                    >
                      Everyday Collection
                    </Link>
                  </div>

                  <div className="xaaj-mega-footer" data-xaaj-mega-item>
                    <span>
                      Thoughtful tableware, shaped slowly in India.
                    </span>
                    <button
                      type="button"
                      onClick={() => goToShop('/shop')}
                    >
                      Explore the collection
                      <ArrowRight size={14} />
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Collections */}
          <Link
            to="/collections"
            onClick={closeMenus}
          >
            Collections
          </Link>

          {/* NEW ARRIVALS + HOVER MENU */}
          <div
            className={`xaaj-nav-mega-item ${
              activeMegaMenu === 'new-arrivals' ? 'is-open' : ''
            }`}
            onMouseEnter={() => openMegaMenu('new-arrivals')}
            onMouseLeave={scheduleMegaMenuClose}
          >
            <Link
              to="/shop?filter=new"
              className="xaaj-nav-mega-trigger"
              onClick={closeMenus}
            >
              <span>New Arrivals</span>
              <ChevronDown
                size={13}
                strokeWidth={1.5}
                className="nav-shop-chevron"
              />
            </Link>

            {activeMegaMenu === 'new-arrivals' && (
              <div
                ref={element => {
                  megaMenuRefs.current['new-arrivals'] = element
                }}
                className="xaaj-content-mega-menu xaaj-new-arrivals-menu"
                onMouseEnter={clearMegaCloseTimer}
                onMouseLeave={scheduleMegaMenuClose}
              >
                <div className="xaaj-content-mega-inner">

                  <div
                    className="xaaj-content-mega-intro"
                    data-xaaj-mega-item
                  >
                    <span className="xaaj-mega-label">
                      JUST IN
                    </span>
                    <h3>
                      New pieces for
                      <br />
                      everyday rituals.
                    </h3>
                    <Link
                      to="/shop?filter=new"
                      onClick={closeMenus}
                    >
                      View all new arrivals
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="xaaj-content-mega-products">
                    {(Array.isArray(newArrivals)
                      ? newArrivals.slice(0, 3)
                      : []
                    ).map((product, index) => (
                      <Link
                        key={product.id || product._id || index}
                        to={`/product/${product.slug}`}
                        className="xaaj-mini-product"
                        data-xaaj-mega-item
                        onClick={closeMenus}
                      >
                        <div className="xaaj-mini-product-image">
                          <img
                            src={
                              product.image ||
                              product.images?.[0] ||
                              ''
                            }
                            alt={product.name}
                            loading="lazy"
                          />
                        </div>
                        <span className="xaaj-mini-product-category">
                          {product.category}
                        </span>
                        <strong>{product.name}</strong>
                      </Link>
                    ))}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* ABOUT */}
          <Link to="/about" onClick={closeMenus}>
            About Us
          </Link>

          {/* BLOG + HOVER MENU */}
          <div
            className={`xaaj-nav-mega-item ${
              activeMegaMenu === 'blog' ? 'is-open' : ''
            }`}
            onMouseEnter={() => openMegaMenu('blog')}
            onMouseLeave={scheduleMegaMenuClose}
          >
            <Link
              to="/blog"
              className="xaaj-nav-mega-trigger"
              onClick={closeMenus}
            >
              <span>Blog</span>
              <ChevronDown
                size={13}
                strokeWidth={1.5}
                className="nav-shop-chevron"
              />
            </Link>

            {activeMegaMenu === 'blog' && (
              <div
                ref={element => {
                  megaMenuRefs.current.blog = element
                }}
                className="xaaj-content-mega-menu xaaj-blog-mega-menu"
                onMouseEnter={clearMegaCloseTimer}
                onMouseLeave={scheduleMegaMenuClose}
              >
                <div className="xaaj-content-mega-inner">

                  <div
                    className="xaaj-content-mega-intro"
                    data-xaaj-mega-item
                  >
                    <span className="xaaj-mega-label">
                      FROM THE JOURNAL
                    </span>
                    <h3>
                      Stories for
                      <br />
                      beautiful living.
                    </h3>
                    <Link
                      to="/blog"
                      onClick={closeMenus}
                    >
                      Read all stories
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="xaaj-blog-mini-grid">
                    {(Array.isArray(blogPosts)
                      ? blogPosts.filter(post => post?.isPublished !== false).slice(0, 3)
                      : []
                    ).map((post, index) => (
                      <Link
                        key={post.id || post.slug || index}
                        to={`/blog/${post.slug}`}
                        className="xaaj-mini-blog"
                        data-xaaj-mega-item
                        onClick={closeMenus}
                      >
                        <div className="xaaj-mini-blog-image">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              loading="lazy"
                            />
                          ) : (
                            <div />
                          )}
                          <span>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <small>{post.category}</small>
                        <strong>{post.title}</strong>
                      </Link>
                    ))}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* CONTACT */}
          <Link to="/contact" onClick={closeMenus}>
            Contact
          </Link>

        </nav>
      </div>

      {/* Click outside the active mega menu to close it */}
      {activeMegaMenu && (
        <button
          type="button"
          className="xaaj-mega-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setActiveMegaMenu(null)}
        />
      )}

      {/* Self-contained premium mega-menu styling */}
      <style>{`
        /* Header fixed on every route except /collections. */
        .xaaj-header-shell.is-fixed {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 5000;
          background: #fffdf9;
          isolation: isolate;
        }

        .xaaj-header-shell.is-flow {
          position: relative;
          width: 100%;
          z-index: 5000;
        }

        .xaaj-fixed-header-spacer {
          width: 100%;
          pointer-events: none;
        }

        .xaaj-navigation-wrap {
          position: relative;
          z-index: 1000;
        }

        .xaaj-nav-mega-item {
          position: static;
          display: flex;
          align-items: center;
          height: 100%;
        }

        .nav-shop-trigger,
        .xaaj-nav-mega-trigger {
          appearance: none;
          border: 0;
          background: transparent;
          padding: 0;
          margin: 0;
          height: 100%;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: inherit;
          font: inherit;
          cursor: pointer;
          text-decoration: none;
          text-transform: inherit;
          letter-spacing: inherit;
        }

        .nav-shop-chevron {
          transition: transform .35s cubic-bezier(.22,1,.36,1);
        }

        .xaaj-nav-mega-item.is-open .nav-shop-chevron {
          transform: rotate(180deg);
        }

        .xaaj-shop-mega-menu,
        .xaaj-content-mega-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 1200;
          background: rgba(255, 253, 249, .985);
          border-top: 1px solid rgba(41, 40, 36, .09);
          border-bottom: 1px solid rgba(41, 40, 36, .10);
          box-shadow: 0 24px 55px rgba(41, 40, 36, .13);
          will-change: transform, opacity;
        }

        .xaaj-shop-mega-inner {
          width: min(1380px, calc(100% - 70px));
          margin: 0 auto;
          padding: 34px 0 25px;
          display: grid;
          grid-template-columns: 1.05fr 1.45fr 1fr 1fr;
          gap: 34px;
          position: relative;
        }

        .xaaj-mega-column {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-right: 24px;
          border-right: 1px solid rgba(41, 40, 36, .10);
        }

        .xaaj-mega-column:last-of-type {
          border-right: 0;
        }

        .xaaj-mega-label {
          display: block;
          margin-bottom: 14px;
          color: #292824;
          font-size: 10px;
          line-height: 1.2;
          letter-spacing: 1.8px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .xaaj-mega-column > a,
        .xaaj-mega-main-link {
          appearance: none;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          width: fit-content;
          margin: 0 0 10px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #514d47;
          font: inherit;
          font-size: 13px;
          line-height: 1.45;
          text-decoration: none;
          cursor: pointer;
          transition: color .22s ease, transform .22s ease;
        }

        .xaaj-mega-column > a:hover,
        .xaaj-mega-main-link:hover {
          color: #2f7048;
          transform: translateX(3px);
        }

        .xaaj-mega-main-link {
          color: #2f7048;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .xaaj-mega-label-spaced {
          margin-top: 22px;
        }

        .xaaj-mega-feature-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .xaaj-mega-feature-card {
          display: block !important;
          width: 100% !important;
          margin: 0 !important;
          color: #292824 !important;
          transform: none !important;
        }

        .xaaj-mega-feature-image {
          width: 100%;
          aspect-ratio: 1.18 / 1;
          overflow: hidden;
          margin-bottom: 9px;
          background: #eee9e1;
        }

        .xaaj-mega-feature-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform .65s cubic-bezier(.22,1,.36,1);
        }

        .xaaj-mega-feature-card:hover .xaaj-mega-feature-image img {
          transform: scale(1.045);
        }

        .xaaj-mega-feature-card > span {
          font-size: 12px;
          line-height: 1.4;
        }

        .xaaj-mega-footer {
          grid-column: 1 / -1;
          margin-top: 4px;
          padding-top: 19px;
          border-top: 1px solid rgba(41, 40, 36, .10);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .xaaj-mega-footer > span {
          color: #77716a;
          font-family: inherit;
          font-size: 13px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: .01em;
          line-height: 1.45;
        }

        .xaaj-mega-footer button,
        .xaaj-content-mega-intro a {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 0;
          background: transparent;
          color: #292824;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: color .2s ease, transform .2s ease;
        }

        .xaaj-mega-footer button:hover,
        .xaaj-content-mega-intro a:hover {
          color: #2f7048;
          transform: translateX(3px);
        }

        /* New Arrivals + Blog dropdown */
        .xaaj-content-mega-menu {
          background:
            linear-gradient(
              180deg,
              rgba(255,253,249,.99),
              rgba(250,247,241,.985)
            );
        }

        .xaaj-content-mega-inner {
          width: min(1240px, calc(100% - 70px));
          margin: 0 auto;
          padding: 30px 0 27px;
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 42px;
          align-items: stretch;
        }

        .xaaj-content-mega-intro {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 34px;
          border-right: 1px solid rgba(41,40,36,.10);
        }

        .xaaj-content-mega-intro .xaaj-mega-label {
          margin-bottom: 12px;
        }

        .xaaj-content-mega-intro h3 {
          margin: 0 0 20px;
          color: #292824;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(25px, 2.2vw, 34px);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -.025em;
        }

        .xaaj-content-mega-products,
        .xaaj-blog-mini-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .xaaj-mini-product,
        .xaaj-mini-blog {
          min-width: 0;
          color: #292824;
          text-decoration: none;
          display: block;
        }

        .xaaj-mini-product-image,
        .xaaj-mini-blog-image {
          position: relative;
          overflow: hidden;
          width: 100%;
          aspect-ratio: 1.25 / 1;
          margin-bottom: 10px;
          background: #eee9e1;
        }

        .xaaj-mini-product-image img,
        .xaaj-mini-blog-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform .7s cubic-bezier(.22,1,.36,1);
        }

        .xaaj-mini-product:hover .xaaj-mini-product-image img,
        .xaaj-mini-blog:hover .xaaj-mini-blog-image img {
          transform: scale(1.055);
        }

        .xaaj-mini-product-category,
        .xaaj-mini-blog small {
          display: block;
          margin-bottom: 5px;
          color: #77716a;
          font-size: 9px;
          line-height: 1.2;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .xaaj-mini-product strong,
        .xaaj-mini-blog strong {
          display: block;
          color: #292824;
          font-size: 13px;
          line-height: 1.35;
          font-weight: 500;
          transition: color .22s ease;
        }

        .xaaj-mini-product:hover strong,
        .xaaj-mini-blog:hover strong {
          color: #2f7048;
        }

        .xaaj-mini-blog-image span {
          position: absolute;
          left: 10px;
          bottom: 9px;
          color: #fff;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-shadow: 0 2px 10px rgba(0,0,0,.35);
        }

        .xaaj-mega-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999;
          border: 0;
          padding: 0;
          background: rgba(25, 27, 24, .055);
          cursor: default;
        }

        @media (max-width: 850px) {
          .xaaj-shop-mega-menu,
          .xaaj-content-mega-menu {
            position: relative;
            top: auto;
            left: auto;
            right: auto;
            width: 100%;
            box-shadow: none;
            border-top: 1px solid rgba(41, 40, 36, .08);
          }

          .xaaj-shop-mega-inner,
          .xaaj-content-mega-inner {
            width: 100%;
            padding: 22px 20px;
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .xaaj-mega-column {
            border-right: 0;
            border-bottom: 1px solid rgba(41, 40, 36, .09);
            padding: 0 0 20px;
          }

          .xaaj-content-mega-intro {
            border-right: 0;
            border-bottom: 1px solid rgba(41,40,36,.10);
            padding: 0 0 20px;
          }

          .xaaj-content-mega-products,
          .xaaj-blog-mini-grid {
            grid-template-columns: 1fr;
          }

          .xaaj-mini-product,
          .xaaj-mini-blog {
            display: grid;
            grid-template-columns: 92px 1fr;
            column-gap: 13px;
            align-items: center;
          }

          .xaaj-mini-product-image,
          .xaaj-mini-blog-image {
            grid-row: 1 / span 3;
            margin: 0;
            aspect-ratio: 1 / 1;
          }

          .xaaj-mini-product-category,
          .xaaj-mini-blog small {
            margin: 0 0 4px;
          }

          .xaaj-mega-backdrop {
            display: none;
          }

          .xaaj-nav-mega-item {
            height: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .xaaj-shop-mega-menu,
          .xaaj-content-mega-menu,
          .xaaj-mini-product-image img,
          .xaaj-mini-blog-image img {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )

  if (shouldFixHeader) {
    return (
      <>
        <div
          aria-hidden="true"
          className="xaaj-fixed-header-spacer"
          style={{ height: `${headerShellHeight}px` }}
        />
        {createPortal(headerContent, document.body)}
      </>
    )
  }

  return headerContent
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
  rating = 0,
  reviews = 0
}) {
  const numericRating = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  )

  const reviewCount = Number(reviews) || 0

  const fullStars = Math.floor(numericRating)

  const hasHalfStar =
    numericRating - fullStars >= 0.5

  const emptyStars =
    5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <span
      className="rating"
      aria-label={`${numericRating.toFixed(1)} out of 5 stars, ${reviewCount} reviews`}
    >
      <span className="rating-stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '★'}
        {'☆'.repeat(emptyStars)}
      </span>

      {reviewCount > 0 ? (
        <small>
          {numericRating.toFixed(1)} ({reviewCount})
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

let adminPreviewSessionActive = false

const isAdminPreviewMode = () => {
  try {
    return (
      new URLSearchParams(window.location.search).get('xaajPreview') === '1' ||
      adminPreviewSessionActive
    )
  } catch {
    return adminPreviewSessionActive
  }
}

const productCardCartStyles = `
  /* Reduced product-card corner radius */
  .product-card {
    border-radius: 8px !important;
  }

  .product-card .product-image,
  .product-card .product-image-link {
    border-radius: 8px !important;
  }

  .product-card .product-image img {
    border-radius: 8px !important;
  }

  .product-card .xaaj-cart-button {
    position: relative !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0 !important;
    width: 42px !important;
    min-width: 42px !important;
    height: 42px !important;
    padding: 0 !important;
    overflow: hidden !important;
    border: 1px solid rgba(47, 112, 72, .22) !important;
    border-radius: 999px !important;
    background: #f4f0e8 !important;
    color: #2f7048 !important;
    cursor: pointer !important;
    white-space: nowrap !important;
    transition:
      width .48s cubic-bezier(.22,1,.36,1),
      min-width .48s cubic-bezier(.22,1,.36,1),
      background-color .3s ease,
      color .3s ease,
      border-color .3s ease,
      box-shadow .4s ease,
      transform .35s cubic-bezier(.22,1,.36,1) !important;
  }

  .product-card .xaaj-cart-button:hover,
  .product-card .xaaj-cart-button:focus-visible {
    width: 142px !important;
    min-width: 142px !important;
    justify-content: flex-start !important;
    gap: 9px !important;
    padding: 0 16px !important;
    background: #2f7048 !important;
    color: #fff !important;
    border-color: #2f7048 !important;
    box-shadow: 0 12px 28px rgba(47, 112, 72, .20) !important;
    transform: translateY(-1px) !important;
    outline: none !important;
  }

  .product-card .xaaj-cart-button:active {
    transform: translateY(0) scale(.97) !important;
  }

  .product-card .xaaj-cart-button:disabled {
    width: 42px !important;
    min-width: 42px !important;
    opacity: .52 !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
  }

  .product-card .xaaj-cart-button-icon {
    width: 16px !important;
    min-width: 16px !important;
    height: 16px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    z-index: 2 !important;
    transition: transform .42s cubic-bezier(.22,1,.36,1) !important;
  }

  .product-card .xaaj-cart-button:hover .xaaj-cart-button-icon,
  .product-card .xaaj-cart-button:focus-visible .xaaj-cart-button-icon {
    transform: rotate(-7deg) scale(1.08) !important;
  }

  .product-card .xaaj-cart-button-label {
    display: block !important;
    max-width: 0 !important;
    overflow: hidden !important;
    opacity: 0 !important;
    transform: translateX(-8px) !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    letter-spacing: .04em !important;
    line-height: 1 !important;
    transition:
      max-width .42s cubic-bezier(.22,1,.36,1),
      opacity .28s ease .06s,
      transform .42s cubic-bezier(.22,1,.36,1) !important;
    position: relative !important;
    z-index: 2 !important;
  }

  .product-card .xaaj-cart-button:hover .xaaj-cart-button-label,
  .product-card .xaaj-cart-button:focus-visible .xaaj-cart-button-label {
    max-width: 100px !important;
    opacity: 1 !important;
    transform: translateX(0) !important;
  }

  .product-card .xaaj-cart-button-shine {
    position: absolute !important;
    top: -40% !important;
    left: -70% !important;
    width: 35% !important;
    height: 180% !important;
    pointer-events: none !important;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.38),
      transparent
    ) !important;
    transform: skewX(-18deg) !important;
    opacity: 0 !important;
  }

  .product-card .xaaj-cart-button:hover .xaaj-cart-button-shine,
  .product-card .xaaj-cart-button:focus-visible .xaaj-cart-button-shine {
    opacity: 1 !important;
    animation: xaajCartButtonShine .75s cubic-bezier(.22,1,.36,1) forwards !important;
  }

  .product-card .xaaj-cart-button.add-success {
    background: #2f7048 !important;
    color: #fff !important;
    border-color: #2f7048 !important;
  }

  @keyframes xaajCartButtonShine {
    from { left: -70%; }
    to { left: 135%; }
  }

  @media (max-width: 850px) {
    .product-card .xaaj-cart-button {
      width: 42px !important;
      min-width: 42px !important;
    }

    .product-card .xaaj-cart-button:hover,
    .product-card .xaaj-cart-button:focus-visible {
      width: 42px !important;
      min-width: 42px !important;
      padding: 0 !important;
      justify-content: center !important;
      gap: 0 !important;
    }

    .product-card .xaaj-cart-button-label {
      display: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .product-card .xaaj-cart-button,
    .product-card .xaaj-cart-button-icon,
    .product-card .xaaj-cart-button-label {
      transition: none !important;
    }

    .product-card .xaaj-cart-button:hover .xaaj-cart-button-shine,
    .product-card .xaaj-cart-button:focus-visible .xaaj-cart-button-shine {
      animation: none !important;
    }
  }
`

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

    if (isAdminPreviewMode()) {
      window.alert(
        'Admin Preview Mode: adding products to cart is disabled.'
      )
      return
    }

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
    <>
      <style>{productCardCartStyles}</style>

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
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="product-title-link"
        >
          <h3>{product.name}</h3>
        </Link>

        <p className="product-description">
          {product.description ||
            product.desc ||
            product.shortDescription ||
            'Beautifully crafted for everyday use.'}
        </p>

        <Rating
          rating={product.rating}
          reviews={
            product.reviewCount ??
            product.reviews ??
            0
          }
        />

        <div className="product-bottom-row">
          <div className="price">
            <strong>{money(product.price)}</strong>

            {Number(product.old || 0) > Number(product.price || 0) && (
              <del>{money(product.old)}</del>
            )}

            {Number(product.old || 0) > Number(product.price || 0) && (
              <span className="save-badge">
                {Math.round(
                  ((Number(product.old) - Number(product.price)) /
                    Number(product.old)) *
                    100
                )}% off
              </span>
            )}
          </div>

          <button
            type="button"
            className={`add xaaj-cart-button ${
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
            <span className="xaaj-cart-button-icon" aria-hidden="true">
              {Number(product.stock ?? 0) <= 0 ? (
                <ShoppingBag size={16} strokeWidth={1.7} />
              ) : cartPulse ? (
                <Check size={16} strokeWidth={2} />
              ) : (
                <ShoppingBag size={16} strokeWidth={1.7} />
              )}
            </span>

            <span className="xaaj-cart-button-label">
              {Number(product.stock ?? 0) <= 0
                ? 'Out of stock'
                : cartPulse
                  ? 'Added to cart'
                  : 'Add to Cart'}
            </span>

            <span className="xaaj-cart-button-shine" aria-hidden="true" />
          </button>
        </div>

        {/* Subtle stock cue */}
        {Number(product.stock ?? 0) > 0 &&
          Number(product.stock ?? 0) <= 5 && (
            <span className="low-stock">
              Only {product.stock} left
            </span>
          )}

      </div>

      </article>
    </>
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

        <h2
          style={{
            fontWeight: 500
          }}
        >
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
    products: liveProducts,
    bestSellingProducts,
    newArrivals
  } = useStore()

  // ==========================================================
  // HERO SLIDER
  // ==========================================================

  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)

  const heroTouchStart = useRef(null)
  const heroOverlapStageRef = useRef(null)

  // ==========================================================
  // CINEMATIC CATEGORY SCROLL
  // ==========================================================
  const categorySceneRef = useRef(null)
  useLayoutEffect(() => {
    const section = categorySceneRef.current
    if (!section || !Array.isArray(categories) || categories.length < 2) {
      return undefined
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const cards = Array.from(
      section.querySelectorAll('[data-xaaj-category-card]')
    )
    const progressItems = Array.from(
      section.querySelectorAll('[data-xaaj-category-progress]')
    )

    if (!cards.length) return undefined

    const ctx = gsap.context(() => {
      gsap.set(cards, {
        autoAlpha: 0,
        yPercent: 5,
        scale: 0.965
      })

      gsap.set(cards[0], {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1
      })

      gsap.set(progressItems, {
        scaleX: 0.22,
        transformOrigin: 'left center',
        opacity: 0.35
      })

      if (progressItems[0]) {
        gsap.set(progressItems[0], {
          scaleX: 1,
          opacity: 1
        })
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power2.inOut'
        },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * (categories.length - 1)}`,
          pin: true,
          scrub: 1.15,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      })

      for (let index = 1; index < cards.length; index += 1) {
        const previous = cards[index - 1]
        const current = cards[index]

        timeline
          .to(
            previous,
            {
              autoAlpha: 0,
              yPercent: -4,
              scale: 0.965,
              duration: 1
            },
            index - 1
          )
          .fromTo(
            current,
            {
              autoAlpha: 0,
              yPercent: 5,
              scale: 0.965
            },
            {
              autoAlpha: 1,
              yPercent: 0,
              scale: 1,
              duration: 1
            },
            index - 1
          )

        if (progressItems[index - 1]) {
          timeline.to(
            progressItems[index - 1],
            {
              scaleX: 0.22,
              opacity: 0.35,
              duration: 0.7
            },
            index - 1
          )
        }

        if (progressItems[index]) {
          timeline.to(
            progressItems[index],
            {
              scaleX: 1,
              opacity: 1,
              duration: 0.7
            },
            index - 1
          )
        }
      }

      ScrollTrigger.refresh()
    }, section)

    return () => ctx.revert()
  }, [])

  // ==========================================================
  // HERO -> NEXT SECTION OVERLAP SCROLL
  // The hero is pinned to the viewport while the next section
  // continues through normal document flow and slides over it.
  // This is driven only by scroll position — no autoplay motion.
  // ==========================================================

  useLayoutEffect(() => {
    const stage = heroOverlapStageRef.current
    if (!stage) return undefined

    const hero = stage.querySelector('.hero.hero-slider')
    const intro = stage.querySelector('.intro')

    if (!hero || !intro) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: () => `+=${hero.offsetHeight}`,
        pin: hero,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true
      })
    }, stage)

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [])

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
            mediaType:
              slide.mediaType === 'video'
                ? 'video'
                : 'image',
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

      {/* Hero sizing fix: the hero itself owns the full viewport height.
          The media is absolutely pinned to all four edges so no white strip
          can appear below the image/video. */}
      <style>{`
        .hero.hero-slider {
          position: relative !important;
          width: 100% !important;
          height: 100dvh !important;
          min-height: 100svh !important;
          max-height: none !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          aspect-ratio: auto !important;
        }

        .hero.hero-slider .hero-slides {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
          overflow: hidden !important;
        }

        .hero.hero-slider .hero-slide {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-width: 100% !important;
          min-height: 100% !important;
          max-width: none !important;
          max-height: none !important;
          display: block !important;
          object-fit: cover !important;
          object-position: center center !important;
          margin: 0 !important;
        }

        .hero.hero-slider .hero-slide img,
        .hero.hero-slider .hero-slide video {
          display: block !important;
        }

        /* =====================================================
           HERO -> NEXT SECTION SCROLL OVERLAP
           The hero stays behind. The next section remains in
           normal document flow and physically slides over it.
           No change is made to the hero media itself.
        ===================================================== */
        .xaaj-hero-overlap-stage {
          position: relative;
          overflow: visible !important;
          isolation: isolate;
        }

        .xaaj-hero-overlap-stage > .hero.hero-slider {
          position: relative !important;
          z-index: 1 !important;
        }

        .xaaj-hero-overlap-stage > .intro {
          position: relative !important;
          z-index: 2 !important;
          margin-top: 0 !important;
          background: var(--ivory) !important;
          opacity: 1 !important;
          transform: none !important;
          box-shadow: none;
        }

        .xaaj-hero-overlap-stage > .intro[data-xaaj-reveal] {
          opacity: 1 !important;
          transform: none !important;
        }
      `}</style>

      {/* Header */}
      <Header />


      <main>


        {/* ====================================================
            HERO SECTION
        ==================================================== */}

        <div ref={heroOverlapStageRef} className="xaaj-hero-overlap-stage">

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

            {heroSlides.map((slide, index) => {
              const isVideo = slide.mediaType === 'video'

              return isVideo ? (
                <video
                  key={`${slide.image}-${index}`}
                  className={`hero-slide ${
                    index === heroIndex
                      ? 'hero-slide-active'
                      : ''
                  }`}
                  src={slide.image}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload={index === 0 ? 'auto' : 'metadata'}
                  aria-label={slide.alt || 'XAAJ Crockery'}
                />
              ) : (
                <img
                  key={`${slide.image}-${index}`}
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
              )
            })}

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
            Stays in normal flow so scrolling naturally moves it
            upward over the sticky hero.
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


        </div>


        {/* ====================================================
            CATEGORIES SECTION
        ==================================================== */}

        <section
          ref={categorySceneRef}
          className="xaaj-category-cinematic"
          aria-label="Shop by form"
        >
          <div className="xaaj-category-cinematic-inner">

            <div className="xaaj-category-copy">
              <span className="eyebrow">Shop by form</span>

              <h2>
                Find your
                <br />
                <em>everyday.</em>
              </h2>

              <p>
                Thoughtfully shaped pieces for the rituals,
                gatherings and quiet moments around your table.
              </p>

              <div className="xaaj-category-progress" aria-hidden="true">
                {categories.map((category, index) => (
                  <span
                    key={`progress-${category.name}-${index}`}
                    data-xaaj-category-progress
                    title={category.name}
                  />
                ))}
              </div>

              <span className="xaaj-category-scroll-hint">
                Scroll to explore
                <ArrowRight size={14} />
              </span>
            </div>

            <div className="xaaj-category-stage">
              <div className="xaaj-category-stage-glow" aria-hidden="true" />

              {categories.map((category, index) => (
                <div
                  className="xaaj-category-card"
                  data-xaaj-category-card
                  key={category.name}
                >
                  <Link
                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                    className="xaaj-category-card-link"
                  >
                    <div className="xaaj-category-image-wrap">
                      <img
                        src={category.image}
                        alt={category.name}
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    </div>

                  </Link>
                </div>
              ))}

            </div>

          </div>

          <style>{`
            .xaaj-category-cinematic {
              position: relative;
              min-height: 100vh;
              height: 100vh;
              overflow: hidden;
              background:
                radial-gradient(circle at 74% 42%, rgba(255,255,255,.72), transparent 34%),
                linear-gradient(135deg, #f6f1e9 0%, #eee8dd 100%);
              color: #292824;
              isolation: isolate;
            }

            .xaaj-category-cinematic-inner {
              width: min(1480px, calc(100% - 96px));
              height: 100%;
              margin: 0 auto;
              display: grid;
              grid-template-columns: minmax(300px, .72fr) minmax(0, 1.6fr);
              gap: clamp(42px, 6vw, 96px);
              align-items: center;
              padding: 62px 0;
            }

            .xaaj-category-copy {
              position: relative;
              z-index: 3;
              max-width: 420px;
              padding-left: clamp(0px, 1.5vw, 22px);
            }


            .xaaj-category-copy h2 {
              margin: 12px 0 25px;
              font-family: Georgia, 'Times New Roman', serif;
              font-size: clamp(54px, 6.2vw, 94px);
              line-height: .91;
              letter-spacing: -.055em;
              font-weight: 400;
            }

            .xaaj-category-copy h2 em {
              color: #bd5137;
              font-style: italic;
              font-weight: 400;
            }

            .xaaj-category-copy p {
              max-width: 350px;
              margin: 0;
              color: #706b63;
              font-size: 14px;
              line-height: 1.8;
            }

            .xaaj-category-progress {
              display: flex;
              width: min(300px, 100%);
              gap: 7px;
              margin-top: 42px;
            }

            .xaaj-category-progress span {
              display: block;
              flex: 1;
              height: 2px;
              background: #2f7048;
              border-radius: 99px;
            }

            .xaaj-category-scroll-hint {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              margin-top: 22px;
              color: #8a837a;
              font-size: 10px;
              letter-spacing: 1.8px;
              text-transform: uppercase;
            }

            .xaaj-category-stage {
              position: relative;
              width: 100%;
              height: min(80vh, 760px);
              min-height: 540px;
              display: flex;
              align-items: center;
              justify-content: center;
              transform: translateX(clamp(0px, 1.5vw, 24px));
            }

            .xaaj-category-stage-glow {
              position: absolute;
              width: min(42vw, 600px);
              height: min(42vw, 600px);
              border-radius: 50%;
              background: rgba(255,255,255,.55);
              filter: blur(2px);
            }

            .xaaj-category-card {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              visibility: hidden;
              will-change: transform, opacity;
            }

            .xaaj-category-card-link {
              position: relative;
              display: block;
              width: min(680px, 88%);
              color: inherit;
              text-decoration: none;
              outline: none;
            }

            .xaaj-category-image-wrap {
              position: relative;
              width: min(570px, 100%);
              aspect-ratio: 1 / 1;
              margin: 0 auto;
              overflow: hidden;
              border-radius: 50%;
              background: #e6dfd4;
              box-shadow:
                0 30px 80px rgba(55,48,40,.12),
                0 0 0 1px rgba(41,40,36,.06);
            }

            .xaaj-category-image-wrap::after {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(
                145deg,
                rgba(255,255,255,.15),
                transparent 45%,
                rgba(40,35,28,.08)
              );
              pointer-events: none;
            }

            .xaaj-category-image-wrap img {
              width: 100%;
              height: 100%;
              display: block;
              object-fit: cover;
              transition: transform 1.2s cubic-bezier(.22,1,.36,1);
            }

            .xaaj-category-card-link:hover .xaaj-category-image-wrap img {
              transform: scale(1.035);
            }

            @media (max-width: 850px) {
              .xaaj-category-cinematic {
                height: auto;
                min-height: 100svh;
              }

              .xaaj-category-cinematic-inner {
                width: min(100% - 38px, 620px);
                min-height: 100svh;
                grid-template-columns: 1fr;
                gap: 25px;
                padding: 55px 0 45px;
              }

              .xaaj-category-copy {
                max-width: 100%;
              }

              .xaaj-category-copy h2 {
                font-size: clamp(48px, 15vw, 72px);
                margin-bottom: 16px;
              }

              .xaaj-category-copy p {
                max-width: 330px;
              }

              .xaaj-category-progress,
              .xaaj-category-scroll-hint {
                margin-top: 20px;
              }

              .xaaj-category-stage {
                height: 58vh;
                min-height: 400px;
                transform: none;
              }

              .xaaj-category-card-link {
                width: min(470px, 88%);
              }

              .xaaj-category-image-wrap {
                width: min(390px, 100%);
              }

              .xaaj-category-card-info {
                bottom: -38px;
              }

              .xaaj-category-card-info h3 {
                font-size: clamp(28px, 8vw, 38px);
              }

            }

            @media (prefers-reduced-motion: reduce) {
              .xaaj-category-card,
              .xaaj-category-image-wrap img {
                transition: none !important;
              }
            }
          `}</style>
        </section>


        {/* ====================================================
            BEST-SELLING PRODUCTS
        ==================================================== */}

        <section
          className="favorites"
          data-xaaj-reveal="up"
        >

          <div className="wrap">

            <SectionHeading
              eyebrow="Loved by our customers"
              title="Best-selling products"
              action={{
                label: 'View all',
                to: '/shop'
              }}
            />

            <div className="product-grid">

              {bestSellingProducts.length > 0 ? (
                bestSellingProducts.map(product => (
                  <ProductCard
                    product={product}
                    key={product.id}
                  />
                ))
              ) : (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: '30px 0',
                    color: '#706d67',
                    fontSize: '14px'
                  }}
                >
                  Customer favourites will appear here as reviews come in.
                </div>
              )}

            </div>

          </div>

        </section>


        {/* ====================================================
            NEW ARRIVALS
        ==================================================== */}

        <section
          id="customer-favorites"
          className="favorites"
          data-xaaj-reveal="up"
          style={{ scrollMarginTop: '120px' }}
        >

          <div className="wrap">

            <SectionHeading
              eyebrow="Just added to XAAJ"
              title="New Arrivals"
              action={{
                label: 'View all',
                to: '/shop'
              }}
            />

            <div className="product-grid">

              {newArrivals.map(product => (
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
              India, Made for the Table.
            </h2>

            <div className="feature-story-copy xaaj-brand-story-premium">

              <div className="xaaj-story-intro">
                <p className="xaaj-story-lead">
                  A little clay.
                  <br />
                  A lot of character.
                  <br />
                  And a story in every piece.
                </p>

                <p className="xaaj-story-body">
                  XAAJ is contemporary crockery rooted in the colours, crafts and everyday beauty of India.
                  <br />
                  Made by hand. Designed for now.
                  <br />
                  Meant to be used, loved and lived with.
                </p>
              </div>

              <div className="xaaj-story-rule" aria-hidden="true" />

              <div className="xaaj-story-block">
                <span className="xaaj-story-kicker">01 — ROOTED IN INDIA</span>
                <p>
                  The beauty of India, served differently.
                  <br />
                  We find inspiration in the things that surround us—old crafts, familiar colours, everyday rituals, places and people.
                  <br />
                  Then we give them a new form.
                  <br />
                  Pieces with a sense of where they come from,
                  <br />
                  and a place in how you live today.
                </p>
              </div>

              <div className="xaaj-story-rule" aria-hidden="true" />

              <div className="xaaj-story-block xaaj-story-living">
                <span className="xaaj-story-kicker">02 — MADE FOR LIVING</span>
                <p className="xaaj-story-pull">Made to gather stories.</p>
                <p>
                  Morning chai.
                  <br />
                  Long lunches.
                  <br />
                  Festive dinners.
                  <br />
                  Midnight conversations.
                  <br />
                  Because a table is never just a table.
                  <br />
                  It is where life happens.
                </p>
              </div>

            </div>

            <Button
              to="/story"
              light
            >
              Our story
            </Button>

          </div>


          <video
  src="https://res.cloudinary.com/kswukbpp/video/upload/v1789806424/19605262-hd_1080_1920_60fps.mp4"
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  aria-label="XAAJ handmade crockery"
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  }}
/>

        <style>{`
          .xaaj-brand-story-premium { display:flex; flex-direction:column; max-width:560px; }
          .xaaj-story-intro { display:grid; gap:24px; }
          .xaaj-story-lead { margin:0; max-width:470px; font-family:Georgia,'Times New Roman',serif; font-size:clamp(19px,1.55vw,25px); line-height:1.42; letter-spacing:-.018em; color:rgba(247,244,236,.94); }
          .xaaj-story-body { margin:0; max-width:500px; color:rgba(235,232,222,.68); font-size:13px; line-height:1.9; }
          .xaaj-story-rule { width:42px; height:1px; margin:28px 0 25px; background:rgba(242,238,227,.42); }
          .xaaj-story-block { max-width:500px; }
          .xaaj-story-kicker { display:block; margin-bottom:12px; color:rgba(221,216,203,.48); font-size:9px; line-height:1.2; font-weight:600; letter-spacing:2.1px; text-transform:uppercase; }
          .xaaj-story-block p:not(.xaaj-story-pull) { margin:0; color:rgba(235,232,222,.68); font-size:13px; line-height:1.85; }
          .xaaj-story-pull { margin:0 0 12px; color:rgba(247,244,236,.9); font-family:Georgia,'Times New Roman',serif; font-size:clamp(18px,1.45vw,23px); line-height:1.25; letter-spacing:-.015em; }
          @media(max-width:850px){ .xaaj-story-body,.xaaj-story-block p:not(.xaaj-story-pull){font-size:12.5px;line-height:1.75}.xaaj-story-rule{margin:23px 0 21px} }
        `}</style>

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
// CONTACT FORM
// ============================================================

function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState(null)

  const handleChange = event => {
    const { name, value } = event.target
    setForm(current => ({
      ...current,
      [name]: value
    }))
  }

  const handleSubmit = async event => {
    event.preventDefault()

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim()
    const message = form.message.trim()

    if (!name || !email || !message) {
      setPopup({
        type: 'error',
        title: 'A few details are missing',
        message: 'Please enter your name, email address and message.'
      })
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setPopup({
        type: 'error',
        title: 'Invalid email address',
        message: 'Please enter a valid email address and try again.'
      })
      return
    }

    setLoading(true)

    try {
      const result = await contactService.send({
        name,
        email,
        phone,
        message
      })

      setForm({
        name: '',
        email: '',
        phone: '',
        message: ''
      })

      setPopup({
        type: 'success',
        title: 'Message received',
        message:
          result?.message ||
          'Thank you for reaching out to XAAJ. Our team will get back to you shortly.'
      })
    } catch (error) {
      setPopup({
        type: 'error',
        title: 'Something went wrong',
        message:
          error?.data?.message ||
          error?.message ||
          'We could not send your message right now. Please try again or contact us directly.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="xaaj-contact-form-head">
        <div>
          <span className="xaaj-contact-index">01 — YOUR MESSAGE</span>
          <h2>Tell us what’s<br /><em>on your mind.</em></h2>
        </div>

        <div className="xaaj-contact-form-intro">
          <p>
            Whether you have a question about an order, a piece you love,
            delivery or something else entirely — we would love to hear from you.
          </p>
          <span className="xaaj-contact-form-note">A considered reply, usually within 1–2 working days.</span>
        </div>
      </div>

      <div className="xaaj-contact-form-grid">
        <form className="xaaj-contact-form-panel" onSubmit={handleSubmit}>
          <div className="xaaj-contact-form-fields">
            <label className="xaaj-contact-field">
              <span><b>01</b> Your name <i>*</i></span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={80}
                autoComplete="name"
                placeholder="Enter your name"
              />
            </label>

            <label className="xaaj-contact-field">
              <span><b>02</b> Email address <i>*</i></span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={254}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>

            <label className="xaaj-contact-field xaaj-contact-field-wide">
              <span><b>03</b> Phone / WhatsApp</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={15}
                autoComplete="tel"
                placeholder="+91 00000 00000"
              />
            </label>

            <label className="xaaj-contact-field xaaj-contact-field-wide">
              <span><b>04</b> Your message <i>*</i></span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={6}
                placeholder="Tell us how we can help..."
              />
              <small>{form.message.length}/2000</small>
            </label>
          </div>

          <div className="xaaj-contact-submit-row">
            <span>We read every message.</span>
            <button type="submit" disabled={loading}>
              <span>{loading ? 'Sending...' : 'Send message'}</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </form>

        <aside className="xaaj-contact-care">
          <div className="xaaj-contact-care-top">
            <span className="xaaj-contact-index">02 — XAAJ CARE</span>
            <div className="xaaj-contact-monogram">
              <img
                src={logoUrl}
                alt="XAAJ"
              />
            </div>
            <h3>Made to be<br /><em>answered.</em></h3>
            <p>
              Good things deserve thoughtful care. Reach us directly if you
              need help with an order or simply want to know more about XAAJ.
            </p>
          </div>

          <div className="xaaj-contact-care-links">
            <a href="https://wa.me/919899446117" target="_blank" rel="noreferrer">
              <MessageCircle size={18} strokeWidth={1.4} />
              <span>
                <small>WhatsApp</small>
                <strong>+91 98994 46117</strong>
              </span>
              <ArrowRight size={15} />
            </a>

            <a href="mailto:customercare@xaaj.in">
              <Mail size={18} strokeWidth={1.4} />
              <span>
                <small>Email</small>
                <strong>customercare@xaaj.in</strong>
              </span>
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="xaaj-contact-address">
            <small>STUDIO / BUSINESS ADDRESS</small>
            <p>G6/4C DLF Garden City,<br />Sector 92, Gurugram 122505</p>
          </div>
        </aside>
      </div>

      <div className="xaaj-contact-response-note">
        We usually respond within 1–2 working days. For urgent order support,
        you can reach us directly by phone or WhatsApp.
      </div>

      {popup && (
        <div
          className="xaaj-contact-popup"
          role="dialog"
          aria-modal="true"
          aria-labelledby="xaaj-contact-popup-title"
          onClick={event => {
            if (event.target === event.currentTarget) {
              setPopup(null)
            }
          }}
        >
          <div className="xaaj-contact-popup-card">
            <button
              type="button"
              className="xaaj-contact-popup-close"
              onClick={() => setPopup(null)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="xaaj-contact-popup-mark">
              {popup.type === 'error' ? '!' : '♡'}
            </div>

            <span className="xaaj-contact-popup-brand">XAAJ</span>

            <h3 id="xaaj-contact-popup-title">{popup.title}</h3>

            <p>{popup.message}</p>

            <div className="xaaj-contact-popup-rule" />

            <button
              type="button"
              className="xaaj-contact-popup-action"
              onClick={() => setPopup(null)}
            >
              Continue
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

  const [locationOpen, setLocationOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('India — Online')

  const locations = [
    'India — Online',
    'Delhi NCR',
    'Mumbai',
    'Bengaluru',
    'Hyderabad'
  ]

  const handleLocationSelect = location => {
    setSelectedLocation(location)
    setLocationOpen(false)
  }

  return (
    <>
      <style>{`
        .xaaj-footer-premium {
          position: relative;
          overflow: hidden;
          background: #f5f3ea;
          color: #171b18;
          border-top: 1px solid rgba(34, 45, 38, .08);
        }

        .xaaj-footer-premium::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .32;
          background:
            linear-gradient(45deg, rgba(72, 107, 86, .07) 25%, transparent 25%, transparent 75%, rgba(72, 107, 86, .07) 75%),
            linear-gradient(45deg, rgba(72, 107, 86, .07) 25%, transparent 25%, transparent 75%, rgba(72, 107, 86, .07) 75%);
          background-position: 0 0, 10px 10px;
          background-size: 20px 20px;
          mask-image: linear-gradient(to top, #000 0%, rgba(0,0,0,.7) 32%, transparent 68%);
          -webkit-mask-image: linear-gradient(to top, #000 0%, rgba(0,0,0,.7) 32%, transparent 68%);
        }

        .xaaj-footer-inner {
          position: relative;
          z-index: 2;
          width: min(1420px, calc(100% - 96px));
          margin: 0 auto;
          padding: 68px 0 0;
        }

        .xaaj-footer-columns {
          display: grid;
          grid-template-columns: 1.15fr .85fr .95fr .95fr 1.35fr;
          gap: 54px;
        }

        .xaaj-footer-column h4 {
          margin: 0 0 22px;
          color: #171b18;
          font-size: 13px;
          line-height: 1.2;
          font-weight: 650;
          letter-spacing: 1.25px;
          text-transform: uppercase;
        }

        .xaaj-footer-column a,
        .xaaj-footer-column span {
          display: block;
          margin: 0 0 15px;
          color: #252a27;
          font-size: 14px;
          line-height: 1.45;
          text-decoration: none;
          transition: transform .35s cubic-bezier(.22,1,.36,1), color .25s ease;
        }

        .xaaj-footer-column a:hover {
          color: #477456;
          transform: translateX(4px);
        }

        /* Brand replaces the old "Find us on" block. */
        .xaaj-footer-brand {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
        }

        .xaaj-footer-brand-logo {
          display: block;
          width: min(180px, 100%);
          height: auto;
          margin: 0 0 42px;
          object-fit: contain;
          object-position: left center;
        }

        .xaaj-footer-brand-caption {
          max-width: 230px;
          margin: 0 0 28px !important;
          color: #777b76 !important;
          font-size: 12px !important;
          line-height: 1.65 !important;
          letter-spacing: .02em;
        }

        .xaaj-footer-country {
          display: inline-flex !important;
          align-items: center;
          gap: 10px;
          margin: 0 0 30px !important;
          color: #252a27 !important;
          font-size: 14px !important;
        }

        /* XAAJ emblem instead of the generic globe. */
        .xaaj-footer-emblem {
          width: 27px;
          height: 27px;
          flex: 0 0 27px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(41, 40, 36, .72);
          border-radius: 50%;
          color: #252a27;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 13px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -.08em;
        }

        .xaaj-footer-locator {
          width: min(100%, 300px);
          position: relative;
          margin-top: 2px;
        }

        .xaaj-footer-locator-title {
          margin-bottom: 13px !important;
          color: #171b18 !important;
          font-size: 12px !important;
          font-weight: 650 !important;
          letter-spacing: 1.35px !important;
          text-transform: uppercase;
        }

        .xaaj-footer-locator-trigger {
          width: 100%;
          min-height: 58px;
          padding: 0 16px 0 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border: 1px solid rgba(29, 37, 32, .10);
          border-radius: 0;
          background: rgba(255,255,255,.72);
          color: #353a36;
          box-shadow: 0 10px 30px rgba(33, 43, 36, .05);
          font: inherit;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          transition:
            border-color .25s ease,
            background-color .25s ease,
            box-shadow .3s ease;
        }

        .xaaj-footer-locator-trigger:hover,
        .xaaj-footer-locator-trigger[aria-expanded="true"] {
          border-color: rgba(47,112,72,.34);
          background: rgba(255,255,255,.9);
          box-shadow: 0 14px 34px rgba(33,43,36,.08);
        }

        .xaaj-footer-locator-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          margin: 0 !important;
          color: #3e443f !important;
          font-size: 19px !important;
          line-height: 1 !important;
          transition: transform .3s cubic-bezier(.22,1,.36,1), color .25s ease;
        }

        .xaaj-footer-locator-trigger[aria-expanded="true"] .xaaj-footer-locator-arrow {
          transform: rotate(90deg);
          color: #2f7048 !important;
        }

        .xaaj-footer-locator-menu {
          position: absolute;
          left: 0;
          right: 0;
          bottom: calc(100% + 8px);
          z-index: 20;
          padding: 7px;
          border: 1px solid rgba(29,37,32,.10);
          background: rgba(255,254,250,.98);
          box-shadow: 0 18px 42px rgba(33,43,36,.13);
        }

        .xaaj-footer-location-option {
          width: 100%;
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 0 !important;
          padding: 10px 11px;
          border: 0;
          background: transparent;
          color: #353a36 !important;
          font: inherit;
          font-size: 12px !important;
          line-height: 1.3 !important;
          text-align: left;
          cursor: pointer;
          transform: none !important;
        }

        .xaaj-footer-location-option:hover {
          background: #f1eee6;
          color: #2f7048 !important;
        }

        .xaaj-footer-location-option.is-selected {
          color: #2f7048 !important;
          font-weight: 600;
        }

        .xaaj-footer-location-option-mark {
          margin: 0 !important;
          color: #2f7048 !important;
          font-size: 11px !important;
        }

        .xaaj-footer-social {
          display: flex;
          align-items: center;
          gap: 17px;
          margin: 27px 0 0;
          padding-top: 20px;
          border-top: 1px solid rgba(34,45,38,.09);
        }

        .xaaj-footer-social a {
          width: 30px;
          height: 30px;
          margin: 0 !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          color: #171b18 !important;
          transform: none !important;
        }

        .xaaj-footer-social a:hover {
          color: #477456 !important;
          transform: translateY(-3px) !important;
        }

        .xaaj-footer-connect p {
          margin: 0 0 15px;
          color: #252a27;
          font-size: 14px;
          line-height: 1.5;
        }

        .xaaj-footer-connect a {
          display: block;
          margin: 0 0 14px;
          font-size: 14px;
        }

        .xaaj-footer-contact-line {
          display: flex !important;
          align-items: center;
          gap: 9px;
        }

        .xaaj-footer-contact-line svg {
          flex: 0 0 auto;
        }

        .xaaj-footer-art {
          position: relative;
          z-index: 1;
          height: 300px;
          margin-top: 38px;
          overflow: hidden;
        }

        .xaaj-footer-art-checker {
          position: absolute;
          inset: 58px 0 0;
          opacity: .48;
          background:
            linear-gradient(45deg, rgba(78, 116, 92, .09) 25%, transparent 25%, transparent 75%, rgba(78, 116, 92, .09) 75%),
            linear-gradient(45deg, rgba(78, 116, 92, .09) 25%, transparent 25%, transparent 75%, rgba(78, 116, 92, .09) 75%);
          background-position: 0 0, 18px 18px;
          background-size: 36px 36px;
          mask-image: linear-gradient(to top, #000 0%, rgba(0,0,0,.8) 55%, transparent 100%);
          -webkit-mask-image: linear-gradient(to top, #000 0%, rgba(0,0,0,.8) 55%, transparent 100%);
        }

        .xaaj-footer-botanical {
          position: absolute;
          left: -2%;
          right: -2%;
          bottom: -22px;
          width: 104%;
          height: 270px;
          pointer-events: none;
        }

        .xaaj-footer-botanical .stem {
          fill: none;
          stroke: #6f856d;
          stroke-width: 2.1;
          stroke-linecap: round;
          opacity: .8;
        }

        .xaaj-footer-botanical .leaf {
          fill: #81947a;
          opacity: .78;
        }

        .xaaj-footer-botanical .leaf-light {
          fill: #a5b39b;
          opacity: .68;
        }

        .xaaj-footer-botanical .flower {
          fill: #c87b7b;
          opacity: .72;
        }

        .xaaj-footer-botanical .flower-center {
          fill: #d6b45b;
          opacity: .9;
        }

        .xaaj-footer-botanical .fruit {
          fill: #b64c4c;
          opacity: .82;
        }

        .xaaj-footer-botanical .sun {
          fill: #c49a3b;
          opacity: .78;
        }

        .xaaj-footer-bottom {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 0 24px;
          border-top: 1px solid rgba(30, 39, 33, .10);
          color: #626862;
          font-size: 11px;
          letter-spacing: .3px;
        }

        .xaaj-footer-bottom a {
          color: inherit;
          text-decoration: none;
        }

        .xaaj-footer-bottom a:hover {
          color: #477456;
        }

        @media (max-width: 1000px) {
          .xaaj-footer-columns {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 40px 28px;
          }

          .xaaj-footer-connect {
            grid-column: span 2;
          }
        }

        @media (max-width: 680px) {
          .xaaj-footer-inner {
            width: min(100% - 38px, 560px);
            padding-top: 48px;
          }

          .xaaj-footer-columns {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 34px 24px;
          }

          .xaaj-footer-columns > :first-child {
            grid-column: 1 / -1;
          }

          .xaaj-footer-connect {
            grid-column: 1 / -1;
          }

          .xaaj-footer-brand-logo {
            width: min(190px, 70%);
            margin-bottom: 30px;
          }

          .xaaj-footer-locator {
            width: min(100%, 320px);
          }

          .xaaj-footer-social {
            margin-top: 22px;
          }

          .xaaj-footer-art {
            height: 220px;
            margin-top: 24px;
          }

          .xaaj-footer-botanical {
            height: 205px;
          }

          .xaaj-footer-bottom {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .xaaj-footer-column a,
          .xaaj-footer-social a,
          .xaaj-footer-locator-arrow,
          .xaaj-footer-locator-trigger {
            transition: none !important;
          }
        }
      `}</style>

      <footer className="xaaj-footer-premium">

        <div className="xaaj-footer-inner">

          <div className="xaaj-footer-columns">

            {/* XAAJ BRAND */}
            <div className="xaaj-footer-column xaaj-footer-brand">

              <img
                className="xaaj-footer-brand-logo"
                src={logoUrl}
                alt="XAAJ — Stores Crafted in Earth"
              />

              <p className="xaaj-footer-brand-caption">
                Thoughtful tableware, shaped slowly in India.
              </p>

              

              {/* SHOP & EXPERIENCE — now interactive */}
              <div className="xaaj-footer-locator">

                <h4 className="xaaj-footer-locator-title">
                  Shop &amp; experience
                </h4>

                <button
                  type="button"
                  className="xaaj-footer-locator-trigger"
                  aria-expanded={locationOpen}
                  aria-haspopup="listbox"
                  onClick={() => setLocationOpen(current => !current)}
                >
                  <span>{selectedLocation}</span>
                  <span className="xaaj-footer-locator-arrow" aria-hidden="true">›</span>
                </button>

                {locationOpen && (
                  <div
                    className="xaaj-footer-locator-menu"
                    role="listbox"
                    aria-label="Select location"
                  >
                    {locations.map(location => (
                      <button
                        key={location}
                        type="button"
                        role="option"
                        aria-selected={selectedLocation === location}
                        className={`xaaj-footer-location-option ${
                          selectedLocation === location ? 'is-selected' : ''
                        }`}
                        onClick={() => handleLocationSelect(location)}
                      >
                        <span>{location}</span>
                        {selectedLocation === location && (
                          <span className="xaaj-footer-location-option-mark">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

              </div>

            </div>

            {/* ABOUT */}
            <div className="xaaj-footer-column">

              <h4>About us</h4>

              <Link to="/about">Our story</Link>
              <Link to="/story">The XAAJ way</Link>
              <Link to="/blog">Journal</Link>
              <Link to="/contact">Contact</Link>

            </div>

            {/* SERVICES */}
            <div className="xaaj-footer-column">

              <h4>Services</h4>

              <Link to="/shop">Shop all</Link>
              <Link to="/shop?filter=new">New arrivals</Link>
              <Link to="/faq">Gift cards &amp; gifting</Link>
              <Link to="/contact">Corporate enquiries</Link>

            </div>

            {/* HELP */}
            <div className="xaaj-footer-column">

              <h4>Help</h4>

              <Link to="/shipping" title="Shipping Policy">
                Shipping &amp; Payment
              </Link>

              <Link to="/account">
                Track Order
              </Link>

              <Link to="/returns" title="Return & Refund Policy">
                Return &amp; Exchanges
              </Link>

              <Link to="/terms" title="Terms & Conditions">
                Terms of Use
              </Link>

              <Link to="/privacy" title="Privacy Policy">
                Privacy Policy
              </Link>

              <Link to="/faq">
                FAQs
              </Link>

            </div>

            {/* CONNECT */}
            <div className="xaaj-footer-column xaaj-footer-connect">

              <h4>Connect</h4>

              <p>For collaborations &amp; brand enquiries</p>

              <a href="mailto:customercare@xaaj.in">
                customercare@xaaj.in
              </a>

              <a
                href="https://wa.me/919899446117"
                target="_blank"
                rel="noreferrer"
                className="xaaj-footer-contact-line"
              >
                <FaWhatsapp size={18} />
                +91 98994 46117
              </a>

              <p>
                Monday – Saturday<br />
                9:30 am – 5:30 pm IST
              </p>

              {/* Find us on — moved under Connect */}
              <h4 className="xaaj-footer-social-title">
                Find us on
              </h4>

              <div className="xaaj-footer-social">

                <a
                  href="https://www.instagram.com/xaajstories?stkn=MWxkMzRscjAzaXVjZQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="XAAJ on Instagram"
                  title="Instagram"
                >
                  <FaInstagram size={22} />
                </a>

                <a
                  href="https://wa.me/919899446117"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat with XAAJ on WhatsApp"
                  title="WhatsApp"
                >
                  <FaWhatsapp size={22} />
                </a>

                <a
                  href="mailto:customercare@xaaj.in"
                  aria-label="Email XAAJ"
                  title="Email"
                >
                  <Mail size={21} />
                </a>

              </div>

            </div>

          </div>

          {/* Botanical / textile-inspired artwork */}
          <div className="xaaj-footer-art" aria-hidden="true">

            <div className="xaaj-footer-art-checker" />

            <svg
              className="xaaj-footer-botanical"
              viewBox="0 0 1600 300"
              preserveAspectRatio="none"
            >

              <path
                className="stem"
                d="M-40 290 C 160 220, 220 250, 360 190 S 620 180, 790 235 S 1040 270, 1190 190 S 1430 165, 1640 235"
              />

              <path
                className="stem"
                d="M40 292 C 150 250, 180 145, 260 105"
              />

              <path
                className="stem"
                d="M350 294 C 430 240, 470 130, 545 82"
              />

              <path
                className="stem"
                d="M1170 294 C 1110 235, 1100 135, 1040 95"
              />

              <path
                className="stem"
                d="M1460 294 C 1390 235, 1420 145, 1370 90"
              />

              <g>
                <ellipse className="leaf" cx="170" cy="220" rx="15" ry="31" transform="rotate(-42 170 220)" />
                <ellipse className="leaf-light" cx="205" cy="194" rx="14" ry="30" transform="rotate(35 205 194)" />
                <ellipse className="leaf" cx="250" cy="168" rx="14" ry="29" transform="rotate(-42 250 168)" />
                <ellipse className="leaf-light" cx="285" cy="150" rx="13" ry="27" transform="rotate(36 285 150)" />

                <ellipse className="leaf" cx="470" cy="205" rx="15" ry="31" transform="rotate(-46 470 205)" />
                <ellipse className="leaf-light" cx="510" cy="175" rx="14" ry="28" transform="rotate(36 510 175)" />
                <ellipse className="leaf" cx="555" cy="130" rx="13" ry="27" transform="rotate(-36 555 130)" />

                <ellipse className="leaf-light" cx="1135" cy="210" rx="15" ry="31" transform="rotate(40 1135 210)" />
                <ellipse className="leaf" cx="1095" cy="172" rx="14" ry="29" transform="rotate(-38 1095 172)" />
                <ellipse className="leaf-light" cx="1050" cy="132" rx="13" ry="26" transform="rotate(38 1050 132)" />

                <ellipse className="leaf" cx="1395" cy="205" rx="15" ry="31" transform="rotate(42 1395 205)" />
                <ellipse className="leaf-light" cx="1360" cy="168" rx="14" ry="29" transform="rotate(-38 1360 168)" />
                <ellipse className="leaf" cx="1325" cy="128" rx="13" ry="27" transform="rotate(36 1325 128)" />
              </g>

              <g>
                <circle className="fruit" cx="330" cy="220" r="25" />
                <path className="leaf-light" d="M330 195 C 310 177, 294 179, 286 190 C 304 198, 318 201, 330 195 Z" />
                <circle className="fruit" cx="1235" cy="218" r="24" />
                <path className="leaf-light" d="M1235 194 C 1253 176, 1270 180, 1278 191 C 1259 199, 1246 200, 1235 194 Z" />
              </g>

              <g>
                <circle className="flower-center" cx="675" cy="215" r="10" />
                <circle className="flower" cx="675" cy="190" r="14" />
                <circle className="flower" cx="700" cy="215" r="14" />
                <circle className="flower" cx="675" cy="240" r="14" />
                <circle className="flower" cx="650" cy="215" r="14" />

                <circle className="flower-center" cx="925" cy="212" r="10" />
                <circle className="flower" cx="925" cy="187" r="14" />
                <circle className="flower" cx="950" cy="212" r="14" />
                <circle className="flower" cx="925" cy="237" r="14" />
                <circle className="flower" cx="900" cy="212" r="14" />
              </g>

              <path
                className="sun"
                d="M790 80
                   C 805 104, 826 110, 850 111
                   C 826 122, 815 140, 815 166
                   C 800 143, 780 134, 756 137
                   C 779 123, 788 105, 790 80 Z"
              />

            </svg>

          </div>

          <div className="xaaj-footer-bottom">

            <span>
              © 2026 XAAJ. Made for everyday.
            </span>

            <span>
              <Link to="/privacy" title="Privacy Policy">Privacy</Link>
              {' · '}
              <Link to="/terms" title="Terms & Conditions">Terms</Link>
            </span>

          </div>

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
    products: liveProducts,
    bestSellingProducts,
    newArrivals
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
              'Serveware',
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

  const {
    add,
    products: liveProducts
  } = useStore()
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
          rating: Number(raw.rating || 0),
          reviews: Number(raw.reviewCount || 0),
          reviewCount: Number(raw.reviewCount || 0)
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

  const relatedProducts = liveProducts
    .filter(item => {
      const sameCategory =
        String(item.category || '').toLowerCase() ===
        String(product?.category || '').toLowerCase()

      const differentProduct =
        String(item.id || item._id) !==
        String(product?.id || product?._id)

      return sameCategory && differentProduct
    })
    .slice(0, 4)

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
                rating={Number(product.rating) || 0}
                reviews={Number(
                  product.reviewCount ??
                  product.reviews ??
                  0
                )}
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

                  if (isAdminPreviewMode()) {
                    window.alert(
                      'Admin Preview Mode: adding products to cart is disabled.'
                    )
                    return
                  }

                  for (let i = 0; i < qty; i++) {
                    add(product)
                  }

                  // Keep the add-to-cart interaction lightweight.
                  // Do not clone the large product image into <body>: without a
                  // guaranteed animation stylesheet it can render at full size
                  // and cover the product page. The header cart bump provides
                  // the visual confirmation instead.

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

              {/* Product Information Accordions — premium editorial style */}
              <div className="xaaj-product-accordions">
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');

                  .xaaj-product-accordions {
                    margin-top: 30px;
                    border-top: 1px solid rgba(42, 39, 35, .14);
                  }

                  .xaaj-product-accordions details {
                    margin: 0;
                    border-bottom: 1px solid rgba(42, 39, 35, .14);
                  }

                  .xaaj-product-accordions summary {
                    position: relative;
                    list-style: none;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                    padding: 21px 2px 20px;
                    cursor: pointer;
                    color: #2c2925;
                    font-family: 'Cormorant Garamond', Georgia, serif;
                    font-size: clamp(20px, 1.8vw, 25px);
                    font-weight: 500;
                    line-height: 1.1;
                    letter-spacing: -.015em;
                    transition: color .3s ease;
                  }

                  .xaaj-product-accordions summary::-webkit-details-marker {
                    display: none;
                  }

                  .xaaj-product-accordions summary::after {
                    content: '+';
                    width: 25px;
                    height: 25px;
                    flex: 0 0 25px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #6f6a63;
                    font-family: 'Assistant', Arial, sans-serif;
                    font-size: 20px;
                    font-weight: 400;
                    line-height: 1;
                    transition: transform .35s cubic-bezier(.22,1,.36,1), color .25s ease;
                  }

                  .xaaj-product-accordions details[open] summary {
                    color: #2f7048;
                  }

                  .xaaj-product-accordions details[open] summary::after {
                    content: '−';
                    transform: rotate(180deg);
                    color: #2f7048;
                  }

                  .xaaj-product-accordions summary:hover {
                    color: #2f7048;
                  }

                  .xaaj-product-accordions p {
                    max-width: 720px;
                    margin: 0;
                    padding: 0 42px 23px 2px;
                    color: #716c65;
                    font-family: 'Assistant', Arial, sans-serif;
                    font-size: 13px;
                    font-weight: 400;
                    line-height: 1.9;
                    white-space: pre-line;
                  }

                  .xaaj-product-accordions details[open] p {
                    animation: xaajAccordionReveal .45s cubic-bezier(.22,1,.36,1) both;
                  }

                  @keyframes xaajAccordionReveal {
                    from {
                      opacity: 0;
                      transform: translateY(-7px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }

                  @media (max-width: 700px) {
                    .xaaj-product-accordions summary {
                      padding: 18px 0;
                      font-size: 21px;
                    }

                    .xaaj-product-accordions p {
                      padding: 0 4px 20px;
                      font-size: 13px;
                    }
                  }
                `}</style>

                <details open>
                  <summary>Description</summary>
                  <p>
                    {product.description ||
                      product.desc ||
                      'Beautifully crafted for everyday use.'}
                  </p>
                </details>

                <details>
                  <summary>Product Details &amp; Care</summary>
                  <p>
                    {product.productDetails ||
                      'Material, dimensions and care instructions will be shown here.'}
                  </p>
                </details>

                <details>
                  <summary>Shipping &amp; Payment</summary>
                  <p>
                    {product.shippingPayment ||
                      'Shipping and payment information will be shown here. Secure online payment options are available at checkout.'}
                  </p>
                </details>

                <details>
                  <summary>Return &amp; Exchange</summary>
                  <p>
                    {product.returnExchange ||
                      'Return & exchange information will be shown here. For help with an order, please contact XAAJ support.'}
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

          {relatedProducts.length > 0 && (
            <section
              className="wrap"
              style={{
                marginTop: '90px',
                marginBottom: '30px'
              }}
            >
              <SectionHeading
                eyebrow="You may also like"
                title="Related products"
              />

              <div className="product-grid">
                {relatedProducts.map(relatedProduct => (
                  <ProductCard
                    key={relatedProduct.id || relatedProduct._id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </section>
          )}

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
    toggleWish,
    add
  } = useStore()

  const items = wishlist
    ? liveProducts.filter(product => wish.includes(product.id || product._id))
    : cart

  const getProduct = item =>
    liveProducts.find(
      product =>
        String(product.id || product._id) === String(item.id || item._id)
    ) || item

  const getProductUrl = item => {
    const product = getProduct(item)
    const identifier = product.slug || item.slug || product.id || product._id
    return `/product/${encodeURIComponent(String(identifier || ''))}`
  }

  const shippingFee = total >= 1000 ? 0 : 99
  const grandTotal = total + shippingFee
  const freeShippingProgress = Math.min(100, (total / 1000) * 100)
  const remainingForFreeShipping = Math.max(0, 1000 - total)

  return (
    <>
      <Header />

      <main className={`page xaaj-cart-page ${wishlist ? 'xaaj-wishlist-page' : ''}`}>
        <div className="wrap">
          <div className="breadcrumbs">
            Home <span>/</span> {wishlist ? 'Wishlist' : 'Your cart'}
          </div>

          <header className="xaaj-cart-heading">
            <div>
              <span className="eyebrow">
                {wishlist ? 'Saved with intention' : 'Your selections'}
              </span>
              <h1>{wishlist ? 'Your wishlist' : 'Your cart'}</h1>
              <p>
                {wishlist
                  ? 'Pieces you loved enough to keep close.'
                  : 'A considered collection of pieces for your table.'}
              </p>
            </div>
            <div className="xaaj-cart-count">
              <span>{items.length}</span>
              <small>{items.length === 1 ? 'piece' : 'pieces'}</small>
            </div>
          </header>

          {items.length === 0 ? (
            <div className="xaaj-empty-state">
              <div className="xaaj-empty-mark">
                {wishlist ? <Heart size={25} strokeWidth={1.25} /> : <ShoppingBag size={25} strokeWidth={1.25} />}
              </div>
              <span className="eyebrow">
                {wishlist ? 'Nothing saved yet' : 'Your collection is waiting'}
              </span>
              <h2>
                {wishlist ? 'Keep something beautiful close.' : 'Start with something beautiful.'}
              </h2>
              <p>
                Explore XAAJ and find pieces made to become part of everyday rituals.
              </p>
              <Button to="/shop">Explore the collection</Button>
            </div>
          ) : (
            <div className="xaaj-shopping-layout">
              <section className="xaaj-shopping-items">
                {!wishlist && (
                  <div className="xaaj-shipping-progress">
                    <div className="xaaj-shipping-copy">
                      <span>
                        {remainingForFreeShipping > 0
                          ? <>Add <strong>{money(remainingForFreeShipping)}</strong> more for complimentary shipping.</>
                          : <>Your order qualifies for <strong>complimentary shipping.</strong></>}
                      </span>
                      <span>{Math.round(freeShippingProgress)}%</span>
                    </div>
                    <div className="xaaj-progress-track">
                      <span style={{ width: `${freeShippingProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="xaaj-items-header">
                  <span>{wishlist ? 'Saved pieces' : 'Your pieces'}</span>
                  <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                </div>

                <div className="xaaj-item-list">
                  {items.map(item => {
                    const product = getProduct(item)
                    const qty = item.qty || 1
                    const productUrl = getProductUrl(item)
                    const image = product.image || item.image
                    const name = product.name || item.name
                    const category = product.category || item.category
                    const price = Number(product.price ?? item.price ?? 0)

                    return (
                      <article className="xaaj-shopping-item" key={item.id || item._id}>
                        <Link
                          to={productUrl}
                          className="xaaj-shopping-image"
                          aria-label={`View ${name}`}
                        >
                          <img src={image} alt={name} />
                          <span>View piece <ArrowRight size={13} /></span>
                        </Link>

                        <div className="xaaj-shopping-info">
                          <div className="xaaj-item-topline">
                            <span>{category || 'XAAJ Collection'}</span>
                            <button
                              type="button"
                              className="xaaj-item-remove"
                              aria-label={`Remove ${name}`}
                              onClick={() => wishlist ? toggleWish(item.id || item._id) : remove(item.id || item._id)}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <Link to={productUrl} className="xaaj-shopping-title">
                            <h2>{name}</h2>
                          </Link>

                          <p className="xaaj-item-price">{money(price)}</p>

                          <div className="xaaj-item-actions">
                            {!wishlist ? (
                              <div className="xaaj-quantity-control" aria-label={`Quantity for ${name}`}>
                                <button type="button" onClick={() => change(item.id || item._id, -1)} aria-label="Decrease quantity">
                                  <Minus size={13} />
                                </button>
                                <span>{qty}</span>
                                <button type="button" onClick={() => change(item.id || item._id, 1)} aria-label="Increase quantity">
                                  <Plus size={13} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="xaaj-text-action"
                                onClick={() => {
                                 if (isAdminPreviewMode()) {
                                   window.alert(
                                     'Admin Preview Mode: adding products to cart is disabled.'
                                   )
                                   return
                                 }

                                 add(product)
                               }}
                              >
                                <ShoppingBag size={14} /> Add to cart
                              </button>
                            )}

                            <Link to={productUrl} className="xaaj-view-link">
                              View details <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>

                        <strong className="xaaj-item-total">
                          {money(price * qty)}
                        </strong>
                      </article>
                    )
                  })}
                </div>
              </section>

              {!wishlist && (
                <aside className="xaaj-order-summary">
                  <div className="xaaj-summary-kicker">XAAJ / ORDER</div>
                  <h2>Order summary</h2>
                  <p className="xaaj-summary-intro">Thoughtfully packed and prepared for its journey to you.</p>

                  <div className="xaaj-summary-lines">
                    <div><span>Subtotal</span><strong>{money(total)}</strong></div>
                    <div>
                      <span>Shipping</span>
                      <strong>{shippingFee === 0 ? 'Complimentary' : money(shippingFee)}</strong>
                    </div>
                  </div>

                  <div className="xaaj-summary-total">
                    <span>Total</span>
                    <strong>{money(grandTotal)}</strong>
                  </div>

                  <Button to="/checkout" className="xaaj-checkout-button">
                    Continue to checkout
                  </Button>

                  <div className="xaaj-summary-note">
                    <ShieldCheck size={16} />
                    <span>Secure checkout · Carefully packed · Damage support within 48 hours</span>
                  </div>
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
  auth = false,
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

  if (auth) {
    return (
      <>
        <Header />

        <main className="page simple xaaj-auth-page">
          <div className="xaaj-auth-shell">
            {children}
          </div>
        </main>

        <style>{`
          .xaaj-auth-page {
            min-height: calc(100vh - 118px);
            padding: 28px 24px 52px;
            background:
              radial-gradient(circle at 10% 5%, rgba(47,112,72,.055), transparent 28%),
              linear-gradient(180deg, #f7f5f0 0%, #f2efe8 100%);
          }

          .xaaj-auth-shell {
            width: min(1120px, 100%);
            min-height: 690px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .xaaj-auth-layout {
            width: min(100%, 980px);
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(430px, .82fr);
            align-items: stretch;
            overflow: hidden;
            border: 1px solid rgba(39,46,40,.10);
            border-radius: 24px;
            background: rgba(255,254,250,.88);
            box-shadow:
              0 34px 90px rgba(37,42,37,.09),
              0 2px 10px rgba(37,42,37,.035);
          }

          /* The left side is intentionally typographic, not a stock image.
             It gives the authentication screen its own brand identity. */
          .xaaj-auth-editorial {
            position: relative;
            min-height: 690px;
            padding: 56px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #183126;
            color: #f8f5ed;
          }

          .xaaj-auth-editorial::before {
            content: 'X';
            position: absolute;
            right: -45px;
            bottom: -125px;
            color: rgba(255,255,255,.035);
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 410px;
            line-height: 1;
            font-weight: 400;
            pointer-events: none;
          }

          .xaaj-auth-editorial::after {
            content: '';
            position: absolute;
            width: 240px;
            height: 240px;
            right: 34px;
            top: 105px;
            border: 1px solid rgba(226,235,225,.13);
            border-radius: 50%;
            box-shadow:
              0 0 0 30px rgba(226,235,225,.018),
              0 0 0 60px rgba(226,235,225,.012);
            pointer-events: none;
          }

          .xaaj-auth-mark {
            position: relative;
            z-index: 2;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            color: rgba(248,245,237,.72);
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2.4px;
            text-transform: uppercase;
          }

          .xaaj-auth-mark i {
            width: 30px;
            height: 1px;
            display: block;
            background: #a8c29d;
          }

          .xaaj-auth-editorial-copy {
            position: relative;
            z-index: 2;
            max-width: 500px;
          }

          .xaaj-auth-editorial-eyebrow {
            display: block;
            margin-bottom: 19px;
            color: #a8c29d;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2.3px;
            text-transform: uppercase;
          }

          .xaaj-auth-editorial h2 {
            max-width: 500px;
            margin: 0;
            color: #f8f5ed;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(52px, 5.6vw, 78px);
            line-height: .91;
            letter-spacing: -.055em;
            font-weight: 400;
          }

          .xaaj-auth-editorial h2 em {
            color: #c9d7c1;
            font-style: italic;
            font-weight: 400;
          }

          .xaaj-auth-editorial-copy p {
            max-width: 370px;
            margin: 27px 0 0;
            color: rgba(248,245,237,.65);
            font-size: 12px;
            line-height: 1.85;
          }

          .xaaj-auth-editorial-footer {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 12px;
            color: rgba(248,245,237,.48);
            font-size: 9px;
            letter-spacing: .7px;
          }

          .xaaj-auth-editorial-footer b {
            color: rgba(248,245,237,.76);
            font-weight: 600;
          }

          .xaaj-auth-editorial-dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: #a8c29d;
          }

          .xaaj-auth-form-panel {
            display: flex;
            align-items: center;
            padding: 42px clamp(34px, 4vw, 56px);
            background: rgba(255,254,250,.95);
          }

          .xaaj-auth-form-inner {
            width: min(400px, 100%);
            margin: 0 auto;
          }

          .xaaj-auth-nav {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px;
            margin-bottom: 27px;
            border: 1px solid #e4e0d8;
            border-radius: 999px;
            background: #f5f3ee;
          }

          .xaaj-auth-nav a {
            min-width: 94px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            color: #77736b;
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .4px;
            transition: background .25s ease, color .25s ease, transform .25s ease;
          }

          .xaaj-auth-nav a:hover {
            color: #292824;
            transform: translateY(-1px);
          }

          .xaaj-auth-nav a.active {
            background: #292824;
            color: #fffdf8;
            box-shadow: 0 4px 12px rgba(41,40,36,.12);
          }

          .xaaj-auth-kicker {
            display: block;
            margin-bottom: 13px;
            color: #2f7048;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .xaaj-auth-title {
            margin: 0;
            color: #292824;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(44px, 4vw, 58px);
            line-height: .98;
            font-weight: 400;
            letter-spacing: -.05em;
          }

          .xaaj-auth-lead {
            max-width: 390px;
            margin: 13px 0 23px;
            color: #77736b;
            font-size: 12px;
            line-height: 1.8;
          }

          .xaaj-auth-form {
            display: grid;
            gap: 14px;
          }

          .xaaj-auth-section-label {
            display: flex;
            align-items: center;
            gap: 11px;
            margin: 2px 0 -4px;
            color: #918b83;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 1.8px;
            text-transform: uppercase;
          }

          .xaaj-auth-section-label::after {
            content: '';
            height: 1px;
            flex: 1;
            background: #e7e2d9;
          }

          .xaaj-auth-fields {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .xaaj-auth-fields .full {
            grid-column: 1 / -1;
          }

          .xaaj-auth-field {
            position: relative;
          }

          .xaaj-auth-field label {
            display: block;
            margin: 0 0 6px 1px;
            color: #5f5a53;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1.1px;
            text-transform: uppercase;
          }

          .xaaj-auth-input-wrap {
            position: relative;
          }

          .xaaj-auth-field input {
            width: 100%;
            height: 46px;
            box-sizing: border-box;
            padding: 0 14px;
            border: 1px solid #dedad2;
            border-radius: 10px;
            outline: none;
            background: #fbfaf7;
            color: #292824;
            font: inherit;
            font-size: 12px;
            transition:
              border-color .25s ease,
              background .25s ease,
              box-shadow .25s ease;
          }

          .xaaj-auth-field input::placeholder {
            color: #aaa49b;
          }

          .xaaj-auth-field input:hover {
            border-color: #c9c3b9;
            background: #fff;
          }

          .xaaj-auth-field input:focus {
            border-color: #2f7048;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(47,112,72,.08);
          }

          .xaaj-auth-password-toggle {
            position: absolute;
            top: 50%;
            right: 13px;
            transform: translateY(-50%);
            padding: 4px;
            border: 0;
            background: transparent;
            color: #858078;
            font: inherit;
            font-size: 9px;
            font-weight: 700;
            cursor: pointer;
          }

          .xaaj-auth-password-toggle:hover {
            color: #2f7048;
          }

          .xaaj-auth-error {
            margin: -5px 1px 0;
            color: #b42318;
            font-size: 11px;
            line-height: 1.5;
          }

          .xaaj-auth-submit {
            position: relative;
            width: 100%;
            min-height: 48px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            border: 1px solid #292824;
            border-radius: 10px;
            background: #292824;
            color: #fffdf8;
            font: inherit;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .65px;
            cursor: pointer;
            transition:
              transform .28s cubic-bezier(.22,1,.36,1),
              background .25s ease,
              box-shadow .28s ease;
          }

          .xaaj-auth-submit:hover {
            transform: translateY(-2px);
            background: #2f7048;
            box-shadow: 0 13px 28px rgba(47,112,72,.17);
          }

          .xaaj-auth-submit:active {
            transform: translateY(0);
          }

          .xaaj-auth-submit:disabled {
            opacity: .58;
            cursor: wait;
            transform: none;
            box-shadow: none;
          }

          .xaaj-auth-secondary {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 14px;
            margin-top: 11px;
            padding-top: 1px;
          }

          .xaaj-auth-secondary span {
            display: none;
          }

          .xaaj-auth-secondary a,
          .xaaj-auth-switch a {
            color: #2f7048;
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
          }

          .xaaj-auth-secondary a:hover,
          .xaaj-auth-switch a:hover {
            text-decoration: underline;
            text-underline-offset: 4px;
          }

          .xaaj-auth-switch {
            margin: 25px 0 0;
            padding-top: 21px;
            border-top: 1px solid #e7e2d9;
            color: #817b73;
            text-align: center;
            font-size: 10px;
          }

          .xaaj-auth-switch a {
            margin-left: 5px;
          }

          .xaaj-auth-trust {
            display: flex;
            justify-content: center;
            gap: 9px;
            margin-top: 18px;
            color: #aaa49b;
            font-size: 8px;
            letter-spacing: .25px;
          }

          .xaaj-auth-step {
            display: flex;
            align-items: center;
            gap: 9px;
            margin: 0 0 15px;
            color: #817b73;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }

          .xaaj-auth-step strong {
            display: inline-flex;
            width: 22px;
            height: 22px;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #e7eee7;
            color: #2f7048;
            font-size: 8px;
          }

          @media (max-width: 900px) {
            .xaaj-auth-page {
              padding: 25px 16px 55px;
            }

            .xaaj-auth-layout {
              grid-template-columns: 1fr;
              max-width: 620px;
            }

            .xaaj-auth-editorial {
              min-height: 300px;
              padding: 32px;
            }

            .xaaj-auth-editorial::before {
              font-size: 250px;
              right: -30px;
              bottom: -80px;
            }

            .xaaj-auth-editorial::after {
              width: 150px;
              height: 150px;
              right: 25px;
              top: 70px;
            }

            .xaaj-auth-editorial h2 {
              font-size: 52px;
            }

            .xaaj-auth-editorial-footer {
              margin-top: 35px;
            }

            .xaaj-auth-form-panel {
              padding: 42px 30px 48px;
            }
          }

          @media (max-width: 560px) {
            .xaaj-auth-page {
              min-height: calc(100vh - 90px);
              padding: 12px 10px 40px;
            }

            .xaaj-auth-layout {
              border-radius: 18px;
            }

            .xaaj-auth-editorial {
              min-height: 250px;
              padding: 25px 22px;
            }

            .xaaj-auth-editorial h2 {
              font-size: 42px;
            }

            .xaaj-auth-editorial-copy p {
              max-width: 270px;
              margin-top: 14px;
              font-size: 10px;
            }

            .xaaj-auth-editorial-footer {
              display: none;
            }

            .xaaj-auth-form-panel {
              padding: 31px 21px 36px;
            }

            .xaaj-auth-nav {
              margin-bottom: 30px;
            }

            .xaaj-auth-nav a {
              min-width: 86px;
            }

            .xaaj-auth-fields {
              grid-template-columns: 1fr;
              gap: 16px;
            }

            .xaaj-auth-fields .full {
              grid-column: auto;
            }

            .xaaj-auth-title {
              font-size: 43px;
            }

            .xaaj-auth-lead {
              margin-bottom: 26px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .xaaj-auth-nav a,
            .xaaj-auth-field input,
            .xaaj-auth-submit {
              transition: none !important;
            }
          }        `}</style>
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

      /* Blog index: no cinematic hero video. Open the Blog page directly
         into the clean editorial listing shown in the reference design. */
      .xaaj-blog-page-content {
        margin-top: 56px;
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

        .xaaj-blog-page-content {
          margin-top: 38px;
        }
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
        <div className="xaaj-blog-content xaaj-blog-page-content">
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

  const { cart, total, clearCart, loadProducts } = useStore()
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()

  const previewQueryActive =
    new URLSearchParams(location.search).get('xaajPreview') === '1'

  const isAdminPreview =
    previewQueryActive || adminPreviewSessionActive

  useEffect(() => {
    if (previewQueryActive) {
      // Preview state is kept only in this loaded app instance.
      // It does not persist to normal users or other browser tabs.
      adminPreviewSessionActive = true
    }
  }, [previewQueryActive])

  // ==========================================================
  // LOGIN STATE
  // ==========================================================

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

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
  // PRODUCT REVIEW / FEEDBACK STATE
  // ==========================================================

  const [reviewingItem, setReviewingItem] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')

  const openReviewForm = (order, item) => {
    setReviewingItem({
      orderId: order?._id || order?.id,
      productId: item?.product,
      productName: item?.name || 'Product',
      image: item?.image || ''
    })
    setReviewRating(0)
    setReviewComment('')
    setReviewError('')
    setReviewMessage('')
  }

  const closeReviewForm = () => {
    if (reviewLoading) return
    setReviewingItem(null)
    setReviewRating(0)
    setReviewComment('')
    setReviewError('')
    setReviewMessage('')
  }

  const handleSubmitReview = async event => {
    event.preventDefault()

    if (!reviewingItem?.orderId || !reviewingItem?.productId) return

    if (!reviewRating) {
      setReviewError('Please select a rating from 1 to 5 stars.')
      return
    }

    try {
      setReviewLoading(true)
      setReviewError('')
      setReviewMessage('')

      const result = await reviewService.create({
        orderId: reviewingItem.orderId,
        productId: reviewingItem.productId,
        rating: reviewRating,
        comment: reviewComment
      })

      setOrders(currentOrders =>
        currentOrders.map(order => {
          const orderId = order?._id || order?.id
          if (String(orderId) !== String(reviewingItem.orderId)) return order

          return {
            ...order,
            items: Array.isArray(order.items)
              ? order.items.map(item =>
                  String(item.product) === String(reviewingItem.productId)
                    ? {
                        ...item,
                        reviewSubmitted: true,
                        reviewId: result?.review?._id || result?.data?.review?._id || null,
                        reviewedAt: new Date().toISOString()
                      }
                    : item
                )
              : order.items
          }
        })
      )

      // Refresh products so the latest rating/review count appears immediately
      // on Product Cards and Best-selling/New Arrivals sections.
      await loadProducts()

      setReviewMessage(result?.message || 'Thank you. Your review has been submitted.')

      window.setTimeout(() => {
        setReviewingItem(null)
        setReviewRating(0)
        setReviewComment('')
        setReviewMessage('')
      }, 900)
    } catch (error) {
      console.error('Review submission error:', error)
      setReviewError(
        error?.data?.message ||
        error?.message ||
        'Unable to submit your review. Please try again.'
      )
    } finally {
      setReviewLoading(false)
    }
  }

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

    if (isAdminPreview) {
      setPaymentError(
        'Admin Preview Mode: checkout and ordering are disabled.'
      )
      return
    }

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

        // Clear cart only after the COD order is successfully created.
        clearCart()

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

            // Clear cart only after Razorpay payment is verified successfully.
            clearCart()

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
  // ==========================================================
  // ABOUT US — PREMIUM BRAND EXPERIENCE
  // ==========================================================

  if (path === '/about') {
    return (
      <>
        <Header />

        <style>{`
          .xaaj-about {
            --ink: #25231f;
            --muted: #756f66;
            --paper: #f5f1e9;
            --paper-2: #ebe5da;
            --line: rgba(37,35,31,.14);
            --accent: #a84d35;
            background: var(--paper);
            color: var(--ink);
            overflow: hidden;
          }

          .xaaj-about *,
          .xaaj-about *::before,
          .xaaj-about *::after {
            box-sizing: border-box;
          }

          /* ================= HERO ================= */

          .xaaj-about-hero {
            width: min(1380px, calc(100% - 32px));
            min-height: 720px;
            margin: 16px auto 0;
            display: grid;
            grid-template-columns: .84fr 1.16fr;
            background: #e9e1d5;
            overflow: hidden;
          }

          .xaaj-about-hero-copy {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 74px clamp(34px, 6vw, 92px);
          }

          .xaaj-about-eyebrow {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 28px;
            color: var(--accent);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .28em;
            text-transform: uppercase;
          }

          .xaaj-about-eyebrow::before {
            content: '';
            width: 30px;
            height: 1px;
            background: currentColor;
          }

          .xaaj-about-hero h1 {
            max-width: 620px;
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(55px, 6.5vw, 94px);
            font-weight: 400;
            line-height: .91;
            letter-spacing: -.06em;
          }

          .xaaj-about-hero h1 em {
            color: var(--accent);
            font-style: italic;
          }

          .xaaj-about-hero-description {
            max-width: 475px;
            margin: 31px 0 0;
            color: #666057;
            font-size: 14px;
            line-height: 1.9;
          }

          .xaaj-about-hero-link {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            width: fit-content;
            margin-top: 32px;
            padding-bottom: 9px;
            border-bottom: 1px solid var(--ink);
            color: var(--ink);
            text-decoration: none;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .12em;
            text-transform: uppercase;
          }

          .xaaj-about-hero-link svg {
            transition: transform .25s ease;
          }

          .xaaj-about-hero-link:hover svg {
            transform: translateX(4px);
          }

          .xaaj-about-hero-number {
            position: absolute;
            right: 30px;
            bottom: 25px;
            color: rgba(37,35,31,.20);
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 74px;
            line-height: 1;
          }

          .xaaj-about-hero-visual {
            position: relative;
            min-height: 720px;
            overflow: hidden;
          }

          .xaaj-about-hero-visual img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            object-position: center;
            filter: saturate(.82);
            transition: transform 1.2s cubic-bezier(.22,1,.36,1);
          }

          .xaaj-about-hero:hover .xaaj-about-hero-visual img {
            transform: scale(1.035);
          }

          .xaaj-about-hero-badge {
            position: absolute;
            left: 28px;
            bottom: 28px;
            width: 112px;
            height: 112px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(255,255,255,.58);
            border-radius: 50%;
            background: rgba(37,35,31,.78);
            color: #fff;
            text-align: center;
            font-size: 8px;
            line-height: 1.55;
            letter-spacing: .14em;
            text-transform: uppercase;
            backdrop-filter: blur(7px);
          }

          .xaaj-about-hero-badge strong {
            display: block;
            margin-bottom: 2px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 20px;
            font-weight: 400;
            letter-spacing: 0;
          }

          /* ================= INTRO ================= */

          .xaaj-about-intro {
            width: min(1180px, calc(100% - 42px));
            margin: 0 auto;
            padding: 125px 0 118px;
            display: grid;
            grid-template-columns: .55fr 1.45fr;
            gap: 55px;
          }

          .xaaj-about-section-label {
            padding-top: 8px;
            color: var(--accent);
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .25em;
            text-transform: uppercase;
          }

          .xaaj-about-intro h2 {
            max-width: 870px;
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(40px, 5.4vw, 72px);
            font-weight: 400;
            line-height: .99;
            letter-spacing: -.055em;
          }

          .xaaj-about-intro h2 em {
            font-style: italic;
          }

          .xaaj-about-intro-text {
            max-width: 620px;
            margin-top: 30px;
            color: var(--muted);
            font-size: 15px;
            line-height: 1.9;
          }

          .xaaj-about-stat-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            margin-top: 52px;
            border-top: 1px solid var(--line);
            border-bottom: 1px solid var(--line);
          }

          .xaaj-about-stat {
            padding: 24px 22px 25px 0;
            border-right: 1px solid var(--line);
          }

          .xaaj-about-stat:not(:first-child) {
            padding-left: 22px;
          }

          .xaaj-about-stat:last-child {
            border-right: 0;
          }

          .xaaj-about-stat strong {
            display: block;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 25px;
            font-weight: 400;
          }

          .xaaj-about-stat span {
            display: block;
            margin-top: 7px;
            color: #817a70;
            font-size: 10px;
            line-height: 1.55;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

          /* ================= STORY IMAGE STRIP ================= */

          .xaaj-about-story {
            background: var(--ink);
            color: #fff;
            padding: 0;
          }

          .xaaj-about-story-grid {
            width: min(1380px, 100%);
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1.08fr .92fr;
            min-height: 690px;
          }

          .xaaj-about-story-image {
            min-height: 690px;
            overflow: hidden;
          }

          .xaaj-about-story-image img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            filter: saturate(.75);
          }

          .xaaj-about-story-copy {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 80px clamp(38px, 7vw, 100px);
          }

          .xaaj-about-story-copy .xaaj-about-section-label {
            color: #d58b76;
          }

          .xaaj-about-story-copy h2 {
            max-width: 590px;
            margin: 22px 0 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(42px, 5vw, 68px);
            font-weight: 400;
            line-height: .98;
            letter-spacing: -.055em;
          }

          .xaaj-about-story-copy h2 em {
            font-style: italic;
          }

          .xaaj-about-story-copy p {
            max-width: 530px;
            margin: 27px 0 0;
            color: rgba(255,255,255,.61);
            font-size: 14px;
            line-height: 1.9;
          }

          .xaaj-about-story-signature {
            margin-top: 38px;
            color: rgba(255,255,255,.38);
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 22px;
            font-style: italic;
          }

          /* ================= VALUES ================= */

          .xaaj-about-values {
            width: min(1180px, calc(100% - 42px));
            margin: 0 auto;
            padding: 125px 0 130px;
          }

          .xaaj-about-values-head {
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 50px;
            padding-bottom: 48px;
            border-bottom: 1px solid var(--line);
          }

          .xaaj-about-values h2 {
            max-width: 760px;
            margin: 18px 0 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(43px, 5.5vw, 73px);
            font-weight: 400;
            line-height: .97;
            letter-spacing: -.055em;
          }

          .xaaj-about-values-head p {
            max-width: 250px;
            margin: 0;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.75;
          }

          .xaaj-about-value-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .xaaj-about-value {
            position: relative;
            min-height: 280px;
            padding: 30px 38px 25px 0;
            border-right: 1px solid var(--line);
          }

          .xaaj-about-value:not(:first-child) {
            padding-left: 38px;
          }

          .xaaj-about-value:last-child {
            border-right: 0;
          }

          .xaaj-about-value-number {
            color: var(--accent);
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .2em;
          }

          .xaaj-about-value h3 {
            margin: 80px 0 11px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 27px;
            font-weight: 400;
          }

          .xaaj-about-value p {
            max-width: 270px;
            margin: 0;
            color: var(--muted);
            font-size: 13px;
            line-height: 1.8;
          }

          /* ================= CTA ================= */

          .xaaj-about-cta {
            position: relative;
            padding: 120px 20px 130px;
            background: #e8e0d4;
            text-align: center;
            overflow: hidden;
          }

          .xaaj-about-cta::before {
            content: 'XAAJ';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -53%);
            color: rgba(37,35,31,.045);
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(150px, 27vw, 400px);
            line-height: 1;
            white-space: nowrap;
            pointer-events: none;
          }

          .xaaj-about-cta-inner {
            position: relative;
            z-index: 1;
          }

          .xaaj-about-cta h2 {
            max-width: 850px;
            margin: 20px auto 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(48px, 6.3vw, 84px);
            font-weight: 400;
            line-height: .94;
            letter-spacing: -.06em;
          }

          .xaaj-about-cta h2 em {
            color: var(--accent);
            font-style: italic;
          }

          .xaaj-about-cta p {
            max-width: 500px;
            margin: 25px auto 0;
            color: var(--muted);
            font-size: 13px;
            line-height: 1.8;
          }

          .xaaj-about-cta-links {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 9px;
            margin-top: 34px;
          }

          .xaaj-about-cta-links a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 46px;
            padding: 0 20px;
            border: 1px solid rgba(37,35,31,.22);
            border-radius: 999px;
            color: var(--ink);
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            transition: .25s ease;
          }

          .xaaj-about-cta-links a:hover {
            background: var(--ink);
            border-color: var(--ink);
            color: #fff;
            transform: translateY(-2px);
          }

          /* ================= MOBILE ================= */

          @media (max-width: 800px) {
            .xaaj-about-hero {
              width: calc(100% - 20px);
              margin-top: 10px;
              min-height: auto;
              grid-template-columns: 1fr;
            }

            .xaaj-about-hero-copy {
              min-height: 520px;
              padding: 65px 28px 55px;
            }

            .xaaj-about-hero h1 {
              font-size: clamp(51px, 15vw, 70px);
            }

            .xaaj-about-hero-visual {
              min-height: 430px;
            }

            .xaaj-about-hero-badge {
              left: 20px;
              bottom: 20px;
            }

            .xaaj-about-intro {
              width: calc(100% - 30px);
              padding: 78px 0 75px;
              grid-template-columns: 1fr;
              gap: 28px;
            }

            .xaaj-about-intro h2 {
              font-size: clamp(40px, 12vw, 55px);
            }

            .xaaj-about-stat-row {
              grid-template-columns: 1fr;
            }

            .xaaj-about-stat,
            .xaaj-about-stat:not(:first-child) {
              padding: 20px 0;
              border-right: 0;
              border-bottom: 1px solid var(--line);
            }

            .xaaj-about-stat:last-child {
              border-bottom: 0;
            }

            .xaaj-about-story-grid {
              grid-template-columns: 1fr;
            }

            .xaaj-about-story-image {
              min-height: 480px;
            }

            .xaaj-about-story-copy {
              min-height: 560px;
              padding: 72px 28px;
            }

            .xaaj-about-story-copy h2 {
              font-size: clamp(42px, 12vw, 56px);
            }

            .xaaj-about-values {
              width: calc(100% - 30px);
              padding: 78px 0 82px;
            }

            .xaaj-about-values-head {
              display: block;
            }

            .xaaj-about-values-head p {
              margin-top: 25px;
            }

            .xaaj-about-value-grid {
              grid-template-columns: 1fr;
            }

            .xaaj-about-value,
            .xaaj-about-value:not(:first-child) {
              min-height: auto;
              padding: 27px 0 32px;
              border-right: 0;
              border-bottom: 1px solid var(--line);
            }

            .xaaj-about-value:last-child {
              border-bottom: 0;
            }

            .xaaj-about-value h3 {
              margin-top: 35px;
            }

            .xaaj-about-cta {
              padding: 82px 18px 90px;
            }
          }

          /* XAAJ V3 — editorial atelier redesign */
          .xaaj-about {
            --paper: #f4f0e8 !important;
            --paper-2: #e9e2d7 !important;
            --ink: #292825 !important;
            --muted: #746f67 !important;
            --line: rgba(41,40,37,.14) !important;
            --accent: #a84d35 !important;
            background: var(--paper) !important;
          }

          .xaaj-about-hero {
            width: min(1320px, calc(100% - 52px)) !important;
            min-height: min(760px, calc(100vh - 110px)) !important;
            margin: 26px auto 0 !important;
            grid-template-columns: 1.08fr .92fr !important;
            background: #e7dfd2 !important;
            border: 1px solid rgba(41,40,37,.10);
          }

          .xaaj-about-hero-visual {
            grid-column: 1 !important;
            grid-row: 1 !important;
            min-height: min(760px, calc(100vh - 110px)) !important;
            order: 0 !important;
          }

          .xaaj-about-hero-copy {
            grid-column: 2 !important;
            grid-row: 1 !important;
            min-height: min(760px, calc(100vh - 110px)) !important;
            padding: clamp(46px, 6vw, 92px) clamp(34px, 5vw, 76px) !important;
            justify-content: space-between !important;
            background: #e7dfd2 !important;
          }

          .xaaj-about-hero-visual::before {
            display: none !important;
          }

          .xaaj-about-hero-visual img {
            filter: saturate(.78) contrast(.97) !important;
            transform: scale(1.01);
          }

          .xaaj-about-hero:hover .xaaj-about-hero-visual img {
            transform: scale(1.045) !important;
          }

          .xaaj-about-hero-badge {
            left: 22px !important;
            bottom: 22px !important;
            width: 104px !important;
            height: 104px !important;
            border-radius: 50% !important;
            background: rgba(24,49,38,.88) !important;
            border-color: rgba(255,255,255,.45) !important;
          }

          .xaaj-about-hero h1 {
            max-width: 650px !important;
            font-size: clamp(58px, 6.1vw, 88px) !important;
            line-height: .86 !important;
            letter-spacing: -.06em !important;
          }

          .xaaj-about-hero h1 em {
            color: #a84d35 !important;
          }

          .xaaj-about-hero-description {
            max-width: 430px !important;
            margin-top: 25px !important;
            font-size: 13px !important;
            line-height: 1.85 !important;
          }

          .xaaj-about-hero-link {
            margin-top: 24px !important;
          }

          .xaaj-about-hero-number {
            right: 28px !important;
            bottom: 25px !important;
            font-size: 62px !important;
            color: rgba(41,40,37,.13) !important;
          }

          .xaaj-about-intro {
            width: min(1180px, calc(100% - 52px)) !important;
            padding: 125px 0 118px !important;
            grid-template-columns: 170px 1fr !important;
            gap: 70px !important;
          }

          .xaaj-about-intro h2 {
            max-width: 880px !important;
            font-size: clamp(46px, 5.4vw, 74px) !important;
            line-height: .96 !important;
          }

          .xaaj-about-intro-text {
            max-width: 620px !important;
            margin-top: 28px !important;
            font-size: 14px !important;
            line-height: 1.9 !important;
          }

          .xaaj-about-stat-row {
            margin-top: 52px !important;
          }

          .xaaj-about-stat {
            min-height: 132px !important;
            padding: 24px 22px 25px 0 !important;
          }

          .xaaj-about-stat strong {
            color: #a84d35 !important;
            font-size: 10px !important;
            letter-spacing: .18em !important;
          }

          .xaaj-about-stat span {
            margin-top: 32px !important;
            font-family: Georgia, 'Times New Roman', serif !important;
            font-size: 17px !important;
            color: #35332e !important;
          }

          .xaaj-about-story {
            background: #183126 !important;
          }

          .xaaj-about-story-grid {
            width: min(1320px, 100%) !important;
            min-height: 690px !important;
            grid-template-columns: .9fr 1.1fr !important;
          }

          .xaaj-about-story-image {
            grid-column: 2 !important;
            min-height: 690px !important;
          }

          .xaaj-about-story-copy {
            grid-column: 1 !important;
            grid-row: 1 !important;
            padding: 82px clamp(40px, 6vw, 92px) !important;
          }

          .xaaj-about-story-copy h2 {
            font-size: clamp(44px, 5vw, 70px) !important;
          }

          .xaaj-about-story-copy p {
            font-size: 13px !important;
            line-height: 1.9 !important;
          }

          .xaaj-about-values {
            width: min(1180px, calc(100% - 52px)) !important;
            padding: 120px 0 110px !important;
          }

          .xaaj-about-values-head {
            padding-bottom: 46px !important;
          }

          .xaaj-about-values h2 {
            font-size: clamp(45px, 5.3vw, 72px) !important;
          }

          .xaaj-about-value-grid {
            grid-template-columns: 1fr !important;
          }

          .xaaj-about-value {
            min-height: 0 !important;
            display: grid !important;
            grid-template-columns: 70px 1fr 1fr !important;
            gap: 28px !important;
            align-items: center !important;
            padding: 29px 0 !important;
            border-right: 0 !important;
            border-bottom: 1px solid var(--line) !important;
          }

          .xaaj-about-value:not(:first-child) {
            padding-left: 0 !important;
          }

          .xaaj-about-value:last-child {
            border-bottom: 0 !important;
          }

          .xaaj-about-value h3 {
            margin: 0 !important;
            font-size: 28px !important;
          }

          .xaaj-about-value p {
            max-width: 340px !important;
            margin: 0 !important;
          }

          .xaaj-about-cta {
            min-height: 430px !important;
            padding: 105px 20px 110px !important;
            background: #e7dfd2 !important;
          }

          .xaaj-about-cta h2 {
            font-size: clamp(48px, 6vw, 80px) !important;
          }

          .xaaj-about-cta-links a {
            border-radius: 0 !important;
            background: transparent !important;
            border: 0 !important;
            border-bottom: 1px solid rgba(41,40,37,.35) !important;
            padding: 9px 2px !important;
          }

          @media (max-width: 800px) {
            .xaaj-about-hero {
              width: calc(100% - 22px) !important;
              margin-top: 11px !important;
              grid-template-columns: 1fr !important;
            }

            .xaaj-about-hero-visual {
              grid-column: 1 !important;
              grid-row: 2 !important;
              min-height: 440px !important;
            }

            .xaaj-about-hero-copy {
              grid-column: 1 !important;
              grid-row: 1 !important;
              min-height: 530px !important;
              padding: 55px 28px 50px !important;
            }

            .xaaj-about-intro {
              width: calc(100% - 30px) !important;
              padding: 78px 0 76px !important;
              grid-template-columns: 1fr !important;
              gap: 25px !important;
            }

            .xaaj-about-story-grid {
              grid-template-columns: 1fr !important;
            }

            .xaaj-about-story-image {
              grid-column: 1 !important;
              grid-row: 1 !important;
              min-height: 470px !important;
            }

            .xaaj-about-story-copy {
              grid-column: 1 !important;
              grid-row: 2 !important;
              padding: 65px 28px 75px !important;
            }

            .xaaj-about-values {
              width: calc(100% - 30px) !important;
              padding: 78px 0 80px !important;
            }

            .xaaj-about-value {
              grid-template-columns: 50px 1fr !important;
              gap: 20px !important;
            }

            .xaaj-about-value p {
              grid-column: 2 !important;
            }

            .xaaj-about-cta {
              padding: 82px 18px 90px !important;
            }
          }

          /* XAAJ V2 — editorial refinement */
          .xaaj-about-hero {
            width: 100%;
            margin: 0;
            min-height: min(760px, calc(100vh - 112px));
            grid-template-columns: .78fr 1.22fr;
            background: #183126;
            border-radius: 0;
          }

          .xaaj-about-hero-copy {
            min-height: min(760px, calc(100vh - 112px));
            padding: clamp(34px,5vw,72px);
          }

          .xaaj-about-hero h1 {
            font-size: clamp(58px,6.7vw,94px);
            line-height: .86;
          }

          .xaaj-about-hero-visual {
            min-height: min(760px, calc(100vh - 112px));
          }

          .xaaj-about-hero-visual::before {
            content: '';
            position: absolute;
            z-index: 2;
            left: 0;
            top: 0;
            bottom: 0;
            width: 22%;
            background: linear-gradient(90deg, rgba(24,49,38,.35), transparent);
            pointer-events: none;
          }

          .xaaj-about-intro {
            width: min(1240px, calc(100% - 52px));
            padding: 135px 0 125px;
            grid-template-columns: .42fr 1.58fr;
            gap: 75px;
          }

          .xaaj-about-intro h2 {
            max-width: 900px;
            font-size: clamp(44px,5.7vw,78px);
          }

          .xaaj-about-intro-text {
            max-width: 680px;
            font-size: 15px;
          }

          .xaaj-about-stat-row {
            margin-top: 62px;
          }

          .xaaj-about-stat {
            min-height: 145px;
            padding-top: 28px;
          }

          .xaaj-about-stat strong {
            color: #a84d35;
            font-size: 11px;
            letter-spacing: .15em;
          }

          .xaaj-about-stat span {
            margin-top: 31px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 17px;
            letter-spacing: 0;
            text-transform: none;
            color: #35332e;
          }

          .xaaj-about-story-grid {
            width: 100%;
            min-height: 720px;
            grid-template-columns: 1.2fr .8fr;
          }

          .xaaj-about-story-image {
            min-height: 720px;
          }

          .xaaj-about-story-copy {
            padding: 82px clamp(40px,6vw,96px);
          }

          .xaaj-about-story-copy h2 {
            font-size: clamp(44px,5.2vw,72px);
          }

          .xaaj-about-values {
            width: min(1240px, calc(100% - 52px));
            padding: 130px 0 125px;
          }

          .xaaj-about-values-head {
            padding-bottom: 52px;
          }

          .xaaj-about-value-grid {
            grid-template-columns: 1fr;
          }

          .xaaj-about-value {
            min-height: 0;
            display: grid;
            grid-template-columns: 80px 1fr 1fr;
            gap: 28px;
            align-items: center;
            padding: 30px 0;
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .xaaj-about-value:not(:first-child) {
            padding-left: 0;
          }

          .xaaj-about-value:last-child {
            border-bottom: 0;
          }

          .xaaj-about-value h3 {
            margin: 0;
            font-size: 28px;
          }

          .xaaj-about-value p {
            max-width: 340px;
          }

          .xaaj-about-cta {
            min-height: 540px;
            padding: 110px 20px;
          }

          .xaaj-about-cta-links a {
            border-radius: 0;
            padding: 10px 0;
            min-height: 0;
          }

          @media (max-width: 800px) {
            .xaaj-about-hero,
            .xaaj-about-hero-copy,
            .xaaj-about-hero-visual {
              min-height: auto;
            }

            .xaaj-about-hero {
              grid-template-columns: 1fr;
            }

            .xaaj-about-hero-copy {
              min-height: 560px;
            }

            .xaaj-about-hero-visual {
              min-height: 470px;
            }

            .xaaj-about-intro {
              width: calc(100% - 30px);
              padding: 82px 0;
              grid-template-columns: 1fr;
              gap: 28px;
            }

            .xaaj-about-value {
              grid-template-columns: 55px 1fr;
            }

            .xaaj-about-value p {
              grid-column: 2;
            }
          }
        `}</style>

        <main className="xaaj-about">

          {/* HERO */}
          <section className="xaaj-about-hero">

            <div className="xaaj-about-hero-copy">
              <span className="xaaj-about-eyebrow">
                The XAAJ story
              </span>

              <h1>
                Everyday
                <br />
                objects,
                <br />
                <em>beautifully lived.</em>
              </h1>

              <p className="xaaj-about-hero-description">
                We believe the objects around your table should
                bring a little more warmth to ordinary moments.
                XAAJ creates thoughtful crockery for the way
                people actually live, gather and celebrate.
              </p>

              <Link className="xaaj-about-hero-link" to="/shop">
                Explore the collection
                <ArrowRight size={14} />
              </Link>

              <span className="xaaj-about-hero-number">
                01
              </span>
            </div>

            <div className="xaaj-about-hero-visual">
              <img
                src={heroImage}
                alt="XAAJ tableware arranged on a warm dining table"
              />

              <div className="xaaj-about-hero-badge">
                <div>
                  <strong>XAAJ</strong>
                  Made for
                  <br />
                  everyday rituals
                </div>
              </div>
            </div>

          </section>

          {/* PHILOSOPHY */}
          <section className="xaaj-about-intro">

            <div className="xaaj-about-section-label">
              02 — Our philosophy
            </div>

            <div>
              <h2>
                The everyday deserves
                <em> beautiful things.</em>
              </h2>

              <p className="xaaj-about-intro-text">
                XAAJ began with a simple idea: beauty should not
                be reserved for special occasions. From the first
                cup of tea in the morning to a table shared with
                people you love, the pieces we use every day
                can make ordinary rituals feel meaningful.
              </p>

              <div className="xaaj-about-stat-row">

                <div className="xaaj-about-stat">
                  <strong>01</strong>
                  <span>Thoughtful design</span>
                </div>

                <div className="xaaj-about-stat">
                  <strong>02</strong>
                  <span>Indian craft</span>
                </div>

                <div className="xaaj-about-stat">
                  <strong>03</strong>
                  <span>Made to be lived with</span>
                </div>

              </div>
            </div>

          </section>

          {/* STORY */}
          <section className="xaaj-about-story">

            <div className="xaaj-about-story-grid">

              <div className="xaaj-about-story-image">
                <img
                  src={tableImage}
                  alt="Warm table setting with handcrafted crockery"
                />
              </div>

              <div className="xaaj-about-story-copy">

                <span className="xaaj-about-section-label">
                  03 — The XAAJ way
                </span>

                <h2>
                  For morning tea,
                  <br />
                  long lunches &
                  <br />
                  <em>everything between.</em>
                </h2>

                <p>
                  We work with makers and draw inspiration from
                  the textures, colours and quiet character of
                  Indian craft. Our collections are designed
                  to feel contemporary while still carrying
                  a sense of warmth and familiarity.
                </p>

                <p>
                  Small variations in colour, texture and form
                  are part of the charm. They are little reminders
                  that the objects on your table have a human story.
                </p>

                <div className="xaaj-about-story-signature">
                  — with care, XAAJ
                </div>

              </div>

            </div>

          </section>

          {/* VALUES */}
          <section className="xaaj-about-values">

            <div className="xaaj-about-values-head">

              <div>
                <span className="xaaj-about-section-label">
                  04 — What we believe
                </span>

                <h2>
                  Less clutter.
                  <br />
                  More <em>meaning.</em>
                </h2>
              </div>

              <p>
                Every collection starts with the same question:
                will this make the everyday table feel a little
                more special?
              </p>

            </div>

            <div className="xaaj-about-value-grid">

              <div className="xaaj-about-value">
                <span className="xaaj-about-value-number">
                  01
                </span>

                <h3>
                  Craft over clutter
                </h3>

                <p>
                  Thoughtful pieces that earn their place
                  at your table.
                </p>
              </div>

              <div className="xaaj-about-value">
                <span className="xaaj-about-value-number">
                  02
                </span>

                <h3>
                  Beauty with purpose
                </h3>

                <p>
                  Form, texture and function working together
                  naturally.
                </p>
              </div>

              <div className="xaaj-about-value">
                <span className="xaaj-about-value-number">
                  03
                </span>

                <h3>
                  Made to keep
                </h3>

                <p>
                  Objects you reach for often, share freely
                  and enjoy for years.
                </p>
              </div>

            </div>

          </section>

          {/* CTA */}
          <section className="xaaj-about-cta">

            <div className="xaaj-about-cta-inner">

              <span className="xaaj-about-section-label">
                05 — Come say hello
              </span>

              <h2>
                Your table tells a story.
                <br />
                <em>Make it yours.</em>
              </h2>

              <p>
                Questions about an order, a product or simply
                want to say hello? Our team is always happy to help.
              </p>

              <div className="xaaj-about-cta-links">

                <a href="mailto:customercare@xaaj.in">
                  Email us
                </a>

                <a href="tel:+919899446117">
                  +91 9899446117
                </a>

                <Link to="/contact">
                  Contact us
                  <ArrowRight
                    size={13}
                    style={{ marginLeft: 7 }}
                  />
                </Link>

              </div>

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

    if (isAdminPreview) {
      return (
        <SimplePage
          eyebrow="Admin Preview Mode"
          title="Checkout is disabled."
        >
          <p className="lead">
            You are viewing the XAAJ storefront from the
            Admin Live Store preview. Product purchasing,
            checkout and payment are disabled in this mode.
          </p>

          <Button
            to="/"
            onClick={() => {
              window.sessionStorage.removeItem(
                'xaaj-admin-preview'
              )
            }}
          >
            Back to store
          </Button>
        </SimplePage>
      )
    }

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

                    .xaaj-feedback-list {
                      display: grid;
                      gap: 10px;
                      width: 100%;
                      margin-top: 4px;
                      padding-top: 4px;
                    }

                    .xaaj-feedback-item {
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      gap: 14px;
                      padding: 12px 13px;
                      border: 1px solid rgba(41,40,37,.08);
                      border-radius: 15px;
                      background: rgba(255,255,255,.72);
                    }

                    .xaaj-feedback-product {
                      display: flex;
                      align-items: center;
                      gap: 11px;
                      min-width: 0;
                    }

                    .xaaj-feedback-product img,
                    .xaaj-feedback-placeholder {
                      width: 46px;
                      height: 46px;
                      flex: 0 0 46px;
                      border-radius: 10px;
                      object-fit: cover;
                      background: #f0ece5;
                    }

                    .xaaj-feedback-placeholder {
                      display: grid;
                      place-items: center;
                      font-size: 9px;
                      letter-spacing: .12em;
                      color: #77736b;
                    }

                    .xaaj-feedback-product strong {
                      display: block;
                      max-width: 280px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      font-size: 13px;
                    }

                    .xaaj-feedback-product small {
                      display: block;
                      margin-top: 3px;
                      color: #77736b;
                      font-size: 11px;
                    }

                    .xaaj-feedback-button {
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                      gap: 7px;
                      min-height: 38px;
                      padding: 0 14px;
                      border: 1px solid rgba(41,40,37,.18);
                      border-radius: 999px;
                      background: #292824;
                      color: #fff;
                      font: inherit;
                      font-size: 11px;
                      font-weight: 700;
                      cursor: pointer;
                      white-space: nowrap;
                    }

                    .xaaj-reviewed-badge {
                      display: inline-flex;
                      align-items: center;
                      gap: 6px;
                      min-height: 36px;
                      padding: 0 12px;
                      border: 1px solid rgba(61,105,77,.18);
                      border-radius: 999px;
                      background: rgba(61,105,77,.07);
                      color: #3d694d;
                      font-size: 11px;
                      font-weight: 700;
                      white-space: nowrap;
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

                            {status === 'delivered' && Array.isArray(order.items) && (
                              <div className="xaaj-feedback-list">
                                {order.items.map((item, itemIndex) => (
                                  <div className="xaaj-feedback-item" key={`${orderId}-${item.product || itemIndex}`}>
                                    <div className="xaaj-feedback-product">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name || 'Product'} />
                                      ) : (
                                        <div className="xaaj-feedback-placeholder">XAAJ</div>
                                      )}
                                      <div>
                                        <strong>{item.name || 'Product'}</strong>
                                        <small>Qty: {item.quantity || 1}</small>
                                      </div>
                                    </div>

                                    {item.reviewSubmitted ? (
                                      <span className="xaaj-reviewed-badge">
                                        <Check size={14} />
                                        Reviewed
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        className="xaaj-feedback-button"
                                        onClick={() => openReviewForm(order, item)}
                                      >
                                        <Star size={14} />
                                        Give Feedback
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </>
              )}
          </div>

          {reviewingItem && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="xaaj-review-title"
              onClick={event => {
                if (event.target === event.currentTarget) closeReviewForm()
              }}
              style={{
                position: 'fixed', inset: 0, zIndex: 99999, display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '20px',
                background: 'rgba(35,32,28,.48)', backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{
                position: 'relative', width: 'min(100%, 480px)', padding: '30px',
                border: '1px solid #e8e0d5', borderRadius: '24px',
                background: '#fffdf9', boxShadow: '0 30px 80px rgba(41,40,37,.22)'
              }}>
                <button
                  type="button" onClick={closeReviewForm} disabled={reviewLoading}
                  aria-label="Close review"
                  style={{
                    position: 'absolute', top: '15px', right: '15px', width: '35px', height: '35px',
                    display: 'grid', placeItems: 'center', border: '1px solid #e5ddd2',
                    borderRadius: '50%', background: '#fff', color: '#292824', cursor: 'pointer'
                  }}
                >
                  <X size={16} strokeWidth={1.5} />
                </button>

                <span className="eyebrow">Your experience</span>
                <h2 id="xaaj-review-title" style={{
                  margin: '9px 45px 8px 0', fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: '30px', lineHeight: 1.2, fontWeight: 400
                }}>
                  How did you like it?
                </h2>
                <p style={{ margin: '0 0 20px', color: '#706d67', fontSize: '14px' }}>
                  {reviewingItem.productName}
                </p>

                <form onSubmit={handleSubmitReview}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '8px 0 18px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star} type="button" onClick={() => setReviewRating(star)}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        style={{
                          width: '42px', height: '42px', border: 0, background: 'transparent',
                          color: star <= reviewRating ? '#b84d32' : '#c9c1b7',
                          cursor: 'pointer', fontSize: '29px', lineHeight: 1
                        }}
                      >★</button>
                    ))}
                  </div>

                  <p style={{ minHeight: '20px', margin: '-5px 0 16px', textAlign: 'center', fontSize: '12px', color: '#77736b' }}>
                    {reviewRating ? `${reviewRating} out of 5` : 'Select your rating'}
                  </p>

                  <textarea
                    value={reviewComment}
                    onChange={event => setReviewComment(event.target.value)}
                    maxLength={1000} rows={5}
                    placeholder="Tell us a little about your experience (optional)"
                    disabled={reviewLoading}
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '14px 15px',
                      border: '1px solid #ddd4c8', borderRadius: '14px', background: '#fff',
                      color: '#292824', outline: 'none', resize: 'vertical', font: 'inherit', lineHeight: 1.6
                    }}
                  />

                  {reviewError && <p style={{ margin: '12px 0 0', color: '#b42318', fontSize: '13px' }}>{reviewError}</p>}
                  {reviewMessage && <p style={{ margin: '12px 0 0', color: '#3d694d', fontSize: '13px' }}>{reviewMessage}</p>}

                  <button type="submit" className="button" disabled={reviewLoading} style={{ width: '100%', marginTop: '18px', justifyContent: 'center' }}>
                    {reviewLoading ? 'Submitting...' : 'Submit review'}
                    {!reviewLoading && <ArrowRight size={15} />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </SimplePage>
      )
    }

    return (
      <SimplePage
        auth
        eyebrow="Welcome back"
        title="Sign in"
      >
        <div className="xaaj-auth-layout">
          <section className="xaaj-auth-editorial">
            <div className="xaaj-auth-mark">
              <i />
              XAAJ · STORIES CRAFTED IN EARTH
            </div>

            <div className="xaaj-auth-editorial-copy">
              <span className="xaaj-auth-editorial-eyebrow">
                The everyday, considered
              </span>

              <h2>
                Make room
                <br />
                <em>for beautiful.</em>
              </h2>

              <p>
                Your saved pieces, orders and details —
                quietly kept in one place.
              </p>
            </div>

            <div className="xaaj-auth-editorial-footer">
              <b>01</b>
              <span className="xaaj-auth-editorial-dot" />
              Thoughtfully made tableware
              <span className="xaaj-auth-editorial-dot" />
              India
            </div>
          </section>

          <section className="xaaj-auth-form-panel">
            <div className="xaaj-auth-form-inner">
              <nav className="xaaj-auth-nav" aria-label="Account navigation">
                <Link className="active" to="/account">Sign in</Link>
                <Link to="/register">Create account</Link>
              </nav>

              <span className="xaaj-auth-kicker">
                Welcome back
              </span>

              <h1 className="xaaj-auth-title">
                Sign in.
              </h1>

              <p className="xaaj-auth-lead">
                Enter your email and password to continue
                to your XAAJ account.
              </p>

              <form
                className="xaaj-auth-form"
                onSubmit={handleLogin}
              >
                <div className="xaaj-auth-field">
                  <label htmlFor="xaaj-login-email">
                    Email address
                  </label>
                  <input
                    id="xaaj-login-email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="xaaj-auth-field">
                  <label htmlFor="xaaj-login-password">
                    Password
                  </label>

                  <div className="xaaj-auth-input-wrap">
                    <input
                      id="xaaj-login-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Your password"
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      style={{ paddingRight: '62px' }}
                      required
                    />

                    <button
                      type="button"
                      className="xaaj-auth-password-toggle"
                      onClick={() => setShowLoginPassword(value => !value)}
                    >
                      {showLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="xaaj-auth-error">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="xaaj-auth-submit"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Continue to XAAJ'}
                  {!loading && <ArrowRight size={14} />}
                </button>
              </form>

              <div className="xaaj-auth-secondary">
                <span />
                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <p className="xaaj-auth-switch">
                New to XAAJ?
                <Link to="/register">
                  Create your account
                </Link>
              </p>

              <div className="xaaj-auth-trust">
                <span>Secure</span>
                <span>·</span>
                <span>Private</span>
                <span>·</span>
                <span>Made for XAAJ</span>
              </div>
            </div>
          </section>
        </div>
      </SimplePage>
    )
  }

  // ==========================================================
  // REGISTER
  // ==========================================================

  if (path === '/register') {
    return (
      <SimplePage
        auth
        eyebrow="Join XAAJ"
        title="Create account"
      >
        <div className="xaaj-auth-layout">
          <section className="xaaj-auth-editorial">
            <div className="xaaj-auth-mark">
              <i />
              XAAJ · STORIES CRAFTED IN EARTH
            </div>

            <div className="xaaj-auth-editorial-copy">
              <span className="xaaj-auth-editorial-eyebrow">
                Made for everyday rituals
              </span>

              <h2>
                Begin with
                <br />
                <em>something beautiful.</em>
              </h2>

              <p>
                Create your account once. We will keep
                your details ready for every future order.
              </p>
            </div>

            <div className="xaaj-auth-editorial-footer">
              <b>01</b>
              <span className="xaaj-auth-editorial-dot" />
              Thoughtfully made tableware
              <span className="xaaj-auth-editorial-dot" />
              India
            </div>
          </section>

          <section className="xaaj-auth-form-panel">
            <div className="xaaj-auth-form-inner">
              <nav className="xaaj-auth-nav" aria-label="Account navigation">
                <Link to="/account">Sign in</Link>
                <Link className="active" to="/register">Create account</Link>
              </nav>

              <span className="xaaj-auth-kicker">
                Join XAAJ
              </span>

              <h1 className="xaaj-auth-title">
                Create account.
              </h1>

              <p className="xaaj-auth-lead">
                A few details now means a smoother checkout
                and a more personal XAAJ experience later.
              </p>

              <form
                className="xaaj-auth-form"
                onSubmit={handleRegister}
              >
                <div className="xaaj-auth-section-label">
                  Your details
                </div>

                <div className="xaaj-auth-fields">
                  <div className="xaaj-auth-field">
                    <label htmlFor="xaaj-register-name">
                      Full name
                    </label>
                    <input
                      id="xaaj-register-name"
                      value={registerName}
                      onChange={e => setRegisterName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="xaaj-auth-field">
                    <label htmlFor="xaaj-register-phone">
                      Phone
                    </label>
                    <input
                      id="xaaj-register-phone"
                      value={registerPhone}
                      onChange={e =>
                        setRegisterPhone(
                          e.target.value.replace(/\D/g, '').slice(0, 10)
                        )
                      }
                      placeholder="10-digit number"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="xaaj-auth-field full">
                    <label htmlFor="xaaj-register-email">
                      Email address
                    </label>
                    <input
                      id="xaaj-register-email"
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="xaaj-auth-field full">
                    <label htmlFor="xaaj-register-password">
                      Password
                    </label>

                    <div className="xaaj-auth-input-wrap">
                      <input
                        id="xaaj-register-password"
                        value={registerPassword}
                        onChange={e => setRegisterPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        type={showRegisterPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        style={{ paddingRight: '62px' }}
                        required
                      />

                      <button
                        type="button"
                        className="xaaj-auth-password-toggle"
                        onClick={() => setShowRegisterPassword(value => !value)}
                      >
                        {showRegisterPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="xaaj-auth-section-label">
                  Delivery details
                </div>

                <div className="xaaj-auth-fields">
                  <div className="xaaj-auth-field full">
                    <label htmlFor="xaaj-register-address">
                      Address
                    </label>
                    <input
                      id="xaaj-register-address"
                      value={registerAddress}
                      onChange={e => setRegisterAddress(e.target.value)}
                      placeholder="House / street / locality"
                      autoComplete="street-address"
                      required
                    />
                  </div>

                  <div className="xaaj-auth-field">
                    <label htmlFor="xaaj-register-city">
                      City
                    </label>
                    <input
                      id="xaaj-register-city"
                      value={registerCity}
                      onChange={e => setRegisterCity(e.target.value)}
                      placeholder="City"
                      autoComplete="address-level2"
                      required
                    />
                  </div>

                  <div className="xaaj-auth-field">
                    <label htmlFor="xaaj-register-state">
                      State
                    </label>
                    <input
                      id="xaaj-register-state"
                      value={registerState}
                      onChange={e => setRegisterState(e.target.value)}
                      placeholder="State"
                      autoComplete="address-level1"
                      required
                    />
                  </div>

                  <div className="xaaj-auth-field full">
                    <label htmlFor="xaaj-register-pin">
                      PIN code
                    </label>
                    <input
                      id="xaaj-register-pin"
                      value={registerPin}
                      onChange={e =>
                        setRegisterPin(
                          e.target.value.replace(/\D/g, '').slice(0, 6)
                        )
                      }
                      placeholder="6-digit PIN code"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                {registerError && (
                  <p className="xaaj-auth-error">
                    {registerError}
                  </p>
                )}

                <button
                  type="submit"
                  className="xaaj-auth-submit"
                  disabled={registerLoading}
                >
                  {registerLoading
                    ? 'Creating account...'
                    : 'Create my XAAJ account'}
                  {!registerLoading && <ArrowRight size={14} />}
                </button>
              </form>

              <p className="xaaj-auth-switch">
                Already have an account?
                <Link to="/account">
                  Sign in
                </Link>
              </p>

              <div className="xaaj-auth-trust">
                <span>Secure</span>
                <span>·</span>
                <span>Email verification</span>
                <span>·</span>
                <span>Private</span>
              </div>
            </div>
          </section>
        </div>
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
  // CONTACT — PREMIUM CONTACT EXPERIENCE
  // ==========================================================

  if (path === '/contact') {
    return (
      <>
        <Header />

        <style>{`
          /* ==========================================================
             XAAJ CONTACT — ULTRA PREMIUM EDITORIAL CONTACT EXPERIENCE
             ========================================================== */

          .xaaj-contact-page {
            --contact-ink: #1d2d25;
            --contact-green: #183126;
            --contact-paper: #f2eee5;
            --contact-white: #fbfaf6;
            --contact-muted: #8b877f;
            --contact-line: rgba(29,45,37,.15);
            background: var(--contact-paper);
            color: #292824;
            overflow: hidden;
          }

          /* Hero: removes the empty feeling above the form with a strong
             editorial composition rather than another generic card. */
          .xaaj-contact-hero {
            position: relative;
            min-height: 430px;
            width: 100%;
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(360px, .85fr);
            align-items: end;
            padding: 78px clamp(28px, 7vw, 110px) 74px;
            background: var(--contact-green);
            color: #f5f0e7;
            overflow: hidden;
          }

          .xaaj-contact-hero::before {
            content: 'X';
            position: absolute;
            right: 2vw;
            bottom: -18vw;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(300px, 43vw, 700px);
            font-weight: 400;
            line-height: .72;
            color: transparent;
            -webkit-text-stroke: 1px rgba(245,240,231,.08);
            pointer-events: none;
          }

          .xaaj-contact-hero::after {
            content: '';
            position: absolute;
            inset: 18px;
            border: 1px solid rgba(245,240,231,.10);
            pointer-events: none;
          }

          .xaaj-contact-hero-copy,
          .xaaj-contact-hero-details {
            position: relative;
            z-index: 1;
          }

          .xaaj-contact-kicker {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            color: #d69b83;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .24em;
            text-transform: uppercase;
          }

          .xaaj-contact-kicker::before {
            content: '';
            width: 34px;
            height: 1px;
            background: currentColor;
          }

          .xaaj-contact-hero h1 {
            max-width: 850px;
            margin: 22px 0 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(60px, 8.2vw, 118px);
            font-weight: 400;
            line-height: .79;
            letter-spacing: -.055em;
          }

          .xaaj-contact-hero h1 em {
            color: #d69b83;
            font-style: italic;
          }

          .xaaj-contact-hero-details {
            justify-self: end;
            width: min(430px, 100%);
            padding-left: 42px;
            border-left: 1px solid rgba(245,240,231,.17);
          }

          .xaaj-contact-hero-details p {
            max-width: 390px;
            margin: 0;
            color: rgba(245,240,231,.68);
            font-size: 14px;
            line-height: 1.85;
          }

          .xaaj-contact-hero-links {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 26px;
            margin-top: 34px;
          }

          .xaaj-contact-hero-links a {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(245,240,231,.16);
            color: #f5f0e7;
            text-decoration: none;
            font-size: 12px;
            transition: border-color .3s ease, color .3s ease, transform .3s ease;
          }

          .xaaj-contact-hero-links a:hover {
            color: #d69b83;
            border-color: rgba(214,155,131,.6);
            transform: translateY(-2px);
          }

          .xaaj-contact-hero-links small {
            display: block;
            margin-bottom: 5px;
            color: rgba(245,240,231,.42);
            font-size: 8px;
            letter-spacing: .16em;
            text-transform: uppercase;
          }

          .xaaj-contact-hero-links strong {
            display: block;
            font-weight: 500;
            letter-spacing: .01em;
          }

          /* Form stage overlaps the hero for a luxury editorial finish. */
          .xaaj-contact-content {
            position: relative;
            z-index: 3;
            width: min(1240px, calc(100% - 52px));
            /* Keep a deliberate breathing space between the green hero and the white form. */
            margin: 30px auto 0;
            padding: 0 0 70px;
          }

          .xaaj-contact-form-head {
            display: grid;
            grid-template-columns: minmax(0, 1.1fr) minmax(280px, .9fr);
            gap: 50px;
            padding: 58px 60px 50px;
            background: var(--contact-white);
            border-bottom: 1px solid var(--contact-line);
          }

          .xaaj-contact-index {
            display: block;
            margin-bottom: 16px;
            color: #a84d35;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .2em;
            text-transform: uppercase;
          }

          .xaaj-contact-form-head h2 {
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(42px, 5vw, 70px);
            font-weight: 400;
            line-height: .9;
            letter-spacing: -.045em;
          }

          .xaaj-contact-form-head h2 em,
          .xaaj-contact-care h3 em {
            font-style: italic;
            font-weight: 400;
          }

          .xaaj-contact-form-intro {
            align-self: end;
            padding-left: 34px;
            border-left: 1px solid var(--contact-line);
          }

          .xaaj-contact-form-intro p {
            margin: 0;
            max-width: 430px;
            color: #66625c;
            font-size: 14px;
            line-height: 1.8;
          }

          .xaaj-contact-form-note {
            display: block;
            margin-top: 22px;
            color: #a09a90;
            font-size: 10px;
            letter-spacing: .02em;
          }

          .xaaj-contact-form-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.55fr) minmax(300px, .72fr);
            background: var(--contact-white);
            border-bottom: 1px solid var(--contact-line);
          }

          .xaaj-contact-form-panel {
            min-width: 0;
            padding: 52px 60px 56px;
            border-right: 1px solid var(--contact-line);
          }

          .xaaj-contact-form-fields {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 32px 28px;
          }

          .xaaj-contact-field {
            position: relative;
            display: grid;
            gap: 10px;
            min-width: 0;
          }

          .xaaj-contact-field-wide {
            grid-column: 1 / -1;
          }

          .xaaj-contact-field > span {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #292824;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

          .xaaj-contact-field > span b {
            color: #a84d35;
            font-size: 9px;
            font-weight: 700;
          }

          .xaaj-contact-field > span i {
            color: #a84d35;
            font-style: normal;
          }

          .xaaj-contact-field input,
          .xaaj-contact-field textarea {
            width: 100%;
            box-sizing: border-box;
            border: 0;
            border-bottom: 1px solid #c9c3b9;
            border-radius: 0;
            padding: 13px 0 14px;
            background: transparent;
            color: #292824;
            font: inherit;
            font-size: 14px;
            line-height: 1.5;
            outline: none;
            transition: border-color .3s ease, padding .3s ease;
          }

          .xaaj-contact-field input::placeholder,
          .xaaj-contact-field textarea::placeholder {
            color: #aaa49b;
          }

          .xaaj-contact-field input:focus,
          .xaaj-contact-field textarea:focus {
            border-bottom-color: var(--contact-green);
          }

          .xaaj-contact-field textarea {
            min-height: 142px;
            resize: vertical;
          }

          .xaaj-contact-field small {
            justify-self: end;
            margin-top: -4px;
            color: #aaa49b;
            font-size: 9px;
            letter-spacing: .05em;
          }

          .xaaj-contact-submit-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-top: 38px;
            padding-top: 22px;
            border-top: 1px solid var(--contact-line);
          }

          .xaaj-contact-submit-row > span {
            color: #99938a;
            font-size: 10px;
            letter-spacing: .04em;
          }

          .xaaj-contact-submit-row button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 28px;
            min-width: 205px;
            min-height: 52px;
            padding: 0 20px;
            border: 0;
            border-radius: 0;
            background: var(--contact-green);
            color: #fff;
            font: inherit;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .08em;
            text-transform: uppercase;
            cursor: pointer;
            transition: background .3s ease, transform .3s ease, gap .3s ease;
          }

          .xaaj-contact-submit-row button:hover:not(:disabled) {
            background: #274839;
            gap: 36px;
            transform: translateY(-2px);
          }

          .xaaj-contact-submit-row button:disabled {
            cursor: wait;
            opacity: .62;
          }

          .xaaj-contact-care {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 100%;
            padding: 52px 42px 44px;
            background: var(--contact-green);
            color: #f5f0e7;
            overflow: hidden;
          }

          .xaaj-contact-care::after {
            content: 'X';
            position: absolute;
            right: -35px;
            bottom: -60px;
            font-family: Georgia, serif;
            font-size: 300px;
            line-height: .7;
            color: transparent;
            -webkit-text-stroke: 1px rgba(245,240,231,.07);
            pointer-events: none;
          }

          .xaaj-contact-care-top,
          .xaaj-contact-care-links,
          .xaaj-contact-address {
            position: relative;
            z-index: 1;
          }

          .xaaj-contact-care .xaaj-contact-index {
            color: #d69b83;
          }

          .xaaj-contact-monogram {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            margin: 42px 0 24px;
            border: 1px solid rgba(245,240,231,.2);
            overflow: hidden;
            background: rgba(245,240,231,.035);
          }

          .xaaj-contact-monogram img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 7px;
            filter: brightness(0) invert(1);
          }

          .xaaj-contact-care h3 {
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(34px, 3.3vw, 48px);
            font-weight: 400;
            line-height: .93;
            letter-spacing: -.035em;
          }

          .xaaj-contact-care-top p {
            max-width: 330px;
            margin: 22px 0 0;
            color: rgba(245,240,231,.60);
            font-size: 13px;
            line-height: 1.8;
          }

          .xaaj-contact-care-links {
            display: grid;
            gap: 0;
            margin-top: 54px;
          }

          .xaaj-contact-care-links a {
            display: grid;
            grid-template-columns: 24px 1fr 15px;
            align-items: center;
            gap: 12px;
            padding: 17px 0;
            border-top: 1px solid rgba(245,240,231,.13);
            color: #f5f0e7;
            text-decoration: none;
            transition: color .25s ease, padding .3s ease, border-color .25s ease;
          }

          .xaaj-contact-care-links a:last-child {
            border-bottom: 1px solid rgba(245,240,231,.13);
          }

          .xaaj-contact-care-links a:hover {
            padding-left: 5px;
            color: #d69b83;
            border-color: rgba(214,155,131,.38);
          }

          .xaaj-contact-care-links small,
          .xaaj-contact-address small {
            display: block;
            margin-bottom: 5px;
            color: rgba(245,240,231,.42);
            font-size: 8px;
            letter-spacing: .16em;
            text-transform: uppercase;
          }

          .xaaj-contact-care-links strong {
            font-size: 12px;
            font-weight: 500;
          }

          .xaaj-contact-address {
            margin-top: 42px;
            padding-top: 22px;
            border-top: 1px solid rgba(245,240,231,.13);
          }

          .xaaj-contact-address p {
            margin: 0;
            color: rgba(245,240,231,.66);
            font-size: 11px;
            line-height: 1.7;
          }

          .xaaj-contact-response-note {
            padding: 18px 0 0;
            color: #918b82;
            font-size: 10px;
            line-height: 1.7;
          }

          /* Success/error dialog */
          .xaaj-contact-popup {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: rgba(24,29,25,.58);
            backdrop-filter: blur(10px);
          }

          .xaaj-contact-popup-card {
            position: relative;
            width: min(100%, 470px);
            padding: 48px 36px 34px;
            text-align: center;
            background: #fbfaf6;
            border: 1px solid rgba(41,40,37,.12);
            box-shadow: 0 30px 100px rgba(0,0,0,.20);
          }

          .xaaj-contact-popup-close {
            position: absolute;
            top: 13px;
            right: 15px;
            width: 30px;
            height: 30px;
            border: 0;
            background: transparent;
            color: #77716a;
            font-size: 23px;
            cursor: pointer;
          }

          .xaaj-contact-popup-mark {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
            border: 1px solid #d9d0c5;
            color: #a84d35;
            font-family: Georgia, serif;
            font-size: 22px;
          }

          .xaaj-contact-popup-brand {
            display: block;
            margin-bottom: 10px;
            color: #a84d35;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .25em;
          }

          .xaaj-contact-popup-card h3 {
            margin: 0 0 13px;
            color: #292824;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 30px;
            font-weight: 400;
          }

          .xaaj-contact-popup-card p {
            max-width: 390px;
            margin: 0 auto;
            color: #706d67;
            font-size: 14px;
            line-height: 1.75;
          }

          .xaaj-contact-popup-rule {
            width: 54px;
            height: 1px;
            margin: 24px auto;
            background: #d9d0c5;
          }

          .xaaj-contact-popup-action {
            min-width: 140px;
            min-height: 44px;
            padding: 0 22px;
            border: 0;
            background: var(--contact-green);
            color: #fff;
            font-size: 11px;
            letter-spacing: .08em;
            text-transform: uppercase;
            cursor: pointer;
          }

          @media (max-width: 900px) {
            .xaaj-contact-hero {
              min-height: 510px;
              grid-template-columns: 1fr;
              align-items: end;
              gap: 38px;
              padding: 70px 28px 65px;
            }

            .xaaj-contact-hero-details {
              justify-self: start;
              width: min(560px, 100%);
              padding-left: 0;
              padding-top: 24px;
              border-left: 0;
              border-top: 1px solid rgba(245,240,231,.17);
            }

            .xaaj-contact-content {
              width: calc(100% - 32px);
              margin-top: -55px;
            }

            .xaaj-contact-form-head {
              grid-template-columns: 1fr;
              gap: 30px;
              padding: 42px 34px;
            }

            .xaaj-contact-form-intro {
              padding-left: 0;
              padding-top: 24px;
              border-left: 0;
              border-top: 1px solid var(--contact-line);
            }

            .xaaj-contact-form-grid {
              grid-template-columns: 1fr;
            }

            .xaaj-contact-form-panel {
              padding: 42px 34px 46px;
              border-right: 0;
              border-bottom: 1px solid var(--contact-line);
            }

            .xaaj-contact-care {
              min-height: 540px;
              padding: 44px 34px;
            }
          }

          @media (max-width: 560px) {
            .xaaj-contact-hero {
              min-height: 570px;
              padding: 56px 20px 50px;
            }

            .xaaj-contact-hero::after {
              inset: 12px;
            }

            .xaaj-contact-hero h1 {
              font-size: clamp(55px, 17vw, 78px);
              line-height: .84;
            }

            .xaaj-contact-hero-links {
              grid-template-columns: 1fr;
              gap: 16px;
              margin-top: 26px;
            }

            .xaaj-contact-content {
              width: calc(100% - 22px);
              margin-top: -34px;
            }

            .xaaj-contact-form-head {
              padding: 34px 22px;
            }

            .xaaj-contact-form-head h2 {
              font-size: 42px;
            }

            .xaaj-contact-form-panel {
              padding: 34px 22px 38px;
            }

            .xaaj-contact-form-fields {
              grid-template-columns: 1fr;
              gap: 26px;
            }

            .xaaj-contact-field-wide {
              grid-column: 1;
            }

            .xaaj-contact-submit-row {
              align-items: stretch;
              flex-direction: column;
              gap: 16px;
            }

            .xaaj-contact-submit-row button {
              width: 100%;
            }

            .xaaj-contact-care {
              min-height: 520px;
              padding: 36px 22px;
            }

            .xaaj-contact-monogram {
              margin-top: 32px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .xaaj-contact-hero-links a,
            .xaaj-contact-care-links a,
            .xaaj-contact-submit-row button,
            .xaaj-contact-field input,
            .xaaj-contact-field textarea {
              transition: none !important;
            }
          }
        `}</style>

        <main className="xaaj-contact-page">
          <section className="xaaj-contact-hero">
            <div className="xaaj-contact-hero-copy">
              <span className="xaaj-contact-kicker">Contact XAAJ</span>
              <h1>Let’s start a<br /><em>conversation.</em></h1>
            </div>

            <div className="xaaj-contact-hero-details">
              <p>
                Thoughtful tableware starts with thoughtful details. Tell us
                what you need and our care team will take it from here.
              </p>

              <div className="xaaj-contact-hero-links">
                <a href="tel:+919899446117">
                  <span>
                    <small>Call / WhatsApp</small>
                    <strong>+91 98994 46117</strong>
                  </span>
                  <ArrowRight size={14} />
                </a>

                <a href="mailto:customercare@xaaj.in">
                  <span>
                    <small>Write to us</small>
                    <strong>customercare@xaaj.in</strong>
                  </span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </section>

          <section className="xaaj-contact-content">
            <ContactForm />
          </section>
        </main>

        <Newsletter />
        <Footer />
      </>
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
// PREMIUM GLOBAL SMOOTH SCROLL
// ============================================================

function SmoothScrollShell({ children }) {
  const main = useRef(null)
  const smoother = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const wrapper = main.current
    const content = wrapper?.querySelector('#smooth-content')

    if (!wrapper || !content) {
      return undefined
    }

    smoother.current = ScrollSmoother.create({
      wrapper,
      content,
      smooth: 1.25,
      effects: true,
      normalizeScroll: false,
      ignoreMobileResize: true
    })

    ScrollTrigger.refresh()

    return () => {
      smoother.current?.kill()
      smoother.current = null
    }
  }, [])

  return (
    <div
      id="smooth-wrapper"
      ref={main}
      className="xaaj-smooth-wrapper"
    >
      <div id="smooth-content" className="xaaj-smooth-content">
        {children}
      </div>

      <style>{`
        html {
          scroll-behavior: auto;
        }

        .xaaj-smooth-wrapper {
          width: 100%;
          min-height: 100vh;
        }

        .xaaj-smooth-content {
          width: 100%;
          min-height: 100vh;
          overflow: visible;
        }

        @media (prefers-reduced-motion: reduce) {
          .xaaj-smooth-content {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}


// ============================================================
// APP ROOT
// ============================================================

export default function AppRoot() {

  return (

    <AuthProvider>

      <StoreProvider>

        <BrowserRouter>

          <SmoothScrollShell>

            <App />

          </SmoothScrollShell>

        </BrowserRouter>

      </StoreProvider>

    </AuthProvider>

  )
}
