// ============================================================
// XAAJ Backend - Main Server File
// ============================================================

// -------------------------
// 1. External Packages
// -------------------------
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'

// -------------------------
// 2. Configuration
// -------------------------
import {
  env,
  assertProductionConfig
} from './config/env.js'

// -------------------------
// 3. Database
// -------------------------
import {
  connectDatabase,
  disconnectDatabase
} from './config/db.js'

// -------------------------
// 4. Routes
// -------------------------
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import commerceRoutes from './routes/commerce.js'
import orderRoutes from './routes/orders.js'
import cmsRoutes from './routes/cms.js'
import adminRoutes from './routes/admin.js'
import paymentRoutes from './routes/payments.js'
import uploadRoutes from './routes/uploads.js'

// -------------------------
// 5. Middleware
// -------------------------
import {
  notFound,
  errorHandler
} from './middleware/index.js'


// ============================================================
// 6. Validate Environment Configuration
// ============================================================

// Production me server start hone se pehle
// required environment variables check hongi.
assertProductionConfig()


// ============================================================
// 7. Create Express Application
// ============================================================

const app = express()


// ============================================================
// 8. Basic Security
// ============================================================

// Express ka X-Powered-By header disable karta hai.
// Isse server technology unnecessarily expose nahi hoti.
app.disable('x-powered-by')

// Helmet common HTTP security headers add karta hai.
app.use(helmet())


// ============================================================
// 9. CORS Configuration
// ============================================================

// Frontend ko backend API access karne ki permission.
// credentials: true isliye hai kyunki hum cookies/JWT
// authentication use kar rahe hain.
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
)


// ============================================================
// 10. Rate Limiting
// ============================================================

// Ek IP se 15 minutes me maximum 300 requests.
// Brute-force aur unnecessary API abuse ko prevent karta hai.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8'
  })
)


// ============================================================
// 11. Body Parsers
// ============================================================

// JSON request body parse karega.
app.use(
  express.json({
    limit: '1mb'
  })
)

// Form URL encoded data parse karega.
app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb'
  })
)


// ============================================================
// 12. Cookie Parser
// ============================================================

// Request cookies ko read karne ke liye.
// Signed cookies ke liye cookieSecret use hota hai.
app.use(
  cookieParser(env.cookieSecret)
)


// ============================================================
// 13. Request Data Sanitization
// ============================================================

// MongoDB injection jaise attacks se basic protection.
// $ ya . se start/contain hone wale suspicious keys
// request body, params aur query se remove kiye ja rahe hain.
app.use((req, _res, next) => {

  for (const source of [
    req.body,
    req.params,
    req.query
  ]) {

    if (source && typeof source === 'object') {

      for (const key of Object.keys(source)) {

        if (
          key.startsWith('$') ||
          key.includes('.')
        ) {
          delete source[key]
        }

      }
    }
  }

  next()
})


// ============================================================
// 14. HTTP Request Logger
// ============================================================

// Development me simple logs.
// Production me detailed combined logs.
app.use(
  morgan(
    env.nodeEnv === 'production'
      ? 'combined'
      : 'dev'
  )
)


// ============================================================
// 15. Health Check
// ============================================================

// Server correctly running hai ya nahi check karne ke liye.
//
// Browser/Postman:
// GET http://localhost:PORT/api/health
//
// Expected response:
// {
//   "success": true,
//   "service": "xaaj-api"
// }
app.get(
  '/api/health',
  (_req, res) => {

    res.json({
      success: true,
      service: 'xaaj-api',
      timestamp: new Date().toISOString()
    })

  }
)


// ============================================================
// 16. API Routes
// ============================================================

// -------------------------
// Authentication
// -------------------------
// Login
// Register
// Logout
// Current user etc.
app.use(
  '/api/auth',
  authRoutes
)


// -------------------------
// Products
// -------------------------
app.use(
  '/api/products',
  productRoutes
)


// -------------------------
// Commerce
// -------------------------
app.use(
  '/api/commerce',
  commerceRoutes
)


// -------------------------
// Orders
// -------------------------
app.use(
  '/api/orders',
  orderRoutes
)


// -------------------------
// CMS
// -------------------------
app.use(
  '/api/cms',
  cmsRoutes
)


// -------------------------
// Admin
// -------------------------
// Admin dashboard aur admin-only
// operations yahan handle hongi.
app.use(
  '/api/admin',
  adminRoutes
)


// -------------------------
// Payments
// -------------------------
app.use(
  '/api/payment',
  paymentRoutes
)


// -------------------------
// File Uploads
// -------------------------
app.use(
  '/api/uploads',
  uploadRoutes
)


// ============================================================
// 17. 404 Handler
// ============================================================

// Agar koi API route exist nahi karta,
// to notFound middleware response dega.
app.use(notFound)


// ============================================================
// 18. Global Error Handler
// ============================================================

// Backend ke unexpected errors ko
// centralized way me handle karega.
app.use(errorHandler)


// ============================================================
// 19. Start Server
// ============================================================

const server = app.listen(
  env.port,
  async () => {

    // Server start hone ke baad database connect.
    await connectDatabase()

    console.log(
      `[XAAJ] API listening on port ${env.port}`
    )
  }
)


// ============================================================
// 20. Graceful Shutdown
// ============================================================

// Server ko safely shutdown karne ke liye.
// SIGTERM/SIGINT par:
// 1. New requests stop
// 2. Database disconnect
// 3. Process exit
async function shutdown(signal) {

  console.log(
    `[XAAJ] ${signal} received`
  )

  server.close(
    async () => {

      await disconnectDatabase()

      process.exit(0)
    }
  )
}


// ============================================================
// 21. Process Signals
// ============================================================

process.on(
  'SIGTERM',
  () => shutdown('SIGTERM')
)

process.on(
  'SIGINT',
  () => shutdown('SIGINT')
)


// ============================================================
// 22. Export App
// ============================================================

// Testing ya external usage ke liye app export.
export default app