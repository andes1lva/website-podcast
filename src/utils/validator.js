const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(8).required(),
  confirm_password: Joi.string().valid(Joi.ref('password')).required(),
  email: Joi.string().email().max(100).required(),
  address: Joi.string().max(255).allow(null, ''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };