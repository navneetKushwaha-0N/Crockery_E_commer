import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { productService } from '../services/api'

const StoreContext = createContext(null)

// =====================================================
// Read data from localStorage
// =====================================================
function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)

    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

// =====================================================
// Store Provider
// =====================================================
export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() =>
    readStorage('xaaj-cart', [])
  )

  const [wish, setWish] = useState(() =>
    readStorage('xaaj-wishlist', [])
  )

  const [products, setProducts] = useState([])

  // ===================================================
  // Load Products
  // ===================================================
  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        const result = await productService.list({
          limit: 48
        })

        const productList = Array.isArray(result?.data)
          ? result.data
          : []

        if (cancelled) return

        setProducts(
          productList.map(product => ({
            ...product,

            id: product._id,

            image: product.images?.[0] || '',

            // MRP is the proper old/display price
            old:
              product.mrp ??
              product.compareAtPrice ??
              null,

            tag:
              product.tags?.[0] ||
              'New',

            reviews:
              product.reviewCount ||
              0
          }))
        )
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Products load error:',
            error
          )

          setProducts([])
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  // ===================================================
  // ADD TO CART
  // ===================================================
  const add = product => {
    setCart(items => {
      const found = items.find(
        item => item.id === product.id
      )

      const stock = Number(product.stock ?? 0)

      // -----------------------------------------------
      // Product out of stock
      // -----------------------------------------------
      if (stock <= 0) {
        return items
      }

      // -----------------------------------------------
      // Product already exists in cart
      // -----------------------------------------------
      if (found) {
        // Already reached available stock
        if (found.qty >= stock) {
          return items
        }

        return items.map(item =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1
              }
            : item
        )
      }

      // -----------------------------------------------
      // Add new product
      // -----------------------------------------------
      return [
        ...items,
        {
          ...product,
          qty: 1
        }
      ]
    })
  }

  // ===================================================
  // REMOVE FROM CART
  // ===================================================
  const remove = id => {
    setCart(items =>
      items.filter(item => item.id !== id)
    )
  }

  // ===================================================
  // CHANGE CART QUANTITY
  // ===================================================
  const change = (id, delta) => {
    setCart(items =>
      items.map(item => {
        if (item.id !== id) {
          return item
        }

        const stock = Number(item.stock ?? 0)

        const currentQty = Number(item.qty || 1)

        // ---------------------------------------------
        // New quantity
        // ---------------------------------------------
        const newQty = currentQty + delta

        // ---------------------------------------------
        // Minimum quantity = 1
        // ---------------------------------------------
        if (newQty < 1) {
          return {
            ...item,
            qty: 1
          }
        }

        // ---------------------------------------------
        // Maximum quantity = available stock
        // ---------------------------------------------
        if (stock > 0 && newQty > stock) {
          return {
            ...item,
            qty: stock
          }
        }

        // ---------------------------------------------
        // Normal quantity update
        // ---------------------------------------------
        return {
          ...item,
          qty: newQty
        }
      })
    )
  }

  // ===================================================
  // WISHLIST
  // ===================================================
  const toggleWish = id => {
    setWish(items =>
      items.includes(id)
        ? items.filter(item => item !== id)
        : [...items, id]
    )
  }

  // ===================================================
  // Save Cart
  // ===================================================
  useEffect(() => {
    window.localStorage.setItem(
      'xaaj-cart',
      JSON.stringify(cart)
    )
  }, [cart])

  // ===================================================
  // Save Wishlist
  // ===================================================
  useEffect(() => {
    window.localStorage.setItem(
      'xaaj-wishlist',
      JSON.stringify(wish)
    )
  }, [wish])

  // ===================================================
  // Store Values
  // ===================================================
  const value = useMemo(
    () => ({
      products,

      cart,

      wish,

      add,

      remove,

      change,

      toggleWish,

      // Total number of products in cart
      count: cart.reduce(
        (total, item) =>
          total + Number(item.qty || 0),
        0
      ),

      // Cart subtotal
      total: cart.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.qty || 0),
        0
      )
    }),
    [
      products,
      cart,
      wish
    ]
  )

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

// =====================================================
// useStore Hook
// =====================================================
export const useStore = () =>
  useContext(StoreContext)