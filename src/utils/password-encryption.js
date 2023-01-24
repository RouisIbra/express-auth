const bcrypt = require("bcrypt");

// set salt rounds
const saltRounds = 10;

const encryptPassword = (password) => {
  const hash = bcrypt.hashSync(password, saltRounds);
  return hash;
};

const verifyPassword = (password, hash) => {
  const result = bcrypt.compareSync(password, hash);
  return result;
};

module.exports = { encryptPassword, verifyPassword };
