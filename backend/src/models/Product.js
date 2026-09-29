import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    // ==========================================================
    // PRODUCT NAME
    // ==========================================================

    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    // ==========================================================
    // SEO-FRIENDLY PRODUCT URL
    // ==========================================================

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    // ==========================================================
    // PRODUCT DESCRIPTION
    // ==========================================================

    description: {
      type: String,
      required: true,
      trim: true
    },

    // ==========================================================
    // PRODUCT DETAILS & CARE
    // ==========================================================

    productDetails: {
      type: String,
      trim: true,
      default: ''
    },

    // ==========================================================
    // SHIPPING & PAYMENT
    // ==========================================================

    shippingPayment: {
      type: String,
      trim: true,
      default: ''
    },

    // ==========================================================
    // RETURN & EXCHANGE
    // ==========================================================

    returnExchange: {
      type: String,
      trim: true,
      default: ''
    },

    // ==========================================================
    // PRODUCT CATEGORY
    // Main category used by the store navigation/filtering.
    // ==========================================================

    category: {
      type: String,
      required: true,
      enum: [
        'Dinnerware',
        'Glassware',
        'Serveware',
        'Gifting',
        'Horeca',

        // Legacy values kept temporarily so existing products can
        // still be read/updated without breaking the old dataset.
        'Dinner Sets',
        'Plates',
        'Bowls',
        'Cups & Mugs'
      ],
      index: true
    },

    // ==========================================================
    // DINNERWARE COLLECTION (OPTIONAL)
    // Only used when the main category is Dinnerware.
    // The admin user may leave this empty.
    // ==========================================================

    dinnerwareCollection: {
      type: String,
      enum: [
        'Speckled White',
        'Dove Gray',
        'Blush Pink',
        'Beachgrass Green',
        'Midnight Blue'
      ],
      default: null,
      trim: true
    },

    // ==========================================================
    // HSN CODE
    // Stored as a string so leading zeroes are preserved.
    // Supports 4, 6 or 8 digit HSN codes.
    // ==========================================================

    hsnCode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}(?:\d{2})?(?:\d{2})?$/, 'HSN code must contain 4, 6, or 8 digits.'],
      index: true
    },

    // ==========================================================
    // MRP / ORIGINAL PRICE
    // ==========================================================

    mrp: {
      type: Number,
      required: true,
      min: 0
    },

    // ==========================================================
    // SELLING PRICE
    // ==========================================================

    price: {
      type: Number,
      required: true,
      min: 0
    },

    // ==========================================================
    // OLD FIELD - COMPATIBILITY
    // compareAtPrice ko rakha gaya hai taaki purane
    // products/data break na ho.
    // ==========================================================

    compareAtPrice: {
      type: Number,
      min: 0
    },

    // ==========================================================
    // PRODUCT IMAGES
    // Multiple images allowed
    // First image = main product image
    // ==========================================================

    images: [
      {
        type: String,
        trim: true
      }
    ],

    // ==========================================================
    // AVAILABLE STOCK
    // ==========================================================

    stock: {
      type: Number,
      min: 0,
      default: 0
    },

    // ==========================================================
    // SHIPPING PACKAGE DETAILS
    //
    // Used for Velocity Shipping
    //
    // weight  = KG
    // length  = CM
    // breadth = CM
    // height  = CM
    // ==========================================================

    shipping: {
      weight: {
        type: Number,
        required: true,
        min: 0.001
      },

      length: {
        type: Number,
        required: true,
        min: 0.1
      },

      breadth: {
        type: Number,
        required: true,
        min: 0.1
      },

      height: {
        type: Number,
        required: true,
        min: 0.1
      }
    },

    // ==========================================================
    // PRODUCT TAGS
    // Example:
    // featured, bestseller, new
    // ==========================================================

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],

    // ==========================================================
    // PRODUCT RATING
    // ==========================================================

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    // ==========================================================
    // NUMBER OF REVIEWS
    // ==========================================================

    reviewCount: {
      type: Number,
      min: 0,
      default: 0
    },

    // ==========================================================
    // PRODUCT ACTIVE / INACTIVE
    // ==========================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
)

// ==========================================================
// VALIDATE DINNERWARE COLLECTION
// If category is Dinnerware, the collection is optional.
// For other categories it is cleared so the data stays clean.
// ==========================================================

productSchema.pre('validate', function validateDinnerwareCollection() {
  if (this.category !== 'Dinnerware') {
    this.dinnerwareCollection = null
  }
})

// ==========================================================
// VALIDATE PRICE
// Selling price MRP se zyada nahi honi chahiye
// ==========================================================

productSchema.pre(
  'validate',
  function validatePrices() {
    if (
      this.mrp !== undefined &&
      this.price !== undefined &&
      Number(this.price) > Number(this.mrp)
    ) {
      this.invalidate(
        'price',
        'Selling price cannot be greater than MRP.'
      )
    }
  }
)

// ==========================================================
// TEXT SEARCH INDEX
// ==========================================================

productSchema.index({
  name: 'text',
  description: 'text',
  productDetails: 'text',
  tags: 'text'
})

// ==========================================================
// PRODUCT INDEXES
// ==========================================================

productSchema.index({
  category: 1,
  dinnerwareCollection: 1,
  isActive: 1
})

productSchema.index({
  createdAt: -1
})

// ==========================================================
// MODEL
// ==========================================================

export default mongoose.model(
  'Product',
  productSchema
)
