import 'dotenv/config'
import mongoose from 'mongoose'

import Order from '../src/models/Order.js'
import { createPrepaidVelocityShipment } from '../src/services/velocityShipmentRetry.js'

async function main() {
  try {
    console.log('========================================')
    console.log('PENDING RAZORPAY VELOCITY SHIPMENTS')
    console.log('========================================')

    // MongoDB connection
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in .env')
    }

    await mongoose.connect(process.env.MONGODB_URI)

    console.log('MongoDB connected ✅')

    // Find old Razorpay-paid orders where
    // Velocity shipment has NOT been created yet.
    const orders = await Order.find({
      paymentProvider: 'razorpay',
      paymentStatus: 'paid',
      status: 'confirmed',
      $and: [
        {
          $or: [
            { velocityShipmentId: { $exists: false } },
            { velocityShipmentId: null },
            { velocityShipmentId: '' }
          ]
        },
        {
          $or: [
            { velocityAwb: { $exists: false } },
            { velocityAwb: null },
            { velocityAwb: '' }
          ]
        }
      ]
    }).sort({ createdAt: 1 })

    console.log(`Found ${orders.length} pending Razorpay orders.`)

    if (orders.length === 0) {
      console.log('No pending Razorpay shipments found.')
      return
    }

    let successCount = 0
    let failedCount = 0

    for (const order of orders) {
      console.log('')
      console.log('----------------------------------------')
      console.log(`Processing Order: ${order._id}`)
      console.log(`Total: ₹${order.total}`)
      console.log(`Payment: ${order.paymentStatus}`)
      console.log('----------------------------------------')

      try {
        const result =
          await createPrepaidVelocityShipment(
            order._id
          )

        if (
          result?.success ||
          result?.created ||
          result?.alreadyCreated
        ) {
          successCount += 1

          console.log(
            `SUCCESS ✅ Velocity shipment processed for ${order._id}`
          )

          console.log({
            velocityOrderId:
              result?.order?.velocityOrderId,

            velocityShipmentId:
              result?.order?.velocityShipmentId,

            velocityAwb:
              result?.order?.velocityAwb
          })
        } else {
          failedCount += 1

          console.log(
            `SKIPPED ⚠️ Order ${order._id}`
          )

          console.log(result)
        }
      } catch (error) {
        failedCount += 1

        console.error(
          `FAILED ❌ Order ${order._id}`
        )

        console.error({
          message: error?.message,
          velocityResponse:
            error?.velocityResponse
        })
      }
    }

    console.log('')
    console.log('========================================')
    console.log('PROCESS COMPLETED')
    console.log('========================================')
    console.log(`Total found : ${orders.length}`)
    console.log(`Successful  : ${successCount}`)
    console.log(`Failed      : ${failedCount}`)
    console.log('========================================')
  } catch (error) {
    console.error('')
    console.error('SCRIPT FAILED ❌')
    console.error(error)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
    console.log('MongoDB connection closed.')
  }
}

main()