import { Router } from 'express'
import Product from '../models/Product.js'

import {
  asyncHandler,
  adminOnly,
  protect,
  productSchema,
  validate
} from '../middleware/index.js'

const router = Router()

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