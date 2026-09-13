import { Router } from 'express'

import Content from '../models/CMS.js'
import Product from '../models/Product.js'

import {
  asyncHandler,
  adminOnly,
  protect
} from '../middleware/index.js'

const router = Router()

// ==========================================================
// ACTIVE CONTENT FILTER
// ==========================================================

const activeFilter = {
  isActive: true,
  $and: [
    {
      $or: [
        { startsAt: null },
        { startsAt: { $lte: new Date() } }
      ]
    },
    {
      $or: [
        { endsAt: null },
        { endsAt: { $gte: new Date() } }
      ]
    }
  ]
}

// ==========================================================
// ANNOUNCEMENT - PUBLIC GET
// Frontend Header announcement ke liye
// GET /api/cms/announcement
// ==========================================================

router.get(
  '/announcement',
  asyncHandler(async (_req, res) => {
    const announcement = await Content.findOne({
      type: 'announcement'
    }).sort({
      updatedAt: -1
    })

    // Agar database me announcement nahi hai
    if (!announcement) {
      return res.json({
        success: true,
        data: {
          text: '',
          enabled: false
        }
      })
    }

    res.json({
      success: true,
      data: {
        id: announcement._id,

        // text ya message me jo available ho
        text:
          announcement.text ||
          announcement.message ||
          '',

        // enabled field available ho to use karo,
        // warna isActive use karo
        enabled: Boolean(
          announcement.enabled !== undefined
            ? announcement.enabled
            : announcement.isActive
        )
      }
    })
  })
)

// ==========================================================
// ANNOUNCEMENT - ADMIN UPDATE
// Admin panel se announcement save/update
// PUT /api/cms/announcement
// ==========================================================

router.put(
  '/announcement',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const text = String(
      req.body?.text ||
      req.body?.message ||
      ''
    ).trim()

    const enabled = req.body?.enabled !== false

    // Message required
    if (!text) {
      return res.status(422).json({
        success: false,
        message: 'Announcement message is required.'
      })
    }

    // Maximum 200 characters
    if (text.length > 200) {
      return res.status(422).json({
        success: false,
        message: 'Announcement message cannot exceed 200 characters.'
      })
    }

    const announcement = await Content.findOneAndUpdate(
      {
        type: 'announcement'
      },
      {
        $set: {
          type: 'announcement',
          text,
          enabled,
          isActive: enabled,
          order: 0,

          // Announcement ko permanently active rakhne ke liye
          startsAt: null,
          endsAt: null
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    )

    res.json({
      success: true,
      message: 'Announcement updated successfully.',
      data: {
        id: announcement._id,
        text: announcement.text || text,
        enabled: Boolean(
          announcement.enabled !== undefined
            ? announcement.enabled
            : announcement.isActive
        )
      }
    })
  })
)

// ==========================================================
// HOME CMS DATA
// GET /api/cms/home
// ==========================================================

router.get(
  '/home',
  asyncHandler(async (_req, res) => {
    const [
      content,
      categories,
      featured,
      bestsellers,
      newArrivals
    ] = await Promise.all([
      Content.find(activeFilter).sort({
        order: 1
      }),

      Product.distinct(
        'category',
        {
          isActive: true
        }
      ),

      Product.find({
        isActive: true,
        tags: 'featured'
      })
        .sort({
          createdAt: -1
        })
        .limit(8),

      Product.find({
        isActive: true,
        tags: 'bestseller'
      })
        .sort({
          createdAt: -1
        })
        .limit(8),

      Product.find({
        isActive: true,
        tags: 'new'
      })
        .sort({
          createdAt: -1
        })
        .limit(8)
    ])

    res.json({
      success: true,
      data: {
        content,
        categories,
        featured,
        bestsellers,
        newArrivals
      }
    })
  })
)

// ==========================================================
// ADMIN - GET ALL CMS CONTENT
// GET /api/cms
// ==========================================================

router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const filter = req.query.type
      ? {
          type: req.query.type
        }
      : {}

    const content = await Content.find(filter).sort({
      order: 1
    })

    res.json({
      success: true,
      data: content
    })
  })
)

// ==========================================================
// ADMIN - CREATE CMS CONTENT
// POST /api/cms
// ==========================================================

router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const content = await Content.create(
      req.body
    )

    res.status(201).json({
      success: true,
      data: content
    })
  })
)

// ==========================================================
// ADMIN - UPDATE CMS CONTENT
// PATCH /api/cms/:id
// ==========================================================

router.patch(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const content =
      await Content.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      )

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'CMS content not found.'
      })
    }

    res.json({
      success: true,
      data: content
    })
  })
)

// ==========================================================
// ADMIN - DELETE CMS CONTENT
// DELETE /api/cms/:id
// ==========================================================

router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const content =
      await Content.findByIdAndDelete(
        req.params.id
      )

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'CMS content not found.'
      })
    }

    res.json({
      success: true,
      message: 'CMS content deleted successfully.'
    })
  })
)

// ==========================================================
// EXPORT ROUTER
// ==========================================================

export default router