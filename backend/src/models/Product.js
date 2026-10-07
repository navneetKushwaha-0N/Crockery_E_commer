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

    // ==========================================================



    category: {

      type: String,

      required: true,

      enum: [

        'Dinnerware',

        'Drinkware',

        'Serveware',

        'Gifting',



        // Legacy values

        'Dinner Sets',

        'Plates',

        'Bowls',

        'Cups',

        'Mugs'

      ],

      index: true

    },



    // ==========================================================

    // PRODUCT SUBCATEGORY

    // ==========================================================



    subcategory: {

      type: String,

      enum: [

        '',

        'Cups',

        'Mugs',

        'Pasta Plate',

        'Serving Bowl',

        'Serving Platter',

        'Tea Set',

        'Tea Cup Set'

      ],

      default: '',

      trim: true

    },



    // ==========================================================

    // HSN CODE

    // ==========================================================



    hsnCode: {

      type: String,

      required: true,

      trim: true,

      match: [

        /^\d{4}(?:\d{2})?(?:\d{2})?$/,

        'HSN code must contain 4, 6, or 8 digits.'

      ],

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

    // DISCOUNT PERCENTAGE

    //

    // Example:

    // MRP = 1499

    // Discount = 25

    // Selling Price = 1124

    // ==========================================================



    discountPercent: {

      type: Number,

      default: 0,

      min: 0,

      max: 100

    },



    // ==========================================================

    // SHOW DISCOUNT PERCENTAGE

    //

    // true:

    // ₹1,124   ₹1,499 MRP   25% OFF

    //

    // false:

    // ₹1,124   ₹1,499 MRP

    // ==========================================================



    showDiscountPercent: {

      type: Boolean,

      default: true

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

    // ==========================================================



    compareAtPrice: {

      type: Number,

      min: 0

    },



    // ==========================================================

    // PRODUCT IMAGES

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

// VALIDATE SUBCATEGORY

// ==========================================================



productSchema.pre('validate', function validateSubcategory() {
  const allowedSubcategories = {
    Dinnerware: [],
    Drinkware: ['Cups', 'Mugs'],
    Serveware: [
      'Pasta Plate',
      'Serving Bowl',
      'Serving Platter'
    ],
    Gifting: [
      'Tea Set',
      'Tea Cup Set'
    ]
  }

  const category = String(this.category || '').trim()
  const subcategory = String(this.subcategory || '').trim()

  // Always normalize missing/null subcategory values.
  if (!subcategory) {
    this.subcategory = ''
    return
  }

  // Dinnerware has no subcategory.
  if (category === 'Dinnerware') {
    this.subcategory = ''
    return
  }

  // Unknown category is handled by the category enum.
  if (!Object.prototype.hasOwnProperty.call(allowedSubcategories, category)) {
    this.subcategory = ''
    return
  }

  if (!allowedSubcategories[category].includes(subcategory)) {
    this.invalidate(
      'subcategory',
      `Invalid subcategory "${subcategory}" for ${category}.`
    )
    return
  }

  this.subcategory = subcategory
})


// VALIDATE DISCOUNT

// ==========================================================



productSchema.pre(

  'validate',

  function validateDiscount() {

    if (

      this.discountPercent !== undefined &&

      this.discountPercent !== null

    ) {

      const discount = Number(this.discountPercent)



      if (!Number.isFinite(discount)) {

        this.invalidate(

          'discountPercent',

          'Discount percentage must be a valid number.'

        )



        return

      }



      if (discount < 0 || discount > 100) {

        this.invalidate(

          'discountPercent',

          'Discount percentage must be between 0 and 100.'

        )

      }

    }

  }

)



// ==========================================================

// VALIDATE PRICE

//

// Selling price MRP se zyada nahi honi chahiye.

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

  subcategory: 1,

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