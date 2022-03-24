"use strict";

const { body, param, query, validationResult } = require("express-validator");

exports.channelGetValidator = () => {
  return [
    query("limit").optional().isNumeric().withMessage("limit must numeric value").bail().isLength({ max: 9 }).withMessage("Customer id max 9 digit"),
    query("page").optional().isNumeric().withMessage("page must numeric value").bail().isLength({ min: 0, max: 9 }),
  ];
};

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extractedErrors = errors.array().map((err) => {
    return { [err.param]: err.msg };
  });

  return res.status(400).json({ errors: extractedErrors });
};
