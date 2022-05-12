import * as Joi from 'joi'

const appConfigValidation = {
  NODE_ENV: Joi.string().valid('development', 'production').optional(),
  PORT: Joi.number().required(),
  FRONTEND_URL: Joi.string().required(),
}

export default appConfigValidation
