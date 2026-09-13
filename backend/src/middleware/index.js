import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env.js'

// ============================================================
// ASYNC HANDLER
// ============================================================

export function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
}

// ============================================================
// AUTH PROTECTION
// ============================================================

export function protect(req, res, next) {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret)
    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}

// ============================================================
// ADMIN PROTECTION
// ============================================================

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    })
  }

  next()
}

// ============================================================
// VALIDATION MIDDLEWARE
// ============================================================

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    })

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten()
      })
    }

    req.validated = result.data
    next()
  }
}

// ============================================================
// REGISTER VALIDATION
// ============================================================

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name cannot exceed 80 characters'),

    email: z
      .string()
      .trim()
      .email('Please enter a valid email address'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),

    phone: z
      .string()
      .trim()
      .min(10, 'Please enter a valid phone number')
      .max(15, 'Please enter a valid phone number'),

    address: z
      .string()
      .trim()
      .min(5, 'Please enter your full address')
      .max(250, 'Address is too long'),

    city: z
      .string()
      .trim()
      .min(2, 'Please enter your city')
      .max(80, 'City name is too long'),

    state: z
      .string()
      .trim()
      .min(2, 'Please enter your state')
      .max(80, 'State name is too long'),

    pin: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'PIN code must be 6 digits')
  }),

  params: z.object({}),
  query: z.object({})
})

// ============================================================
// LOGIN VALIDATION
// ============================================================

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address'),

    password: z
      .string()
      .min(1, 'Password is required')
  }),

  params: z.object({}),
  query: z.object({})
})

// ============================================================
// PRODUCT VALIDATION
// ============================================================

export const productSchema = z.object({
  body: z
    .object({
      // ------------------------------------------------------
      // Basic product information
      // ------------------------------------------------------

      name: z
        .string()
        .trim()
        .min(
          2,
          'Product name must be at least 2 characters'
        )
        .max(
          150,
          'Product name cannot exceed 150 characters'
        ),

      slug: z
        .string()
        .trim()
        .min(2, 'Product slug is required')
        .max(180, 'Product slug cannot exceed 180 characters')
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'Product slug can contain only lowercase letters, numbers and hyphens'
        ),

      description: z
        .string()
        .trim()
        .min(
          10,
          'Product description must be at least 10 characters'
        ),

      category: z
        .string()
        .trim()
        .min(2, 'Product category is required')
        .max(80, 'Product category is too long'),

      // ------------------------------------------------------
      // Pricing
      // ------------------------------------------------------

      mrp: z
        .coerce
        .number()
        .finite('MRP must be a valid number')
        .nonnegative('MRP cannot be negative'),

      price: z
        .coerce
        .number()
        .finite('Selling price must be a valid number')
        .nonnegative('Selling price cannot be negative'),

      // ------------------------------------------------------
      // Backward compatibility
      // ------------------------------------------------------

      compareAtPrice: z
        .coerce
        .number()
        .finite()
        .nonnegative()
        .optional(),

      // ------------------------------------------------------
      // Stock
      // ------------------------------------------------------

      stock: z
        .coerce
        .number()
        .int('Stock must be a whole number')
        .nonnegative('Stock cannot be negative')
        .optional(),

      // ------------------------------------------------------
      // Multiple product images
      // ------------------------------------------------------

      images: z
        .array(
          z
            .string()
            .trim()
            .url('Each product image must be a valid URL')
        )
        .min(
          1,
          'At least one product image is required'
        )
        .max(
          10,
          'A maximum of 10 product images is allowed'
        )
        .optional(),

      // ------------------------------------------------------
      // Product Details & Care
      // ------------------------------------------------------

      productDetails: z
        .string()
        .trim()
        .max(
          5000,
          'Product details cannot exceed 5000 characters'
        )
        .optional(),

      // ------------------------------------------------------
      // Shipping & Payment
      // ------------------------------------------------------

      shippingPayment: z
        .string()
        .trim()
        .max(
          5000,
          'Shipping & payment information cannot exceed 5000 characters'
        )
        .optional(),

      // ------------------------------------------------------
      // Return & Exchange
      // ------------------------------------------------------

      returnExchange: z
        .string()
        .trim()
        .max(
          5000,
          'Return & exchange information cannot exceed 5000 characters'
        )
        .optional(),

      // ------------------------------------------------------
      // Product tags
      // ------------------------------------------------------

      tags: z
        .array(
          z
            .string()
            .trim()
            .min(1, 'Tag cannot be empty')
            .max(50, 'Tag cannot exceed 50 characters')
        )
        .max(20, 'Maximum 20 tags are allowed')
        .optional()
    })

    // --------------------------------------------------------
    // Price validation
    // Selling price must not be greater than MRP
    // --------------------------------------------------------

    .superRefine((data, ctx) => {
      if (data.price > data.mrp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message:
            'Selling price cannot be higher than MRP'
        })
      }
    }),

  params: z.object({}),
  query: z.object({})
})

// ============================================================
// NOT FOUND
// ============================================================

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  })
}

// ============================================================
// ERROR HANDLER
// ============================================================

export function errorHandler(err, req, res, next) {
  console.error('[XAAJ API]', err)

  const status =
    err.name === 'ValidationError'
      ? 422
      : err.code === 11000
        ? 409
        : err.statusCode || 500

  res.status(status).json({
    success: false,
    message:
      status === 500
        ? 'Internal server error'
        : err.message
  })
}