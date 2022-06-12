import * as Joi from 'joi'

const authConfigValidation = {
  SESSION_SECRET: Joi.string().required(),
  COOKIE_MAX_AGE: Joi.number().default(4.32e7),
  JWT_SECRET: Joi.string().required(),
}

export default authConfigValidation
