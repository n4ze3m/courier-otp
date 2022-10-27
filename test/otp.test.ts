import 'dotenv/config'
import CourierOtp from '../lib/index'

describe('OTP testing', () => {
  test('Send OTP', async () => {
    const courierOtp = new CourierOtp({
      redisUrl: process.env.REDIS_URL!,
      courierApiKey: process.env.COURIER_API_KEY!,
      courierTemplateId: process.env!.COURIER_TEMPLATE_ID!,
    })
    const result = await courierOtp.sendOtp({
      to: 'nazeemnob20@gmail.com',
      type: 'email',
    })
    expect(Boolean(result)).toBeTruthy()
    courierOtp.redisClose()
  })

  test('Verify Failed OTP', async () => {
    const courierOtp = new CourierOtp({
      redisUrl: process.env.REDIS_URL!,
      courierApiKey: process.env.COURIER_API_KEY!,
      courierTemplateId: process.env!.COURIER_TEMPLATE_ID!,
    })

    const result = await courierOtp.verifyOtp({
      to: 'nazeemnob20@gmail.com',
      type: 'email',
      otp: '547689',
    })

    expect(Boolean(result)).toBeTruthy()
    courierOtp.redisClose()
  })

  test('Verify OTP', async () => {
    const courierOtp = new CourierOtp({
      redisUrl: process.env.REDIS_URL!,
      courierApiKey: process.env.COURIER_API_KEY!,
      courierTemplateId: process.env!.COURIER_TEMPLATE_ID!,
    })
    const result = await courierOtp.sendOtp({
      to: 'nazeemnob20@gmail.com',
      type: 'email',
    })

    if (result) {
      const verifyResult = await courierOtp.verifyOtp({
        to: 'nazeemnob20@gmail.com',
        type: 'email',
        otp: result.otp!,
      })

      expect(verifyResult.verify).toBe(true)
    } else {
      throw new Error('OTP not sent')
    }
    courierOtp.redisClose()
  })
})
