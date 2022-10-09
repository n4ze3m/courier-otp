import Redis from 'ioredis';
import { CourierClient } from "@trycourier/courier";
import type { ICourierClient } from "@trycourier/courier";
import type { ICourierOtp, ISendOtpOptions, IVerifyOtpOptions } from './types';

class OTP {
    public courierApiKey: string;
    public courierTemplateId: string;

    private redis: Redis
    private courierClient: ICourierClient
    private _otpLength: number = 6;
    private _otpExpiry: number = 300;

    constructor({ redisUrl, courierApiKey, courierTemplateId }: ICourierOtp) {
        this.courierApiKey = courierApiKey;
        this.courierTemplateId = courierTemplateId;

        this.redis = new Redis(redisUrl);
        this.courierClient = CourierClient({ authorizationToken: this.courierApiKey });
    }

    private generateOtp(n: number) {
        let otp = '';
        for (let i = 0; i < n; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    }



    public async sendOtp(options: ISendOtpOptions) {
        try {
            const otp = this.generateOtp(options?.otpOptions?.length || this._otpLength);
            const key = `${options.type}:${options.to}`;
            const otpExists = await this.redis.get(key);
            if (otpExists) {
                await this.redis.del(key);
            }
            await this.redis.set(key, otp, 'EX', options?.otpOptions?.expiry || this._otpExpiry);
            const to = {
                [options.type]: options.to
            }
            const { requestId } = await this.courierClient.send({
                message: {
                    template: this.courierTemplateId,
                    data: {
                        otp
                    },
                    to
                }
            });
            return {
                requestId,
                otp
            }
        } catch (err) {
            console.log(err);
            return null
        }
    }


    public async verifyOtp(options: IVerifyOtpOptions) {
        try {
            const key = `${options.type}:${options.to}`;
            const otp = await this.redis.get(key);
            if (otp === options.otp) {
                await this.redis.del(key);
                return {
                    verify: true,
                    error: null,
                    type: "SUCCESS"
                }
            }
            return {
                verify: false,
                error: "Invalid OTP",
                type: "INVALID_OTP"
            }

        } catch (err) {
            console.log(err);
            return {
                verify: false,
                error: err,
                type: "ERROR"
            }
        }
    }


    public redisClose() {
        this.redis.disconnect();
    }
}

export { OTP }