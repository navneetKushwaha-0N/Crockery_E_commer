import { Router } from 'express'
import Product from '../models/Product.js'
import Subscriber from '../models/Subscriber.js'
import { sendEmail } from '../services/integrations.js'

import {
  asyncHandler,
  adminOnly,
  protect,
  productSchema,
  validate
} from '../middleware/index.js'

const router = Router()

// ============================================================
// NEWSLETTER PRODUCT ANNOUNCEMENT
// ============================================================

const sendNewProductAnnouncement = async product => {
  try {
    // ----------------------------------------------------------
    // Get all active newsletter subscribers
    // ----------------------------------------------------------

    const subscribers = await Subscriber.find({
      isSubscribed: true
    })
      .select('email -_id')
      .lean()

    if (!subscribers.length) {
      console.log(
        '[Newsletter] No active subscribers found.'
      )

      return
    }

    // ----------------------------------------------------------
    // Product image
    // ----------------------------------------------------------

    const productImage =
      Array.isArray(product.images) &&
      product.images.length > 0
        ? product.images[0]
        : ''

    // ----------------------------------------------------------
    // Frontend URL
    // ----------------------------------------------------------

    const clientUrl = (
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      ''
    ).replace(/\/$/, '')

    const productUrl = clientUrl
      ? `${clientUrl}/product/${encodeURIComponent(
          product.slug || product._id
        )}`
      : '#'

    // ----------------------------------------------------------
    // Product details
    // ----------------------------------------------------------

    const productName =
      String(product.name || 'A new piece').trim()

    const productPrice = Number(product.price)

    // ----------------------------------------------------------
    // Product image HTML
    // ----------------------------------------------------------

    const imageHtml = productImage
      ? `
        <img
          src="${productImage}"
          alt="${productName}"
          style="
            display:block;
            width:100%;
            height:360px;
            object-fit:cover;
          "
        />
      `
      : ''

    // ----------------------------------------------------------
    // Price HTML
    // ----------------------------------------------------------

    const priceHtml =
      Number.isFinite(productPrice)
        ? `
          <p
            style="
              margin:24px 0;
              font-family:Georgia,'Times New Roman',serif;
              font-size:22px;
              color:#292824;
            "
          >
            ₹${productPrice.toLocaleString('en-IN')}
          </p>
        `
        : ''

    // ----------------------------------------------------------
    // Email HTML
    // ----------------------------------------------------------

    const emailHtml = `
      <div
        style="
          margin:0;
          padding:40px 20px;
          background:#f6f2eb;
          font-family:Arial,Helvetica,sans-serif;
          color:#292824;
        "
      >

        <div
          style="
            max-width:600px;
            margin:0 auto;
            background:#ffffff;
            border:1px solid #e8e1d7;
            border-radius:20px;
            overflow:hidden;
          "
        >

          ${imageHtml}

          <div
            style="
              padding:42px 34px;
              text-align:center;
            "
          >

            <!-- Eyebrow -->

            <div
              style="
                font-size:11px;
                letter-spacing:4px;
                text-transform:uppercase;
                color:#b84d32;
                font-weight:600;
              "
            >
              Just arrived at XAAJ
            </div>

            <!-- Product name -->

            <h1
              style="
                margin:16px 0 14px;
                font-family:Georgia,'Times New Roman',serif;
                font-size:34px;
                line-height:1.2;
                font-weight:400;
                color:#292824;
              "
            >
              ${productName}
            </h1>

            <!-- Description -->

            <p
              style="
                margin:0 auto;
                max-width:470px;
                font-size:15px;
                line-height:1.8;
                color:#706d67;
              "
            >
              A new piece has found its way into the
              XAAJ collection — thoughtfully chosen for
              everyday rituals and beautiful moments.
            </p>

            <!-- Price -->

            ${priceHtml}

            <!-- Product button -->

            <a
              href="${productUrl}"
              style="
                display:inline-block;
                padding:14px 24px;
                background:#292824;
                color:#ffffff;
                text-decoration:none;
                border-radius:999px;
                font-size:13px;
                letter-spacing:.5px;
              "
            >
              Discover the piece
            </a>

            <!-- Divider -->

            <div
              style="
                margin:32px auto;
                width:70px;
                height:1px;
                background:#d8d0c5;
              "
            ></div>

            <!-- Signature -->

            <p
              style="
                margin:0;
                font-family:Georgia,'Times New Roman',serif;
                font-size:18px;
                color:#292824;
              "
            >
              With warmth,<br />

              <span style="font-size:16px;">
                Team XAAJ
              </span>
            </p>

          </div>

          <!-- Footer -->

          <div
            style="
              padding:20px 30px;
              text-align:center;
              background:#f8f5ef;
              border-top:1px solid #eee8df;
              font-size:12px;
              line-height:1.6;
              color:#8a857d;
            "
          >
            You’re receiving this because you subscribed
            to XAAJ updates.
          </div>

        </div>
      </div>
    `

    // ----------------------------------------------------------
    // Send email to all subscribers
    // ----------------------------------------------------------

    const results = await Promise.allSettled(
      subscribers.map(({ email }) =>
        sendEmail({
          to: email,
          subject: `New at XAAJ — ${productName}`,
          html: emailHtml
        })
      )
    )

    // ----------------------------------------------------------
    // Count successful / failed emails
    // ----------------------------------------------------------

    const failed = results.filter(
      result => result.status === 'rejected'
    ).length

    const successful =
      subscribers.length - failed

    if (failed > 0) {
      console.error(
        `[Newsletter] ${failed} product announcement email(s) failed.`
      )
    }

    console.log(
      `[Newsletter] Product announcement sent to ${successful}/${subscribers.length} subscriber(s).`
    )

  } catch (error) {
    // Newsletter failure should NOT break product creation.
    console.error(
      '[Newsletter] Product announcement error:',
      error
    )
  }
}


// ============================================================
// GET ALL PRODUCTS
// ============================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      tag,
      sort = 'newest'
    } = req.query

    const page = Math.max(
      1,
      Number(req.query.page) || 1
    )

    const limit = Math.min(
      48,
      Math.max(
        1,
        Number(req.query.limit) || 24
      )
    )

    const filter = {
      isActive: true
    }

    // --------------------------------------------------------
    // Category
    // --------------------------------------------------------

    if (category) {
      filter.category = String(category).trim()
    }

    // --------------------------------------------------------
    // Search
    // --------------------------------------------------------

    if (search) {
      filter.$text = {
        $search: String(search).trim()
      }
    }

    // --------------------------------------------------------
    // Price filter
    // --------------------------------------------------------

    const min = Number(minPrice)
    const max = Number(maxPrice)

    if (
      minPrice !== undefined &&
      Number.isFinite(min)
    ) {
      filter.price = {
        ...(filter.price || {}),
        $gte: Math.max(0, min)
      }
    }

    if (
      maxPrice !== undefined &&
      Number.isFinite(max)
    ) {
      filter.price = {
        ...(filter.price || {}),
        $lte: Math.max(0, max)
      }
    }

    // --------------------------------------------------------
    // Stock filter
    // --------------------------------------------------------

    if (inStock === 'true') {
      filter.stock = {
        $gt: 0
      }
    }

    // --------------------------------------------------------
    // Tag filter
    // --------------------------------------------------------

    if (tag) {
      filter.tags = String(tag)
        .trim()
        .toLowerCase()
    }

    // --------------------------------------------------------
    // Sorting
    // --------------------------------------------------------

    const sortMap = {
      newest: {
        createdAt: -1
      },

      price_low: {
        price: 1
      },

      price_high: {
        price: -1
      },

      rating: {
        rating: -1,
        createdAt: -1
      }
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product
        .find(filter)
        .sort(
          sortMap[sort] || sortMap.newest
        )
        .skip(skip)
        .limit(limit),

      Product.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: products,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  })
)


// ============================================================
// GET SINGLE PRODUCT
// Supports slug and MongoDB ID
// ============================================================

router.get(
  '/:identifier',
  asyncHandler(async (req, res) => {
    const identifier =
      String(req.params.identifier).trim()

    let product = await Product.findOne({
      slug: identifier.toLowerCase(),
      isActive: true
    })

    // --------------------------------------------------------
    // Try MongoDB ObjectId
    // --------------------------------------------------------

    if (
      !product &&
      /^[a-fA-F0-9]{24}$/.test(identifier)
    ) {
      product = await Product.findOne({
        _id: identifier,
        isActive: true
      })
    }

    // --------------------------------------------------------
    // Not found
    // --------------------------------------------------------

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    res.json({
      success: true,
      data: product
    })
  })
)


// ============================================================
// CREATE PRODUCT
// ADMIN ONLY
// ============================================================

router.post(
  '/',
  protect,
  adminOnly,
  validate(productSchema),

  asyncHandler(async (req, res) => {
    const productData = {
      ...req.validated.body
    }

    // --------------------------------------------------------
    // MRP = compareAtPrice
    // --------------------------------------------------------

    productData.compareAtPrice =
      productData.mrp

    // --------------------------------------------------------
    // Images
    // --------------------------------------------------------

    if (Array.isArray(productData.images)) {
      productData.images =
        productData.images
          .map(image => String(image).trim())
          .filter(Boolean)
    } else {
      productData.images = []
    }

    // --------------------------------------------------------
    // Create
    // --------------------------------------------------------

    const product =
      await Product.create(productData)

    // --------------------------------------------------------
    // Newsletter announcement
    // --------------------------------------------------------
    // Product is already created successfully.
    // Newsletter failure will NOT undo the product creation.

    await sendNewProductAnnouncement(product)

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    })
  })
)


// ============================================================
// UPDATE PRODUCT
// ADMIN ONLY
// ============================================================

router.patch(
  '/:id',
  protect,
  adminOnly,

  asyncHandler(async (req, res) => {
    // --------------------------------------------------------
    // Basic ObjectId validation
    // --------------------------------------------------------

    if (
      !/^[a-fA-F0-9]{24}$/.test(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      })
    }

    // --------------------------------------------------------
    // Find existing product
    // --------------------------------------------------------

    const product =
      await Product.findById(
        req.params.id
      )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const updateData = {
      ...req.body
    }

    // --------------------------------------------------------
    // Prevent client from modifying protected fields
    // --------------------------------------------------------

    delete updateData._id
    delete updateData.createdAt
    delete updateData.updatedAt

    // --------------------------------------------------------
    // MRP / Selling price
    // --------------------------------------------------------

    if (
      updateData.mrp !== undefined
    ) {
      updateData.mrp =
        Number(updateData.mrp)

      if (
        !Number.isFinite(updateData.mrp) ||
        updateData.mrp < 0
      ) {
        return res.status(422).json({
          success: false,
          message: 'Invalid MRP'
        })
      }

      updateData.compareAtPrice =
        updateData.mrp
    }

    if (
      updateData.price !== undefined
    ) {
      updateData.price =
        Number(updateData.price)

      if (
        !Number.isFinite(updateData.price) ||
        updateData.price < 0
      ) {
        return res.status(422).json({
          success: false,
          message: 'Invalid selling price'
        })
      }
    }

    // --------------------------------------------------------
    // Check price relationship
    // --------------------------------------------------------

    const finalMrp =
      updateData.mrp !== undefined
        ? updateData.mrp
        : product.mrp

    const finalPrice =
      updateData.price !== undefined
        ? updateData.price
        : product.price

    if (finalPrice > finalMrp) {
      return res.status(422).json({
        success: false,
        message:
          'Selling price cannot be higher than MRP'
      })
    }

    // --------------------------------------------------------
    // Stock
    // --------------------------------------------------------

    if (
      updateData.stock !== undefined
    ) {
      updateData.stock =
        Number(updateData.stock)

      if (
        !Number.isInteger(updateData.stock) ||
        updateData.stock < 0
      ) {
        return res.status(422).json({
          success: false,
          message: 'Stock must be a valid whole number'
        })
      }
    }

    // --------------------------------------------------------
    // Images
    // --------------------------------------------------------

    if (
      updateData.images !== undefined
    ) {
      if (
        !Array.isArray(
          updateData.images
        )
      ) {
        return res.status(422).json({
          success: false,
          message: 'Images must be an array'
        })
      }

      updateData.images =
        updateData.images
          .map(image => String(image).trim())
          .filter(Boolean)
    }

    // --------------------------------------------------------
    // Update
    // --------------------------------------------------------

    Object.assign(
      product,
      updateData
    )

    await product.save()

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    })
  })
)


// ============================================================
// DELETE / ARCHIVE PRODUCT
// ADMIN ONLY
// ============================================================

router.delete(
  '/:id',
  protect,
  adminOnly,

  asyncHandler(async (req, res) => {
    if (
      !/^[a-fA-F0-9]{24}$/.test(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      })
    }

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        {
          isActive: false
        },
        {
          new: true
        }
      )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    res.json({
      success: true,
      message: 'Product archived'
    })
  })
)


// ============================================================
// EXPORT
// ============================================================

export default router