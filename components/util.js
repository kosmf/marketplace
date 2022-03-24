"use strict";
const crypto = require("crypto");
const { saltPassword } = require("@Components/enum");

exports.generateSaltPassword = (plainPassword) => {
  const passwordString = `${saltPassword.left}_${String(plainPassword)}_${saltPassword.right}`;
  const hashedPassword = crypto.createHash("md5").update(passwordString).digest("hex");
  return hashedPassword;
};

exports.falsyBouncerObject = (obj = {}) => {
  let newObj = {};
  for (const key in obj) Boolean(obj[key]) ? (newObj[key] = obj[key]) : null;
  return newObj;
};
