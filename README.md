# Courier OTP

Custom OTP package for sending OTP via SMS and Email and verifying OTP. This package is built on top of [Courier](https://courier.com) and [Redis](https://redis.io/).

## Installation

Using npm:

```bash
$ npm install --save courier-otp
```

Using yarn:

```bash
$ yarn add courier-otp
```

## Usage

To use this package, you need to have a [Courier](https://courier.com) account and a [Redis](https://redis.io) server.

_IMPORTANT_: In your Courier account, you need to create a new template with the following
`{otp}` variable. This variable will be replaced with the OTP code. Otherwise, users won't receive the OTP code.

```js
const { CourierOtp } = require('courier-otp')

const main = async () => {
  const courierOtp = new CourierOtp({
    redisUrl: '<redis-url>',
    courierApiKey: '<courier-api-key>',
    courierTemplateId: '<courier-template-id>',
  })
  // send otp
  const result = await courierOtp.sendOtp({
    to: 'you@example.com',
    type: 'email',
  })
  console.log(result)
  // verify otp
  const verifyResult = await courierOtp.verifyOtp({
    to: 'you@example.com',
    type: 'email',
    otp: '123456',
  })
  console.log(verifyResult)
}

main()
```

## API

### `new CourierOtp(options)`

Creates a new instance of `CourierOtp`.

#### Arguments

- `options` - An object containing the following fields:
  - `redisUrl` - The url of the redis server.
  - `courierApiKey` - The api key of the courier account.
  - `courierTemplateId` - The template id of the courier account.

### `sendOtp(options)`

Sends an OTP to the given email or phone number.

#### Arguments

- `options` - An object containing the following fields:
  - `to` - The email or phone number to send the OTP to.
  - `type` - The type of the `to` field. It can be either `email` or `phone_number`.
  - `otpOptions` - An object containing the following fields:
    - `length` - The length of the OTP. Default is `6`.
    - `expiry` - The expiry of the OTP in seconds. Default is `300` (5 minutes).
  - `courierVariables` - An object containing the variables to be replaced in the courier template. Note that the `otp` variable is reserved for the OTP code.

#### Returns

An object containing the following fields:

- `requestId` - The request id from the courier api.
- `otp` - The generated OTP.

or null if the OTP is not sent.

### `verifyOtp(options)`

Verifies the given OTP.

#### Arguments

- `options` - An object containing the following fields:
  - `to` - The email or phone number to send the OTP to.
  - `type` - The type of the `to` field. It can be either `email` or `phone_number`.
  - `otp` - The OTP to verify.

### Returns

An object containing the following fields:

- `verify` - A boolean indicating whether the OTP is valid or not.
- `error` - An error message if the OTP is invalid.
- `type` - Resend type. It can be `SUCCESS` , `INVALID_OTP` or `ERROR`.

## License

MIT

## Contributing

Contributions are welcome! Just open an issue or a pull request.
