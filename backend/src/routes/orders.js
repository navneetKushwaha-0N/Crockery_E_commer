import { Router } from 'express'

import Product from '../models/Product.js'
import User from '../models/User.js'
import Order from '../models/Order.js'

import {
  asyncHandler,
  protect,
  adminOnly
} from '../middleware/index.js'

import { sendEmail } from '../services/integrations.js'

const router = Router()

// ============================================================
// GET ALL ORDERS
//
// Customer:
//   Sirf apne orders
//
// Admin:
//   ?all=true ke saath sabhi orders
// ============================================================

router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const filter =
      req.user.role === 'admin' &&
      req.query.all === 'true'
        ? {}
        : {
            user: req.user.id
          }

    const orders =
      await Order.find(filter)
        .populate(
          'user',
          'name email'
        )
        .sort({
          createdAt: -1
        })

    res.json({
      success: true,
      data: orders
    })
  })
)


// ============================================================
// GET SINGLE ORDER
// ============================================================

router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const order =
      await Order.findOne({
        _id: req.params.id,

        ...(req.user.role === 'admin'
          ? {}
          : {
              user: req.user.id
            })
      }).populate(
        'user',
        'name email'
      )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    res.json({
      success: true,
      data: order
    })
  })
)


// ============================================================
// CREATE ORDER
//
// Customer checkout ke time order create hoga.
//
// IMPORTANT:
// Product price frontend se trust nahi kiya jayega.
// Price MongoDB se li jayegi.
//
// Shipping address:
// 1. Checkout se bheja gaya address use hoga.
// 2. Agar nahi bheja gaya to user's saved address use hoga.
//
// Order mein address ka SNAPSHOT save hoga.
// Baad mein profile address change hone par old order nahi badlega.
// ============================================================

router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    // --------------------------------------------------------
    // Cart items
    // --------------------------------------------------------

    const incoming =
      Array.isArray(req.body.items)
        ? req.body.items
        : []

    if (!incoming.length) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      })
    }


    // --------------------------------------------------------
    // Product IDs
    // --------------------------------------------------------

    const productIds =
      incoming
        .map(item => item.product)
        .filter(Boolean)

    const products =
      await Product.find({
        _id: {
          $in: productIds
        },
        isActive: true
      })


    if (!products.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid products found'
      })
    }


    // --------------------------------------------------------
    // Secure order items
    // --------------------------------------------------------

    const items =
      incoming
        .map(item => {
          const product =
            products.find(
              p =>
                p._id.toString() ===
                String(item.product)
            )

          if (!product) {
            return null
          }

          const quantity = Math.max(
            1,
            Number(item.quantity) || 1
          )


          // --------------------------------------------------
          // Stock check
          // --------------------------------------------------

          if (quantity > product.stock) {
            throw Object.assign(
              new Error(
                `${product.name} does not have enough stock`
              ),
              {
                statusCode: 400
              }
            )
          }


          return {
            product: product._id,

            name: product.name,

            image:
              product.images?.[0] || '',

            // IMPORTANT:
            // Always database price
            price: product.price,

            quantity
          }
        })
        .filter(Boolean)


    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid products found'
      })
    }


    // --------------------------------------------------------
    // Calculate subtotal
    // --------------------------------------------------------

    const subtotal =
      items.reduce(
        (sum, item) =>
          sum +
          item.price *
            item.quantity,
        0
      )


    // --------------------------------------------------------
    // Shipping fee
    //
    // ₹5000+ = Free shipping
    // Below ₹5000 = ₹199
    // --------------------------------------------------------

    const shippingFee =
      subtotal >= 5000
        ? 0
        : 199


    const discount = 0

    const total =
      subtotal -
      discount +
      shippingFee


    // ========================================================
    // SHIPPING ADDRESS
    // ========================================================

    let shippingAddress =
      req.body.shippingAddress || null


    // --------------------------------------------------------
    // If checkout did not send address,
    // fetch user's saved address
    // --------------------------------------------------------

    if (
      !shippingAddress ||
      typeof shippingAddress !== 'object'
    ) {
      const user =
        await User.findById(
          req.user.id
        )

      const savedAddress =
        user?.addresses?.[0]

      if (savedAddress) {
        shippingAddress = {
          name:
            savedAddress.name || '',

          email:
            user.email || '',

          phone:
            savedAddress.phone || '',

          address:
            [
              savedAddress.line1,
              savedAddress.line2
            ]
              .filter(Boolean)
              .join(', '),

          city:
            savedAddress.city || '',

          state:
            savedAddress.state || '',

          pin:
            savedAddress.postalCode || ''
        }
      }
    }


    // --------------------------------------------------------
    // Create immutable shipping snapshot
    // --------------------------------------------------------

    shippingAddress = {
      name: String(
        shippingAddress?.name || ''
      ).trim(),

      email: String(
        shippingAddress?.email ||
        ''
      ).trim().toLowerCase(),

      phone: String(
        shippingAddress?.phone || ''
      ).trim(),

      address: String(
        shippingAddress?.address || ''
      ).trim(),

      city: String(
        shippingAddress?.city || ''
      ).trim(),

      state: String(
        shippingAddress?.state || ''
      ).trim(),

      pin: String(
        shippingAddress?.pin || ''
      ).trim()
    }


    // ========================================================
    // VALIDATE SHIPPING DETAILS
    // ========================================================

    if (
      !shippingAddress.name ||
      !shippingAddress.email ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !/^\d{6}$/.test(
        shippingAddress.pin
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide complete and valid shipping details'
      })
    }


    // ========================================================
    // CREATE ORDER
    //
    // IMPORTANT:
    // Yahan stock decrement nahi kar rahe.
    // Payment route successful payment ke baad
    // stock safely update karega.
    // ========================================================

    const order =
      await Order.create({
        user: req.user.id,

        items,

        shippingAddress,

        subtotal,

        discount,

        shippingFee,

        total,

        status: 'pending',

        paymentStatus: 'pending',

        paymentProvider: 'razorpay'
      })


    res.status(201).json({
      success: true,
      message:
        'Order created successfully',
      data: order
    })
  })
)


// ============================================================
// UPDATE ORDER STATUS
//
// ADMIN ONLY
//
// Status flow:
//
// pending
// confirmed
// processing
// packed
// shipped
// out_for_delivery
// delivered
// cancelled
//
// Also:
// courierName
// trackingNumber
// ============================================================

router.patch(
  '/:id/status',
  protect,
  adminOnly,

  asyncHandler(async (req, res) => {
    const allowedStatuses = [
      'pending',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ]


    const status =
      String(
        req.body.status || ''
      ).trim()


    const courierName =
      String(
        req.body.courierName || ''
      ).trim()


    const trackingNumber =
      String(
        req.body.trackingNumber || ''
      ).trim()


    // --------------------------------------------------------
    // Validate status
    // --------------------------------------------------------

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      })
    }


    // --------------------------------------------------------
    // Find order
    // --------------------------------------------------------

    const order =
      await Order.findById(
        req.params.id
      ).populate(
        'user',
        'name email'
      )


    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }


    const oldStatus =
      order.status


    // --------------------------------------------------------
    // Update status
    // --------------------------------------------------------

    order.status =
      status


    // --------------------------------------------------------
    // Courier
    // --------------------------------------------------------

    if (
      courierName !== ''
    ) {
      order.courierName =
        courierName
    }


    // --------------------------------------------------------
    // Tracking number
    // --------------------------------------------------------

    if (
      trackingNumber !== ''
    ) {
      order.trackingNumber =
        trackingNumber
    }


    await order.save()


    // ========================================================
    // CUSTOMER EMAIL
    // ========================================================

    const customerEmail =
      order.shippingAddress?.email ||
      order.user?.email


    const customerName =
      order.shippingAddress?.name ||
      order.user?.name ||
      'Customer'


    let emailSubject =
      'XAAJ - Order Status Updated'

    let emailTitle =
      'Your order status was updated'

    let emailMessage =
      `Your order status has been changed to ${status}.`


    switch (status) {
      case 'confirmed':
        emailSubject =
          'XAAJ - Order Confirmed'

        emailTitle =
          'Your order is confirmed! 🎉'

        emailMessage =
          'Your payment has been received and your order has been confirmed.'
        break


      case 'processing':
        emailSubject =
          'XAAJ - Order Processing'

        emailTitle =
          'Your order is being processed'

        emailMessage =
          'We have started processing your order.'
        break


      case 'packed':
        emailSubject =
          'XAAJ - Order Packed'

        emailTitle =
          'Your order has been packed 📦'

        emailMessage =
          'Your order has been carefully packed and is ready for dispatch.'
        break


      case 'shipped':
        emailSubject =
          'XAAJ - Order Shipped'

        emailTitle =
          'Your order is on the way 🚚'

        emailMessage =
          'Your order has been shipped and is now on its way to you.'
        break


      case 'out_for_delivery':
        emailSubject =
          'XAAJ - Out for Delivery'

        emailTitle =
          'Your order is out for delivery 🛵'

        emailMessage =
          'Your order is currently out for delivery and should reach you soon.'
        break


      case 'delivered':
        emailSubject =
          'XAAJ - Order Delivered'

        emailTitle =
          'Your order has been delivered 🎉'

        emailMessage =
          'Your XAAJ order has been successfully delivered.'
        break


      case 'cancelled':
        emailSubject =
          'XAAJ - Order Cancelled'

        emailTitle =
          'Your order has been cancelled'

        emailMessage =
          'Your order has been cancelled. If you believe this was a mistake, please contact our support team.'
        break
    }


    // ========================================================
    // COURIER HTML
    // ========================================================

    let courierHtml = ''


    if (
      status === 'shipped' ||
      status === 'out_for_delivery'
    ) {
      courierHtml = `
        <div style="
          margin-top:20px;
          padding:16px;
          background:#f7f7f7;
          border-radius:10px;
        ">
          <p style="margin:0 0 8px;">
            <strong>Courier:</strong>
            ${
              order.courierName ||
              'Not provided'
            }
          </p>

          <p style="margin:0;">
            <strong>Tracking Number:</strong>
            ${
              order.trackingNumber ||
              'Not provided'
            }
          </p>
        </div>
      `
    }


    // ========================================================
    // SEND EMAIL ONLY IF STATUS CHANGED
    // ========================================================

    if (
      customerEmail &&
      oldStatus !== status
    ) {
      await sendEmail({
        to: customerEmail,

        subject: emailSubject,

        html: `
          <div style="
            font-family:Arial,sans-serif;
            line-height:1.6;
            max-width:600px;
            margin:auto;
            padding:20px;
          ">

            <h2>
              ${emailTitle}
            </h2>

            <p>
              Hi <strong>${customerName}</strong>,
            </p>

            <p>
              ${emailMessage}
            </p>

            <div style="
              margin-top:20px;
              padding:16px;
              border:1px solid #e5e5e5;
              border-radius:10px;
            ">

              <p style="margin:0 0 8px;">
                <strong>Order ID:</strong>
                ${order._id}
              </p>

              <p style="margin:0 0 8px;">
                <strong>Order Total:</strong>
                ₹${order.total}
              </p>

              <p style="margin:0;">
                <strong>Status:</strong>
                ${status.replace(
                  /_/g,
                  ' '
                )}
              </p>

            </div>

            ${courierHtml}

            <p style="margin-top:24px;">
              Thank you for shopping with
              <strong>XAAJ</strong>.
            </p>

          </div>
        `
      })
    }


    // ========================================================
    // RESPONSE
    // ========================================================

    res.json({
      success: true,
      message:
        'Order updated successfully',
      data: order
    })
  })
)


// ============================================================
// EXPORT ROUTER
// ============================================================

export default router