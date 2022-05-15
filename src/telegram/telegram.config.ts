import * as Joi from 'joi'

export const telegramConfigValidation = {
  BOT_KEY: Joi.string().required(),
  TELEGRAM_API_URL: Joi.string().default('https://api.telegram.org/bot'),
  HEROKU_URL: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  TELEGRAM_AUTH_URL: Joi.string().required(),
  ENABLE_POLLING: Joi.boolean().default(false),
}
