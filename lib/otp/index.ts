import Redis from 'ioredis'
import { CourierClient } from '@trycourier/courier'
import type { ICourierClient } from '@trycourier/courier'
import type { ICourierOtp, ISendOtpOptions, IVerifyOtpOptions } from './types'
/**
 * @class CourierOtp
 * @description A class to send and verify OTPs using Courier
 * @param {ICourierOtp} options
 * @param {string} options.redisUrl Redis URL
 * @param {string} options.courierApiKey Courier API Key
 * @param {string} options.courierTemplateId Courier Template ID
 * @example
 * import CourierOtp from 'courier-otp'
 *
 * const courierOtp = new CourierOtp({
 *  redisUrl: 'redis://localhost:6379',
 * courierApiKey: 'YOUR_COURIER_API_KEY',
 * courierTemplateId: 'YOUR_COURIER_TEMPLATE_ID',
 * })
 *
 * const result = await courierOtp.sendOtp({
 * to: 'someone@example.com',
 * type: 'email',
 * })
 *
 * if (result) {
 * const verifyResult = await courierOtp.verifyOtp({
 * to: 'someone@example.com',
 * type: 'email',
 * otp: result.otp,
 * })
 *
 * if (verifyResult.verify) {
 * console.log('OTP verified')
 * }
 * }
 *
 */
class OTP {
  /**
   * @property {string} courierApiKey
   * @description Courier API Key
   */
  public courierApiKey: string
  /**
   * @property {string} courierTemplateId
   * @description Courier Template ID
   */
  public courierTemplateId: string
  /**
   * @property {Redis} redis
   * @description Redis client
   */
  private redis: Redis
  /**
   * @property {ICourierClient} courierClient
   * @description Courier Client
   */
  private courierClient: ICourierClient
  /**
   * @property {number} _otpLength
   * @description Default OTP length
   */
  private _otpLength: number = 6
  /**
   * @property {number} _otpExpiry
   * @description Default OTP expiry
   */
  private _otpExpiry: number = 300
  /**
   * @constructor
   * @param {ICourierOtp} options
   * @param {string} options.redisUrl Redis URL
   * @param {string} options.courierApiKey Courier API Key
   * @param {string} options.courierTemplateId Courier Template ID
   */
  constructor({ redisUrl, courierApiKey, courierTemplateId }: ICourierOtp) {
    this.courierApiKey = courierApiKey
    this.courierTemplateId = courierTemplateId

    this.redis = new Redis(redisUrl)
    this.courierClient = CourierClient({ authorizationToken: this.courierApiKey })
  }
  /**
   * @method _generateOtp
   * @description Generate OTP
   * @param {number} n
   * @returns {string} OTP
   * @private
   */
  private _generateOtp(n: number): string {
    return Math.floor(Math.random() * 10 ** n).toString()
  }
  /**
   * @method sendOtp
   * @description Send OTP
   * @param {ISendOtpOptions} options
   * @param {string} options.to Recipient
   * @param {string} options.type Type of recipient
   * @param {IOtpOptions} options.otpOptions OTP options
   * @param {number} options.otpOptions.length OTP length
   * @param {number} options.otpOptions.expiry OTP expiry
   * @param {ICourierVariables} options.courierVariables Courier variables
   * @returns {Promise<{ requestId: string; otp: string } | null>} OTP
   */
  public async sendOtp(
    options: ISendOtpOptions
  ): Promise<{ requestId: string; otp: string } | null> {
    try {
      const otp = this._generateOtp(options?.otpOptions?.length || this._otpLength)
      const key = `${options.type}:${options.to}`
      const otpExists = await this.redis.get(key)
      if (otpExists) {
        await this.redis.del(key)
      }
      await this.redis.set(key, otp, 'EX', options?.otpOptions?.expiry || this._otpExpiry)
      const to = {
        [options.type]: options.to,
      }
      const { requestId } = await this.courierClient.send({
        message: {
          template: this.courierTemplateId,
          data: {
            ...options.courierVariables,
            otp: otp,
          },
          to: to,
        },
      })
      return {
        requestId: requestId,
        otp: otp,
      }
    } catch (err) {
      console.log(err)
      return null
    }
  }
  /**
   * @method verifyOtp
   * @description Verify OTP
   * @param {IVerifyOtpOptions} options
   * @param {string} options.to Recipient
   * @param {string} options.type Type of recipient
   * @param {string} options.otp OTP
   *
   * @returns {Promise<{ verify: boolean, error: any | null, type: string}>} Verification result
   */
  public async verifyOtp(
    options: IVerifyOtpOptions
  ): Promise<{ verify: boolean; error: string | null; type: string }> {
    try {
      const key = `${options.type}:${options.to}`
      const otp = await this.redis.get(key)
      if (otp === options.otp) {
        await this.redis.del(key)
        return {
          verify: true,
          error: null,
          type: 'SUCCESS',
        }
      }
      return {
        verify: false,
        error: 'Invalid OTP',
        type: 'INVALID_OTP',
      }
    } catch (err) {
      console.log(err)
      return {
        verify: false,
        error: 'Internal Server Error',
        type: 'ERROR',
      }
    }
  }
  /**
   * @method redisClose
   * @description Close Redis connection
   * @returns {void}
   */
  public redisClose(): void {
    this.redis.disconnect()
  }
}

export { OTP }
