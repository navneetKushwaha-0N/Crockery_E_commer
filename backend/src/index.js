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

assertProductionConfig()


// ============================================================
// 7. Create Express Application
// ============================================================

const app = express()


// ============================================================
// 8. Basic Security
// ============================================================

app.disable('x-powered-by')

app.use(helmet())


// ============================================================
// 9. CORS Configuration
// ============================================================

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
)


// ============================================================
// 10. Rate Limiting
// ============================================================

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

app.use(
  express.json({
    limit: '1mb'
  })
)

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb'
  })
)


// ============================================================
// 12. Cookie Parser
// ============================================================

app.use(
  cookieParser(env.cookieSecret)
)


// ============================================================
// 13. Request Data Sanitization
// ============================================================

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

app.use(
  '/api/auth',
  authRoutes
)

app.use(
  '/api/products',
  productRoutes
)

app.use(
  '/api/commerce',
  commerceRoutes
)

app.use(
  '/api/orders',
  orderRoutes
)

app.use(
  '/api/cms',
  cmsRoutes
)

app.use(
  '/api/admin',
  adminRoutes
)

app.use(
  '/api/payment',
  paymentRoutes
)

app.use(
  '/api/uploads',
  uploadRoutes
)


// ============================================================
// 17. 404 Handler
// ============================================================

app.use(notFound)


// ============================================================
// 18. Global Error Handler
// ============================================================

app.use(errorHandler)


// ============================================================
// 19. Connect Database & Start Server
// ============================================================

// Database ko turant connect karo. Vercel jaise serverless
// environment mein app.listen() ka callback kabhi trigger
// nahi hota, isliye connection yahan top-level pe karna
// zaroori hai — warna production mein DB kabhi connect
// hi nahi hoga.
await connectDatabase()

let server

if (env.nodeEnv !== 'production') {
  server = app.listen(
    env.port,
    () => {
      console.log(
        `[XAAJ] API listening on port ${env.port}`
      )
    }
  )
}


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

  if (server) {
    server.close(
      async () => {
        await disconnectDatabase()
        process.exit(0)
      }
    )
  } else {
    await disconnectDatabase()
    process.exit(0)
  }
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

export default app