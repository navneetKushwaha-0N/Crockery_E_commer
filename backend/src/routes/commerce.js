import { Router } from 'express'
import Product from '../models/Product.js'
import { Cart, Wishlist, Review, Coupon, Contact } from '../models/Commerce.js'
import { asyncHandler, protect } from '../middleware/index.js'

const router = Router()
router.get('/cart', protect, asyncHandler(async (req, res) => { const cart = await Cart.findOne({ user: req.user.id }).populate('items.product'); res.json({ success: true, data: cart || { user: req.user.id, items: [] } }) }))
router.put('/cart', protect, asyncHandler(async (req, res) => { const items = Array.isArray(req.body.items) ? req.body.items : []; const ids = items.map(item => item.product); const products = await Product.find({ _id: { $in: ids }, isActive: true }); const valid = items.map(item => { const product = products.find(p => p._id.toString() === item.product); return product ? { product: product._id, quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)) } : null }).filter(Boolean); const cart = await Cart.findOneAndUpdate({ user: req.user.id }, { user: req.user.id, items: valid }, { upsert: true, new: true }).populate('items.product'); res.json({ success: true, data: cart }) }))
router.get('/wishlist', protect, asyncHandler(async (req, res) => { const list = await Wishlist.findOne({ user: req.user.id }).populate('products'); res.json({ success: true, data: list || { user: req.user.id, products: [] } }) }))
router.post('/wishlist/:productId', protect, asyncHandler(async (req, res) => { const list = await Wishlist.findOneAndUpdate({ user: req.user.id }, { $addToSet: { products: req.params.productId } }, { upsert: true, new: true }).populate('products'); res.json({ success: true, data: list }) }))
router.delete('/wishlist/:productId', protect, asyncHandler(async (req, res) => { const list = await Wishlist.findOneAndUpdate({ user: req.user.id }, { $pull: { products: req.params.productId } }, { new: true }).populate('products'); res.json({ success: true, data: list }) }))
router.post('/reviews', protect, asyncHandler(async (req, res) => { const review = await Review.create({ user: req.user.id, product: req.body.product, rating: req.body.rating, comment: req.body.comment }); res.status(201).json({ success: true, data: review }) }))
router.post('/contact', asyncHandler(async (req, res) => { const contact = await Contact.create(req.body); res.status(201).json({ success: true, data: contact }) }))
router.post('/coupons/validate', protect, asyncHandler(async (req, res) => { const coupon = await Coupon.findOne({ code: String(req.body.code).toUpperCase(), isActive: true }); if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date())) return res.status(400).json({ success: false, message: 'Coupon is invalid or expired' }); res.json({ success: true, data: coupon }) }))
export default router
