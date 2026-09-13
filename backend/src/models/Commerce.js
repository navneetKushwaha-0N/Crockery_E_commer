import mongoose from 'mongoose'

export const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: { type: Number, min: 1 } }]
}, { timestamps: true })
export const wishlistSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true }, products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] }, { timestamps: true })
export const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, rating: { type: Number, min: 1, max: 5, required: true }, comment: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: true })
reviewSchema.index({ product: 1, user: 1 }, { unique: true })
export const couponSchema = new mongoose.Schema({ code: { type: String, required: true, unique: true, uppercase: true }, type: { type: String, enum: ['percent', 'fixed'], required: true }, value: { type: Number, min: 0, required: true }, minOrderValue: { type: Number, default: 0 }, expiresAt: Date, usageLimit: Number, usedCount: { type: Number, default: 0 }, isActive: { type: Boolean, default: true } }, { timestamps: true })
export const contactSchema = new mongoose.Schema({ name: String, email: String, subject: String, message: String, status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new', index: true } }, { timestamps: true })
export const Cart = mongoose.model('Cart', cartSchema)
export const Wishlist = mongoose.model('Wishlist', wishlistSchema)
export const Review = mongoose.model('Review', reviewSchema)
export const Coupon = mongoose.model('Coupon', couponSchema)
export const Contact = mongoose.model('Contact', contactSchema)
