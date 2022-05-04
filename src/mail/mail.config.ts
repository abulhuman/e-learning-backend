import * as Joi from 'joi'

const emailConfigValidation = {
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_IS_SECURE: Joi.boolean().required(),
  MAIL_USER: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_FROM: Joi.string().default('elearning.aastu.edu'),
  EMAIL_VERIFICATION_URL: Joi.string().required(),
}

export default emailConfigValidation
