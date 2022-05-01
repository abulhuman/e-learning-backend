import * as Joi from 'joi'

const databaseConfigValidation = {
  DATABASE_URL: Joi.string().required(),
}

export default databaseConfigValidation
