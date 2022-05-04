import * as Joi from 'joi'

const appConfigValidation = {
  NODE_ENV: Joi.string().valid('development', 'production').optional(),
  PORT: Joi.number().required(),
}

export default appConfigValidation
