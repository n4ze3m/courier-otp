export type IOtpOptions = {
    length?: number;
    expiry?: number;
}

export interface ICourierOtp {
    redisUrl: string;
    courierApiKey: string;
    courierTemplateId: string;
}

export type IOtpType = "email" | "phone_number"

export type ISendOtpOptions = {
    to: string;
    type: IOtpType;
    otpOptions?: IOtpOptions;
}

export type IVerifyOtpOptions = {
    type: string;
    to: string;
    otp: string
}
