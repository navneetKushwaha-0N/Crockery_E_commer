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
  PhoneCall,
  MapPin,
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
  '/xaaj-logo-no-tagline.png'

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

// Homepage collection cards — dedicated XAAJ category photography.
const dinnerSetsHeroImage =
  'https://res.cloudinary.com/kswukbpp/image/upload/v1790273032/ChatGPT_Image_Sep_24_2026_11_33_30_PM.png'

const cupsMugsHeroImage =
  'https://res.cloudinary.com/kswukbpp/image/upload/v1790269006/ChatGPT_Image_Sep_24_2026_10_26_10_PM.png'

// Horeca collection gallery defaults. Admin CMS media can replace any slot;
// clearing a CMS slot falls back to the original image so the section stays visible.
const horecaDefaultMedia = {
  main: {
    url: tableImage,
    alt: 'XAAJ Horeca collection'
  },
  sideOne: {
    url: dinnerSetsHeroImage,
    alt: 'XAAJ Horeca tableware'
  },
  sideTwo: {
    url: 'https://res.cloudinary.com/kswukbpp/image/upload/v1790269104/ChatGPT_Image_Sep_24_2026_10_27_52_PM.png',
    alt: 'XAAJ Horeca serveware'
  }
}

// Homepage category hero cards are keyed by stable slugs.
// Admin-managed media can replace these fallback images without changing
// the category links or product/category filtering.
const categoryHeroDefinitions = [
  {
    name: 'Glassware',
    slug: 'glassware',
    fallback:
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1200&q=88'
  },
  {
    name: 'Gifting',
    slug: 'gifting',
    fallback: tableImage
  },
  {
    name: 'Dinnerware',
    slug: 'dinnerware',
    fallback: dinnerSetsHeroImage
  },
  {
    name: 'Serveware',
    slug: 'serveware',
    fallback:
      'https://res.cloudinary.com/kswukbpp/image/upload/v1790269104/ChatGPT_Image_Sep_24_2026_10_27_52_PM.png'
  },
  {
    name: 'Horeca',
    slug: 'horeca',
    fallback: heroImage
  }
]

const toCategoryHeroSlug = value =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getCategoryHeroMediaType = (url, mediaType) => {
  if (mediaType === 'video') return 'video'

  return /\.(mp4|webm|ogg|mov)(?:[?#].*)?$/i.test(String(url || '').trim())
    ? 'video'
    : 'image'
}

const getBrandStoryMediaType = (url, mediaType) =>
  getCategoryHeroMediaType(url, mediaType)


// ============================================================
// HEADER — XAAJ EDITORIAL / AMALA-STYLE SHELL
// ============================================================

function Header() {
  const { user } = useAuth()
  const { count, cart, total } = useStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuMounted, setMenuMounted] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartMounted, setCartMounted] = useState(false)
  const [cartClosing, setCartClosing] = useState(false)
  const [search, setSearch] = useState('')
  const drawerTimerRef = useRef(null)
  const [announcementText, setAnnouncementText] = useState('Free shipping on orders above ₹1,000')
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const [homeScrolled, setHomeScrolled] = useState(false)
  const [mobileDinnerwareOpen, setMobileDinnerwareOpen] = useState(false)

  const clearDrawerTimer = () => {
    if (drawerTimerRef.current) {
      window.clearTimeout(drawerTimerRef.current)
      drawerTimerRef.current = null
    }
  }

  const closeMenu = () => {
    clearDrawerTimer()
    setMobileDinnerwareOpen(false)
    setMenuOpen(false)
    setMenuClosing(true)
    drawerTimerRef.current = window.setTimeout(() => {
      setMenuMounted(false)
      setMenuClosing(false)
      drawerTimerRef.current = null
    }, 420)
  }

  const closeCart = () => {
    clearDrawerTimer()
    setCartOpen(false)
    setCartClosing(true)
    drawerTimerRef.current = window.setTimeout(() => {
      setCartMounted(false)
      setCartClosing(false)
      drawerTimerRef.current = null
    }, 380)
  }

  const closeAll = () => {
    setSearchOpen(false)
    if (menuMounted) closeMenu()
    if (cartMounted) closeCart()
  }

  const openMenu = () => {
    clearDrawerTimer()
    setMobileDinnerwareOpen(false)
    setCartOpen(false)
    setCartMounted(false)
    setCartClosing(false)
    setSearchOpen(false)
    setMenuMounted(true)
    requestAnimationFrame(() => setMenuOpen(true))
  }

  const openCart = () => {
    clearDrawerTimer()
    setMenuOpen(false)
    setMenuMounted(false)
    setMenuClosing(false)
    setSearchOpen(false)
    setCartClosing(false)
    setCartMounted(true)
    setCartOpen(true)
  }

  useEffect(() => {
    const isHome = location.pathname === '/'
    if (!isHome) {
      setHomeScrolled(false)
      return undefined
    }
    const onScroll = () => setHomeScrolled(window.scrollY > 55)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.add('xaaj-header-mounted')
    return () => {
      document.body.classList.remove('xaaj-header-mounted')
      clearDrawerTimer()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadAnnouncement() {
      try {
        const result = await apiRequest('/cms/announcement')
        const data = result?.data || result?.announcement || result || {}
        if (cancelled) return
        if (data?.text || data?.message) setAnnouncementText(data.text || data.message)
        if (data?.enabled !== undefined) setAnnouncementEnabled(Boolean(data.enabled))
      } catch (error) {
        console.error('Announcement load error:', error)
      }
    }
    loadAnnouncement()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') closeAll()
    }
    document.addEventListener('keydown', onKeyDown)
    const panelOpen = menuMounted || cartMounted || searchOpen
    document.body.style.overflow = panelOpen ? 'hidden' : ''
    document.body.style.paddingRight = panelOpen
      ? `${window.innerWidth - document.documentElement.clientWidth}px`
      : ''
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [menuMounted, cartMounted, searchOpen])

  const go = path => {
    closeAll()
    navigate(path)
  }

  const shopCategories = Array.isArray(categories) ? categories.filter(Boolean) : []
  const menuFeatured = shopCategories.slice(0, 2)
  const cartItems = Array.isArray(cart)
    ? cart
    : Array.isArray(cart?.items)
      ? cart.items
      : cart && typeof cart === 'object'
        ? Object.values(cart).filter(item => item && typeof item === 'object' && (item.id || item._id || item.name))
        : []

  return (
    <>
      <div className={`xaaj-ref-header-shell ${location.pathname === '/' ? 'xaaj-home-header' : ''} ${homeScrolled ? 'is-scrolled' : ''}`}>
        {announcementEnabled && announcementText && (
          <div className={`xaaj-ref-announcement ${homeScrolled ? 'is-hidden' : ''}`}>
            <span>{announcementText}</span>
          </div>
        )}

        <header className="xaaj-ref-header">
          <div className="xaaj-ref-header-side xaaj-ref-header-side-left" aria-hidden="true" />

          <button
            type="button"
            className={`xaaj-ref-mobile-menu-toggle ${menuMounted && menuOpen ? 'is-open' : ''}`}
            aria-label={menuMounted && menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuMounted && menuOpen}
            onClick={() => {
              if (menuMounted && menuOpen) closeMenu()
              else openMenu()
            }}
          >
            {menuMounted && menuOpen
              ? <X size={31} strokeWidth={1.15} />
              : <Menu size={31} strokeWidth={1.15} />}
          </button>

          <div className="xaaj-ref-header-center">
            <Link to="/" className="xaaj-ref-logo" onClick={closeAll} aria-label="XAAJ home">
              <img src={logoUrl} alt="XAAJ" />
              <span>STORES CRAFTED IN EARTH</span>
            </Link>

            <nav className="xaaj-ref-main-nav" aria-label="Collection navigation">
              <div className="xaaj-ref-nav-dropdown">
                <Link
                  className={`xaaj-ref-nav-trigger ${new URLSearchParams(location.search).get('category') === 'Dinnerware' ? 'active' : ''}`}
                  to="/shop?category=Dinnerware"
                  aria-haspopup="true"
                >
                  <span>Dinnerware</span>
                  <ChevronDown className="xaaj-ref-nav-chevron" size={13} strokeWidth={1.35} />
                </Link>

                <div className="xaaj-ref-nav-menu" role="menu" aria-label="Dinnerware categories">
                  {['Speckled White', 'Dove Gray', 'Blush Pink', 'Beachgrass Green', 'Midnight Blue'].map(name => (
                    <Link
                      key={name}
                      to="/shop?category=Dinnerware"
                      role="menuitem"
                      onClick={closeAll}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                className={new URLSearchParams(location.search).get('category') === 'Glassware' ? 'active' : ''}
                to="/shop?category=Glassware"
              >
                Glassware
              </Link>

              <Link
                className={new URLSearchParams(location.search).get('category') === 'Serveware' ? 'active' : ''}
                to="/shop?category=Serveware"
              >
                Serveware
              </Link>

              <Link
                className={new URLSearchParams(location.search).get('category') === 'Gifting' ? 'active' : ''}
                to="/shop?category=Gifting"
              >
                Gifting
              </Link>

              <Link
                className={new URLSearchParams(location.search).get('category') === 'Horeca' ? 'active' : ''}
                to="/shop?category=Horeca"
              >
                Horeca
              </Link>
            </nav>
          </div>

          <div className="xaaj-ref-actions">
            <button
              type="button"
              className="xaaj-ref-header-icon"
              aria-label="Search"
              onClick={() => {
                if (searchOpen) setSearchOpen(false)
                else {
                  if (menuMounted) closeMenu()
                  if (cartMounted) closeCart()
                  setSearchOpen(true)
                }
              }}
            >
              <Search size={19} strokeWidth={1.45} />
            </button>
            <button
              type="button"
              className="xaaj-ref-header-icon"
              aria-label="Account"
              onClick={() => go(user?.role === 'admin' ? '/admin' : '/account')}
            >
              <UserRound size={19} strokeWidth={1.45} />
            </button>
            <button
              type="button"
              className={`xaaj-ref-cart-button ${cartOpen ? 'is-active' : ''}`}
              aria-label="View cart"
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                closeAll()
                navigate('/cart')
              }}
            >
              <ShoppingBag size={19} strokeWidth={1.45} />
              {count > 0 && <span>{count}</span>}
            </button>
          </div>
        </header>
      </div>

      {searchOpen && (
        <>
          <button
            type="button"
            className="xaaj-ref-search-backdrop"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />

          <div
            className="xaaj-ref-search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            <div className="xaaj-ref-search-row">
              <form
                className="xaaj-ref-search-form"
                onSubmit={event => {
                  event.preventDefault()
                  const value = search.trim()
                  if (value) go(`/shop?search=${encodeURIComponent(value)}`)
                }}
              >
                <input
                  autoFocus
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search"
                  aria-label="Search products"
                />

                <button
                  type="submit"
                  className="xaaj-ref-search-submit"
                  aria-label="Submit search"
                >
                  <Search size={20} strokeWidth={1.35} />
                </button>
              </form>

              <button
                type="button"
                className="xaaj-ref-search-close"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={27} strokeWidth={1.25} />
              </button>
            </div>
          </div>
        </>
      )}

      {(menuMounted || cartMounted) && (
        <button
          type="button"
          className="xaaj-ref-overlay"
          aria-label="Close panel"
          onClick={closeAll}
        />
      )}

      {menuMounted && (
        <aside className={`xaaj-ref-menu-drawer ${menuOpen ? 'is-open' : 'is-closing'}`} aria-label="Main menu">
          <div className="xaaj-ref-mobile-menu-content">
            <nav aria-label="Mobile collection navigation">
              {!mobileDinnerwareOpen ? (
                <>
                  <button
                    type="button"
                    className="xaaj-ref-mobile-dinnerware-toggle"
                    onClick={() => setMobileDinnerwareOpen(true)}
                    aria-expanded="false"
                  >
                    <span>Dinnerware</span>
                    <ArrowRight size={22} strokeWidth={1.15} />
                  </button>

                  <Link to="/shop?category=Glassware" onClick={closeMenu}>
                    <span>Glassware</span>
                  </Link>

                  <Link to="/shop?category=Serveware" onClick={closeMenu}>
                    <span>Serveware</span>
                  </Link>

                  <Link to="/shop?category=Gifting" onClick={closeMenu}>
                    <span>Gifting</span>
                  </Link>

                  <Link to="/shop?category=Horeca" onClick={closeMenu}>
                    <span>Horeca</span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="xaaj-ref-mobile-dinnerware-back"
                    onClick={() => setMobileDinnerwareOpen(false)}
                    aria-label="Back to collections"
                  >
                    <ArrowRight className="xaaj-ref-mobile-dinnerware-back-icon" size={22} strokeWidth={1.15} />
                    <span>Dinnerware</span>
                  </button>

                  {['Speckled White', 'Dove Gray', 'Blush Pink', 'Beachgrass Green', 'Midnight Blue'].map(name => (
                    <Link key={name} to="/shop?category=Dinnerware" onClick={closeMenu}>
                      <span>{name}</span>
                    </Link>
                  ))}
                </>
              )}
            </nav>

            <div className="xaaj-ref-mobile-menu-secondary">
              <button type="button" onClick={() => go('/about')}>Our Story</button>
              <button type="button" onClick={() => go('/faq')}>FAQs</button>
              <button type="button" onClick={() => go('/contact')}>Contact Us</button>
            </div>
          </div>

          <div className="xaaj-ref-menu-links">
            <div className="xaaj-ref-menu-primary">
              <button onClick={() => go('/shop')}>Shop all <ArrowRight size={14} /></button>
              <button onClick={() => go('/collections')}>Collections <ArrowRight size={14} /></button>
              <button onClick={() => go('/shop?filter=new')}>New arrivals <ArrowRight size={14} /></button>
              <button onClick={() => go('/shop?filter=best-selling')}>Best sellers <ArrowRight size={14} /></button>
            </div>

            <div className="xaaj-ref-menu-columns">
              <div>
                <span>DINING</span>
                {['Dinner Sets', 'Plates', 'Bowls', 'Serveware'].map(name => (
                  <button key={name} onClick={() => go(`/shop?category=${encodeURIComponent(name)}`)}>{name}</button>
                ))}
              </div>
              <div>
                <span>DRINKWARE</span>
                {['Cups & Mugs', 'Glassware'].map(name => (
                  <button key={name} onClick={() => go(`/shop?category=${encodeURIComponent(name)}`)}>{name}</button>
                ))}
              </div>
              <div>
                <span>ABOUT XAAJ</span>
                <button onClick={() => go('/about')}>Our story</button>
                <button onClick={() => go('/contact')}>Contact</button>
                <button onClick={() => go('/faq')}>FAQs</button>
              </div>
            </div>

            <div className="xaaj-ref-menu-bottom">
              <button onClick={() => go('/account')}>My account</button>
              <button onClick={() => go('/wishlist')}>Wishlist</button>
              <small>Thoughtful tableware, shaped slowly in India.</small>
            </div>
          </div>

          <div className="xaaj-ref-menu-feature">
            {menuFeatured[0] ? (
              <Link to={`/shop?category=${encodeURIComponent(menuFeatured[0].name)}`} onClick={closeAll}>
                <img src={menuFeatured[0].image} alt={menuFeatured[0].name} />
                <div><span>{menuFeatured[0].name}</span><strong>Explore collection <ArrowRight size={14} /></strong></div>
              </Link>
            ) : (
              <Link to="/shop" onClick={closeAll}>
                <img src={heroImage} alt="XAAJ collection" />
                <div><span>XAAJ</span><strong>Explore collection <ArrowRight size={14} /></strong></div>
              </Link>
            )}
          </div>
        </aside>
      )}

      {cartMounted && createPortal(
        <aside className={`xaaj-ref-cart-drawer ${cartOpen ? 'is-open' : 'is-closing'}`} aria-label="Shopping cart">
          <div className="xaaj-ref-drawer-head">
            <div>
              <span>Your selection</span>
              <h2>Cart <small>{cartItems.length}</small></h2>
            </div>
            <button
              type="button"
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                closeCart()
              }}
              aria-label="Close cart"
            >
              <X size={20} strokeWidth={1.35} />
            </button>
          </div>

          <div className="xaaj-ref-cart-items">
            {cartItems.length === 0 ? (
              <div className="xaaj-ref-empty-cart">
                <div className="xaaj-ref-empty-cart-mark">
                  <ShoppingBag size={25} strokeWidth={1.15} />
                </div>
                <span>Nothing here yet</span>
                <p>Your table is waiting for something beautiful.</p>
                <button type="button" onClick={() => go('/shop')}>
                  Explore the collection <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="xaaj-ref-cart-intro">
                  <span>{cartItems.length} {cartItems.length === 1 ? 'piece' : 'pieces'} selected</span>
                  <small>Curated for everyday rituals</small>
                </div>

                {cartItems.map(item => (
                  <div className="xaaj-ref-cart-item" key={item.id || item._id}>
                    <img src={item.image} alt={item.name} />
                    <div className="xaaj-ref-cart-item-copy">
                      <span>{item.category || 'XAAJ'}</span>
                      <strong>{item.name}</strong>
                      <p>{money(item.price)} <em>× {item.qty || 1}</em></p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="xaaj-ref-cart-footer">
              <div className="xaaj-ref-cart-subtotal">
                <span>Subtotal</span>
                <strong>{money(total)}</strong>
              </div>
              <p className="xaaj-ref-cart-note">Shipping calculated at checkout</p>

              <button type="button" onClick={() => go('/cart')}>
                View cart <ArrowRight size={15} />
              </button>
              <button type="button" className="secondary" onClick={() => go('/checkout')}>
                Checkout <ArrowRight size={15} />
              </button>
            </div>
          )}
        </aside>,
        document.body
      )}

      <style>{`
        body.xaaj-header-mounted{padding-top:0!important;background:#ffffff}
        .xaaj-ref-header-shell{position:relative;z-index:9000;width:100%;background:#fffdf9}
        .xaaj-ref-header-shell,.xaaj-ref-header-shell.xaaj-home-header,.xaaj-ref-header-shell.xaaj-home-header.is-scrolled{background:#ffffff!important}
        .xaaj-ref-header-shell .xaaj-ref-header,.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-header{background:#ffffff!important}
        .xaaj-ref-announcement{height:42px;max-height:42px;background:#252923;color:#f8f3e9;display:flex;align-items:center;justify-content:center;font-family:'Gotham Book','Gotham',Arial,sans-serif;font-size:11px;font-weight:400;letter-spacing:1.45px;line-height:1;text-transform:none;overflow:hidden;white-space:nowrap;transition:max-height .35s ease,opacity .25s ease,visibility .35s ease,padding .35s ease}
        .xaaj-ref-announcement::before,.xaaj-ref-announcement::after{display:none!important}
        .xaaj-ref-announcement.is-hidden{max-height:42px;height:42px;opacity:0;visibility:hidden;pointer-events:none}
        .xaaj-ref-header{height:144px;background:#fffdf9;border:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:start;padding:15px 4.2vw 0;position:relative;color:#302d28}
        .xaaj-ref-header-center{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;min-width:290px}
        .xaaj-ref-logo{display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;color:#302d28;line-height:1}
        .xaaj-ref-logo img{width:96px;height:66px;object-fit:contain;object-position:center}
        .xaaj-ref-logo span{font-family:'Gotham Book','Gotham',Arial,sans-serif;font-size:7px;letter-spacing:2.4px;margin-top:-2px;color:#777168;text-transform:uppercase}
        .xaaj-ref-main-nav{
            display:flex;
            align-items:center;
            justify-content:center;
            gap:31px;
            margin-top:34px;
            padding:0 10px;
            white-space:nowrap;
          }

          .xaaj-ref-nav-dropdown{
            position:relative;
            display:flex;
            align-items:center;
            height:25px;
          }

          .xaaj-ref-nav-trigger{
            gap:4px;
          }

          .xaaj-ref-nav-chevron{
            margin-top:1px;
            transition:transform .28s cubic-bezier(.22,1,.36,1);
          }

          .xaaj-ref-nav-dropdown:hover .xaaj-ref-nav-chevron,
          .xaaj-ref-nav-dropdown:focus-within .xaaj-ref-nav-chevron{
            transform:rotate(180deg);
          }

          .xaaj-ref-nav-menu{
            position:absolute;
            top:calc(100% + 13px);
            left:50%;
            min-width:208px;
            padding:12px 0;
            background:#ffffff!important;
            border:1px solid rgba(48,45,40,.22);
            border-radius:7px;
            box-shadow:0 12px 32px rgba(48,45,40,.10);
            transform:translate(-50%, -7px);
            opacity:0;
            visibility:hidden;
            pointer-events:none;
            transition:opacity .22s ease, transform .25s cubic-bezier(.22,1,.36,1), visibility .22s ease;
            z-index:10000;
          }

          .xaaj-ref-nav-menu::before{
            content:"";
            position:absolute;
            top:-7px;
            left:50%;
            width:12px;
            height:12px;
            background:#fffdf9;
            border-left:1px solid rgba(48,45,40,.22);
            border-top:1px solid rgba(48,45,40,.22);
            transform:translateX(-50%) rotate(45deg);
          }

          .xaaj-ref-nav-dropdown:hover .xaaj-ref-nav-menu,
          .xaaj-ref-nav-dropdown:focus-within .xaaj-ref-nav-menu{
            opacity:1;
            visibility:visible;
            pointer-events:auto;
            transform:translate(-50%, 0);
          }

          .xaaj-ref-nav-menu a{
            display:flex!important;
            width:100%;
            min-height:38px;
            align-items:center;
            padding:0 20px!important;
            color:#5d5750!important;
            font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
            font-size:13px!important;
            font-weight:400;
            letter-spacing:.01em;
            text-decoration:none;
            transition:background .2s ease, color .2s ease, padding-left .2s ease;
          }

          .xaaj-ref-nav-menu a::after{
            display:none!important;
          }

          .xaaj-ref-nav-menu a:hover{
            color:#302d28!important;
            background:rgba(48,45,40,.045);
            padding-left:24px!important;
          }

          .xaaj-ref-nav-menu a.active{
            color:#302d28!important;
          }

          .xaaj-ref-main-nav a{
            position:relative;
            display:inline-flex;
            align-items:center;
            height:25px;
            color:#57534e;
            text-decoration:none;
            font-family:inherit;
            font-size:13px;
            font-weight:400;
            line-height:1;
            letter-spacing:.015em;
            transition:color .25s ease, opacity .25s ease;
          }

          .xaaj-ref-main-nav a::after{
            content:"";
            position:absolute;
            left:0;
            right:0;
            bottom:-7px;
            height:1px;
            background:#2d2a26;
            transform:scaleX(0);
            transform-origin:center;
            transition:transform .28s cubic-bezier(.22,1,.36,1);
          }

          .xaaj-ref-main-nav a:hover{
            color:#24211e;
          }

          .xaaj-ref-main-nav a:hover::after,
          .xaaj-ref-main-nav a.active::after{
            transform:scaleX(1);
          }

          .xaaj-ref-main-nav a.active{
            color:#24211e;
          }

          @media(max-width:850px){
            .xaaj-ref-main-nav{
              gap:20px;
              margin-top:18px;
              overflow-x:auto;
              justify-content:flex-start;
              scrollbar-width:none;
              -webkit-overflow-scrolling:touch;
            }

            .xaaj-ref-main-nav::-webkit-scrollbar{
              display:none;
            }

            .xaaj-ref-main-nav a{
              flex:0 0 auto;
              font-size:12px;
            }

            .xaaj-ref-nav-dropdown{
              flex:0 0 auto;
            }

            .xaaj-ref-nav-menu{
              left:0;
              transform:translate(0, -7px);
            }

            .xaaj-ref-nav-menu::before{
              left:30px;
            }

            .xaaj-ref-nav-dropdown:hover .xaaj-ref-nav-menu,
            .xaaj-ref-nav-dropdown:focus-within .xaaj-ref-nav-menu{
              transform:translate(0, 0);
            }
          }

          @media(max-width:520px){
            .xaaj-ref-main-nav{
              gap:18px;
              padding:0 4px;
            }

            .xaaj-ref-main-nav a{
              font-size:11px;
            }
          }.xaaj-ref-main-nav a{font-family:'Gotham Book','Gotham',Arial,sans-serif;font-size:13px!important;line-height:1;color:#5d5750;text-decoration:none;position:relative;padding:3px 0;transition:color .25s ease}
        .xaaj-ref-main-nav a::after{content:'';position:absolute;left:0;right:0;bottom:-4px;height:1px;background:#302d28;transform:scaleX(0);transform-origin:center;transition:transform .25s ease}
        .xaaj-ref-main-nav a:hover,.xaaj-ref-main-nav a.active{color:#302d28}
        .xaaj-ref-main-nav a.active::after{transform:scaleX(1)}
        .xaaj-ref-header-side{min-width:1px}
        .xaaj-ref-actions{justify-self:end;display:flex;align-items:center;gap:7px;padding-top:18px}
        .xaaj-ref-header-icon,.xaaj-ref-cart-button{appearance:none;border:0;background:transparent;color:#302d28;width:39px;height:39px;display:grid;place-items:center;padding:0;cursor:pointer;transition:transform .2s ease,color .2s ease}
        .xaaj-ref-header-icon:hover,.xaaj-ref-cart-button:hover{transform:translateY(-1px);color:#8d4e3d}
        .xaaj-ref-cart-button{position:relative}.xaaj-ref-cart-button span{position:absolute;right:1px;top:1px;min-width:14px;height:14px;border-radius:50%;background:#b84d38;color:#fff;font:600 8px/1 'Gotham Book','Gotham',Arial,sans-serif;display:grid;place-items:center}
        /* Keep the logo/nav geometry identical while scrolling. Only the surface changes. */
        .xaaj-ref-header-shell.xaaj-home-header.is-scrolled{position:relative;top:auto}
        .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-header-center,.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-logo,.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-main-nav,.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-actions{transform:none}
        .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-header{height:144px;padding-top:15px;align-items:start;border-bottom:1px solid rgba(48,45,40,.08);background:#fffdf9;box-shadow:0 6px 20px rgba(48,45,40,.035);backdrop-filter:none;-webkit-backdrop-filter:none}
        .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-logo img{width:96px;height:66px}
        .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-logo span{display:block}
        .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-main-nav{margin-top:18px;gap:31px}
        .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-actions{padding-top:18px}
        .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-header-center{flex-direction:column;gap:0;align-items:center}
        .xaaj-ref-overlay{
          position:fixed!important;
          top:42px!important;
          right:0!important;
          bottom:0!important;
          left:0!important;
          border:0!important;
          background:rgba(26,25,22,.34)!important;
          z-index:8999!important;
          cursor:pointer!important;
        }
        .xaaj-ref-cart-drawer{
          position:fixed!important;
          top:42px!important;
          right:0!important;
          bottom:0!important;
          left:auto!important;
          width:min(520px,92vw)!important;
          height:calc(100dvh - 42px)!important;
          max-height:calc(100dvh - 42px)!important;
          min-height:0!important;
          margin:0!important;
          padding:0!important;
          background:#fffdf9!important;
          z-index:2147483647!important;
          display:flex!important;
          flex-direction:column!important;
          overflow:hidden!important;
          box-sizing:border-box!important;
          box-shadow:-28px 0 70px rgba(25,22,18,.17)!important;
          transform:translateX(100%)!important;
          transition:transform .38s cubic-bezier(.22,1,.36,1)!important;
          will-change:transform;
        }
        .xaaj-ref-cart-drawer.is-open{transform:translateX(0)!important}
        .xaaj-ref-cart-drawer.is-closing{transform:translateX(100%)!important}
        .xaaj-ref-drawer-head{padding:28px 28px 20px;border-bottom:1px solid rgba(42,39,34,.1);display:flex;justify-content:space-between;align-items:flex-start}.xaaj-ref-drawer-head span{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#8a8379}.xaaj-ref-drawer-head h2{margin:5px 0 0;font:400 32px 'Gotham Book','Gotham',Arial,sans-serif}.xaaj-ref-drawer-head h2 small{font:400 11px 'Gotham Book','Gotham',Arial,sans-serif;color:#888;margin-left:4px}.xaaj-ref-drawer-head button{width:36px;height:36px;display:grid;place-items:center;border:0;background:transparent;color:#302d28;cursor:pointer}
        .xaaj-ref-cart-intro{display:flex;justify-content:space-between;align-items:baseline;padding:0 0 16px;margin-bottom:18px;border-bottom:1px solid rgba(42,39,34,.08)}.xaaj-ref-cart-intro span{font-size:10px;text-transform:uppercase;letter-spacing:1.2px;color:#5f5a52}.xaaj-ref-cart-intro small{font-size:10px;color:#9a9389}.xaaj-ref-empty-cart-mark{width:58px;height:58px;border:1px solid rgba(42,39,34,.14);border-radius:50%;display:grid;place-items:center;margin-bottom:18px;color:#665f56}.xaaj-ref-empty-cart>span{font-size:9px;letter-spacing:1.6px;text-transform:uppercase;color:#8b847a}.xaaj-ref-empty-cart p{margin:7px 0 18px!important}.xaaj-ref-cart-item-copy{min-width:0}.xaaj-ref-cart-item-copy p em{font-style:normal;color:#8b857b;margin-left:3px}.xaaj-ref-cart-note{margin:0 0 14px;color:#8a8379;font-size:9px;letter-spacing:.3px}.xaaj-ref-cart-subtotal{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px}.xaaj-ref-cart-subtotal span{font-size:10px;text-transform:uppercase;letter-spacing:1.2px;color:#6a645c}.xaaj-ref-cart-subtotal strong{font:400 20px 'Gotham Book','Gotham',Arial,sans-serif;color:#292621}
        .xaaj-ref-cart-items{padding:34px 34px 36px;overflow-y:auto;overflow-x:hidden;flex:1;min-height:0}.xaaj-ref-cart-item{display:grid;grid-template-columns:82px 1fr;gap:14px;padding:0 0 18px;margin-bottom:18px;border-bottom:1px solid rgba(42,39,34,.08)}.xaaj-ref-cart-item img{width:82px;height:102px;object-fit:cover;background:#eeeae1}.xaaj-ref-cart-item span{font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#8b857b}.xaaj-ref-cart-item strong{display:block;font:400 17px 'Gotham Book','Gotham',Arial,sans-serif;margin:5px 0}.xaaj-ref-cart-item p{margin:0;color:#68635c;font-size:11px}.xaaj-ref-empty-cart{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#787269}.xaaj-ref-empty-cart p{max-width:220px;font:400 20px 'Gotham Book','Gotham',Arial,sans-serif;line-height:1.25}.xaaj-ref-empty-cart button{display:flex;align-items:center;gap:7px;border:0;background:none;color:#8d4e3d;font-size:11px;cursor:pointer}.xaaj-ref-cart-footer{padding:24px 34px 30px;border-top:1px solid rgba(42,39,34,.1);flex:0 0 auto;background:#fffdf9}.xaaj-ref-cart-footer>div{display:flex;justify-content:space-between;margin-bottom:16px;color:#605b53;font-size:12px}.xaaj-ref-cart-footer>div strong{color:#292621;font-size:14px}.xaaj-ref-cart-footer button{width:100%;height:45px;border:1px solid #302d28;background:#302d28;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;font-size:10px;text-transform:uppercase;letter-spacing:1.3px;cursor:pointer;margin-top:8px}.xaaj-ref-cart-footer button.secondary{background:transparent;color:#302d28}
        .xaaj-ref-search-backdrop{
          position:fixed;
          top:44px;
          right:0;
          bottom:0;
          left:0;
          border:0;
          background:rgba(25,24,21,.48);
          z-index:9490;
          cursor:pointer;
        }

        .xaaj-ref-search-panel{
          position:fixed;
          top:44px;
          left:0;
          right:0;
          height:144px;
          z-index:9700;
          background:#fffdf9;
          border-bottom:1px solid rgba(42,39,34,.08);
          box-shadow:0 10px 24px rgba(35,32,28,.05);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:0 28px;
          box-sizing:border-box;
        }

        .xaaj-ref-search-row{
          width:min(824px,100%);
          display:flex;
          align-items:center;
          justify-content:center;
          gap:16px;
        }

        .xaaj-ref-search-form{
          position:relative;
          width:min(770px,calc(100vw - 112px));
          height:51px;
          margin:0;
          border:1px solid #96928d;
          border-radius:6px;
          background:#fffdf9;
          display:flex;
          align-items:center;
          box-sizing:border-box;
          overflow:hidden;
        }

        .xaaj-ref-search-form input{
          width:100%;
          height:100%;
          border:0;
          outline:0;
          background:transparent;
          color:#3d3a36;
          padding:0 58px 0 20px;
          font:400 15px/1 'Gotham Book','Gotham',Arial,sans-serif;
          letter-spacing:.25px;
          box-sizing:border-box;
        }

        .xaaj-ref-search-form input::placeholder{
          color:#66615c;
          opacity:1;
        }

        .xaaj-ref-search-submit{
          position:absolute;
          top:0;
          right:0;
          width:52px;
          height:50px;
          border:0!important;
          background:transparent!important;
          color:#5b5752!important;
          display:grid!important;
          place-items:center!important;
          padding:0!important;
          cursor:pointer;
        }

        .xaaj-ref-search-close{
          width:36px!important;
          height:51px!important;
          border:0!important;
          background:transparent!important;
          color:#413e39!important;
          display:grid!important;
          place-items:center!important;
          padding:0!important;
          cursor:pointer;
          flex:0 0 36px;
        }

        .xaaj-ref-search-close:hover{
          color:#8d4e3d!important;
        }
        .xaaj-ref-mobile-menu-toggle{
          display:none;
          position:absolute;
          left:14px;
          top:10px;
          width:42px;
          height:42px;
          border:0;
          background:transparent;
          color:#292722;
          padding:0;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          z-index:5;
        }

        .xaaj-ref-mobile-menu-content{
          display:none;
        }

        @media(max-width:850px){
          .xaaj-ref-mobile-menu-toggle{
            display:flex;
          }

          .xaaj-ref-menu-drawer{
            position:fixed!important;
            top:148px!important;
            left:0!important;
            right:auto!important;
            bottom:0!important;
            width:min(88vw, 420px)!important;
            max-width:calc(100vw - 54px)!important;
            height:calc(100dvh - 148px)!important;
            margin:0!important;
            padding:0!important;
            background:#f8f5f5!important;
            color:#292722!important;
            border:0!important;
            border-radius:0!important;
            box-shadow:18px 0 55px rgba(28,25,22,.14)!important;
            transform:translateX(-105%)!important;
            transition:transform .42s cubic-bezier(.22,1,.36,1)!important;
            overflow-y:auto!important;
            overflow-x:hidden!important;
            z-index:2147483000!important;
          }

          .xaaj-ref-menu-drawer.is-open{
            transform:translateX(0)!important;
          }

          .xaaj-ref-menu-drawer.is-closing{
            transform:translateX(-105%)!important;
          }

          .xaaj-ref-menu-drawer > .xaaj-ref-menu-links,
          .xaaj-ref-menu-drawer > .xaaj-ref-menu-feature{
            display:none!important;
          }

          .xaaj-ref-mobile-menu-content{
            display:flex;
            min-height:100%;
            flex-direction:column;
            justify-content:space-between;
            padding:104px 0 24px;
          }

          .xaaj-ref-mobile-menu-content nav{
            display:flex;
            flex-direction:column;
          }

          .xaaj-ref-mobile-menu-content nav a{
            min-height:76px;
            display:flex!important;
            align-items:center;
            justify-content:space-between;
            padding:0 28px 0 26px!important;
            color:#292722!important;
            text-decoration:none;
            font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif!important;
            font-size:28px!important;
            font-weight:500!important;
            line-height:1!important;
            letter-spacing:-.02em!important;
            border-bottom:1px solid rgba(42,39,34,.08);
            transition:background .2s ease, padding-left .2s ease;
          }

          .xaaj-ref-mobile-menu-content nav a:first-child{
            border-top:1px solid rgba(42,39,34,.08);
          }

          .xaaj-ref-mobile-menu-content nav a:hover,
          .xaaj-ref-mobile-menu-content nav a:focus-visible{
            background:rgba(42,39,34,.045);
            padding-left:30px!important;
            outline:none;
          }

          .xaaj-ref-mobile-menu-secondary{
            display:flex;
            align-items:center;
            gap:22px;
            padding:21px 26px 0;
            border-top:1px solid rgba(42,39,34,.10);
          }

          .xaaj-ref-mobile-menu-secondary button{
            border:0;
            background:none;
            padding:0;
            color:#666059;
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
            font-size:11px;
            letter-spacing:.06em;
            cursor:pointer;
          }

          .xaaj-ref-mobile-menu-secondary button:hover{
            color:#292722;
          }

          .xaaj-ref-actions{
            padding-top:11px;
          }

          .xaaj-ref-actions .xaaj-ref-header-icon[aria-label="Account"]{
            display:none;
          }

          .xaaj-ref-actions .xaaj-ref-header-icon,
          .xaaj-ref-actions .xaaj-ref-cart-button{
            width:37px;
            height:37px;
          }

          .xaaj-ref-mobile-menu-toggle.is-open{
            z-index:2147483001;
          }

          .xaaj-reference-hero{
            padding:34px 14px 48px;
          }

          .xaaj-reference-hero-heading{
            padding:0 8px 34px;
          }

          .xaaj-reference-hero-heading h1{
            max-width:360px;
            font-size:clamp(39px,10.3vw,49px);
            line-height:1.02;
            letter-spacing:-.035em;
          }

          .xaaj-reference-hero-grid{
            grid-template-columns:repeat(2,minmax(0,1fr))!important;
            gap:12px!important;
          }

          .xaaj-reference-hero-card-top{
            height:auto!important;
            aspect-ratio:.66 / 1!important;
          }

          .xaaj-reference-hero-bottom{
            grid-column:1 / -1!important;
            grid-template-columns:1fr!important;
            gap:12px!important;
            margin-top:0!important;
          }

          .xaaj-reference-hero-bottom-card{
            height:auto;
          }

          .xaaj-reference-hero-bottom-card img,
          .xaaj-reference-hero-bottom-card video{
            height:auto!important;
            aspect-ratio:.82 / 1!important;
          }

          .xaaj-reference-hero-label{
            height:72px!important;
            min-height:72px!important;
            flex:0 0 72px!important;
            padding:15px 15px!important;
            gap:8px!important;
            font-size:21px!important;
          }

          .xaaj-reference-hero-label svg{
            width:17px;
            height:17px;
          }
        }

        @media(max-width:520px){
          .xaaj-ref-menu-drawer{
            top:140px!important;
            height:calc(100dvh - 140px)!important;
          }

          .xaaj-ref-overlay{
            top:140px!important;
          }
        }

        @media(max-width:430px){
          .xaaj-ref-mobile-menu-content{
            padding-top:96px;
          }

          .xaaj-ref-mobile-menu-content nav a{
            min-height:70px;
            padding-left:23px!important;
            padding-right:22px!important;
            font-size:26px!important;
          }

          .xaaj-reference-hero{
            padding-left:12px!important;
            padding-right:12px!important;
          }

          .xaaj-reference-hero-grid{
            gap:10px!important;
          }

          .xaaj-reference-hero-bottom{
            gap:10px!important;
          }

          .xaaj-reference-hero-label{
            height:68px;
            min-height:68px;
            flex-basis:68px;
            padding-left:13px;
            padding-right:13px;
            font-size:20px!important;
          }
        }

        @media(max-width:850px){
          .xaaj-ref-overlay{
            top:148px!important;
          }

          .xaaj-ref-cart-drawer{
            top:36px!important;
            height:calc(100dvh - 36px)!important;
            max-height:calc(100dvh - 36px)!important;
            width:min(520px,96vw)!important;
          }
          .xaaj-ref-announcement{height:36px;max-height:36px;font-size:10px;letter-spacing:1.15px}
          .xaaj-ref-header{height:112px;padding:10px 15px 0}
          .xaaj-ref-logo img{width:82px;height:54px}.xaaj-ref-logo span{font-size:5.5px;letter-spacing:1.8px}
          .xaaj-ref-main-nav{gap:20px;margin-top:9px}.xaaj-ref-main-nav a{font-size:13px}
          .xaaj-ref-actions{padding-top:11px;gap:0}.xaaj-ref-header-icon,.xaaj-ref-cart-button{width:34px;height:34px}
          .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-header{height:112px;padding-top:10px;align-items:start}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-header-center{gap:0;flex-direction:column}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-main-nav{gap:20px;margin-top:9px}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-logo img{width:82px;height:54px}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-logo span{display:block}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-actions{padding-top:11px}
        }
        @media(max-width:520px){
          .xaaj-ref-cart-drawer{
            top:38px!important;
            width:100vw!important;
            height:calc(100dvh - 38px)!important;
            max-height:calc(100dvh - 38px)!important;
          }
          .xaaj-ref-header{height:104px;padding-left:10px;padding-right:10px}.xaaj-ref-header-center{min-width:0}.xaaj-ref-logo img{width:76px;height:50px}.xaaj-ref-logo span{font-size:4.8px;letter-spacing:1.5px}.xaaj-ref-main-nav{gap:15px}.xaaj-ref-main-nav a{font-size:14px}.xaaj-ref-actions{padding-top:8px}.xaaj-ref-header-icon,.xaaj-ref-cart-button{width:31px;height:31px}
          .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-header-center{gap:0;flex-direction:column}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-main-nav{gap:15px;margin-top:9px}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-main-nav a{font-size:14px}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-logo img{width:76px;height:50px}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-logo span{display:block}.xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-actions{padding-top:8px}
        }
        @media(max-width:850px){
          .xaaj-ref-search-backdrop{
            top:38px;
          }

          .xaaj-ref-search-panel{
            top:38px;
            height:124px;
            padding:0 18px;
          }

          .xaaj-ref-search-row{
            width:100%;
            gap:9px;
          }

          .xaaj-ref-search-form{
            width:calc(100vw - 73px);
            height:50px;
          }

          .xaaj-ref-search-form input{
            padding-left:16px;
            padding-right:48px;
            font-size:15px;
          }

          .xaaj-ref-search-submit{
            width:48px;
            height:49px;
          }

          .xaaj-ref-search-close{
            width:34px!important;
            flex-basis:34px!important;
          }
        }

      

        /* Final mobile navigation: premium, minimal, drawer-only. */
        @media (max-width: 850px){
          .xaaj-ref-main-nav{
            display:none!important;
          }

          .xaaj-ref-header{
            height:104px;
            padding:8px 14px 0;
          }

          .xaaj-ref-header-center{
            min-width:0;
            height:92px;
            justify-content:flex-start;
          }

          .xaaj-ref-logo{
            gap:0;
          }

          .xaaj-ref-logo img{
            width:82px;
            height:58px;
          }

          .xaaj-ref-logo span{
            display:block!important;
            margin-top:1px!important;
            font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
            font-size:6.2px!important;
            line-height:1!important;
            letter-spacing:2.05px!important;
            color:#777168!important;
            white-space:nowrap;
          }

          .xaaj-ref-actions{
            padding-top:9px;
            gap:0;
          }

          .xaaj-ref-actions .xaaj-ref-header-icon[aria-label="Account"]{
            display:none!important;
          }

          .xaaj-ref-actions .xaaj-ref-header-icon,
          .xaaj-ref-actions .xaaj-ref-cart-button{
            width:36px;
            height:36px;
          }

          .xaaj-ref-mobile-menu-toggle{
            display:flex!important;
            left:12px;
            top:24px;
            width:42px;
            height:42px;
          }

          /* Premium mobile drawer */
          .xaaj-ref-menu-drawer{
            top:140px!important;
            left:0!important;
            width:min(88vw,420px)!important;
            max-width:calc(100vw - 46px)!important;
            height:calc(100dvh - 140px)!important;
            padding:0!important;
            background:#f8f5f5!important;
            box-shadow:18px 0 55px rgba(28,25,22,.12)!important;
          }

          .xaaj-ref-overlay{
            top:140px!important;
          }

          .xaaj-ref-menu-drawer > .xaaj-ref-menu-links,
          .xaaj-ref-menu-drawer > .xaaj-ref-menu-feature{
            display:none!important;
          }

          .xaaj-ref-mobile-menu-content{
            display:flex!important;
            min-height:100%;
            padding:54px 0 24px!important;
            justify-content:space-between;
            box-sizing:border-box;
          }

          .xaaj-ref-mobile-menu-content nav{
            display:flex;
            flex-direction:column;
            width:100%;
          }

          /* Clean menu items: no separators */
          .xaaj-ref-mobile-menu-content nav a,
          .xaaj-ref-mobile-dinnerware-toggle,
          .xaaj-ref-mobile-dinnerware-back{
            min-height:62px;
            width:100%;
            padding:0 24px!important;
            display:flex!important;
            align-items:center;
            justify-content:space-between;
            box-sizing:border-box;
            color:#292722!important;
            background:transparent!important;
            border:0!important;
            font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif!important;
            font-size:22px!important;
            font-weight:500!important;
            line-height:1!important;
            letter-spacing:-.015em!important;
            text-decoration:none;
            text-align:left;
            cursor:pointer;
            transition:color .25s ease,opacity .25s ease,transform .25s ease;
          }

          .xaaj-ref-mobile-menu-content nav a:first-child,
          .xaaj-ref-mobile-dinnerware-toggle,
          .xaaj-ref-mobile-dinnerware-back{
            border-top:0!important;
          }

          .xaaj-ref-mobile-dinnerware-toggle:hover,
          .xaaj-ref-mobile-dinnerware-toggle:focus-visible,
          .xaaj-ref-mobile-menu-content nav a:hover,
          .xaaj-ref-mobile-menu-content nav a:focus-visible,
          .xaaj-ref-mobile-dinnerware-back:hover,
          .xaaj-ref-mobile-dinnerware-back:focus-visible{
            background:transparent!important;
            padding-left:24px!important;
            color:#756b62!important;
            outline:none;
            transform:translateX(2px);
          }

          .xaaj-ref-mobile-dinnerware-back{
            justify-content:flex-start;
            gap:14px;
          }

          .xaaj-ref-mobile-dinnerware-back-icon{
            flex:0 0 auto;
            transform:rotate(180deg);
            opacity:.75;
          }

          /* Minimal footer links */
          .xaaj-ref-mobile-menu-secondary{
            display:flex;
            align-items:center;
            flex-wrap:wrap;
            gap:16px 22px;
            padding:20px 24px 0;
            margin-top:auto;
            border-top:0!important;
          }

          .xaaj-ref-mobile-menu-secondary button{
            border:0;
            background:none;
            padding:0;
            color:#706960;
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
            font-size:10px;
            letter-spacing:.07em;
            cursor:pointer;
            transition:color .2s ease,opacity .2s ease;
          }

          .xaaj-ref-mobile-menu-secondary button:hover{
            color:#292722;
          }
        }

        @media (max-width:430px){
          .xaaj-ref-mobile-menu-toggle{
            left:10px;
            top:21px;
            width:40px;
            height:40px;
          }

          .xaaj-ref-logo img{
            width:76px!important;
            height:52px!important;
          }

          .xaaj-ref-logo span{
            font-size:5.5px!important;
            letter-spacing:1.75px!important;
            margin-top:1px!important;
          }

          .xaaj-ref-mobile-menu-content{
            padding-top:48px!important;
          }

          .xaaj-ref-mobile-menu-content nav a,
          .xaaj-ref-mobile-dinnerware-toggle,
          .xaaj-ref-mobile-dinnerware-back{
            min-height:59px;
            padding-left:20px!important;
            padding-right:20px!important;
            font-size:21px!important;
          }

          .xaaj-ref-mobile-dinnerware-toggle:hover,
          .xaaj-ref-mobile-dinnerware-toggle:focus-visible,
          .xaaj-ref-mobile-menu-content nav a:hover,
          .xaaj-ref-mobile-menu-content nav a:focus-visible,
          .xaaj-ref-mobile-dinnerware-back:hover,
          .xaaj-ref-mobile-dinnerware-back:focus-visible{
            padding-left:20px!important;
          }

          .xaaj-ref-mobile-menu-secondary{
            padding-left:20px;
            padding-right:20px;
            gap:14px 20px;
          }
        }
`}</style>
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
// PRODUCT CARD — MINIMAL EDITORIAL
// ============================================================

let adminPreviewSessionActive = false

const isAdminPreviewMode = () => {
  try {
    return new URLSearchParams(window.location.search).get('xaajPreview') === '1' || adminPreviewSessionActive
  } catch {
    return adminPreviewSessionActive
  }
}

function ProductCard({ product }) {
  const { add, wish, toggleWish } = useStore()
  const [added, setAdded] = useState(false)
  const productId = product.id || product._id
  const liked = wish.includes(productId)
  const secondary = product.images?.[1] || ''

  const handleAdd = event => {
    event.preventDefault()
    event.stopPropagation()
    if (isAdminPreviewMode()) return
    add(product)
    setAdded(true)
    window.dispatchEvent(new CustomEvent('xaaj:cart-added'))
    window.setTimeout(() => setAdded(false), 800)
  }

  return (
    <article className="xaaj-editorial-card">
      <div className="xaaj-editorial-card-media">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img className="primary" src={product.image} alt={product.name} loading="lazy" />
          {secondary && <img className="secondary" src={secondary} alt="" aria-hidden="true" loading="lazy" />}
        </Link>
        {product.tag && <span className="xaaj-editorial-tag">{product.tag}</span>}
        <button
          type="button"
          className={`xaaj-editorial-wish ${liked ? 'liked' : ''}`}
          onClick={event => { event.preventDefault(); event.stopPropagation(); toggleWish(productId) }}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button type="button" className={`xaaj-editorial-add ${added ? 'added' : ''}`} onClick={handleAdd}>
          {added ? <Check size={15} /> : <Plus size={15} />}
          <span>{added ? 'Added' : 'Add'}</span>
        </button>
      </div>
      <div className="xaaj-editorial-card-copy">
        <span>{product.category || 'XAAJ Collection'}</span>
        <Link to={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
        <div><strong>{money(product.price)}</strong>{Number(product.old || 0) > Number(product.price || 0) && <del>{money(product.old)}</del>}</div>
      </div>
      <style>{`
        .xaaj-editorial-card{min-width:0;color:#2c2924}.xaaj-editorial-card-media{position:relative;background:#f1eee7;overflow:hidden;aspect-ratio:4/5}.xaaj-editorial-card-media>a{display:block;width:100%;height:100%}.xaaj-editorial-card-media img{width:100%;height:100%;display:block;object-fit:cover;transition:opacity .45s ease,transform .8s cubic-bezier(.22,1,.36,1)}.xaaj-editorial-card-media .secondary{position:absolute;inset:0;opacity:0}.xaaj-editorial-card:hover .secondary{opacity:1}.xaaj-editorial-card:hover .primary{transform:scale(1.018)}.xaaj-editorial-tag{position:absolute;left:10px;top:10px;background:#fffdf9;padding:5px 7px;font-size:7px;letter-spacing:1px;text-transform:uppercase}.xaaj-editorial-wish{position:absolute;right:10px;top:10px;width:31px;height:31px;border:0;border-radius:50%;background:rgba(255,253,249,.9);display:grid;place-items:center;color:#302d28;cursor:pointer}.xaaj-editorial-wish.liked{color:#9a4c3d}.xaaj-editorial-add{position:absolute;right:10px;bottom:10px;height:34px;min-width:34px;border:1px solid rgba(255,255,255,.8);background:rgba(255,253,249,.92);color:#292621;display:flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;font-size:9px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;transition:all .25s}.xaaj-editorial-add span{display:none}.xaaj-editorial-add:hover,.xaaj-editorial-add.added{background:#2f7048;color:#fff;border-color:#2f7048}.xaaj-editorial-add:hover span,.xaaj-editorial-add.added span{display:inline}.xaaj-editorial-card-copy{padding:10px 1px 0}.xaaj-editorial-card-copy>span{display:block;color:#8a8379;font-size:8px;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:5px}.xaaj-editorial-card-copy h3{margin:0 0 6px;font:400 15px 'Gotham Book','Gotham',Arial,sans-serif;line-height:1.2}.xaaj-editorial-card-copy a{text-decoration:none;color:inherit}.xaaj-editorial-card-copy>div{display:flex;align-items:center;gap:7px;font-size:11px}.xaaj-editorial-card-copy del{color:#9b958b}.xaaj-editorial-card-copy strong{font-weight:500}
        @media(max-width:600px){.xaaj-editorial-card-media{aspect-ratio:3/4}.xaaj-editorial-card-copy h3{font-size:14px}.xaaj-editorial-add{min-width:32px;width:32px;padding:0}.xaaj-editorial-add span{display:none!important}}
        /* Final mobile header: Account icon sits between Search and Cart. */
        @media (max-width:850px){
          .xaaj-ref-actions .xaaj-ref-header-icon[aria-label="Account"]{
            display:grid!important;
            place-items:center!important;
          }

          .xaaj-ref-actions{
            gap:0!important;
          }

          .xaaj-ref-actions .xaaj-ref-header-icon,
          .xaaj-ref-actions .xaaj-ref-cart-button{
            width:36px!important;
            height:36px!important;
          }
        }

        @media (max-width:520px){
          .xaaj-ref-actions .xaaj-ref-header-icon[aria-label="Account"]{
            display:grid!important;
            place-items:center!important;
          }

          .xaaj-ref-actions .xaaj-ref-header-icon,
          .xaaj-ref-actions .xaaj-ref-cart-button{
            width:33px!important;
            height:33px!important;
          }
        }

      `}</style>
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
  const { products: liveProducts, bestSellingProducts, newArrivals } = useStore()
  const productList = Array.isArray(liveProducts) ? liveProducts : []
  const bestsellers = Array.isArray(bestSellingProducts) && bestSellingProducts.length ? bestSellingProducts : productList.slice(0, 4)
  const arrivals = Array.isArray(newArrivals) && newArrivals.length ? newArrivals : productList.slice(4, 8)
  const heroA = defaultHeroSlides[0]?.image || heroImage
  const heroB = defaultHeroSlides[1]?.image || tableImage
  const heroC = defaultHeroSlides[2]?.image || heroImage
  const categoryItems = Array.isArray(categories) ? categories.slice(0, 5) : []

  const [categoryHeroMedia, setCategoryHeroMedia] = useState({})

  useEffect(() => {
    let cancelled = false

    const loadCategoryHeroMedia = async () => {
      try {
        const result = await apiRequest('/cms/category-hero')

        const data =
          result?.data?.categories ||
          result?.data?.items ||
          result?.data?.heroes ||
          result?.categories ||
          result?.items ||
          result?.heroes ||
          result?.data ||
          []

        if (!Array.isArray(data) || cancelled) return

        const mediaBySlug = {}

        data.forEach(item => {
          if (!item || item.enabled === false) return

          const url =
            item.mediaUrl ||
            item.image ||
            item.imageUrl ||
            item.videoUrl ||
            item.url ||
            ''

          const slug = toCategoryHeroSlug(
            item.categorySlug ||
            item.slug ||
            item.categoryName ||
            item.name ||
            item.category?.slug ||
            item.category?.name
          )

          if (!slug || !url) return

          mediaBySlug[slug] = {
            url,
            mediaType: getCategoryHeroMediaType(url, item.mediaType),
            alt: item.alt || item.title || ''
          }
        })

        if (!cancelled) {
          setCategoryHeroMedia(mediaBySlug)
        }
      } catch (error) {
        // The existing category images remain the fallback when CMS data
        // is unavailable, so a CMS/network failure does not break the hero.
        if (!cancelled) {
          console.error('Category hero CMS load error:', error)
        }
      }
    }

    loadCategoryHeroMedia()

    return () => {
      cancelled = true
    }
  }, [])

  const categoryHeroItems = categoryHeroDefinitions.map(category => ({
    ...category,
    ...(categoryHeroMedia[category.slug] || {})
  }))

  // Brand Story media is CMS-controlled.
  // Removing the CMS media only removes the uploaded post; the Brand Story
  // section itself remains visible and falls back to the original table image.
  const [brandStoryMedia, setBrandStoryMedia] = useState({
    url: tableImage,
    mediaType: 'image',
    alt: 'XAAJ handcrafted tableware arranged on a linen table',
    enabled: true
  })

  useEffect(() => {
    let cancelled = false

    const loadBrandStoryMedia = async () => {
      try {
        const result = await apiRequest('/cms/brand-story')

        const raw =
          result?.data?.brandStory ||
          result?.data?.story ||
          result?.data?.item ||
          result?.brandStory ||
          result?.story ||
          result?.item ||
          result?.data ||
          result ||
          null

        const item = Array.isArray(raw)
          ? raw.find(entry => entry && typeof entry === 'object')
          : raw && typeof raw === 'object'
            ? raw
            : null

        const url =
          item?.mediaUrl ||
          item?.image ||
          item?.imageUrl ||
          item?.videoUrl ||
          item?.url ||
          ''

        if (cancelled) return

        const enabled =
          item?.enabled !== undefined
            ? Boolean(item.enabled)
            : item?.isActive !== undefined
              ? Boolean(item.isActive)
              : true

        // When Brand Story media is removed from Admin, keep the section
        // visible and fall back to the original table image.
        setBrandStoryMedia({
          url:
            url ||
            tableImage,
          mediaType: getBrandStoryMediaType(
            url || tableImage,
            item?.mediaType
          ),
          alt:
            item?.alt ||
            item?.title ||
            'XAAJ handcrafted tableware arranged on a linen table',
          enabled
        })
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Brand Story CMS load error:',
            error
          )
        }
      }
    }

    loadBrandStoryMedia()

    return () => {
      cancelled = true
    }
  }, [])

  // Horeca collection media is CMS-controlled by stable slots.
  // The original images remain the fallback when CMS data is unavailable
  // or a slot has been cleared from Admin.
  const [horecaMedia, setHorecaMedia] = useState(horecaDefaultMedia)

  useEffect(() => {
    let cancelled = false

    const loadHorecaMedia = async () => {
      try {
        const result = await apiRequest('/cms/horeca-collection')

        const raw =
          result?.data?.items ||
          result?.data?.horeca ||
          result?.data?.media ||
          result?.items ||
          result?.horeca ||
          result?.media ||
          result?.data ||
          result ||
          null

        const list = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object'
            ? Object.entries(raw).map(([slot, item]) => ({
                ...(item && typeof item === 'object' ? item : { mediaUrl: item }),
                slot
              }))
            : []

        const next = { ...horecaDefaultMedia }

        list.forEach(item => {
          if (!item || item.enabled === false) return

          const slotValue =
            item.slot ||
            item.key ||
            item.position ||
            item.name ||
            ''

          const slot = String(slotValue)
            .trim()
            .toLowerCase()
            .replace(/[\s_-]+/g, '')

          const resolvedSlot =
            slot === 'main' || slot === 'primary' || slot === 'left'
              ? 'main'
              : slot === 'sideone' || slot === 'side1' || slot === 'top' || slot === 'righttop'
                ? 'sideOne'
                : slot === 'sidetwo' || slot === 'side2' || slot === 'bottom' || slot === 'rightbottom'
                  ? 'sideTwo'
                  : null

          if (!resolvedSlot) return

          const url = String(
            item.mediaUrl ||
            item.image ||
            item.imageUrl ||
            item.url ||
            ''
          ).trim()

          if (!url) return

          next[resolvedSlot] = {
            ...next[resolvedSlot],
            url,
            alt:
              item.alt ||
              item.title ||
              next[resolvedSlot].alt
          }
        })

        if (!cancelled) {
          setHorecaMedia(next)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Horeca collection CMS load error:', error)
        }
      }
    }

    loadHorecaMedia()

    return () => {
      cancelled = true
    }
  }, [])

  const normalizeCategoryName = value =>
    String(value || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '')

  // Section 04 intentionally uses product photography while the
  // destination remains the matching category page.
  const sectionFiveCategoryImages = {
    'Plates': 'https://res.cloudinary.com/kswukbpp/image/upload/v1790268538/1.png',
    'Bowls': 'https://res.cloudinary.com/kswukbpp/image/upload/v1790268543/2.png',
    'Cups & Mugs': 'https://res.cloudinary.com/kswukbpp/image/upload/v1790269006/ChatGPT_Image_Sep_24_2026_10_26_10_PM.png',
    'Serveware': 'https://res.cloudinary.com/kswukbpp/image/upload/v1790269104/ChatGPT_Image_Sep_24_2026_10_27_52_PM.png'
  }

  const categoryShowcaseItems = ['Plates', 'Bowls', 'Cups & Mugs', 'Serveware']
    .map((target, index) => {
      const targetKey = normalizeCategoryName(target)
      const category = (Array.isArray(categories) ? categories : []).find(item => {
        const key = normalizeCategoryName(item?.name)
        return key === targetKey || key.includes(targetKey) || targetKey.includes(key)
      })

      if (!category) return null

      const showcaseProduct = productList.find(item => {
        const key = normalizeCategoryName(item?.category)
        return key === targetKey || key.includes(targetKey) || targetKey.includes(key)
      }) || productList[index] || null

      return {
        ...category,
        showcaseProduct
      }
    })
    .filter(Boolean)

  // Homepage hero media is CMS-controlled.
  // The Admin panel saves hero slides through /cms/hero.
  // This homepage reads the first enabled slide in order.
  // If CMS has no usable media, the existing local hero remains the fallback.
  const [heroMedia, setHeroMedia] = useState({
    image: heroA,
    mediaType: 'image',
    mobileImage: heroA,
    alt: 'XAAJ handcrafted tableware'
  })

  useEffect(() => {
    let cancelled = false

    const loadHeroMedia = async () => {
      try {
        const result = await cmsService.getHero()
        const slides = Array.isArray(result?.data?.slides)
          ? result.data.slides
          : []

        const activeSlides = slides
          .filter(slide => slide?.enabled !== false && slide?.image)
          .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))

        const first = activeSlides[0]
        if (!cancelled && first?.image) {
          setHeroMedia({
            image: first.image,
            mediaType: first.mediaType === 'video' ? 'video' : 'image',
            mobileImage: first.mobileImage || first.image,
            alt: first.alt || 'XAAJ handcrafted tableware'
          })
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Hero CMS load error:', error)
        }
      }
    }

    loadHeroMedia()

    return () => {
      cancelled = true
    }
  }, [heroA])

  const heroRef = useRef(null)
  const heroMediaRef = useRef(null)
  const heroContentRef = useRef(null)
  const heroMetaRef = useRef(null)
  const brandStoryRef = useRef(null)
  const brandStoryInnerRef = useRef(null)
  const brandStoryImageRef = useRef(null)
  const brandStoryProgressRef = useRef(null)
  const brandStoryNumberRef = useRef(null)
  const [heroReady, setHeroReady] = useState(false)

  useLayoutEffect(() => {
    const root = heroRef.current
    if (!root) return undefined

    // The homepage hero is now a static editorial category layout.
    // Keep the existing GSAP timelines for the sections below, but do not
    // pin/animate the hero itself.
    const ctx = gsap.context(() => {
      // The new hero is a lightweight editorial card layout.
      // No pinning or hero animation is used above the fold.

      const revealSections = root.parentElement?.querySelectorAll('[data-xaaj-cinema-reveal]:not(.xaaj-brand-story)') || []
      revealSections.forEach((el, index) => {
        gsap.fromTo(el,
          { y: 42, opacity: 0.35 },
          {
            y: 0,
            opacity: 1,
            duration: .85,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              end: 'top 55%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true
            },
            delay: Math.min(index * .04, .16)
          }
        )
      })

      const story = brandStoryRef.current
      if (story) {
        const storyInner = brandStoryInnerRef.current
        const storyImage = brandStoryImageRef.current
        const storyBlocks = Array.from(story.querySelectorAll('.xaaj-brand-story-block'))
        const storyProgress = brandStoryProgressRef.current
        const storyNumber = brandStoryNumberRef.current

        const desktop = window.matchMedia('(min-width: 851px)').matches

        if (storyInner && storyImage && storyBlocks.length && desktop) {
          // One dedicated scroll timeline controls the entire story.
          // Do not let an onUpdate handler overwrite the tweens, otherwise
          // reverse scrolling can feel like a snap.
          gsap.set(storyInner, { clearProps: 'transform', force3D: true })
          gsap.set(storyBlocks, { autoAlpha: 0, y: 34, force3D: true })
          gsap.set(storyBlocks[0], { autoAlpha: 1, y: 0 })

          gsap.set(storyImage, {
            scale: 1.06,
            yPercent: 0,
            transformOrigin: 'center center',
            force3D: true
          })

          if (storyProgress) {
            gsap.set(storyProgress, {
              scaleY: 0,
              transformOrigin: 'top center'
            })
          }

          if (storyNumber) storyNumber.textContent = '03 / 06 · 01'

          const storyTl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: story,
              start: 'top top',
              end: 'bottom top',
              pin: storyInner,
              pinSpacing: false,
              anticipatePin: 1,
              scrub: 1.15,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
              onUpdate: self => {
                if (storyProgress) {
                  storyProgress.style.transform = `scaleY(${self.progress})`
                }
                if (storyNumber) {
                  const chapter = self.progress < 0.34 ? 1 : self.progress < 0.68 ? 2 : 3
                  storyNumber.textContent = `03 / 06 · 0${chapter}`
                }
              }
            }
          })

          // Slow cinematic movement across the entire pinned sequence.
          storyTl.to(storyImage, {
            scale: 1,
            yPercent: -1,
            duration: 3,
            ease: 'none'
          }, 0)

          // 01 exits completely before 02 enters.
          storyTl.to(storyBlocks[0], {
            autoAlpha: 0,
            y: -24,
            duration: 0.22,
            ease: 'power2.in'
          }, 0.78)

          storyTl.fromTo(storyBlocks[1],
            { autoAlpha: 0, y: 34 },
            { autoAlpha: 1, y: 0, duration: 0.26, ease: 'power3.out' },
            1.04
          )

          // 02 exits completely before 03 enters.
          storyTl.to(storyBlocks[1], {
            autoAlpha: 0,
            y: -24,
            duration: 0.22,
            ease: 'power2.in'
          }, 1.86)

          storyTl.fromTo(storyBlocks[2],
            { autoAlpha: 0, y: 34 },
            { autoAlpha: 1, y: 0, duration: 0.26, ease: 'power3.out' },
            2.12
          )

          // Give the last chapter a little breathing room before release.
          storyTl.to(storyBlocks[2], {
            autoAlpha: 1,
            y: -3,
            duration: 0.88,
            ease: 'none'
          }, 2.30)

          if (storyProgress) {
            storyTl.to(storyProgress, {
              scaleY: 1,
              duration: 3,
              ease: 'none'
            }, 0)
          }

          const refreshStory = () => requestAnimationFrame(() => ScrollTrigger.refresh())

          if (storyImage.complete) refreshStory()
          else storyImage.addEventListener('load', refreshStory, { once: true })

          document.fonts?.ready?.then(refreshStory).catch(() => {})
                } else if (storyImage) {
          // Mobile intentionally does not pin. It becomes a natural editorial
          // stack with a lighter image movement for touch performance.
          gsap.fromTo(storyImage,
            { scale: 1.045 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: story,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.7,
                invalidateOnRefresh: true
              }
            }
          )
        }
      }

      // Section 08 — collection story uses a normal, continuous
      // right-to-left carousel. It is intentionally independent of scroll.
      // The duplicated pair makes the loop seamless with no jump.
      // Section 04: product-led category gallery.
      // The entrance is scrubbed rather than toggle-based, so reverse
      // scrolling stays smooth and never pops back into place.
      const gallery = root.parentElement?.querySelector('.xaaj-category-gallery')
      if (gallery) {
        const galleryCards = Array.from(
          gallery.querySelectorAll('.xaaj-category-gallery-card')
        )
        const galleryImages = Array.from(
          gallery.querySelectorAll('.xaaj-category-gallery-card img')
        )
        const desktop = window.matchMedia('(min-width: 851px)').matches

        if (galleryCards.length) {
          gsap.set(galleryCards, {
            autoAlpha: 1,
            y: desktop ? 34 : 18,
            clipPath: 'inset(4% 0% 0% 0%)',
            force3D: true
          })

          gsap.to(galleryCards, {
            autoAlpha: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            stagger: desktop ? 0.055 : 0.03,
            scrollTrigger: {
              trigger: gallery,
              start: 'top 98%',
              end: 'top 62%',
              scrub: 1.25,
              invalidateOnRefresh: true
            }
          })
        }

        if (galleryImages.length) {
          gsap.set(galleryImages, {
            scale: 1.045,
            force3D: true
          })

          gsap.to(galleryImages, {
            scale: 1,
            ease: 'none',
            stagger: 0.035,
            scrollTrigger: {
              trigger: gallery,
              start: 'top 98%',
              end: 'top 54%',
              scrub: 1.35,
              invalidateOnRefresh: true
            }
          })
        }
      }

        // Section 06 uses a single static image. No carousel or scroll animation.
      requestAnimationFrame(() => ScrollTrigger.refresh())
      window.setTimeout(() => ScrollTrigger.refresh(), 300)
    }, root)

    setHeroReady(true)
    return () => ctx.revert()
  }, [heroMedia.mediaType, heroMedia.image])

  useEffect(() => {
    document.body.classList.add('xaaj-cinematic-home')
    return () => document.body.classList.remove('xaaj-cinematic-home')
  }, [])

  return (
    <>
      <Header />
      <main className="xaaj-cinema-home">
        <style>{`
          body.xaaj-cinematic-home{padding-top:0!important;background:#ffffff}
          .xaaj-cinema-home{background:#ffffff;color:#292722;overflow-x:clip}
          .xaaj-cinema-home *{box-sizing:border-box}

          /* Temporarily hide the sections shown in the supplied reference screenshots.
             JSX, data, product mapping and all existing logic are intentionally preserved. */
          .xaaj-cinema-home .xaaj-everyday-carousel,
          .xaaj-cinema-home .xaaj-cinema-products,
          .xaaj-cinema-home .xaaj-collection-story-carousel,
          .xaaj-cinema-home .xaaj-cinema-quote{
            display:none !important;
          }

          .xaaj-cinema-hero{position:relative;height:100svh;min-height:680px;overflow:hidden;background:#171712;color:#fff}
          .xaaj-cinema-hero-media{position:absolute;inset:0;overflow:hidden;background:#171712}
          .xaaj-cinema-hero-media img,.xaaj-cinema-hero-media video{width:100%;height:100%;object-fit:cover;object-position:center;display:block;will-change:transform;filter:saturate(.82) contrast(.96)}
          .xaaj-cinema-hero-media video{pointer-events:none}
          .xaaj-cinema-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,7,5,.62) 0%,rgba(7,7,5,.28) 34%,rgba(7,7,5,.06) 66%,rgba(7,7,5,.22) 100%),linear-gradient(0deg,rgba(0,0,0,.26),transparent 34%,rgba(0,0,0,.16));opacity:1;pointer-events:none}
          .xaaj-cinema-grain{position:absolute;inset:0;opacity:.06;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")}
          .xaaj-cinema-content{position:absolute;z-index:3;left:7vw;top:50%;transform:translateY(-50%);max-width:560px;will-change:transform,opacity}
          .xaaj-cinema-eyebrow{display:block;margin-bottom:18px;font-size:9px;letter-spacing:3.5px;text-transform:uppercase;color:rgba(255,255,255,.72)}
          .xaaj-cinema-title{margin:0;overflow:hidden;font:400 clamp(52px,7.2vw,112px)/.86 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:-.055em}
          .xaaj-cinema-title-line{display:block;overflow:hidden}
          .xaaj-cinema-copy{max-width:370px;margin:25px 0 27px;color:rgba(255,255,255,.78);font-size:13px;line-height:1.7}
          .xaaj-cinema-cta{display:inline-flex;align-items:center;gap:10px;color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.72);padding:13px 18px;font-size:9px;letter-spacing:1.8px;text-transform:uppercase;transition:background .3s ease,color .3s ease}
          .xaaj-cinema-cta:hover{background:#fff;color:#222}
          .xaaj-cinema-meta{position:absolute;z-index:3;right:5.5vw;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:flex-end;gap:15px;will-change:transform,opacity}
          .xaaj-cinema-meta-label{writing-mode:vertical-rl;transform:rotate(180deg);font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.7)}
          .xaaj-cinema-meta-line{width:1px;height:72px;background:rgba(255,255,255,.55)}
          .xaaj-cinema-next-hint{position:absolute;z-index:3;bottom:30px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:9px;color:rgba(255,255,255,.76);font-size:8px;letter-spacing:2.5px;text-transform:uppercase;white-space:nowrap}
          .xaaj-cinema-next-hint span:last-child{width:1px;height:34px;background:rgba(255,255,255,.7)}
          .xaaj-cinema-index{position:absolute;z-index:3;left:7vw;bottom:30px;display:flex;gap:16px;font-size:8px;letter-spacing:1.5px;color:rgba(255,255,255,.72)}
          .xaaj-cinema-index strong{font-weight:400;color:#fff}

          .xaaj-cinema-intro{display:grid;grid-template-columns:.75fr 1.25fr;min-height:650px;background:#f7f5ef}
          .xaaj-cinema-intro-copy{display:flex;align-items:center;padding:80px clamp(30px,7vw,110px);background:#f7f5ef}
          .xaaj-cinema-intro-copy>div{max-width:430px}
          .xaaj-cinema-eyebrow-dark,.xaaj-cinema-section-eyebrow{display:block;font-size:8px;letter-spacing:2.8px;text-transform:uppercase;color:#918b81}
          .xaaj-cinema-intro h2{margin:13px 0 20px;font:400 clamp(42px,5vw,76px)/.91 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:-.05em}
          .xaaj-cinema-intro p{max-width:390px;margin:0 0 25px;color:#746e65;font-size:12px;line-height:1.85}
          .xaaj-cinema-text-link{display:inline-flex;align-items:center;gap:8px;color:#302d28;text-decoration:none;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;border-bottom:1px solid #9d978d;padding-bottom:6px}
          .xaaj-cinema-intro-media{position:relative;min-height:650px;overflow:hidden}
          .xaaj-cinema-intro-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 1s cubic-bezier(.22,1,.36,1)}
          .xaaj-cinema-intro-media:hover img{transform:scale(1.025)}
          .xaaj-cinema-intro-side{position:absolute;right:0;bottom:0;width:min(28%,330px);padding:28px;background:rgba(37,35,30,.82);color:#fff;backdrop-filter:blur(8px)}
          .xaaj-cinema-intro-side h3{margin:10px 0 0;font:400 30px/1 'Gotham Book','Gotham',Arial,sans-serif}

          /* XAAJ brand story: editorial split-screen with a pinned cinematic image */
          .xaaj-brand-story{position:relative;height:300svh;min-height:300svh;background:#171712;color:#f4f1e9;isolation:isolate;overflow:clip}
          .xaaj-brand-story-inner{position:relative;width:100%;height:100svh;min-height:680px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);overflow:hidden;will-change:transform;z-index:20}
          .xaaj-brand-story-image{position:relative;height:100%;min-width:0;overflow:hidden;background:#24231f}
          .xaaj-brand-story-image::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.18) 70%,rgba(0,0,0,.42));pointer-events:none}
          .xaaj-brand-story-image img,.xaaj-brand-story-image video{width:100%;height:100%;object-fit:cover;object-position:center center;display:block;will-change:transform;filter:saturate(.88) contrast(1.02)}
          .xaaj-brand-story-image video{pointer-events:none}
          .xaaj-brand-story-image-label{position:absolute;z-index:2;left:clamp(24px,4vw,64px);bottom:clamp(28px,5vw,62px);font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.78)}
          .xaaj-brand-story-content{position:relative;display:flex;align-items:center;min-width:0;padding:0 clamp(36px,7vw,110px);background:#171712;overflow:hidden}
          .xaaj-brand-story-content::before{content:'XAAJ';position:absolute;right:-.03em;top:50%;transform:translateY(-50%);font:400 clamp(130px,20vw,320px)/.8 'Gotham Book','Gotham',Arial,sans-serif;color:rgba(255,255,255,.025);pointer-events:none;letter-spacing:-.08em}
          .xaaj-brand-story-kicker{position:absolute;z-index:3;left:clamp(36px,7vw,110px);top:clamp(30px,5vw,58px);display:flex;align-items:center;gap:12px;margin:0;color:rgba(255,255,255,.82);font-size:9px;letter-spacing:3.2px;text-transform:uppercase}
          .xaaj-brand-story-kicker i{display:block;width:32px;height:1px;background:rgba(255,255,255,.55)}
          .xaaj-brand-story-kicker span{font-weight:600}
          .xaaj-brand-story-kicker b{font-size:7px;font-weight:500;letter-spacing:2px;color:rgba(255,255,255,.38);margin-left:4px}
          .xaaj-brand-story-block{position:absolute;z-index:2;left:clamp(36px,7vw,110px);right:clamp(52px,7vw,110px);top:50%;transform:translateY(-50%);max-width:590px;margin:0;visibility:visible;opacity:0;will-change:transform,opacity;pointer-events:none}
          .xaaj-brand-story-block:first-of-type{opacity:1}
          .xaaj-brand-story-block.is-active{pointer-events:auto}
          .xaaj-brand-story-block:last-of-type{margin-bottom:0}
          .xaaj-brand-story-block h2{margin:0 0 26px;font:400 clamp(42px,5.2vw,78px)/.9 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:-.055em;color:#f6f2e9}
          .xaaj-brand-story-block h3{margin:0 0 24px;font:400 clamp(28px,3.1vw,48px)/1 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:-.035em;color:#f6f2e9}
          .xaaj-brand-story-block p{max-width:500px;margin:0;color:rgba(246,242,233,.66);font-size:13px;line-height:1.95}
          .xaaj-brand-story-lines{display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:26px;color:rgba(246,242,233,.88);font-size:11px;letter-spacing:.4px}
          .xaaj-brand-story-lines span{position:relative}
          .xaaj-brand-story-lines span:not(:last-child)::after{content:'·';position:absolute;right:-13px;color:rgba(255,255,255,.35)}
          .xaaj-brand-story-discover{display:inline-flex;align-items:center;gap:10px;margin-top:30px;color:#f6f2e9;text-decoration:none;font-size:9px;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.4);padding-bottom:8px;width:max-content}
          .xaaj-brand-story-progress{position:absolute;z-index:5;top:50%;right:clamp(18px,3vw,42px);width:1px;height:96px;background:rgba(255,255,255,.14);transform:translateY(-50%)}
          .xaaj-brand-story-progress span{display:block;width:1px;height:100%;background:rgba(255,255,255,.85);transform:scaleY(0);transform-origin:top}
          .xaaj-brand-story-number{position:absolute;z-index:4;left:clamp(24px,4vw,64px);top:clamp(24px,4vw,50px);font-size:8px;letter-spacing:2px;color:rgba(255,255,255,.7)}

          /* NEW SECTION 03 — two premium editorial tiles */
          .xaaj-brand-story-split{
            width:100%;
            padding:32px 0 76px;
            background:#ffffff;
          }
          .xaaj-brand-story-split-inner{
            /* Match the hero grid width exactly, so both sections share the same left/right edges. */
            width:min(1140px,calc(100% - 48px));
            margin:0 auto;
            display:grid;
            grid-template-columns:minmax(0,1fr) minmax(0,1fr);
            gap:14px;
            align-items:stretch;
          }
          .xaaj-brand-story-split-media,
          .xaaj-brand-story-split-copy{
            min-width:0;
            min-height:540px;
            border:1px solid rgba(48,45,40,.14);
            border-radius:7px;
            overflow:hidden;
          }
          .xaaj-brand-story-split-media{
            display:block;
            position:relative;
            background:#eee9df;
          }
          .xaaj-brand-story-split-media img,
          .xaaj-brand-story-split-media video{
            width:100%;
            height:100%;
            display:block;
            object-fit:cover;
            object-position:center;
            transition:transform .9s cubic-bezier(.22,1,.36,1);
          }
          .xaaj-brand-story-split-media:hover img,
          .xaaj-brand-story-split-media:hover video{
            transform:scale(1.018);
          }
          .xaaj-brand-story-split-copy{
            display:flex;
            align-items:center;
            justify-content:center;
            padding:64px clamp(34px,5.4vw,82px);
            background:#fffdf9;
          }
          .xaaj-brand-story-split-copy-inner{
            width:min(100%,500px);
          }
          .xaaj-brand-story-split-eyebrow{
            display:block;
            margin-bottom:18px;
            color:#8b847b;
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
            font-size:8px;
            line-height:1;
            font-weight:500;
            letter-spacing:2.8px;
            text-transform:uppercase;
          }
          .xaaj-brand-story-split-copy h2{
            margin:0 0 25px;
            color:#302d28;
            font:400 clamp(38px,4.2vw,66px)/.96 'Gotham Book','Gotham',Arial,sans-serif;
            letter-spacing:-.045em;
          }
          .xaaj-brand-story-split-copy p{
            max-width:470px;
            margin:0;
            color:#6d675f;
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
            font-size:12px;
            line-height:1.9;
          }
          .xaaj-brand-story-split-button{
            display:inline-flex;
            align-items:center;
            justify-content:center;
            gap:12px;
            margin-top:30px;
            min-width:138px;
            min-height:44px;
            padding:0 19px;
            border:1px solid rgba(48,45,40,.72);
            border-radius:3px;
            color:#302d28;
            text-decoration:none;
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
            font-size:9px;
            letter-spacing:1.8px;
            text-transform:uppercase;
            transition:background .28s ease,color .28s ease,border-color .28s ease;
          }
          .xaaj-brand-story-split-button:hover{
            background:#302d28;
            color:#fffdf9;
            border-color:#302d28;
          }
          @media(max-width:850px){
            .xaaj-brand-story-split{
              padding:26px 18px 58px;
            }
            .xaaj-brand-story-split-inner{
              grid-template-columns:1fr;
              gap:12px;
            }
            .xaaj-brand-story-split-media,
            .xaaj-brand-story-split-copy{
              min-height:0;
            }
            .xaaj-brand-story-split-media{
              aspect-ratio:1/1.02;
            }
            .xaaj-brand-story-split-copy{
              padding:54px 30px 58px;
              min-height:420px;
            }
            .xaaj-brand-story-split-copy h2{
              font-size:clamp(36px,9vw,52px);
            }
          }
          @media(max-width:520px){
            .xaaj-brand-story-split{
              padding:22px 12px 44px;
            }
            .xaaj-brand-story-split-copy{
              padding:45px 24px 48px;
              min-height:390px;
            }
            .xaaj-brand-story-split-copy p{
              font-size:11px;
              line-height:1.82;
            }
          }

          .xaaj-cinema-category{display:none!important;padding:58px 0 62px;background:#f7f5ef;border-top:1px solid rgba(42,39,34,.07);border-bottom:1px solid rgba(42,39,34,.07)}
          .xaaj-cinema-wrap{width:min(100% - 56px,1700px);margin:auto}
          .xaaj-cinema-category-inner{display:grid;grid-template-columns:250px minmax(0,1fr);align-items:center;gap:34px}
          .xaaj-cinema-category-intro{padding:8px 0 0}
          .xaaj-cinema-category-intro .xaaj-cinema-section-eyebrow{font-size:8px;letter-spacing:2.5px;color:#292722;font-weight:600}
          .xaaj-cinema-category-intro p{max-width:185px;margin:18px 0 30px;color:#777168;font-size:11px;line-height:1.7}
          .xaaj-cinema-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:32px}
          .xaaj-cinema-section-title{margin:10px 0 0;font:400 clamp(40px,5vw,70px)/.92 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:-.05em}
          .xaaj-cinema-category-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}
          .xaaj-cinema-category-card{position:relative;min-width:0;aspect-ratio:.9/1;overflow:hidden;color:#fff;text-decoration:none;background:#302d27}
          .xaaj-cinema-category-card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .9s cubic-bezier(.22,1,.36,1);filter:saturate(.78)}
          .xaaj-cinema-category-card:after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.7),transparent 58%)}
          .xaaj-cinema-category-card:hover img{transform:scale(1.045)}
          .xaaj-cinema-category-card span{position:absolute;z-index:2;left:20px;right:14px;bottom:19px;font:400 17px 'Gotham Book','Gotham',Arial,sans-serif;white-space:nowrap;letter-spacing:-.01em}.xaaj-cinema-category-card:before{content:"";position:absolute;z-index:2;left:20px;bottom:52px;width:28px;height:1px;background:rgba(255,255,255,.58)}

          /* HORECA COLLECTION — same Craft-style geometry as the reference */
          .xaaj-horeca-bundled{
            background:#fff;
            color:#302d28;
            padding:56px 24px 24px;
            overflow:hidden;
          }
          .xaaj-horeca-bundled-inner{
            width:min(1140px,100%);
            margin:0 auto;
          }
          .xaaj-horeca-bundled h2{
            margin:0 0 34px;
            color:#302d28;
            font:400 32px/1.1 'Gotham Book','Gotham',Arial,sans-serif;
            letter-spacing:-.035em;
          }
          .xaaj-horeca-bundled-grid{
            display:grid;
            grid-template-columns:minmax(0,2.1fr) minmax(270px,.9fr);
            gap:18px;
            align-items:stretch;
          }
          .xaaj-horeca-bundled-main{
            display:block;
            min-width:0;
            color:inherit;
            text-decoration:none;
            background:#fff;
            border:1px solid rgba(48,45,40,.12);
            border-radius:5px;
            overflow:hidden;
          }
          .xaaj-horeca-bundled-media{
            width:100%;
            aspect-ratio:1.62/1;
            overflow:hidden;
            background:#e9e5dd;
          }
          .xaaj-horeca-bundled-media img,
          .xaaj-horeca-bundled-small img{
            width:100%;
            height:100%;
            display:block;
            object-fit:cover;
            transition:transform .7s cubic-bezier(.22,1,.36,1);
          }
          .xaaj-horeca-bundled-main:hover .xaaj-horeca-bundled-media img,
          .xaaj-horeca-bundled-small:hover img{
            transform:scale(1.018);
          }
          .xaaj-horeca-bundled-label{
            min-height:78px;
            padding:0 22px;
            display:flex;
            align-items:center;
            justify-content:flex-start;
            gap:7px;
            color:#302d28;
            font:400 21px/1 'Gotham Book','Gotham',Arial,sans-serif;
            border-top:1px solid rgba(48,45,40,.1);
          }
          .xaaj-horeca-bundled-label svg{
            transition:transform .25s ease;
          }
          .xaaj-horeca-bundled-main:hover .xaaj-horeca-bundled-label svg{
            transform:translateX(3px);
          }
          .xaaj-horeca-bundled-side{
            display:grid;
            grid-template-rows:1fr 1fr;
            gap:18px;
            min-width:0;
          }
          .xaaj-horeca-bundled-small{
            display:block;
            min-width:0;
            min-height:0;
            overflow:hidden;
            border-radius:5px;
            background:#e9e5dd;
            border:1px solid rgba(48,45,40,.12);
          }
          .xaaj-horeca-bundled-small img{
            aspect-ratio:1.46/1;
          }
          @media(max-width:850px){
            .xaaj-horeca-bundled{
              padding:48px 18px 22px;
            }
            .xaaj-horeca-bundled h2{
              margin-bottom:24px;
              font-size:30px;
            }
            .xaaj-horeca-bundled-grid{
              grid-template-columns:1fr;
              gap:12px;
            }
            .xaaj-horeca-bundled-side{
              grid-template-columns:1fr 1fr;
              grid-template-rows:none;
              gap:12px;
            }
            .xaaj-horeca-bundled-small img{
              aspect-ratio:1/1;
            }
          }
          @media(max-width:520px){
            .xaaj-horeca-bundled{
              padding:42px 12px 20px;
            }
            .xaaj-horeca-bundled h2{
              font-size:31px;
            }
            .xaaj-horeca-bundled-label{
              min-height:62px;
              padding:0 17px;
              font-size:18px;
            }
          }

          /* Section 04: category spotlight gallery inspired by the supplied reference. */
          .xaaj-category-gallery{background:#eee8d8;color:#2d3428;padding:78px clamp(28px,4.2vw,72px) 92px;position:relative;overflow:hidden;border-top:1px solid rgba(55,61,48,.08);border-bottom:1px solid rgba(55,61,48,.08);z-index:10;backface-visibility:hidden}
          .xaaj-category-gallery::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 12% 8%,rgba(255,255,255,.45),transparent 30%),radial-gradient(circle at 92% 90%,rgba(132,113,79,.08),transparent 32%)}
          .xaaj-category-gallery-head{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;margin-bottom:34px;padding:0 2px;color:#69715d;font-size:9px;letter-spacing:2.8px;text-transform:uppercase}
          .xaaj-category-gallery-head a{display:inline-flex;align-items:center;gap:8px;color:#4f5a46;text-decoration:none;letter-spacing:1.5px;font-size:8px;border-bottom:1px solid rgba(79,90,70,.32);padding-bottom:5px;transition:opacity .3s ease}
          .xaaj-category-gallery-head a:hover{opacity:.65}
          .xaaj-category-gallery-grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(18px,2vw,34px);width:100%}
          .xaaj-category-gallery-card{display:block;min-width:0;color:#4f5a46;text-decoration:none;will-change:transform,opacity,clip-path;transform:translateZ(0)}
          .xaaj-category-gallery-image{overflow:hidden;background:#e5dfd1;aspect-ratio:.84/1;position:relative}
          .xaaj-category-gallery-image::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.01),rgba(0,0,0,.07))}
          .xaaj-category-gallery-image img{width:100%;height:100%;display:block;object-fit:cover;object-position:center;transform-origin:center center;will-change:transform;filter:saturate(.82) contrast(.99);transition:transform 1.15s cubic-bezier(.22,1,.36,1)}
          .xaaj-category-gallery-card:hover .xaaj-category-gallery-image img{transform:scale(1.035)}
          .xaaj-category-gallery-label{display:flex;align-items:center;justify-content:center;min-height:54px;padding:15px 4px 0;color:#59664e;font-size:16px;letter-spacing:.05px;font-family:'Gotham Book','Gotham',Arial,sans-serif;text-align:center}
          .xaaj-brand-story + .xaaj-category-gallery{box-shadow:0 -18px 48px rgba(24,23,18,.07)}

          /* SECTION 06 — THE EVERYDAY TABLE / single image */
          .xaaj-everyday-carousel{position:relative;height:88svh;min-height:620px;background:#161611;color:#fff;overflow:hidden;isolation:isolate}
          .xaaj-everyday-carousel-track{position:relative;width:100%;height:100%;min-height:620px;overflow:hidden;background:#161611}
          .xaaj-everyday-slide{position:absolute;inset:0;margin:0;overflow:hidden;z-index:1}
          .xaaj-everyday-slide img{width:100%;height:100%;object-fit:cover;object-position:center;display:block;filter:saturate(.82) contrast(.97);transform:scale(1.02)}
          .xaaj-everyday-overlay{position:absolute;z-index:3;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(10,9,7,.68) 0%,rgba(10,9,7,.28) 34%,rgba(10,9,7,.05) 70%,rgba(10,9,7,.16) 100%),linear-gradient(0deg,rgba(0,0,0,.28),transparent 45%,rgba(0,0,0,.08))}
          .xaaj-everyday-copy{position:absolute;z-index:5;left:7vw;top:50%;transform:translateY(-50%);width:min(510px,44vw)}
          .xaaj-everyday-copy h2{margin:12px 0 20px;font:400 clamp(48px,6.5vw,98px)/.86 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:-.055em}
          .xaaj-everyday-subtitle{font:400 clamp(18px,2vw,29px)/1.15 'Gotham Book','Gotham',Arial,sans-serif!important;color:rgba(255,255,255,.92)!important;max-width:560px!important;margin:-5px 0 18px!important;line-height:1.25!important}
          .xaaj-everyday-copy p{max-width:370px;color:rgba(255,255,255,.78);font-size:12px;line-height:1.8;margin-bottom:25px}
          .xaaj-everyday-progress,.xaaj-everyday-scroll-hint{display:none}

          .xaaj-cinema-quote{padding:110px 24px;text-align:center;background:#f7f5ef}
          .xaaj-cinema-quote p{max-width:900px;margin:0 auto;font:400 clamp(35px,5vw,72px)/.98 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:-.05em}
          .xaaj-cinema-quote span{display:block;margin-top:25px;color:#928b81;font-size:8px;letter-spacing:2.5px;text-transform:uppercase}

          .xaaj-cinema-products{padding:105px 0;background:#f7f5ef}
          .xaaj-cinema-product-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:17px}
          .xaaj-cinema-product-grid .xaaj-editorial-card-media{aspect-ratio:4/5}
          .xaaj-cinema-product-grid .xaaj-editorial-card-copy h3{font-size:16px}

          /* SECTION 08 — COLLECTION STORY / NORMAL RIGHT-TO-LEFT CAROUSEL */
          .xaaj-collection-story-carousel{
            position:relative;
            height:100svh;
            min-height:680px;
            display:grid;
            grid-template-columns:1fr 1fr;
            background:#e8e3d9;
            overflow:hidden;
            isolation:isolate;
          }
          .xaaj-collection-story-media{
            position:relative;
            height:100%;
            min-height:680px;
            overflow:hidden;
            background:#d8d1c5;
          }
          .xaaj-collection-story-track{
            display:flex;
            width:400%;
            height:100%;
            will-change:transform;
            animation:xaajCollectionStoryRTL 14s linear infinite;
          }
          .xaaj-collection-story-slide{
            position:relative;
            flex:0 0 25%;
            width:25%;
            height:100%;
            margin:0;
            overflow:hidden;
          }
          .xaaj-collection-story-slide img{
            width:100%;
            height:100%;
            object-fit:cover;
            object-position:center;
            display:block;
            transform:scale(1.025);
            transition:transform .8s ease;
          }
          .xaaj-collection-story-carousel:hover .xaaj-collection-story-track{
            animation-play-state:paused;
          }
          @keyframes xaajCollectionStoryRTL{
            from{transform:translate3d(0,0,0)}
            to{transform:translate3d(-50%,0,0)}
          }
          .xaaj-collection-story-copy{
            position:relative;
            z-index:5;
            display:flex;
            align-items:center;
            padding:80px clamp(35px,7vw,105px);
            background:#e8e3d9;
          }
          .xaaj-collection-story-copy>div{max-width:490px}
          .xaaj-collection-story-copy h2{
            margin:12px 0 20px;
            font:400 clamp(45px,5.5vw,82px)/.9 'Gotham Book','Gotham',Arial,sans-serif;
            letter-spacing:-.05em;
          }
          .xaaj-collection-story-copy p{
            color:#716b61;
            font-size:12px;
            line-height:1.85;
            max-width:390px;
            margin-bottom:25px;
          }

          .xaaj-cinema-new{position:relative;min-height:72svh;overflow:hidden;color:#fff;background:#292720}
          .xaaj-cinema-new img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.72)}
          .xaaj-cinema-new:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,18,14,.62),rgba(20,18,14,.08) 70%)}
          .xaaj-cinema-new-copy{position:relative;z-index:2;min-height:72svh;display:flex;align-items:center;padding:80px 7vw}
          .xaaj-cinema-new h2{margin:12px 0 23px;font:400 clamp(45px,6vw,88px)/.88 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:-.05em;max-width:600px}

          .xaaj-cinema-reveal{opacity:1;transform:none;will-change:transform,opacity}

          @media(max-width:850px){
            .xaaj-cinema-hero{min-height:100svh;height:100svh}
            .xaaj-cinema-content{left:22px;right:22px;top:auto;bottom:105px;transform:none;max-width:520px}
            .xaaj-cinema-title{font-size:clamp(48px,14vw,78px)}
            .xaaj-cinema-copy{font-size:11px;max-width:320px}
            .xaaj-cinema-meta{right:18px;top:auto;bottom:125px}
            .xaaj-cinema-index{left:22px;bottom:31px}
            .xaaj-cinema-next-hint{bottom:28px}
            .xaaj-cinema-intro{grid-template-columns:1fr;min-height:0}
            .xaaj-cinema-intro-copy{min-height:470px;padding:60px 22px}
            .xaaj-cinema-intro-media{height:80svh;min-height:460px}
            .xaaj-cinema-intro-side{width:45%;padding:20px}
            .xaaj-cinema-intro-side h3{font-size:22px}
            .xaaj-brand-story{height:auto;min-height:auto}
            .xaaj-brand-story-inner{position:relative;height:auto;min-height:0;display:block;overflow:visible}
            .xaaj-brand-story-image{height:72svh;min-height:460px;position:relative}
            .xaaj-brand-story-content{display:block;min-height:0;padding:78px 22px 90px;overflow:hidden}
            .xaaj-brand-story-kicker{position:relative;left:auto;top:auto;margin:0 0 48px}
            .xaaj-brand-story-block{position:relative;left:auto;right:auto;top:auto;transform:none;margin-bottom:92px;max-width:none;visibility:visible;opacity:1;pointer-events:auto}
            .xaaj-brand-story-block:last-of-type{margin-bottom:0}
            .xaaj-brand-story-block h2{font-size:48px}
            .xaaj-brand-story-block h3{font-size:34px}
            .xaaj-brand-story-block p{font-size:12px;line-height:1.85}
            .xaaj-brand-story-progress{display:none}
            .xaaj-cinema-wrap{width:calc(100% - 28px)}
            .xaaj-cinema-category{padding:28px 0 30px}
            .xaaj-cinema-category-inner{grid-template-columns:1fr;gap:24px}
            .xaaj-cinema-category-intro p{max-width:360px;margin:12px 0 18px}
            .xaaj-cinema-category-grid{grid-template-columns:repeat(2,1fr);gap:11px}
            .xaaj-cinema-category-card{aspect-ratio:.92/1}
            .xaaj-cinema-category-card span{font-size:16px;left:15px;bottom:15px}.xaaj-cinema-category-card:before{left:15px;bottom:44px}
            .xaaj-category-gallery{padding:54px 18px 64px}
            .xaaj-category-gallery-head{margin-bottom:23px;font-size:8px}
            .xaaj-category-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 12px}
            .xaaj-category-gallery-image{aspect-ratio:.84/1}
            .xaaj-category-gallery-label{min-height:48px;padding-top:11px;font-size:13px}
            .xaaj-brand-story-kicker{left:22px;top:25px;gap:9px;font-size:8px;letter-spacing:2.5px}.xaaj-brand-story-kicker i{width:24px}.xaaj-brand-story-kicker b{font-size:6px}
            .xaaj-everyday-carousel{height:78svh;min-height:520px}
            .xaaj-everyday-carousel-track{height:100%;min-height:520px}
            .xaaj-everyday-copy{left:22px;right:22px;top:auto;bottom:82px;transform:none;width:auto}
            .xaaj-everyday-copy h2{font-size:clamp(43px,12vw,70px)}
            .xaaj-everyday-copy p{font-size:11px;max-width:330px}
            .xaaj-everyday-progress,.xaaj-everyday-scroll-hint{display:none}
            .xaaj-cinema-product-grid{grid-template-columns:repeat(2,1fr);gap:12px}
            .xaaj-cinema-products{padding:70px 0}
            .xaaj-collection-story-carousel{
              height:auto;
              min-height:0;
              display:grid;
              grid-template-columns:1fr;
              overflow:hidden;
            }
            .xaaj-collection-story-media{
              height:78svh;
              min-height:460px;
            }
            .xaaj-collection-story-track{
              height:100%;
              animation-duration:11s;
            }
            .xaaj-collection-story-slide{
              flex:0 0 25%;
              width:25%;
              height:100%;
              min-height:460px;
            }
            .xaaj-collection-story-slide img{
              transform:none;
            }
            .xaaj-collection-story-copy{
              min-height:460px;
              padding:60px 22px;
            }
            .xaaj-collection-story-counter,
            .xaaj-collection-story-progress{
              display:none;
            }
            .xaaj-cinema-new,.xaaj-cinema-new-copy{min-height:72svh}
            .xaaj-cinema-new-copy{padding:60px 22px}
            .xaaj-cinema-quote{padding:75px 20px}
          }
          @media(max-width:520px){
            .xaaj-cinema-hero-media img{object-position:58% center}
            .xaaj-cinema-eyebrow{font-size:8px;letter-spacing:2.5px}
            .xaaj-cinema-copy{margin:18px 0 22px}
            .xaaj-cinema-meta{display:none}
            .xaaj-cinema-intro-side{width:52%;padding:15px}
            .xaaj-cinema-intro-side h3{font-size:18px}
            .xaaj-cinema-section-head{align-items:flex-start;flex-direction:column}
            .xaaj-cinema-section-title{font-size:43px}
            .xaaj-cinema-category-intro p{font-size:10px}
            .xaaj-cinema-category-card span{font-size:16px}
          }
          @media(prefers-reduced-motion:reduce){
            .xaaj-cinema-home *{scroll-behavior:auto!important}
            .xaaj-cinema-reveal{opacity:1;transform:none}
            .xaaj-category-gallery-card{opacity:1!important;transform:none!important;clip-path:none!important}
          }

          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');
          body.xaaj-cinematic-home{background:#f8f6f1!important}
          body.xaaj-cinematic-home,body.xaaj-cinematic-home *{font-family:'Gotham Book','Gotham',Arial,sans-serif}
          .xaaj-reference-hero{
            position:relative;
            z-index:1;
            background:#ffffff;
            color:#292722;
            padding:64px 3.45vw 40px;
            overflow:hidden;
          }

          .xaaj-reference-hero-heading{
            text-align:center;
            padding:0 15px 62px;
          }

          .xaaj-reference-hero-heading h1{
            margin:0 auto;
            max-width:1000px;
            font-family:'Cormorant Garamond',Georgia,"Times New Roman",serif !important;
            font-size:clamp(48px,4.25vw,66px);
            font-weight:400 !important;
            line-height:.98;
            letter-spacing:-.035em;
            color:#292722;
          }

          .xaaj-reference-hero-grid{
            width:min(1140px,100%);
            margin:0 auto;
            display:grid;
            grid-template-columns:365px minmax(0,1fr);
            gap:22px;
            align-items:stretch;
          }

          .xaaj-reference-hero-card{
            position:relative;
            display:flex;
            flex-direction:column;
            min-width:0;
            overflow:hidden;
            background:rgb(239,236,236);
            color:#292722;
            text-decoration:none;
            border:1px solid rgba(37,37,37,.20);
            border-radius:6px;
            box-shadow:none;
            transition:border-color .35s ease,transform .35s ease;
          }

          .xaaj-reference-hero-card-top{
            height:659px;
          }

          .xaaj-reference-hero-card img,
          .xaaj-reference-hero-card video{
            width:100%;
            height:auto;
            flex:1 1 auto;
            min-height:0;
            display:block;
            object-fit:cover;
            transition:transform 1.1s cubic-bezier(.22,1,.36,1);
          }

          .xaaj-reference-hero-card:hover{
            border-color:rgba(48,45,40,.34);
          }

          .xaaj-reference-hero-card:hover img,
          .xaaj-reference-hero-card:hover video{
            transform:scale(1.025);
          }

          .xaaj-reference-hero-bottom{
            grid-column:1 / -1;
            display:grid;
            grid-template-columns:repeat(3,minmax(0,1fr));
            gap:22px;
            margin-top:2px;
          }

          .xaaj-reference-hero-bottom-card{
            position:relative;
            display:flex;
            flex-direction:column;
            min-width:0;
            overflow:hidden;
            background:rgb(239,236,236);
            color:#292722;
            text-decoration:none;
            border:1px solid rgba(37,37,37,.20);
            border-radius:6px;
            transition:border-color .35s ease,transform .35s ease;
          }

          .xaaj-reference-hero-bottom-card:hover{
            border-color:rgba(48,45,40,.34);
          }

          .xaaj-reference-hero-bottom-card img,
          .xaaj-reference-hero-bottom-card video{
            width:100%;
            height:380px;
            display:block;
            object-fit:cover;
            transition:transform 1.1s cubic-bezier(.22,1,.36,1);
          }

          .xaaj-reference-hero-bottom-card:hover img,
          .xaaj-reference-hero-bottom-card:hover video{
            transform:scale(1.025);
          }

          .xaaj-reference-hero-label{
            position:relative;
            left:auto;
            bottom:auto;
            height:82px;
            min-height:82px;
            flex:0 0 82px;
            box-sizing:border-box;
            display:flex;
            align-items:center;
            justify-content:flex-start;
            gap:13px;
            padding:19px 22px 18px;
            background:#ffffff;
            color:#302d28;
            font-family:'Cormorant Garamond',Georgia,"Times New Roman",serif !important;
            font-size:28px !important;
            font-weight:500 !important;
            line-height:.95 !important;
            letter-spacing:-.008em !important;
            text-shadow:none;
          }

          .xaaj-reference-hero-label > span{
            font-family:'Cormorant Garamond',Georgia,"Times New Roman",serif !important;
            font-size:inherit !important;
            font-weight:inherit !important;
            line-height:inherit !important;
            letter-spacing:inherit !important;
            color:inherit !important;
          }

          .xaaj-reference-hero-label svg{
            flex:0 0 auto;
            transition:transform .35s ease;
          }

          .xaaj-reference-hero-card:hover .xaaj-reference-hero-label svg,
          .xaaj-reference-hero-bottom-card:hover .xaaj-reference-hero-label svg{
            transform:translateX(4px);
          }

          .xaaj-reference-hero-overlay{
            display:none!important;
          }          /* Product showcase directly below hero — clean 4-up editorial grid */
          .xaaj-hero-product-showcase{
            position:relative;
            background:#f7f5ef;
            color:#292722;
            padding:30px 3.45vw 74px;
            border-bottom:1px solid rgba(42,39,34,.07);
            overflow:hidden;
          }

          .xaaj-hero-product-showcase-inner{
            width:min(1390px,100%);
            margin:0 auto;
          }

          .xaaj-hero-product-showcase-head{
            display:flex;
            align-items:flex-end;
            justify-content:space-between;
            gap:20px;
            margin-bottom:24px;
          }

          .xaaj-hero-product-showcase-kicker{
            display:block;
            margin-bottom:8px;
            color:#8f887f;
            font-size:8px;
            line-height:1;
            letter-spacing:2.4px;
            text-transform:uppercase;
          }

          .xaaj-hero-product-showcase-head h2{
            margin:0;
            color:#292722;
            font:400 25px/1.08 'Gotham Book','Gotham',Arial,sans-serif;
            letter-spacing:-.02em;
          }

          .xaaj-hero-product-showcase-head a{
            display:inline-flex;
            align-items:center;
            gap:8px;
            color:#5f5a53;
            text-decoration:none;
            font-size:8px;
            letter-spacing:1.6px;
            text-transform:uppercase;
            border-bottom:1px solid rgba(95,90,83,.34);
            padding-bottom:5px;
          }

          .xaaj-hero-product-showcase-grid{
            display:grid;
            grid-template-columns:repeat(4,minmax(0,1fr));
            gap:14px;
          }

          .xaaj-hero-product-card{
            min-width:0;
            color:#292722;
            text-decoration:none;
            display:block;
          }

          .xaaj-hero-product-media{
            position:relative;
            overflow:hidden;
            background:#ece8df;
            aspect-ratio:.84/1;
          }

          .xaaj-hero-product-media img{
            width:100%;
            height:100%;
            display:block;
            object-fit:cover;
            transition:transform .8s cubic-bezier(.22,1,.36,1);
            will-change:transform;
          }

          .xaaj-hero-product-card:hover .xaaj-hero-product-media img{
            transform:scale(1.025);
          }

          .xaaj-hero-product-copy{
            padding:12px 2px 0;
          }

          .xaaj-hero-product-copy span{
            display:block;
            margin-bottom:5px;
            color:#918a80;
            font-size:7px;
            line-height:1;
            letter-spacing:1.5px;
            text-transform:uppercase;
          }

          .xaaj-hero-product-copy h3{
            margin:0 0 6px;
            color:#302d28;
            font:400 17px/1.18 'Gotham Book','Gotham',Arial,sans-serif;
            letter-spacing:-.01em;
          }

          .xaaj-hero-product-price{
            color:#4f4a43;
            font-size:11px;
            line-height:1.2;
            letter-spacing:.15px;
          }

          @media(max-width:850px){
            .xaaj-hero-product-showcase{
              padding:26px 18px 54px;
            }

            .xaaj-hero-product-showcase-grid{
              grid-template-columns:repeat(2,minmax(0,1fr));
              gap:18px 14px;
            }

            .xaaj-hero-product-showcase-head h2{
              font-size:22px;
            }

            .xaaj-hero-product-copy h3{
              font-size:15px;
            }
          }

          @media(max-width:520px){
            .xaaj-hero-product-showcase{
              padding:22px 12px 42px;
            }

            .xaaj-hero-product-showcase-head{
              margin-bottom:18px;
            }

            .xaaj-hero-product-showcase-head h2{
              font-size:19px;
            }

            .xaaj-hero-product-showcase-head a{
              font-size:7px;
            }

            .xaaj-hero-product-showcase-grid{
              gap:18px 10px;
            }

            .xaaj-hero-product-copy{
              padding-top:9px;
            }

            .xaaj-hero-product-copy h3{
              font-size:14px;
              line-height:1.15;
            }

            .xaaj-hero-product-copy span{
              font-size:6.5px;
            }

            .xaaj-hero-product-price{
              font-size:10px;
            }
          }

          @media(max-width:850px){
            .xaaj-reference-hero{
              padding:48px 18px 30px;
            }

            .xaaj-reference-hero-heading{
              padding-bottom:35px;
            }

            .xaaj-reference-hero-heading h1{
              font-size:clamp(40px,7vw,54px);
              line-height:1.04;
            }

            .xaaj-reference-hero-grid{
              grid-template-columns:1fr 1fr;
              gap:14px;
            }

            .xaaj-reference-hero-card-top{
              height:430px;
            }

            .xaaj-reference-hero-bottom{
              grid-column:1 / -1;
              grid-template-columns:repeat(2,1fr);
              gap:14px;
            }

            .xaaj-reference-hero-bottom-card img,
            .xaaj-reference-hero-bottom-card video{
              height:330px;
            }

            .xaaj-reference-hero-label{
              min-height:76px;
              padding:18px 19px;
              gap:11px;
              font-size:24px !important;
            }
          }

          @media(max-width:560px){
            .xaaj-reference-hero{
              padding:32px 12px 42px;
            }

            .xaaj-reference-hero-heading{
              padding:0 8px 30px;
            }

            .xaaj-reference-hero-heading h1{
              font-size:37px;
              line-height:1.04;
            }

            .xaaj-reference-hero-grid{
              grid-template-columns:1fr;
              gap:13px;
            }

            .xaaj-reference-hero-card-top{
              height:430px;
            }

            .xaaj-reference-hero-bottom{
              grid-template-columns:1fr 1fr;
              gap:13px;
              margin-top:0;
            }

            .xaaj-reference-hero-bottom-card img,
            .xaaj-reference-hero-bottom-card video{
              height:250px;
            }

            .xaaj-reference-hero-label{
              min-height:64px;
              padding:15px 16px;
              gap:9px;
              font-size:20px !important;
            }

            .xaaj-reference-hero-label svg{
              width:16px;
              height:16px;
            }
          }
        `}</style>

        <section
          ref={heroRef}
          className={`xaaj-reference-hero ${heroReady ? 'is-ready' : ''}`}
          aria-labelledby="xaaj-reference-hero-title"
        >
          <div className="xaaj-reference-hero-heading">
            <h1 id="xaaj-reference-hero-title">
              Sustainably crafted goods to elevate
              <br />
              your everyday.
            </h1>
          </div>

          <div className="xaaj-reference-hero-grid">

            {categoryHeroItems.slice(0, 2).map((category, index) => {
              const mediaUrl = category.url || category.fallback
              const mediaAlt = category.alt || `XAAJ ${category.name} collection`

              return (
                <Link
                  key={category.slug}
                  className="xaaj-reference-hero-card xaaj-reference-hero-card-top"
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  aria-label={`Shop ${category.name}`}
                >
                  {category.mediaType === 'video' ? (
                    <video
                      src={mediaUrl}
                      muted
                      autoPlay
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={mediaAlt}
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={mediaAlt}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : undefined}
                    />
                  )}

                  <span className="xaaj-reference-hero-label">
                    <span>{category.name}</span>
                    <ArrowRight size={20} strokeWidth={1.25} />
                  </span>
                </Link>
              )
            })}

            {/* Bottom three categories */}
            <div className="xaaj-reference-hero-bottom">
              {categoryHeroItems.slice(2).map(category => {
                const mediaUrl = category.url || category.fallback
                const mediaAlt = category.alt || `XAAJ ${category.name} collection`

                return (
                  <Link
                    key={category.slug}
                    className="xaaj-reference-hero-bottom-card"
                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                    aria-label={`Shop ${category.name}`}
                  >
                    {category.mediaType === 'video' ? (
                      <video
                        src={mediaUrl}
                        muted
                        autoPlay
                        loop
                        playsInline
                        preload="metadata"
                        aria-label={mediaAlt}
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={mediaAlt}
                        loading="lazy"
                      />
                    )}

                    <span className="xaaj-reference-hero-label">
                      <span>{category.name}</span>
                      <ArrowRight size={20} strokeWidth={1.25} />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ============================================================
            HERO FOLLOW-UP — PRODUCT SHOWCASE
            Uses live XAAJ products; no dummy catalogue data.
           ============================================================ */}
        {(() => {
          // Always try to fill all 4 cards with unique live products.
          // Priority: bestsellers → new arrivals → remaining live products.
          const heroProductPool = [
            ...(Array.isArray(bestsellers) ? bestsellers : []),
            ...(Array.isArray(arrivals) ? arrivals : []),
            ...(Array.isArray(productList) ? productList : [])
          ]

          const heroProducts = heroProductPool
            .filter((product, index, list) => {
              const productKey =
                product?.id ||
                product?._id ||
                product?.slug ||
                `${product?.name || 'product'}-${index}`

              return list.findIndex(item => (
                (item?.id || item?._id || item?.slug ||
                  `${item?.name || 'product'}-${list.indexOf(item)}`) === productKey
              )) === index
            })
            .slice(0, 4)

          if (!heroProducts.length) return null

          return (
            <section
              className="xaaj-hero-product-showcase xaaj-cinema-reveal"
              data-xaaj-cinema-reveal
              aria-label="Featured XAAJ products"
              style={{ display: 'none' }}
            >
              <div className="xaaj-hero-product-showcase-inner">
                <div className="xaaj-hero-product-showcase-head">
                  <div>
                    <span className="xaaj-hero-product-showcase-kicker">Selected pieces</span>
                    <h2>Made for the everyday table.</h2>
                  </div>

                  <Link to="/shop">
                    View all pieces
                    <ArrowRight size={12} strokeWidth={1.35} />
                  </Link>
                </div>

                <div className="xaaj-hero-product-showcase-grid">
                  {heroProducts.map(product => (
                    <Link
                      key={product.id || product._id || product.slug}
                      to={`/product/${product.slug}`}
                      className="xaaj-hero-product-card"
                      aria-label={`View ${product.name}`}
                    >
                      <div className="xaaj-hero-product-media">
                        <img
                          src={product.image || product.images?.[0] || ''}
                          alt={product.name}
                          loading="lazy"
                        />
                      </div>

                      <div className="xaaj-hero-product-copy">
                        <span>{product.category || 'XAAJ Collection'}</span>
                        <h3>{product.name}</h3>
                        <div className="xaaj-hero-product-price">
                          {money(product.price)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )
        })()}

        <section className="xaaj-cinema-category xaaj-cinema-reveal" data-xaaj-cinema-reveal>
          <div className="xaaj-cinema-wrap">
            <div className="xaaj-cinema-category-inner">
              <div className="xaaj-cinema-category-intro">
                <span className="xaaj-cinema-section-eyebrow">Shop by category</span>
                <p>Every piece tells a story. Discover crockery crafted to be part of your everyday moments.</p>
                <Link className="xaaj-cinema-text-link" to="/shop">View all <ArrowRight size={13} /></Link>
              </div>
              <div className="xaaj-cinema-category-grid">
                {categoryItems.map(category => (
                  <Link className="xaaj-cinema-category-card" key={category.name} to={`/shop?category=${encodeURIComponent(category.name)}`}>
                    <img src={category.image} alt={category.name} loading="lazy" />
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 03 — BRAND STORY / TWO EDITORIAL TILES
            The section uses the same max-width as the hero follow-up so
            the left and right edges line up across the homepage.
           ============================================================ */}
        <section className="xaaj-brand-story-split xaaj-cinema-reveal" data-xaaj-cinema-reveal aria-label="XAAJ brand story">
          <div className="xaaj-brand-story-split-inner">
            <Link className="xaaj-brand-story-split-media" to="/story" aria-label="Read the full XAAJ story">
              {brandStoryMedia.mediaType === 'video' ? (
                <video
                  src={brandStoryMedia.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={brandStoryMedia.alt}
                />
              ) : (
                <img
                  src={brandStoryMedia.url}
                  alt={brandStoryMedia.alt}
                  loading="lazy"
                />
              )}
            </Link>

            <div className="xaaj-brand-story-split-copy">
              <div className="xaaj-brand-story-split-copy-inner">
                <span className="xaaj-brand-story-split-eyebrow">Our story</span>
                <h2>India, Made for the Table.</h2>
                <p>
                  A little clay. A lot of character. And a story in every piece.
                  <br />
                  XAAJ is contemporary crockery rooted in the colours, crafts and everyday beauty of India.
                  <br />
                  Made by hand. Designed for now.
                  <br />
                  Meant to be used, loved and lived with.
                </p>
                <Link className="xaaj-brand-story-split-button" to="/story">
                  <span>Read more</span>
                  <ArrowRight size={15} strokeWidth={1.35} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            HORECA COLLECTION — CRAFT-STYLE BUNDLED LAYOUT
           ============================================================ */}
        <section
          className="xaaj-horeca-bundled xaaj-cinema-reveal"
          data-xaaj-cinema-reveal
          aria-label="Horeca collection"
        >
          <div className="xaaj-horeca-bundled-inner">
            <h2>Discover our Horeca collections</h2>

            <div className="xaaj-horeca-bundled-grid">
              <Link
                to="/shop?category=Horeca"
                className="xaaj-horeca-bundled-main"
                aria-label="Shop Horeca"
              >
                <div className="xaaj-horeca-bundled-media">
                  <img
                    src={horecaMedia.main.url}
                    alt={horecaMedia.main.alt}
                    loading="lazy"
                  />
                </div>

                <div className="xaaj-horeca-bundled-label">
                  Horeca <ArrowRight size={18} strokeWidth={1.25} />
                </div>
              </Link>

              <div className="xaaj-horeca-bundled-side">
                <Link
                  to="/shop?category=Horeca"
                  className="xaaj-horeca-bundled-small"
                  aria-label="Shop Horeca"
                >
                  <img
                    src={horecaMedia.sideOne.url}
                    alt={horecaMedia.sideOne.alt}
                    loading="lazy"
                  />
                </Link>

                <Link
                  to="/shop?category=Horeca"
                  className="xaaj-horeca-bundled-small"
                  aria-label="Shop Horeca"
                >
                  <img
                    src={horecaMedia.sideTwo.url}
                    alt={horecaMedia.sideTwo.alt}
                    loading="lazy"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            BRAND VALUES — FOUR PILLARS
            Added directly after the Horeca collections section.
           ============================================================ */}
        <section
          className="xaaj-values-strip xaaj-cinema-reveal"
          data-xaaj-cinema-reveal
          aria-label="XAAJ values"
        >
          <div className="xaaj-values-grid">
            <article className="xaaj-value-card">
              <div className="xaaj-value-icon" aria-hidden="true">
                <Gem size={42} strokeWidth={1.15} />
              </div>
              <h3>Responsible Design</h3>
              <p>Designed with integrity and<br />durably crafted for everyday<br />use.</p>
            </article>

            <article className="xaaj-value-card">
              <div className="xaaj-value-icon" aria-hidden="true">
                <Package size={42} strokeWidth={1.15} />
              </div>
              <h3>Transparent Pricing</h3>
              <p>We believe in accessible<br />pricing and full transparency.<br />Our pricing model is an open<br />book.</p>
            </article>

            <article className="xaaj-value-card">
              <div className="xaaj-value-icon" aria-hidden="true">
                <ShieldCheck size={42} strokeWidth={1.15} />
              </div>
              <h3>Sustainable Sourcing</h3>
              <p>We only partner with people<br />who put the earth, and its<br />people, first.</p>
            </article>

            <article className="xaaj-value-card">
              <div className="xaaj-value-icon" aria-hidden="true">
                <Truck size={42} strokeWidth={1.15} />
              </div>
              <h3>Giving Back</h3>
              <p>Thanks to Mealshare, every<br />purchase directly donates a<br />meal to a youth in need.</p>
            </article>
          </div>
        </section>

        <style>{`
          .xaaj-values-strip{
            width:100%;
            background:#fff;
            padding:36px 5.2vw 34px;
            box-sizing:border-box;
          }
          .xaaj-values-grid{
            width:min(1180px,100%);
            margin:0 auto;
            display:grid;
            grid-template-columns:repeat(4,minmax(0,1fr));
            gap:54px;
            align-items:start;
          }
          .xaaj-value-card{
            text-align:center;
            color:#393633;
          }
          .xaaj-value-icon{
            width:58px;
            height:58px;
            margin:0 auto 25px;
            display:grid;
            place-items:center;
            color:#aaa8a5;
          }
          .xaaj-value-icon svg{
            width:42px;
            height:42px;
            stroke-width:1.05;
          }
          .xaaj-value-card h3{
            margin:0 0 13px;
            font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;
            font-size:23px;
            font-weight:400;
            line-height:1.2;
            letter-spacing:.01em;
            color:#393633;
          }
          .xaaj-value-card p{
            margin:0;
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
            font-size:14px;
            font-weight:400;
            line-height:2.05;
            letter-spacing:.01em;
            color:#66625e;
          }
          @media(max-width:900px){
            .xaaj-values-grid{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:62px;gap:46px}
          }
          @media(max-width:520px){
            .xaaj-values-strip{padding:34px 20px 42px}
            .xaaj-values-grid{grid-template-columns:1fr;gap:50px}
            .xaaj-value-card h3{font-size:21px}
            .xaaj-value-card p{font-size:13px;line-height:1.85}
          }
        `}</style>

        {/* ============================================================
            BLOG / FROM THE MAGAZINE
            Home-page editorial cards. Blog data, API loading and
            article routing remain unchanged.
           ============================================================ */}
        <BlogSection />

        {/* ============================================================
            SECTION 04 — CATEGORY SPOTLIGHT
            Explore XAAJ categories.
           ============================================================ */}
        {false && (
          <section className="xaaj-category-gallery" aria-label="Explore XAAJ categories">
            <div className="xaaj-category-gallery-head">
              <span>Explore by form</span>
              <Link to="/shop">View all pieces <ArrowRight size={13} /></Link>
            </div>

            <div className="xaaj-category-gallery-grid">
              {categoryShowcaseItems.map((category, index) => {
                const showcaseProduct = category.showcaseProduct
                const showcaseImage =
                  showcaseProduct?.image ||
                  showcaseProduct?.images?.[0] ||
                  ''

                return (
                  <Link
                    key={`gallery-${category.name}`}
                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                    className="xaaj-category-gallery-card"
                    aria-label={`Shop ${category.name}`}
                  >
                    <div className="xaaj-category-gallery-image">
                      {(sectionFiveCategoryImages[category.name] || showcaseImage) && (
                        <img
                          src={sectionFiveCategoryImages[category.name] || showcaseImage}
                          alt={showcaseProduct?.name || category.name}
                          loading={index === 0 ? 'eager' : 'lazy'}
                        />
                      )}
                    </div>
                    <div className="xaaj-category-gallery-label">
                      <span>{category.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="xaaj-everyday-carousel xaaj-cinema-reveal" data-xaaj-cinema-reveal aria-label="The Everyday Table">
          <div className="xaaj-everyday-carousel-track">
            <article className="xaaj-everyday-slide">
              <img
                src="https://res.cloudinary.com/kswukbpp/image/upload/v1790269104/ChatGPT_Image_Sep_24_2026_10_27_52_PM.png"
                alt="XAAJ handcrafted serveware collection"
                loading="eager"
                fetchPriority="high"
              />
            </article>

            <div className="xaaj-everyday-overlay" aria-hidden="true" />

            <div className="xaaj-everyday-copy">
              <span className="xaaj-cinema-section-eyebrow">The Everyday Table</span>
              <h2>The Everyday Table</h2>
              <p className="xaaj-everyday-subtitle">Thoughtfully designed for everyday living.</p>
              <p>Morning chai. Long lunches. Quiet dinners.<br />Pieces designed for the moments that make a home feel like yours.</p>
              <Link className="xaaj-cinema-cta" to="/shop">Shop the collection <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        <section className="xaaj-cinema-products xaaj-cinema-reveal" data-xaaj-cinema-reveal>
          <div className="xaaj-cinema-wrap">
            <div className="xaaj-cinema-section-head"><div><span className="xaaj-cinema-section-eyebrow">Considered · Intentional · Handcrafted</span><h2 className="xaaj-cinema-section-title">Best sellers</h2></div><Link className="xaaj-cinema-text-link" to="/shop?filter=best-selling">View all products <ArrowRight size={13} /></Link></div>
            <div className="xaaj-cinema-product-grid">{bestsellers.slice(0,4).map(product => <ProductCard product={product} key={product.id || product._id} />)}</div>
          </div>
        </section>

        <section className="xaaj-collection-story-carousel xaaj-cinema-reveal" data-xaaj-collection-story aria-label="The collection story">
          <div className="xaaj-collection-story-media">
            <div className="xaaj-collection-story-track">
              <article className="xaaj-collection-story-slide">
                <img src="https://res.cloudinary.com/kswukbpp/image/upload/v1789491522/Blue_Meadow_Bowls2.png" alt="XAAJ Willow Blue serving set" loading="lazy" />
              </article>
              <article className="xaaj-collection-story-slide">
                <img src="https://res.cloudinary.com/kswukbpp/image/upload/v1789492078/Coastal_Clay_Cup_Saucer_Set1.png" alt="XAAJ Coastal Clay cup and saucer set" loading="lazy" />
              </article>
              <article className="xaaj-collection-story-slide" aria-hidden="true">
                <img src="https://res.cloudinary.com/kswukbpp/image/upload/v1789491522/Blue_Meadow_Bowls2.png" alt="" loading="lazy" />
              </article>
              <article className="xaaj-collection-story-slide" aria-hidden="true">
                <img src="https://res.cloudinary.com/kswukbpp/image/upload/v1789492078/Coastal_Clay_Cup_Saucer_Set1.png" alt="" loading="lazy" />
              </article>
            </div>
          </div>

          <div className="xaaj-collection-story-copy">
            <div>
              <span className="xaaj-cinema-section-eyebrow">The collection story</span>
              <h2>Made slowly. Meant to live with you.</h2>
              <p>We look to everyday rituals, natural materials and the quiet beauty around us, then shape useful objects with a calmer point of view.</p>
              <Link className="xaaj-cinema-text-link" to="/about">Our story <ArrowRight size={13} /></Link>
            </div>
          </div>
        </section>

        <section className="xaaj-cinema-products xaaj-cinema-reveal" data-xaaj-cinema-reveal>
          <div className="xaaj-cinema-wrap">
            <div className="xaaj-cinema-section-head"><div><span className="xaaj-cinema-section-eyebrow">Just arrived</span><h2 className="xaaj-cinema-section-title">New arrivals</h2></div><Link className="xaaj-cinema-text-link" to="/shop?filter=new">Shop new <ArrowRight size={13} /></Link></div>
            <div className="xaaj-cinema-product-grid">{arrivals.slice(0,4).map(product => <ProductCard product={product} key={product.id || product._id} />)}</div>
          </div>
        </section>

        <section className="xaaj-cinema-quote"><p>“A table is never just a table. It is where life happens.”</p><span>XAAJ · Stories Crafted in Earth</span></section>
        {/* Legacy standalone Newsletter preserved below; reference subscribe is now inside Footer. */}
      </main>
      <Footer />
    </>
  )
}

// ============================================================
// NEWSLETTER
// ============================================================

// LEGACY NEWSLETTER — preserved intentionally for later use.
function LegacyNewsletter() {

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

// LEGACY FOOTER — preserved intentionally for later use.
// Currently not rendered. Use <LegacyFooter /> when needed.
function LegacyFooter() {

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
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
// REFERENCE SUBSCRIBE + FOOTER
// ============================================================

function Footer() {
  return (
    <footer className="xaaj-reference-footer">
      <style>{`
        .xaaj-reference-footer{
          width:100%;
          overflow:hidden;
          background:#272d29;
          color:#f5f2ea;
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
        }

        .xaaj-reference-footer *,
        .xaaj-reference-footer *::before,
        .xaaj-reference-footer *::after{
          box-sizing:border-box;
        }

        /* Newsletter */
        .xaaj-reference-newsletter{
          padding:58px 24px 56px;
          display:flex;
          flex-direction:column;
          align-items:center;
          text-align:center;
          border-bottom:1px solid rgba(255,255,255,.09);
        }

        .xaaj-reference-newsletter h2{
          margin:0;
          color:#f7f4ec;
          font-family:Georgia,'Times New Roman',serif!important;
          font-size:32px!important;
          line-height:1.12!important;
          font-weight:400!important;
          letter-spacing:-.2px!important;
        }

        .xaaj-reference-newsletter p{
          margin:12px 0 0;
          max-width:560px;
          color:rgba(247,244,236,.62);
          font-size:13px!important;
          line-height:1.55!important;
          letter-spacing:.2px!important;
        }

        .xaaj-reference-newsletter-form{
          width:min(420px,100%);
          margin:22px auto 0;
        }

        .xaaj-reference-newsletter-field{
          width:100%;
          height:50px;
          border:1px solid rgba(247,244,236,.34);
          border-radius:8px;
          background:rgba(255,255,255,.025);
          display:flex;
          align-items:center;
          overflow:hidden;
          transition:border-color .2s ease,background .2s ease;
        }

        .xaaj-reference-newsletter-field:focus-within{
          border-color:rgba(247,244,236,.68);
          background:rgba(255,255,255,.045);
        }

        .xaaj-reference-newsletter-field input{
          flex:1;
          min-width:0;
          height:100%;
          border:0;
          outline:0;
          background:transparent;
          color:#f7f4ec;
          padding:0 15px;
          font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
          font-size:13px!important;
          line-height:1!important;
          letter-spacing:.2px!important;
        }

        .xaaj-reference-newsletter-field input::placeholder{
          color:rgba(247,244,236,.56);
          opacity:1;
        }

        .xaaj-reference-newsletter-field button{
          width:48px;
          height:100%;
          flex:0 0 48px;
          border:0;
          background:transparent;
          color:#f7f4ec;
          display:grid;
          place-items:center;
          padding:0;
          cursor:pointer;
          transition:transform .2s ease,opacity .2s ease;
        }

        .xaaj-reference-newsletter-field button:hover{
          transform:translateX(2px);
          opacity:.75;
        }

        .xaaj-reference-newsletter-message{
          min-height:14px;
          margin-top:7px;
          color:rgba(247,244,236,.55);
          font-size:10px!important;
          line-height:1.4!important;
          letter-spacing:.1px;
        }

        /* Main footer — premium desktop editorial layout: brand | contact | shop/about */
        .xaaj-reference-footer-main{
          width:min(1320px,100%);
          margin:0 auto;
          display:grid!important;
          grid-template-columns:minmax(0,1.15fr) minmax(300px,.90fr) minmax(320px,1.05fr)!important;
          grid-template-areas:'brand contact links';
          align-items:start;
          column-gap:0;
          padding:62px 56px 58px;
          box-sizing:border-box;
        }

        .xaaj-reference-footer-brand{
          grid-area:brand;
          padding:0 72px 0 0;
          min-width:0;
        }

        .xaaj-reference-footer-brand h3{
          margin:0;
          color:#f7f4ec;
          font-family:Georgia,'Times New Roman',serif!important;
          font-size:62px!important;
          font-weight:400!important;
          line-height:.82!important;
          letter-spacing:2px!important;
        }

        .xaaj-reference-footer-brand-rule{
          width:48px;
          height:1px;
          margin:24px 0 18px;
          background:rgba(247,244,236,.58);
        }

        .xaaj-reference-footer-brand p{
          max-width:390px;
          margin:0;
          color:rgba(247,244,236,.70);
          font-family:Georgia,'Times New Roman',serif!important;
          font-size:14px!important;
          line-height:1.65!important;
          letter-spacing:.05px;
        }

        /* Desktop contact column */
        .xaaj-reference-footer-contact{
          grid-area:contact;
          border-left:1px solid rgba(247,244,236,.18);
          border-right:1px solid rgba(247,244,236,.18);
          padding:2px 54px 0;
          display:flex;
          flex-direction:column;
          justify-content:flex-start;
          min-width:0;
        }

        .xaaj-reference-footer-contact h4{
          display:none!important;
        }

        .xaaj-reference-footer-contact-list{
          display:flex;
          flex-direction:column;
          gap:20px;
          padding:0;
        }

        .xaaj-reference-footer-contact-item{
          display:grid;
          grid-template-columns:24px minmax(0,1fr);
          gap:13px;
          align-items:center;
          min-width:0;
          color:inherit;
          text-decoration:none;
          transition:color .22s ease,transform .22s ease;
        }

        .xaaj-reference-footer-contact-item:hover{
          transform:translateX(2px);
        }

        .xaaj-reference-footer-contact-icon{
          width:24px;
          height:24px;
          display:flex;
          align-items:center;
          justify-content:center;
          color:rgba(247,244,236,.88);
          background:transparent;
          border:0;
          border-radius:0;
          margin:0;
          transition:color .22s ease;
        }

        .xaaj-reference-footer-contact-item:hover .xaaj-reference-footer-contact-icon{
          color:#f7f4ec;
        }

        .xaaj-reference-footer-contact-copy{
          min-width:0;
        }

        .xaaj-reference-footer-contact-copy strong{
          display:none!important;
        }

        .xaaj-reference-footer-contact-copy span{
          display:block;
          margin:0;
          max-width:100%;
          overflow:visible;
          text-overflow:clip;
          white-space:normal;
          color:rgba(247,244,236,.68);
          font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
          font-size:11.5px!important;
          line-height:1.5!important;
          letter-spacing:.03px;
        }

        .xaaj-reference-footer-address{
          display:flex;
          align-items:flex-start;
          gap:14px;
          width:100%;
          max-width:285px;
          margin:27px 0 0;
          color:rgba(247,244,236,.60);
          text-decoration:none;
          font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
          font-size:11px!important;
          line-height:1.55!important;
          letter-spacing:.05px;
          transition:color .2s ease;
        }

        .xaaj-reference-footer-address svg{
          flex:0 0 auto;
          margin-top:1px;
          color:rgba(247,244,236,.88);
        }

        .xaaj-reference-footer-address:hover{
          color:#f7f4ec;
        }

        /* Right side: Shop + About */
        .xaaj-reference-footer-links{
          grid-area:links;
          padding-left:54px;
          display:grid;
          grid-template-columns:minmax(125px,1fr) minmax(105px,.82fr);
          column-gap:56px;
          min-width:0;
        }

        .xaaj-reference-footer-column h4{
          margin:2px 0 22px;
          color:#f7f4ec;
          font-family:Georgia,'Times New Roman',serif!important;
          font-size:22px!important;
          font-weight:400!important;
          line-height:1.1!important;
        }

        .xaaj-reference-footer-column nav{
          display:flex;
          flex-direction:column;
          align-items:flex-start;
          gap:13px;
        }

        .xaaj-reference-footer-column a{
          color:rgba(247,244,236,.65);
          text-decoration:none;
          font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
          font-size:12px!important;
          line-height:1.35!important;
          letter-spacing:.15px!important;
          transition:color .2s ease,transform .2s ease;
        }

        .xaaj-reference-footer-column a:hover{
          color:#fff;
          transform:translateX(2px);
        }

        /* Bottom bar */
        .xaaj-reference-footer-bottom{
          min-height:64px;
          border-top:1px solid rgba(255,255,255,.09);
          padding:17px max(48px,calc((100% - 1320px)/2 + 48px));
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:28px;
        }

        .xaaj-reference-footer-copy{
          flex:0 0 auto;
          color:rgba(247,244,236,.48);
          font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
          font-size:10px!important;
          line-height:1.5!important;
          letter-spacing:.15px;
        }

        .xaaj-reference-footer-policies{
          display:flex;
          align-items:center;
          justify-content:flex-end;
          flex-wrap:wrap;
          gap:0;
          min-width:0;
        }

        .xaaj-reference-footer-policies a{
          color:rgba(247,244,236,.52);
          text-decoration:none;
          font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
          font-size:10px!important;
          line-height:1.5!important;
          letter-spacing:.1px;
          white-space:nowrap;
          transition:color .2s ease;
        }

        .xaaj-reference-footer-policies a:hover{
          color:#fff;
        }

        .xaaj-reference-footer-policies a + a::before{
          content:'';
          display:inline-block;
          width:1px;
          height:11px;
          margin:0 14px;
          vertical-align:-2px;
          background:rgba(247,244,236,.22);
        }

        /* Tablet */
        @media(max-width:1050px){
          .xaaj-reference-footer-main{
            grid-template-columns:minmax(260px,1.1fr) minmax(240px,.9fr) minmax(260px,1fr);
            gap:28px;
            padding:54px 34px 48px;
          }

          .xaaj-reference-footer-brand{
            padding-right:28px;
          }

          .xaaj-reference-footer-contact{
            padding-left:30px;
            padding-right:30px;
          }

          .xaaj-reference-footer-links{
            padding-left:30px;
            column-gap:28px;
          }

          .xaaj-reference-footer-bottom{
            padding:16px 34px;
          }

          .xaaj-reference-footer-policies a + a::before{
            margin:0 10px;
          }
        }

        /* Small tablet / large phone */
        @media(max-width:760px){
          .xaaj-reference-newsletter{
            padding:46px 22px 44px;
          }

          .xaaj-reference-newsletter h2{
            font-size:28px!important;
          }

          .xaaj-reference-footer-main{
            grid-template-columns:1fr 1fr;
            gap:38px 28px;
            padding:48px 26px 44px;
          }

          .xaaj-reference-footer-brand{
            grid-column:1 / -1;
          }

          .xaaj-reference-footer-brand p{
            max-width:430px;
          }

          .xaaj-reference-footer-contact{
            grid-column:1 / -1;
          }

          .xaaj-reference-footer-contact-list{
            display:grid;
            grid-template-columns:repeat(3,minmax(0,1fr));
            gap:18px;
          }

          .xaaj-reference-footer-bottom{
            padding:20px 26px 22px;
            align-items:flex-start;
            flex-direction:column;
            gap:14px;
          }

          .xaaj-reference-footer-policies{
            justify-content:flex-start;
          }
        }

        /* Phone */
        @media(max-width:520px){
          .xaaj-reference-newsletter{
            padding:38px 18px 36px;
          }

          .xaaj-reference-newsletter h2{
            font-size:25px!important;
            letter-spacing:-.1px!important;
          }

          .xaaj-reference-newsletter p{
            margin-top:10px;
            max-width:330px;
            font-size:11.5px!important;
            line-height:1.55!important;
          }

          .xaaj-reference-newsletter-form{
            margin-top:18px;
          }

          .xaaj-reference-newsletter-field{
            height:46px;
          }

          .xaaj-reference-footer-main{
            grid-template-columns:1fr 1fr;
            gap:31px 20px;
            padding:39px 20px 34px;
          }

          .xaaj-reference-footer-brand h3{
            font-size:49px!important;
            letter-spacing:1.5px!important;
          }

          .xaaj-reference-footer-brand-rule{
            margin:18px 0 14px;
          }

          .xaaj-reference-footer-brand p{
            max-width:320px;
            font-size:14px!important;
            line-height:1.5!important;
          }

          .xaaj-reference-footer-column h4,
          .xaaj-reference-footer-contact h4{
            margin-bottom:15px;
            font-size:19px!important;
          }

          .xaaj-reference-footer-column nav{
            gap:10px;
          }

          .xaaj-reference-footer-column a{
            font-size:11px!important;
          }

          .xaaj-reference-footer-contact-list{
            grid-template-columns:1fr;
            gap:12px;
          }

          .xaaj-reference-footer-contact-item{
            grid-template-columns:38px minmax(0,1fr);
            gap:11px;
          }

          .xaaj-reference-footer-contact-icon{
            width:38px;
            height:38px;
          }

          .xaaj-reference-footer-contact-copy strong{
            font-size:12px!important;
          }

          .xaaj-reference-footer-contact-copy span{
            font-size:10px!important;
          }

          .xaaj-reference-footer-bottom{
            padding:18px 20px 21px;
            gap:16px;
          }

          .xaaj-reference-footer-copy{
            font-size:9.5px!important;
          }

          .xaaj-reference-footer-policies{
            width:100%;
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:9px 16px;
          }

          .xaaj-reference-footer-policies a{
            font-size:9.5px!important;
            white-space:normal;
          }

          .xaaj-reference-footer-policies a + a::before{
            display:none;
          }
        }


        /* Final desktop footer lock: Brand | Shop | About | Contact */
        @media(min-width:761px){
          .xaaj-reference-footer-main{
            display:grid!important;
            grid-template-columns:minmax(260px,1.35fr) minmax(125px,.72fr) minmax(125px,.72fr) minmax(260px,1.05fr)!important;
            grid-template-areas:'brand shop about contact'!important;
            align-items:start!important;
            column-gap:0!important;
            row-gap:0!important;
          }

          .xaaj-reference-footer-brand{grid-area:brand!important;}
          .xaaj-reference-footer-shop{grid-area:shop!important;}
          .xaaj-reference-footer-about{grid-area:about!important;}
          .xaaj-reference-footer-contact{grid-area:contact!important;}

          .xaaj-reference-footer-shop,
          .xaaj-reference-footer-about{
            padding-left:28px!important;
            padding-right:20px!important;
          }

          /* Premium desktop contact edge: one divider only, between About and Contact. */
          .xaaj-reference-footer-contact{
            padding-left:34px!important;
            padding-right:0!important;
            border-left:1px solid rgba(247,244,236,.18)!important;
            border-right:0!important;
          }

          .xaaj-reference-footer-contact-list{
            gap:18px!important;
          }

          .xaaj-reference-footer-contact-item{
            grid-template-columns:24px minmax(0,1fr)!important;
            gap:13px!important;
          }

          .xaaj-reference-footer-contact-copy span{
            font-size:11.5px!important;
            line-height:1.5!important;
          }

          .xaaj-reference-footer-address{
            margin-top:24px!important;
            max-width:300px!important;
            gap:12px!important;
          }

          .xaaj-mobile-footer{display:none!important;}
        }

        @media(min-width:761px){
          /* Keep the footer visually clean: no right-side contact divider. */
          .xaaj-reference-footer-contact{
            border-right:none!important;
          }
        }

        @media(min-width:761px) and (max-width:1050px){
          .xaaj-reference-footer-main{
            grid-template-columns:minmax(220px,1.2fr) minmax(105px,.7fr) minmax(105px,.7fr) minmax(220px,1fr)!important;
            padding-left:34px!important;
            padding-right:34px!important;
          }

          .xaaj-reference-footer-brand{
            padding-right:24px!important;
          }

          .xaaj-reference-footer-shop,
          .xaaj-reference-footer-about{
            padding-left:18px!important;
            padding-right:12px!important;
          }

          .xaaj-reference-footer-contact{
            padding-left:22px!important;
          }
        }

        /* =========================================================
           XAAJ MOBILE FOOTER
           Premium / responsive / compact editorial layout
           ========================================================= */
        .xaaj-mobile-footer{
          display:none;
        }

        @media(max-width:760px){
          .xaaj-reference-footer-main{
            display:none!important;
          }

          .xaaj-mobile-footer{
            display:block;
            width:100%;
            padding:0 20px;
            box-sizing:border-box;
          }

          .xaaj-mobile-footer-section{
            margin:0;
            border-top:1px solid rgba(247,244,236,.13);
          }

          .xaaj-mobile-footer-section:last-child{
            border-bottom:1px solid rgba(247,244,236,.13);
          }

          .xaaj-mobile-footer-section summary{
            list-style:none;
            min-height:58px;
            padding:0;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:16px;
            cursor:pointer;
            color:#f7f4ec;
            font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif!important;
            font-size:21px!important;
            font-weight:400!important;
            line-height:1;
            letter-spacing:.01em;
            -webkit-tap-highlight-color:transparent;
          }

          .xaaj-mobile-footer-section summary::-webkit-details-marker{
            display:none;
          }

          .xaaj-mobile-footer-section summary svg{
            flex:0 0 auto;
            transition:transform .25s ease;
            opacity:.82;
          }

          .xaaj-mobile-footer-section[open] summary svg{
            transform:rotate(180deg);
          }

          .xaaj-mobile-footer-section nav{
            display:flex;
            flex-direction:column;
            gap:10px;
            padding:0 0 18px;
          }

          .xaaj-mobile-footer-section nav a{
            color:rgba(247,244,236,.62);
            text-decoration:none;
            font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
            font-size:11px!important;
            line-height:1.45!important;
          }

          .xaaj-mobile-footer-contact-list{
            display:flex;
            flex-direction:column;
            gap:13px;
            padding:1px 0 20px;
          }

          .xaaj-mobile-footer-contact-item{
            display:grid;
            grid-template-columns:23px minmax(0,1fr);
            align-items:start;
            column-gap:14px;
            color:rgba(247,244,236,.67);
            text-decoration:none;
            font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
            font-size:11px!important;
            line-height:1.5!important;
            min-width:0;
          }

          .xaaj-mobile-footer-contact-item svg{
            margin-top:1px;
            color:#f7f4ec;
            opacity:.9;
            flex:0 0 auto;
          }

          .xaaj-mobile-footer-contact-item span{
            min-width:0;
            overflow-wrap:anywhere;
          }

          .xaaj-reference-footer-bottom{
            display:flex!important;
            flex-direction:column!important;
            align-items:flex-start!important;
            gap:16px!important;
            padding:18px 20px 21px!important;
            margin:0!important;
          }

          .xaaj-reference-footer-copy{
            order:2;
            width:100%;
            font-size:9.5px!important;
            line-height:1.45!important;
          }

          /* Legal links: deliberate 2-column grid on phones.
             This prevents awkward 3+2 wrapping and keeps every link aligned. */
          .xaaj-reference-footer-policies{
            order:1;
            width:100%!important;
            display:grid!important;
            grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
            justify-content:stretch!important;
            align-items:stretch!important;
            gap:0!important;
            border-top:1px solid rgba(247,244,236,.12);
          }

          .xaaj-reference-footer-policies a{
            display:flex!important;
            align-items:center!important;
            min-height:38px!important;
            box-sizing:border-box!important;
            padding:8px 12px 8px 0!important;
            font-size:10.5px!important;
            line-height:1.35!important;
            letter-spacing:.01em!important;
            white-space:normal!important;
            color:rgba(247,244,236,.62)!important;
            text-decoration:none!important;
          }

          .xaaj-reference-footer-policies a:nth-child(even){
            padding-left:12px!important;
            padding-right:0!important;
            border-left:1px solid rgba(247,244,236,.12);
          }

          .xaaj-reference-footer-policies a:nth-child(odd){
            padding-right:12px!important;
          }

          .xaaj-reference-footer-policies a + a::before{
            display:none!important;
            content:none!important;
          }

          .xaaj-reference-footer-policies a:hover{
            color:#f7f4ec!important;
          }
        }

        @media(max-width:380px){
          .xaaj-mobile-footer{
            padding-left:18px;
            padding-right:18px;
          }

          .xaaj-mobile-footer-section summary{
            min-height:55px;
            font-size:20px!important;
          }

          .xaaj-mobile-footer-contact-list{
            gap:12px;
            padding-bottom:18px;
          }

          .xaaj-mobile-footer-contact-item{
            grid-template-columns:22px minmax(0,1fr);
            column-gap:12px;
            font-size:10.5px!important;
          }

          .xaaj-reference-footer-bottom{
            padding-left:18px!important;
            padding-right:18px!important;
          }

          .xaaj-reference-footer-policies{
            grid-template-columns:1fr!important;
          }

          .xaaj-reference-footer-policies a,
          .xaaj-reference-footer-policies a:nth-child(even),
          .xaaj-reference-footer-policies a:nth-child(odd){
            min-height:35px!important;
            padding:8px 0!important;
            font-size:9.5px!important;
            border-left:0!important;
            border-bottom:1px solid rgba(247,244,236,.09);
          }

          .xaaj-reference-footer-policies a:last-child{
            border-bottom:0!important;
          }
        }

        @media(max-width:360px){
          .xaaj-reference-footer-main{
            padding-left:17px;
            padding-right:17px;
            gap:28px 16px;
          }

          .xaaj-reference-footer-bottom{
            padding-left:17px;
            padding-right:17px;
          }

          .xaaj-reference-footer-brand h3{
            font-size:45px!important;
          }

          .xaaj-reference-footer-brand p{
            font-size:13px!important;
          }

          .xaaj-reference-footer-column h4,
          .xaaj-reference-footer-contact h4{
            font-size:18px!important;
          }
        }
      `}</style>

      <section className="xaaj-reference-newsletter" aria-labelledby="xaaj-reference-subscribe-title">
        <h2 id="xaaj-reference-subscribe-title">Subscribe to our emails</h2>
        <p>Subscribe to our mailing list for insider news, product launches, and more.</p>
        <ReferenceNewsletterForm />
      </section>

      <div className="xaaj-reference-footer-main">
        <div className="xaaj-reference-footer-brand">
          <h3>XAAJ</h3>
          <div className="xaaj-reference-footer-brand-rule" aria-hidden="true" />
          <p>Contemporary crockery rooted in the colours, crafts and everyday beauty of India.</p>
        </div>

        <div className="xaaj-reference-footer-contact">
          <h4>Get in Touch</h4>

          <div className="xaaj-reference-footer-contact-list">
            <a
              className="xaaj-reference-footer-contact-item"
              href="tel:+919899446117"
              aria-label="Call XAAJ at +91 98994 46117"
            >
              <div className="xaaj-reference-footer-contact-icon" aria-hidden="true">
                <PhoneCall size={18} strokeWidth={1.35} />
              </div>
              <div className="xaaj-reference-footer-contact-copy">
                <span>+91 98994 46117</span>
              </div>
            </a>

            <a
              className="xaaj-reference-footer-contact-item"
              href="https://wa.me/919899446117"
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with XAAJ on WhatsApp"
            >
              <div className="xaaj-reference-footer-contact-icon" aria-hidden="true">
                <FaWhatsapp size={18} />
              </div>
              <div className="xaaj-reference-footer-contact-copy">
                <span>9899446117</span>
              </div>
            </a>

            <a
              className="xaaj-reference-footer-contact-item"
              href="mailto:customercare@xaaj.in"
              aria-label="Email XAAJ customer care"
            >
              <div className="xaaj-reference-footer-contact-icon" aria-hidden="true">
                <Mail size={18} strokeWidth={1.35} />
              </div>
              <div className="xaaj-reference-footer-contact-copy">
                <span>customercare@xaaj.in</span>
              </div>
            </a>

            <a
              className="xaaj-reference-footer-contact-item"
              href="https://www.instagram.com/xaajstories?stkn=MWxkMzRscjAzaXVjZQ%3D%3D&utm_source=qr"
              target="_blank"
              rel="noreferrer"
              aria-label="XAAJ on Instagram"
            >
              <div className="xaaj-reference-footer-contact-icon" aria-hidden="true">
                <FaInstagram size={18} />
              </div>
              <div className="xaaj-reference-footer-contact-copy">
                <span>@xaajstories</span>
              </div>
            </a>
          </div>

          <a
            className="xaaj-reference-footer-address"
            href="https://www.google.com/maps/search/?api=1&query=G6%2F4C%20DLF%20Garden%20City%20Sector%2092%20Gurugram%20122505"
            target="_blank"
            rel="noreferrer"
            aria-label="XAAJ business address"
          >
            <MapPin size={17} strokeWidth={1.25} />
            <span>G6/4C DLF Garden City, Sector 92<br />Gurugram 122505</span>
          </a>
        </div>

        <div className="xaaj-reference-footer-column xaaj-reference-footer-shop">
          <h4>Shop</h4>
          <nav aria-label="Shop">
            <Link to="/shop?category=Dinnerware">Dinnerware</Link>
            <Link to="/shop?category=Glassware">Glassware</Link>
            <Link to="/shop?category=Serveware">Serveware</Link>
            <Link to="/shop?category=Gifting">Gifting</Link>
            <Link to="/shop?category=Horeca">Horeca</Link>
          </nav>
        </div>

        <div className="xaaj-reference-footer-column xaaj-reference-footer-about">
          <h4>About</h4>
          <nav aria-label="About XAAJ">
            <Link to="/about">Our Story</Link>
            <Link to="/faq">FAQs</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>
        </div>
      </div>

      {/* Mobile footer: compact editorial layout matching the XAAJ mobile reference. */}
      <div className="xaaj-mobile-footer">
        <details className="xaaj-mobile-footer-section">
          <summary>
            <span>Shop</span>
            <ChevronDown size={17} strokeWidth={1.2} />
          </summary>
          <nav aria-label="Mobile Shop">
            <Link to="/shop?category=Dinnerware">Dinnerware</Link>
            <Link to="/shop?category=Glassware">Glassware</Link>
            <Link to="/shop?category=Serveware">Serveware</Link>
            <Link to="/shop?category=Gifting">Gifting</Link>
            <Link to="/shop?category=Horeca">Horeca</Link>
          </nav>
        </details>

        <details className="xaaj-mobile-footer-section">
          <summary>
            <span>About</span>
            <ChevronDown size={17} strokeWidth={1.2} />
          </summary>
          <nav aria-label="Mobile About">
            <Link to="/about">Our Story</Link>
            <Link to="/faq">FAQs</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>
        </details>

        <details className="xaaj-mobile-footer-section" open>
          <summary>
            <span>Get in Touch</span>
            <ChevronDown size={17} strokeWidth={1.2} />
          </summary>

          <div className="xaaj-mobile-footer-contact-list">
            <a href="https://www.google.com/maps/search/?api=1&query=G6%2F4C%20DLF%20Garden%20City%20Sector%2092%20Gurugram%20122505"
              target="_blank"
              rel="noreferrer"
              className="xaaj-mobile-footer-contact-item"
              aria-label="XAAJ business address">
              <MapPin size={19} strokeWidth={1.35} />
              <span>G6/4C DLF Garden City, Sector 92<br />Gurugram 122505</span>
            </a>

            <a href="https://wa.me/919899446117"
              target="_blank"
              rel="noreferrer"
              className="xaaj-mobile-footer-contact-item"
              aria-label="Chat with XAAJ on WhatsApp">
              <FaWhatsapp size={19} />
              <span>9899446117</span>
            </a>

            <a href="mailto:customercare@xaaj.in"
              className="xaaj-mobile-footer-contact-item"
              aria-label="Email XAAJ customer care">
              <Mail size={19} strokeWidth={1.35} />
              <span>customercare@xaaj.in</span>
            </a>

            <a href="https://www.instagram.com/xaajstories?stkn=MWxkMzRscjAzaXVjZQ%3D%3D&utm_source=qr"
              target="_blank"
              rel="noreferrer"
              className="xaaj-mobile-footer-contact-item"
              aria-label="XAAJ on Instagram">
              <FaInstagram size={19} />
              <span>@xaajstories</span>
            </a>
          </div>
        </details>
      </div>

      <div className="xaaj-reference-footer-bottom">
        <div className="xaaj-reference-footer-copy">
          <span>© 2026, XAAJ. Made for everyday.</span>
        </div>

        <nav className="xaaj-reference-footer-policies" aria-label="Legal policies">
          <Link to="/shipping">Shipping Policy</Link>
          <Link to="/returns">Return &amp; Refund Policy</Link>
          <Link to="/cancellation">Cancellation Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </nav>
      </div>
    </footer>
  )
}

function ReferenceNewsletterForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()
    const value = email.trim().toLowerCase()

    if (!value) {
      setMessage('Please enter your email address.')
      return
    }

    setMessage('Subscribing...')

    try {
      const result = await newsletterService.subscribe(value)
      setEmail('')
      setMessage(result?.message || 'You’re now part of the XAAJ family.')
    } catch (error) {
      if (error?.data?.code === 'ALREADY_SUBSCRIBED' || error?.status === 409) {
        setMessage('This email is already subscribed.')
      } else {
        setMessage(
          error?.data?.message ||
          error?.message ||
          'We could not complete your subscription right now.'
        )
      }
    }
  }

  return (
    <form className="xaaj-reference-newsletter-form" onSubmit={handleSubmit}>
      <div className="xaaj-reference-newsletter-field">
        <input
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="Email"
          aria-label="Email address"
          autoComplete="email"
          required
        />
        <button type="submit" aria-label="Subscribe">
          <ArrowRight size={29} strokeWidth={1.2} />
        </button>
      </div>

      <div className="xaaj-reference-newsletter-message" aria-live="polite">
        {message || '\u00A0'}
      </div>
    </form>
  )
}


// ============================================================
// SHOP PAGE — CLEAN 3-COLUMN CATALOG
// ============================================================

function Shop() {
  const { products: liveProducts } = useStore()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const category = query.get('category')
  const search = query.get('search')
  const filter = query.get('filter')

  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [sort, setSort] = useState('featured')
  const [availability, setAvailability] = useState('all')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [productTypes, setProductTypes] = useState([])
  const filterPanelRef = useRef(null)
  const sortPanelRef = useRef(null)

  let list = Array.isArray(liveProducts) ? [...liveProducts] : []

  if (category) {
    const normalizedCategory = category.toLowerCase()

    if (normalizedCategory === 'dinnerware') {
      const dinnerwareCategories = ['dinner sets', 'plates', 'bowls', 'cups & mugs']
      list = list.filter(product =>
        dinnerwareCategories.includes(String(product.category || '').toLowerCase())
      )
    } else {
      list = list.filter(product =>
        `${product.name || ''} ${product.category || ''}`
          .toLowerCase()
          .includes(normalizedCategory)
      )
    }
  }

  if (search) {
    const term = search.toLowerCase()
    list = list.filter(product => String(product.name || '').toLowerCase().includes(term))
  }

  if (filter === 'new') {
    list = list.filter(product => String(product.tag || '').toLowerCase().includes('new'))
  }

  if (filter === 'best-selling') {
    list = list.slice().sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
  }

  const availableProductTypes = [...new Set(
    list
      .map(product => String(product.category || '').trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b))

  if (availability === 'in') {
    list = list.filter(product => Number(product.stock ?? 0) > 0)
  } else if (availability === 'out') {
    list = list.filter(product => Number(product.stock ?? 0) <= 0)
  }

  if (priceMin !== '') {
    const min = Number(priceMin)
    if (Number.isFinite(min)) {
      list = list.filter(product => Number(product.price || 0) >= min)
    }
  }

  if (priceMax !== '') {
    const max = Number(priceMax)
    if (Number.isFinite(max)) {
      list = list.filter(product => Number(product.price || 0) <= max)
    }
  }

  if (productTypes.length > 0) {
    const selectedTypes = new Set(productTypes.map(value => value.toLowerCase()))
    list = list.filter(product => selectedTypes.has(String(product.category || '').toLowerCase()))
  }

  if (sort === 'low') {
    list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
  } else if (sort === 'high') {
    list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
  } else if (sort === 'alpha-asc') {
    list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
  } else if (sort === 'alpha-desc') {
    list.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')))
  } else if (sort === 'best-selling') {
    list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
  } else if (sort === 'old-new') {
    list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
  } else if (sort === 'new-old') {
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }

  const sortLabels = {
    featured: 'Featured',
    'best-selling': 'Best selling',
    'alpha-asc': 'Alphabetically, A–Z',
    'alpha-desc': 'Alphabetically, Z–A',
    low: 'Price, low to high',
    high: 'Price, high to low',
    'old-new': 'Date, old to new',
    'new-old': 'Date, new to old'
  }

  const toggleProductType = value => {
    setProductTypes(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
    )
  }

  const clearFilters = () => {
    setAvailability('all')
    setPriceMin('')
    setPriceMax('')
    setProductTypes([])
  }

  const activeFilterCount =
    (availability !== 'all' ? 1 : 0) +
    (priceMin !== '' || priceMax !== '' ? 1 : 0) +
    productTypes.length

  useEffect(() => {
    const handlePointerDown = event => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target)
      ) {
        setFilterOpen(false)
      }
      if (
        sortPanelRef.current &&
        !sortPanelRef.current.contains(event.target)
      ) {
        setSortOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <>
      <Header />
      <main className="xaaj-shop-ref">
        <style>{`

          /* XAAJ pure-white surfaces: shop toolbar, filter/sort panels and nav dropdown */
          .xaaj-shop-ref,
          .xaaj-shop-ref-tools,
          .xaaj-shop-ref-popover,
          .xaaj-shop-ref-sort-menu,
          .xaaj-shop-ref-price-field input,
          .xaaj-ref-nav-menu,
          .xaaj-ref-nav-menu::before{
            background:#ffffff!important;
          }

          .xaaj-shop-ref{
            --shop-bg:#ffffff;
            --shop-ink:#2d2a26;
            --shop-muted:#7a746b;
            --shop-line:rgba(45,42,38,.14);
            background:var(--shop-bg);
            color:var(--shop-ink);
            min-height:70vh;
            width:100%;
          }
          .xaaj-shop-ref-inner{width:min(1160px,calc(100% - 96px));margin:0 auto;}
          .xaaj-shop-ref-head{padding:74px 0 54px;text-align:left;}
          .xaaj-shop-ref-head .xaaj-ref-eyebrow{display:block;margin-bottom:13px;color:#918a80;font:400 10px/1.2 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:2.4px;text-transform:uppercase;}
          .xaaj-shop-ref-head h1{margin:0;color:var(--shop-ink);font:400 clamp(48px,6.2vw,78px)/.98 'Playfair Display',serif;letter-spacing:-.045em;}
          .xaaj-shop-ref-head p{margin:25px 0 0;max-width:710px;color:var(--shop-muted);font:400 15px/1.65 'Gotham Book','Gotham',Arial,sans-serif;}
          .xaaj-shop-ref-toolbar-wrap{position:relative;z-index:70;}
          .xaaj-shop-ref-tools{height:62px;background:#ffffff!important;border-top:1px solid var(--shop-line);border-bottom:1px solid var(--shop-line);display:grid;grid-template-columns:1fr auto 1fr;align-items:center;position:relative;background:var(--shop-bg);}
          .xaaj-shop-ref-tools-left{display:flex;align-items:center;gap:28px;justify-self:start;}
          .xaaj-shop-ref-toolbar-button,.xaaj-shop-ref-sort-button{appearance:none;border:0;background:transparent;color:#5e5850;display:inline-flex;align-items:center;gap:7px;padding:0;font:400 12px/1 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:.01em;cursor:pointer;}
          .xaaj-shop-ref-toolbar-button:hover,.xaaj-shop-ref-sort-button:hover{color:var(--shop-ink);}
          .xaaj-shop-ref-count{text-align:center;color:#8a8379;font:400 10px/1 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:.03em;}
          .xaaj-shop-ref-sort-wrap{position:relative;justify-self:end;}
          .xaaj-shop-ref-sort-label{color:#888178;font-size:10px;margin-right:7px;}
          .xaaj-shop-ref-sort-button svg,.xaaj-shop-ref-toolbar-button svg{transition:transform .22s ease;}
          .xaaj-shop-ref-sort-wrap.is-open .xaaj-shop-ref-sort-button svg,.xaaj-shop-ref-filter-wrap.is-open .xaaj-shop-ref-toolbar-button svg{transform:rotate(180deg);}
          .xaaj-shop-ref-popover{position:absolute;top:calc(100% + 14px);left:0;right:0;background:#ffffff!important;border:1px solid rgba(45,42,38,.14);box-shadow:0 24px 65px rgba(35,30,25,.11);z-index:120;backdrop-filter:blur(14px);}
          .xaaj-shop-ref-filter-popover{display:grid;grid-template-columns:1fr 1fr 1.45fr;gap:0;}
          .xaaj-shop-ref-filter-group{padding:26px 30px 28px;border-right:1px solid rgba(45,42,38,.10);}
          .xaaj-shop-ref-filter-group:last-child{border-right:0;}
          .xaaj-shop-ref-filter-group h3{margin:0 0 20px;color:#8b847b;font:500 9px/1 'Gotham Book','Gotham',Arial,sans-serif;letter-spacing:1.7px;text-transform:uppercase;}
          .xaaj-shop-ref-filter-options{display:flex;flex-direction:column;gap:13px;}
          .xaaj-shop-ref-filter-option{appearance:none;border:0;background:transparent;padding:0;color:#625d56;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;font:400 12px/1.3 'Gotham Book','Gotham',Arial,sans-serif;cursor:pointer;}
          .xaaj-shop-ref-filter-option:hover{color:var(--shop-ink);}
          .xaaj-shop-ref-filter-option.is-active{color:var(--shop-ink);font-weight:500;}
          .xaaj-shop-ref-check{width:14px;height:14px;border:1px solid #bdb5ab;display:grid;place-items:center;flex:0 0 14px;}
          .xaaj-shop-ref-filter-option.is-active .xaaj-shop-ref-check{background:var(--shop-ink);border-color:var(--shop-ink);}
          .xaaj-shop-ref-check::after{content:'';width:6px;height:3px;border-left:1px solid #fff;border-bottom:1px solid #fff;transform:rotate(-45deg) translateY(-1px);opacity:0;}
          .xaaj-shop-ref-filter-option.is-active .xaaj-shop-ref-check::after{opacity:1;}
          .xaaj-shop-ref-price-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
          .xaaj-shop-ref-price-field{position:relative;}
          .xaaj-shop-ref-price-field span{position:absolute;left:12px;top:50%;transform:translateY(-50%);font:400 12px 'Gotham Book','Gotham',Arial,sans-serif;color:#8d867d;pointer-events:none;}
          .xaaj-shop-ref-price-field input{width:100%;height:40px;border:1px solid rgba(45,42,38,.18);background:#ffffff!important;color:var(--shop-ink);padding:0 11px 0 24px;outline:none;font:400 12px 'Gotham Book','Gotham',Arial,sans-serif;}
          .xaaj-shop-ref-price-field input:focus{border-color:rgba(45,42,38,.42);}
          .xaaj-shop-ref-filter-footer{grid-column:1/-1;border-top:1px solid rgba(45,42,38,.10);display:flex;align-items:center;justify-content:space-between;padding:15px 22px;}
          .xaaj-shop-ref-active-note{color:#8b847b;font-size:10px;}
          .xaaj-shop-ref-clear{border:0;background:transparent;color:#625d56;padding:6px 0;font:500 10px/1 'Gotham Book','Gotham',Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;cursor:pointer;}
          .xaaj-shop-ref-sort-menu{position:absolute;top:calc(100% + 14px);right:0;min-width:228px;padding:8px;background:#ffffff!important;border:1px solid rgba(45,42,38,.14);box-shadow:0 24px 65px rgba(35,30,25,.11);z-index:120;}
          .xaaj-shop-ref-sort-option{width:100%;border:0;background:transparent;color:#625d56;display:flex;justify-content:space-between;align-items:center;padding:11px 12px;text-align:left;font:400 11px/1.2 'Gotham Book','Gotham',Arial,sans-serif;cursor:pointer;}
          .xaaj-shop-ref-sort-option:hover{background:rgba(45,42,38,.045);color:var(--shop-ink);}
          .xaaj-shop-ref-sort-option.is-active{color:var(--shop-ink);font-weight:500;}
          .xaaj-shop-ref-sort-check{opacity:0;font-size:12px;}
          .xaaj-shop-ref-sort-option.is-active .xaaj-shop-ref-sort-check{opacity:1;}
          .xaaj-shop-ref-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px 18px;padding:34px 0 88px;}
          .xaaj-shop-ref-empty{grid-column:1/-1;text-align:center;padding:110px 20px 130px;}
          .xaaj-shop-ref-empty h2{margin:0 0 10px;font:400 34px/1.1 'Playfair Display',serif;}
          .xaaj-shop-ref-empty p{margin:0;color:#8a8379;font:400 12px/1.6 'Gotham Book','Gotham',Arial,sans-serif;}
          @media(max-width:900px){
            .xaaj-shop-ref-inner{width:min(100% - 44px,760px);}
            .xaaj-shop-ref-filter-popover{grid-template-columns:1fr 1fr;}
            .xaaj-shop-ref-filter-group:nth-child(2){border-right:0;}
            .xaaj-shop-ref-filter-group:nth-child(3){grid-column:1/-1;border-top:1px solid rgba(45,42,38,.10);border-right:0;}
            .xaaj-shop-ref-grid{grid-template-columns:repeat(3,minmax(0,1fr));}
          }
          @media(max-width:700px){
            .xaaj-shop-ref-inner{width:calc(100% - 32px);}
            .xaaj-shop-ref-head{padding:50px 0 34px;}
            .xaaj-shop-ref-head h1{font-size:44px;}
            .xaaj-shop-ref-head p{font-size:13px;margin-top:17px;}
            .xaaj-shop-ref-tools{height:54px;grid-template-columns:1fr auto;}
            .xaaj-shop-ref-tools-left{gap:18px;}
            .xaaj-shop-ref-count{display:none;}
            .xaaj-shop-ref-sort-label{display:none;}
            .xaaj-shop-ref-filter-popover{grid-template-columns:1fr;}
            .xaaj-shop-ref-filter-group,.xaaj-shop-ref-filter-group:nth-child(2),.xaaj-shop-ref-filter-group:nth-child(3){border-right:0;border-top:0;border-bottom:1px solid rgba(45,42,38,.10);grid-column:auto;}
            .xaaj-shop-ref-filter-footer{grid-column:auto;}
            .xaaj-shop-ref-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 12px;padding-top:24px;}
            .xaaj-shop-ref-sort-menu{right:0;min-width:210px;}
          }
        `}</style>

        <div className="xaaj-shop-ref-inner">
          <section className="xaaj-shop-ref-head">
            <span className="xaaj-ref-eyebrow">XAAJ collection</span>
            <h1>{category || (search ? `Search: ${search}` : 'Everything for the everyday')}</h1>
            <p>Considered crockery for tables, rituals and gatherings. Explore the collection by form.</p>
          </section>

          <div className="xaaj-shop-ref-toolbar-wrap">
            <div className="xaaj-shop-ref-tools">
              <div className="xaaj-shop-ref-tools-left">
                <div className={`xaaj-shop-ref-filter-wrap ${filterOpen ? 'is-open' : ''}`} ref={filterPanelRef}>
                  <button
                    type="button"
                    className="xaaj-shop-ref-toolbar-button"
                    onClick={() => {
                      setFilterOpen(value => !value)
                      setSortOpen(false)
                    }}
                    aria-expanded={filterOpen}
                  >
                    Filter{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
                    <ChevronDown size={13} strokeWidth={1.4} />
                  </button>

                  {filterOpen && (
                    <div className="xaaj-shop-ref-popover xaaj-shop-ref-filter-popover">
                      <div className="xaaj-shop-ref-filter-group">
                        <h3>Availability</h3>
                        <div className="xaaj-shop-ref-filter-options">
                          <button
                            type="button"
                            className={`xaaj-shop-ref-filter-option ${availability === 'all' ? 'is-active' : ''}`}
                            onClick={() => setAvailability('all')}
                          >
                            <span>All products</span>
                            <span className="xaaj-shop-ref-check" />
                          </button>
                          <button
                            type="button"
                            className={`xaaj-shop-ref-filter-option ${availability === 'in' ? 'is-active' : ''}`}
                            onClick={() => setAvailability('in')}
                          >
                            <span>In stock</span>
                            <span className="xaaj-shop-ref-check" />
                          </button>
                          <button
                            type="button"
                            className={`xaaj-shop-ref-filter-option ${availability === 'out' ? 'is-active' : ''}`}
                            onClick={() => setAvailability('out')}
                          >
                            <span>Out of stock</span>
                            <span className="xaaj-shop-ref-check" />
                          </button>
                        </div>
                      </div>

                      <div className="xaaj-shop-ref-filter-group">
                        <h3>Price · INR</h3>
                        <div className="xaaj-shop-ref-price-row">
                          <label className="xaaj-shop-ref-price-field">
                            <span>₹</span>
                            <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              value={priceMin}
                              onChange={event => setPriceMin(event.target.value)}
                              placeholder="From"
                              aria-label="Minimum price"
                            />
                          </label>
                          <label className="xaaj-shop-ref-price-field">
                            <span>₹</span>
                            <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              value={priceMax}
                              onChange={event => setPriceMax(event.target.value)}
                              placeholder="To"
                              aria-label="Maximum price"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="xaaj-shop-ref-filter-group">
                        <h3>Product type</h3>
                        <div className="xaaj-shop-ref-filter-options">
                          {availableProductTypes.length > 0 ? availableProductTypes.map(type => (
                            <button
                              type="button"
                              key={type}
                              className={`xaaj-shop-ref-filter-option ${productTypes.includes(type) ? 'is-active' : ''}`}
                              onClick={() => toggleProductType(type)}
                            >
                              <span>{type}</span>
                              <span className="xaaj-shop-ref-check" />
                            </button>
                          )) : (
                            <span className="xaaj-shop-ref-active-note">No product types available.</span>
                          )}
                        </div>
                      </div>

                      <div className="xaaj-shop-ref-filter-footer">
                        <span className="xaaj-shop-ref-active-note">
                          {activeFilterCount > 0 ? `${list.length} matching products` : 'All products shown'}
                        </span>
                        {activeFilterCount > 0 && (
                          <button type="button" className="xaaj-shop-ref-clear" onClick={clearFilters}>
                            Clear filters
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="xaaj-shop-ref-count">{list.length} products</div>

              <div className={`xaaj-shop-ref-sort-wrap ${sortOpen ? 'is-open' : ''}`} ref={sortPanelRef}>
                <button
                  type="button"
                  className="xaaj-shop-ref-sort-button"
                  onClick={() => {
                    setSortOpen(value => !value)
                    setFilterOpen(false)
                  }}
                  aria-expanded={sortOpen}
                >
                  <span className="xaaj-shop-ref-sort-label">Sort by:</span>
                  {sortLabels[sort]}
                  <ChevronDown size={13} strokeWidth={1.4} />
                </button>

                {sortOpen && (
                  <div className="xaaj-shop-ref-sort-menu">
                    {Object.entries(sortLabels).map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        className={`xaaj-shop-ref-sort-option ${sort === value ? 'is-active' : ''}`}
                        onClick={() => {
                          setSort(value)
                          setSortOpen(false)
                        }}
                      >
                        <span>{label}</span>
                        <span className="xaaj-shop-ref-sort-check">✓</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xaaj-shop-ref-grid">
            {list.length > 0 ? list.map(product => (
              <ProductCard product={product} key={product.id || product._id} />
            )) : (
              <div className="xaaj-shop-ref-empty">
                <h2>No pieces found</h2>
                <p>Try clearing a filter or exploring another collection.</p>
              </div>
            )}
          </div>
        </div>
      </main>
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

        <main className="page xaaj-product-page" style={{ background: "#fff" }}>
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

        <main className="page xaaj-product-page" style={{ background: "#fff" }}>
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

      <style>{`
        .xaaj-product-page {
          background: #fff !important;
        }
        .xaaj-product-page,
        .xaaj-product-page > .wrap,
        .xaaj-product-page .detail,
        .xaaj-product-page .detail-copy {
          background: #fff !important;
        }
      `}</style>

      <main className="page xaaj-product-page" style={{ background: "#fff" }}>
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

              {/* Product Information Accordions — premium editorial style */}
              <div className="xaaj-product-accordions">
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Gotham Book:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');

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
                    font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
                    font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
                    font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
        <style>{`
          .xaaj-cart-page {
            background: #ffffff !important;
          }
        `}</style>
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
    font-family:'Gotham Book','Gotham',Arial,sans-serif;
    font-size: clamp(48px, 7vw, 82px);
    line-height: .98;
    font-weight: 400;
    letter-spacing: -.035em;
  }
  .policy-hero .policy-intro {
    max-width: 720px;
    margin: 0;
    font-family:'Gotham Book','Gotham',Arial,sans-serif;
    font-size: clamp(20px, 2.2vw, 27px);
    line-height: 1.45;
    color: #393632;
  }
  .policy-effective {
    margin-top: 18px;
    font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
    font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
    font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
    font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
        {/* Legacy standalone Newsletter preserved below; reference subscribe is now inside Footer. */}
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
            position: relative;
            z-index: 1;
            min-height: calc(100dvh - 80px);
            padding: 56px 24px 80px;
            box-sizing: border-box;
            background:
              radial-gradient(circle at 10% 5%, rgba(47,112,72,.055), transparent 28%),
              linear-gradient(180deg, #f7f5f0 0%, #f2efe8 100%);
          }

          .xaaj-auth-shell {
            width: min(1120px, 100%);
            min-height: 0;
            margin: 0 auto;
            display: flex;
            align-items: flex-start;
            justify-content: center;
          }

          .xaaj-auth-layout {
            width: min(100%, 980px);
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(430px, .82fr);
            align-items: stretch;
            overflow: visible;
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
            border-radius: 23px 0 0 23px;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            align-items: flex-start;
            overflow: visible;
            padding: 42px clamp(34px, 4vw, 56px);
            background: rgba(255,254,250,.95);
            min-width: 0;
          }

          .xaaj-auth-form-inner {
            width: min(400px, 100%);
            margin: 0 auto;
          }

          .xaaj-auth-nav {
            position: relative;
            z-index: 3;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
              min-height: calc(100dvh - 74px);
              padding: 48px 16px 65px;
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
              min-height: calc(100dvh - 74px);
              padding: 36px 10px 52px;
            }

            .xaaj-auth-layout {
              border-radius: 18px;
              overflow: visible;
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

          @media (max-width: 560px) {
            .xaaj-auth-page {
              padding: 28px 10px 44px;
              min-height: calc(100dvh - 140px);
              overflow-x: hidden;
            }

            .xaaj-auth-shell {
              width: 100%;
            }

            .xaaj-auth-layout {
              width: 100%;
              max-width: 100%;
              border-radius: 16px;
              overflow: hidden;
            }

            .xaaj-auth-editorial {
              min-height: 235px;
              padding: 24px 20px;
              border-radius: 0;
            }

            .xaaj-auth-editorial h2 {
              font-size: clamp(36px, 10.8vw, 44px);
              line-height: .94;
            }

            .xaaj-auth-editorial-copy p {
              max-width: 290px;
              margin-top: 13px;
              font-size: 10px;
              line-height: 1.7;
            }

            .xaaj-auth-form-panel {
              padding: 28px 18px 34px;
            }

            .xaaj-auth-form-inner {
              width: 100%;
              max-width: 100%;
            }

            .xaaj-auth-nav {
              width: 100%;
              box-sizing: border-box;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px;
              margin-bottom: 24px;
            }

            .xaaj-auth-nav a {
              width: 100%;
              min-width: 0;
              height: 34px;
              font-size: 9px;
              letter-spacing: .25px;
            }

            .xaaj-auth-title {
              font-size: clamp(38px, 11vw, 46px);
              line-height: .98;
            }

            .xaaj-auth-lead {
              margin: 12px 0 22px;
              max-width: 100%;
              font-size: 11px;
              line-height: 1.7;
            }

            .xaaj-auth-fields {
              grid-template-columns: 1fr;
              gap: 14px;
            }

            .xaaj-auth-fields .full {
              grid-column: auto;
            }

            .xaaj-auth-field input,
            .xaaj-auth-field textarea,
            .xaaj-auth-field select {
              width: 100%;
              max-width: 100%;
              min-width: 0;
              box-sizing: border-box;
            }

            .xaaj-auth-submit {
              width: 100%;
              min-height: 48px;
            }
          }

          @media (max-width: 390px) {
            .xaaj-auth-page {
              padding: 22px 8px 36px;
            }

            .xaaj-auth-editorial {
              min-height: 215px;
              padding: 22px 17px;
            }

            .xaaj-auth-editorial h2 {
              font-size: 34px;
            }

            .xaaj-auth-form-panel {
              padding: 24px 15px 30px;
            }

            .xaaj-auth-nav a {
              font-size: 8.5px;
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
      {/* Legacy standalone Newsletter preserved below; reference subscribe is now inside Footer. */}
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
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
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

      /* ============================================================
         HOME BLOG — "FROM THE MAGAZINE" REFERENCE STYLE
         Scoped to the homepage so the full Blog page stays unchanged.
         ============================================================ */
      .xaaj-blog-home-shell{
        background:#fff;
        padding:34px 0 82px;
        margin-top:0;
      }

      .xaaj-blog-home-content{
        width:min(1148px,calc(100% - 48px));
        margin:0 auto;
      }

      .xaaj-blog-home-heading{
        margin:0 0 31px;
      }

      .xaaj-blog-home-heading h2{
        margin:0;
        color:#302e2b;
        font-family:Georgia,'Times New Roman',serif;
        font-size:31px;
        font-weight:400;
        line-height:1.15;
        letter-spacing:-.012em;
      }

      .xaaj-blog-home-grid{
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:20px;
      }

      .xaaj-blog-card-home{
        background:#fff;
        border:1px solid rgba(48,46,43,.20);
        border-radius:5px;
        box-shadow:none;
        overflow:hidden;
        transform:none;
        transition:box-shadow .35s ease,transform .35s ease;
      }

      .xaaj-blog-card-home:hover{
        transform:translateY(-3px);
        box-shadow:0 10px 28px rgba(48,46,43,.08);
      }

      .xaaj-blog-card-home .xaaj-blog-card-image{
        aspect-ratio:1.67 / 1;
        border-bottom:1px solid rgba(48,46,43,.12);
        background:#e9e5e1;
      }

      .xaaj-blog-card-home .xaaj-blog-card-copy{
        min-height:306px;
        background:#fff;
        padding:27px 30px 29px;
        box-sizing:border-box;
      }

      .xaaj-blog-card-home .xaaj-blog-card-copy h3{
        margin:0 0 13px;
        color:#34312e;
        font-family:Georgia,'Times New Roman',serif;
        font-size:28px;
        font-weight:400;
        line-height:1.16;
        letter-spacing:-.012em;
      }

      .xaaj-blog-card-home .xaaj-blog-card-copy h3 a{
        color:inherit;
      }

      .xaaj-blog-card-home-date{
        display:block;
        margin-bottom:15px;
        color:#77736e;
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
        font-size:10px;
        font-weight:400;
        line-height:1.2;
        letter-spacing:.14em;
        text-transform:uppercase;
      }

      .xaaj-blog-card-home .xaaj-blog-card-copy p{
        margin:0;
        color:#66625e;
        font-family:'Gotham Book','Gotham',Arial,sans-serif;
        font-size:14px;
        line-height:1.72;
        display:-webkit-box;
        -webkit-line-clamp:4;
        -webkit-box-orient:vertical;
        overflow:hidden;
      }

      .xaaj-blog-home-shell .xaaj-blog-fade{
        animation-duration:.65s;
      }

      @media (max-width: 900px) {
        .xaaj-blog-hero { min-height: 460px; }
        .xaaj-blog-feature { grid-template-columns: 1fr; }
        .xaaj-blog-feature-image { min-height: 390px; }
        .xaaj-blog-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 24px; }
      }

      @media (max-width: 900px) {
        .xaaj-blog-home-grid{
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:18px;
        }
        .xaaj-blog-card-home .xaaj-blog-card-copy{
          min-height:280px;
          padding:24px 24px 26px;
        }
        .xaaj-blog-card-home .xaaj-blog-card-copy h3{
          font-size:24px;
        }
      }

      @media (max-width: 620px) {
        .xaaj-blog-home-shell{
          padding:38px 0 62px;
        }
        .xaaj-blog-home-content{
          width:calc(100% - 30px);
        }
        .xaaj-blog-home-heading{
          margin-bottom:24px;
        }
        .xaaj-blog-home-heading h2{
          font-size:27px;
        }
        .xaaj-blog-home-grid{
          grid-template-columns:1fr;
          gap:18px;
        }
        .xaaj-blog-card-home .xaaj-blog-card-image{
          aspect-ratio:1.58 / 1;
        }
        .xaaj-blog-card-home .xaaj-blog-card-copy{
          min-height:0;
          padding:23px 21px 25px;
        }
        .xaaj-blog-card-home .xaaj-blog-card-copy h3{
          font-size:24px;
        }
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



      /* ============================================================
         HOME BLOG — FINAL WHITE SURFACE / NO SECTION BAND
         ============================================================ */
      .xaaj-cinema-home,
      .xaaj-blog-shell,
      .xaaj-blog-home-shell,
      .xaaj-blog-home-content,
      .xaaj-blog-card-home,
      .xaaj-blog-card-home .xaaj-blog-card-copy {
        background:#fff !important;
      }

      .xaaj-values-strip,
      .xaaj-blog-home-shell {
        margin-top:0 !important;
        margin-bottom:0 !important;
        border-top:0 !important;
        border-bottom:0 !important;
      }

      .xaaj-blog-home-content {
        margin-top:0 !important;
      }

      .xaaj-blog-card-home .xaaj-blog-card-copy {
        background:#fff !important;
      }

      .xaaj-blog-card-home {
        box-shadow:none !important;
      }

      /* ============================================================
         BLOG VISIBILITY / ROUTE SAFETY
         Keep the blog route visible even when global site styles or
         previous animation rules are loaded on the same page.
         ============================================================ */
      .xaaj-blog-shell,
      .xaaj-blog-article-shell,
      .xaaj-blog-home-shell {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 100%;
        min-height: 1px;
      }

      .xaaj-blog-article-shell {
        background: #fff !important;
        color: #292825;
        position: relative;
        z-index: 1;
      }

      .xaaj-blog-article,
      .xaaj-blog-article-header,
      .xaaj-blog-article-cover,
      .xaaj-blog-article-body,
      .xaaj-blog-article-back {
        visibility: visible !important;
      }

      .xaaj-blog-article-header.xaaj-blog-fade,
      .xaaj-blog-article-cover.xaaj-blog-fade {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }

      .xaaj-blog-card-home,
      .xaaj-blog-card-home.xaaj-blog-fade {
        visibility: visible !important;
        opacity: 1 !important;
      }

      .xaaj-blog-home-shell {
        background: #fff !important;
      }
    `}</style>
  )
}

function BlogCard({ post, index = 0, homeVariant = false }) {
  if (homeVariant) {
    return (
      <article className="xaaj-blog-card xaaj-blog-card-home xaaj-blog-fade" style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}>
        <Link to={`/blog/${post.slug}`} className="xaaj-blog-card-image" aria-label={`Read ${post.title}`}>
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} loading="lazy" />
          ) : (
            <div className="xaaj-blog-card-placeholder" />
          )}
        </Link>

        <div className="xaaj-blog-card-copy">
          <h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3>
          <span className="xaaj-blog-card-home-date">{formatBlogDate(post.publishDate)}</span>
          {post.excerpt && <p>{post.excerpt}</p>}
        </div>
      </article>
    )
  }

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
    <section className="xaaj-blog-shell xaaj-blog-home-shell" data-xaaj-reveal="up" style={{ background: '#fff', marginTop: 0, marginBottom: 0, border: 0 }}>
      <BlogDesignStyles />

      <div className="xaaj-blog-content xaaj-blog-home-content">
        <div className="xaaj-blog-home-heading">
          <h2>From the magazine</h2>
        </div>

        {loading ? (
          <div className="xaaj-blog-grid xaaj-blog-home-grid">
            {[1, 2, 3].map(item => <div className="xaaj-blog-skeleton" key={item} />)}
          </div>
        ) : visiblePosts.length ? (
          <div className="xaaj-blog-grid xaaj-blog-home-grid">
            {visiblePosts.map((post, index) => (
              <BlogCard key={post.id || post.slug || index} post={post} index={index} homeVariant />
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

      {/* Legacy standalone Newsletter preserved below; reference subscribe is now inside Footer. */}
      <Footer />
    </>
  )
}

function BlogArticle({ slug }) {
  const initialFallback = fallbackBlogPosts.find(item => item.slug === slug) || null
  const [post, setPost] = useState(initialFallback)
  const [loading, setLoading] = useState(!initialFallback)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    let timeoutId = null

    async function loadBlog() {
      setLoadError('')

      // A known local article is rendered immediately so the route never
      // becomes a blank page while the backend request is in flight.
      const localFallback = fallbackBlogPosts.find(item => item.slug === slug) || null
      if (!cancelled && localFallback) {
        setPost(localFallback)
        setLoading(false)
      }

      try {
        const request = apiRequest(`/blogs/${encodeURIComponent(slug)}`)
        const timeout = new Promise((_, reject) => {
          timeoutId = window.setTimeout(() => reject(new Error('Blog request timed out')), 8000)
        })

        const result = await Promise.race([request, timeout])
        const rawData = result?.data
        const rawPost =
          rawData?.blog ||
          rawData?.post ||
          rawData?.article ||
          (Array.isArray(rawData) ? rawData.find(item => item?.slug === slug || item?.id === slug) : null) ||
          result?.blog ||
          result?.post ||
          result?.article ||
          (Array.isArray(result) ? result.find(item => item?.slug === slug || item?.id === slug) : null) ||
          rawData ||
          result

        const livePost = normalizeBlogPost(rawPost)

        if (!cancelled && livePost?.title) {
          setPost(livePost)
          setLoadError('')
        } else if (!cancelled && !localFallback) {
          setPost(null)
          setLoadError('This blog story could not be found.')
        }
      } catch (error) {
        console.error('Blog article load error:', error)
        if (!cancelled) {
          const localFallback = fallbackBlogPosts.find(item => item.slug === slug) || null
          setPost(localFallback)
          if (!localFallback) {
            setLoadError('Unable to load this blog story. Please check the blog API and slug.')
          }
        }
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId)
        if (!cancelled) setLoading(false)
      }
    }

    loadBlog()
    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [slug])

  return (
    <>
      <Header />
      <BlogDesignStyles />

      <main
        className="xaaj-blog-article-shell"
        data-xaaj-blog-route-root="article"
        style={{ background: '#fff', display: 'block', minHeight: '70vh' }}
      >
        <article className="xaaj-blog-article" style={{ opacity: 1, visibility: 'visible', transform: 'none', display: 'block' }}>
          <div className="xaaj-blog-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/blog">Blog</Link>
            <span>/</span>
            <span>{post?.title || slug}</span>
          </div>

          {loading && !post ? (
            <section style={{ padding: '70px 0 120px', textAlign: 'center' }}>
              <span className="xaaj-blog-category">Blog</span>
              <h1 style={{
                margin: '18px auto 0',
                maxWidth: '860px',
                fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
                fontSize: 'clamp(42px, 6vw, 76px)',
                fontWeight: 400,
                lineHeight: 1,
                color: '#292825'
              }}>
                Loading story...
              </h1>
            </section>
          ) : post ? (
            <>
              <header className="xaaj-blog-article-header" style={{ opacity: 1, visibility: 'visible' }}>
                <span className="xaaj-blog-category">{post.category}</span>
                <h1>{post.title}</h1>
                <div className="xaaj-blog-article-meta">
                  <span>By {post.author}</span>
                  <span>•</span>
                  <span>{formatBlogDate(post.publishDate)}</span>
                </div>
              </header>

              {post.coverImage && (
                <div className="xaaj-blog-article-cover" style={{ opacity: 1, visibility: 'visible' }}>
                  <img src={post.coverImage} alt={post.title} />
                </div>
              )}

              <div className="xaaj-blog-article-body">
                {post.excerpt && <p className="xaaj-blog-article-excerpt">{post.excerpt}</p>}
                <div className="xaaj-blog-article-content">
                  {String(post.content || '')
                    .split(/\n{2,}/)
                    .map(part => part.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => (
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
                <Link to="/blog">
                  <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                  Back to all stories
                </Link>
              </div>
            </>
          ) : (
            <section style={{ padding: '70px 0 120px', textAlign: 'center' }}>
              <span className="xaaj-blog-category">Blog</span>
              <h1 style={{
                margin: '18px auto 0',
                maxWidth: '860px',
                fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
                fontSize: 'clamp(42px, 6vw, 76px)',
                fontWeight: 400,
                lineHeight: 1,
                color: '#292825'
              }}>
                Story not found.
              </h1>
              <p style={{ color: '#77736b', marginTop: 18 }}>
                {loadError || 'This story may have been unpublished or the link may be incorrect.'}
              </p>
              <Button to="/blog">Back to blog</Button>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </>
  )
}

// ============================================================
// MAIN APP ROUTING
// ============================================================


// ==========================================================
// XAAJ BRAND STORY — FULL STORY PAGE
// ==========================================================

function BrandStoryPage() {
  const [brandStoryMedia, setBrandStoryMedia] = useState({
    url: tableImage,
    mediaType: 'image',
    alt: 'XAAJ handcrafted tableware arranged on a dining table'
  })

  useEffect(() => {
    let cancelled = false

    const loadBrandStoryMedia = async () => {
      try {
        const result = await apiRequest('/cms/brand-story')

        const raw =
          result?.data?.brandStory ||
          result?.data?.story ||
          result?.data?.item ||
          result?.brandStory ||
          result?.story ||
          result?.item ||
          result?.data ||
          result ||
          null

        const item = Array.isArray(raw)
          ? raw.find(entry => entry && typeof entry === 'object')
          : raw && typeof raw === 'object'
            ? raw
            : null

        if (!item || cancelled) return

        const url =
          item.mediaUrl ||
          item.image ||
          item.imageUrl ||
          item.videoUrl ||
          item.url ||
          ''

        if (!url) return

        const enabled =
          item.enabled !== undefined
            ? Boolean(item.enabled)
            : item.isActive !== undefined
              ? Boolean(item.isActive)
              : true

        if (!enabled) return

        setBrandStoryMedia({
          url,
          mediaType: getBrandStoryMediaType(url, item.mediaType),
          alt: item.alt || item.title || 'XAAJ brand story'
        })
      } catch (error) {
        console.error('Brand story media load error:', error)
      }
    }

    loadBrandStoryMedia()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Header />

      <style>{`
        .xaaj-story-page{
          --story-ink:#2d2a26;
          --story-muted:#6f6a62;
          --story-line:rgba(45,42,38,.14);
          background:#ffffff;
          color:var(--story-ink);
          min-height:100vh;
          padding:52px 0 84px;
        }

        .xaaj-story-page,
        .xaaj-story-page *{
          box-sizing:border-box;
        }

        .xaaj-story-layout{
          width:min(1140px,calc(100% - 48px));
          margin:0 auto;
          display:grid;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr);
          gap:14px;
          align-items:stretch;
        }

        .xaaj-story-visual{
          position:relative;
          min-width:0;
          min-height:0;
          height:auto;
          align-self:stretch;
          background:#eee9e1;
          border:1px solid rgba(48,45,40,.14);
          border-radius:7px;
          overflow:hidden;
        }

        .xaaj-story-visual-media{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          display:block;
          object-fit:cover;
          object-position:center;
        }

        .xaaj-story-visual-caption{
          position:absolute;
          z-index:2;
          left:26px;
          bottom:25px;
          color:rgba(255,255,255,.84);
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
          font-size:8px;
          line-height:1;
          letter-spacing:2.5px;
          text-transform:uppercase;
          text-shadow:0 1px 12px rgba(0,0,0,.22);
          pointer-events:none;
        }

        .xaaj-story-copy-column{
          min-width:0;
          background:#ffffff;
          border:1px solid rgba(48,45,40,.14);
          border-radius:7px;
          padding:68px clamp(34px,5vw,72px) 72px;
        }

        .xaaj-story-copy-inner{
          width:min(100%,500px);
          margin:0 auto;
        }

        .xaaj-story-eyebrow{
          display:flex;
          align-items:center;
          gap:12px;
          margin:0 0 22px;
          color:#8b847b;
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
          font-size:8px;
          line-height:1;
          font-weight:500;
          letter-spacing:2.8px;
          text-transform:uppercase;
        }

        .xaaj-story-eyebrow::before{
          content:'';
          width:30px;
          height:1px;
          background:currentColor;
          flex:0 0 auto;
        }

        .xaaj-story-copy-column h1{
          margin:0;
          max-width:540px;
          color:#302d28;
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
          font-size:clamp(42px,4.8vw,68px);
          font-weight:400;
          line-height:.95;
          letter-spacing:-.05em;
        }

        .xaaj-story-intro{
          margin:30px 0 0;
          max-width:500px;
          color:#6d675f;
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
          font-size:12px;
          line-height:1.9;
        }

        .xaaj-story-intro p,
        .xaaj-story-section p{
          margin:0;
        }

        .xaaj-story-intro p + p{
          margin-top:17px;
        }

        .xaaj-story-divider{
          width:100%;
          height:1px;
          margin:48px 0 44px;
          background:var(--story-line);
        }

        .xaaj-story-section{
          max-width:500px;
        }

        .xaaj-story-section + .xaaj-story-section{
          margin-top:48px;
          padding-top:44px;
          border-top:1px solid var(--story-line);
        }

        .xaaj-story-section h2{
          margin:0 0 20px;
          color:#302d28;
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
          font-size:clamp(28px,3vw,43px);
          font-weight:400;
          line-height:1;
          letter-spacing:-.045em;
        }

        .xaaj-story-section p{
          color:#6d675f;
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
          font-size:12px;
          line-height:1.9;
        }

        .xaaj-story-section p + p{
          margin-top:17px;
        }

        .xaaj-story-moments{
          display:flex;
          flex-wrap:wrap;
          gap:8px 17px;
          margin:24px 0 20px;
          color:#514c45;
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
          font-size:10px;
          line-height:1.7;
          letter-spacing:.02em;
        }

        .xaaj-story-moments span{
          position:relative;
        }

        .xaaj-story-moments span:not(:last-child)::after{
          content:'·';
          position:absolute;
          right:-11px;
          color:#a49d93;
        }

        .xaaj-story-back{
          display:inline-flex;
          align-items:center;
          gap:8px;
          margin-top:52px;
          padding-bottom:8px;
          border-bottom:1px solid #2d2a26;
          color:#2d2a26;
          text-decoration:none;
          font-family:'Gotham Book','Gotham',Arial,sans-serif;
          font-size:8px;
          font-weight:500;
          letter-spacing:1.8px;
          text-transform:uppercase;
        }

        .xaaj-story-back svg{
          transition:transform .25s ease;
        }

        .xaaj-story-back:hover svg{
          transform:translateX(4px);
        }

        @media(max-width:900px){
          .xaaj-story-page{
            padding:42px 0 68px;
          }

          .xaaj-story-layout{
            width:calc(100% - 28px);
            grid-template-columns:1fr;
            gap:12px;
          }

          .xaaj-story-visual{
            position:relative;
            top:auto;
            height:520px;
            min-height:520px;
          }

          .xaaj-story-copy-column{
            padding:54px 32px 60px;
          }
        }

        @media(max-width:560px){
          .xaaj-story-page{
            padding:32px 0 54px;
          }

          .xaaj-story-layout{
            width:calc(100% - 20px);
            gap:10px;
          }

          .xaaj-story-visual{
            height:420px;
            border-radius:6px;
          }

          .xaaj-story-visual-caption{
            left:18px;
            bottom:18px;
            font-size:7px;
            letter-spacing:2px;
          }

          .xaaj-story-copy-column{
            border-radius:6px;
            padding:42px 21px 50px;
          }

          .xaaj-story-eyebrow{
            margin-bottom:20px;
            font-size:7px;
            letter-spacing:2.3px;
          }

          .xaaj-story-eyebrow::before{
            width:23px;
          }

          .xaaj-story-copy-column h1{
            font-size:clamp(40px,13vw,56px);
          }

          .xaaj-story-intro{
            margin-top:25px;
            font-size:11.5px;
            line-height:1.85;
          }

          .xaaj-story-divider{
            margin:40px 0 36px;
          }

          .xaaj-story-section + .xaaj-story-section{
            margin-top:40px;
            padding-top:36px;
          }

          .xaaj-story-section h2{
            margin-bottom:17px;
            font-size:31px;
          }

          .xaaj-story-section p{
            font-size:11.5px;
            line-height:1.85;
          }

          .xaaj-story-moments{
            gap:7px 15px;
            margin:21px 0 18px;
            font-size:9.5px;
          }

          .xaaj-story-back{
            margin-top:44px;
          }
        }
      `}</style>

      <main className="xaaj-story-page">
        <section className="xaaj-story-layout" aria-label="XAAJ brand story">
          <div className="xaaj-story-visual">
            {brandStoryMedia.mediaType === 'video' ? (
              <video
                className="xaaj-story-visual-media"
                src={brandStoryMedia.url}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={brandStoryMedia.alt}
              />
            ) : (
              <img
                className="xaaj-story-visual-media"
                src={brandStoryMedia.url}
                alt={brandStoryMedia.alt}
              />
            )}

            <span className="xaaj-story-visual-caption">
              Made by hand · Designed for now
            </span>
          </div>

          <div className="xaaj-story-copy-column">
            <div className="xaaj-story-copy-inner">
              <span className="xaaj-story-eyebrow">Our story</span>

              <h1>India, Made for the Table.</h1>

              <div className="xaaj-story-intro">
                <p>
                  A little clay.<br />
                  A lot of character.<br />
                  And a story in every piece.
                </p>

                <p>
                  XAAJ is contemporary crockery rooted in the colours,
                  crafts and everyday beauty of India.
                </p>

                <p>
                  Made by hand. Designed for now.<br />
                  Meant to be used, loved and lived with.
                </p>
              </div>

              <div className="xaaj-story-divider" aria-hidden="true" />

              <article className="xaaj-story-section">
                <h2>The beauty of India, served differently.</h2>

                <p>
                  We find inspiration in the things that surround us—old crafts,
                  familiar colours, everyday rituals, places and people.
                </p>

                <p>Then we give them a new form.</p>

                <p>
                  Pieces with a sense of where they come from,
                  and a place in how you live today.
                </p>
              </article>

              <article className="xaaj-story-section">
                <h2>Made to gather stories.</h2>

                <div className="xaaj-story-moments" aria-label="Everyday moments">
                  <span>Morning chai</span>
                  <span>Long lunches</span>
                  <span>Festive dinners</span>
                  <span>Midnight conversations</span>
                </div>

                <p>Because a table is never just a table.</p>
                <p>It is where life happens.</p>
              </article>

              <Link className="xaaj-story-back" to="/">
                Back to the table <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}


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

  // Reset the page to the top whenever the route OR query string changes.
  // This is important for category links such as:
  // /shop?category=Dinnerware -> /shop?category=Serveware
  // because React Router keeps the same pathname while location.search changes.
  // Also reset ScrollSmoother's internal position when it is active.
  useLayoutEffect(() => {
    const resetScroll = () => {
      try {
        const smoother = ScrollSmoother.get()
        if (smoother) {
          if (typeof smoother.scrollTop === 'function') {
            smoother.scrollTop(0)
          }
          if (typeof smoother.scrollTo === 'function') {
            smoother.scrollTo(0, true)
          }
        }
      } catch (error) {
        console.debug('ScrollSmoother reset skipped:', error)
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
    } catch {
      // Ignore browsers that do not expose scrollRestoration.
    }

    // Run once immediately and again after React paints so late layout
    // changes cannot restore the previous scroll position.
    resetScroll()
    const frame = window.requestAnimationFrame(resetScroll)
    const timer = window.setTimeout(resetScroll, 60)

    try {
      ScrollTrigger.refresh()
    } catch {
      // Ignore refresh failures during route transitions.
    }

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [location.pathname, location.search])

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

  
  // ==========================================================
  // XAAJ BRAND STORY
  // ==========================================================

  if (path === '/story') {
    return <BrandStoryPage />
  }

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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serifimportant;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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

        {/* Legacy standalone Newsletter preserved below; reference subscribe is now inside Footer. */}
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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
            font-family:'Gotham Book','Gotham',Arial,sans-serif;
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

        {/* Legacy standalone Newsletter preserved below; reference subscribe is now inside Footer. */}
        <Footer />
  
      <style id="xaaj-gotham-book-global">{`
        :root{
          --xaaj-heading-font:'Gotham Book','Gotham',Arial,sans-serif;
          --xaaj-body-font:'Gotham Book','Gotham',Arial,sans-serif;
          --blog-serif:'Gotham Book','Gotham',Arial,sans-serif;
        }

        html,
        body,
        #root,
        #root *{
          font-family:'Gotham Book','Gotham',Arial,sans-serif !important;
        }

        input,
        textarea,
        select,
        option,
        button{
          font-family:'Gotham Book','Gotham',Arial,sans-serif !important;
        }

        html{
          -webkit-font-smoothing:antialiased;
          -moz-osx-font-smoothing:grayscale;
          text-rendering:optimizeLegibility;
        }
      `}</style>
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
  const isBlogRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/blog' || window.location.pathname.startsWith('/blog/'))

  useLayoutEffect(() => {
    // Blog pages intentionally bypass ScrollSmoother. The editorial blog
    // layout needs normal document flow so the header/article cannot be
    // pushed into or hidden by a transformed smooth-scroll container.
    if (isBlogRoute) return undefined

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
  }, [isBlogRoute])

  if (isBlogRoute) {
    return (
      <>
        <style>{`
          html, body, #root {
            min-height: 100%;
            background: #fff !important;
          }
          body {
            overflow-x: hidden !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
        `}</style>
        {children}
      </>
    )
  }

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

          <style id="xaaj-white-section-surfaces">{`
            html, body, #root,
            .xaaj-smooth-wrapper, .xaaj-smooth-content {
              background: #ffffff !important;
            }

            /* Main page surfaces — pure white, like the cart page. */
            main.xaaj-cinema-home,
            main.xaaj-shop-ref,
            main.xaaj-product-page,
            main.policy-page,
            main.xaaj-auth-page,
            main.xaaj-blog-shell,
            main.xaaj-blog-article-shell,
            main.xaaj-about,
            main.xaaj-contact-page,
            .xaaj-reference-hero,
            .xaaj-hero-product-showcase,
            .xaaj-brand-story-split,
            .xaaj-horeca-bundled,
            .xaaj-cinema-intro,
            .xaaj-cinema-intro-copy,
            .xaaj-cinema-category,
            .xaaj-cinema-quote,
            .xaaj-cinema-products,
            .xaaj-collection-story-carousel,
            .xaaj-collection-story-copy,
            .xaaj-category-gallery,
            .xaaj-values-strip,
            .xaaj-cart-page,
            .xaaj-blog-home-shell,
            .xaaj-blog-home-content {
              background: #ffffff !important;
            }

            /* White content panels inside those sections. */
            .xaaj-brand-story-split-copy,
            .xaaj-blog-feature,
            .xaaj-blog-card,
            .xaaj-blog-card-home,
            .xaaj-blog-card-home .xaaj-blog-card-copy,
            .xaaj-contact-form-head,
            .xaaj-contact-form-grid {
              background: #ffffff !important;
            }

            /* Keep the main header/nav white even while cart/navigation overlays are active. */
            .xaaj-ref-header-shell,
            .xaaj-ref-header-shell .xaaj-ref-header,
            .xaaj-ref-header-shell.xaaj-home-header,
            .xaaj-ref-header-shell.xaaj-home-header.is-scrolled .xaaj-ref-header {
              background: #ffffff !important;
            }
          `}</style>

          <style id="xaaj-nav-premium-typography">{`
            .xaaj-ref-main-nav a{
              font-family:'Gotham Book','Gotham',Arial,sans-serif!important;
              font-size:13px!important;
              line-height:1.2!important;
              font-weight:400!important;
              letter-spacing:.12px!important;
              text-transform:none!important;
            }

            @media(max-width:850px){
              .xaaj-ref-main-nav a{
                font-size:12px!important;
                letter-spacing:.08px!important;
              }
            }

            @media(max-width:520px){
              .xaaj-ref-main-nav a{
                font-size:11px!important;
                letter-spacing:.05px!important;
              }
            }
          `}</style>

          <SmoothScrollShell>

            <App />

          </SmoothScrollShell>

        </BrowserRouter>

      </StoreProvider>

    </AuthProvider>

  )
}
