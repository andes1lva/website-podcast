const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.base': 'O nome de usuário deve ser uma string',
    'string.min': 'O nome de usuário deve ter pelo menos 3 caracteres',
    'string.max': 'O nome de usuário deve ter no máximo 50 caracteres',
    'any.required': 'O nome de usuário é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'A senha deve ter pelo menos 6 caracteres',
    'any.required': 'A senha é obrigatória'
  }),
  confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'As senhas devem coincidir',
    'any.required': 'A confirmação de senha é obrigatória'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'O email é obrigatório'
  }),
  address: Joi.string().allow(null, '').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'O email é obrigatório'
  }),
  password: Joi.string().required().messages({
    'any.required': 'A senha é obrigatória'
  })
});

module.exports = { registerSchema, loginSchema };