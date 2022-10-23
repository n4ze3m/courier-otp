export type IOtpOptions = {
  length?: number
  expiry?: number
}

export interface ICourierOtp {
  redisUrl: string
  courierApiKey: string
  courierTemplateId: string
}

export type IOtpType = 'email' | 'phone_number'

export type ISendOtpOptions = {
  to: string
  type: IOtpType
  otpOptions?: IOtpOptions
  courierVariables?: ICourierVariables | {}
}

export type IVerifyOtpOptions = {
  type: string
  to: string
  otp: string
}

export type ICourierVariables = {
  [key: string]: string | number | boolean 
}
