import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(1000),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  designer: Joi.string(),
  stock_quantity: Joi.number().integer().min(0).default(0),
  images: Joi.array().items(Joi.string()).default([]),
  tags: Joi.array().items(Joi.string()).default([])
});