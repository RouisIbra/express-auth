const hash = require("pbkdf2-password")();

const encryptPassword = (password) => {
  return new Promise((resolve, reject) => {
    hash({ password }, (err, pass, salt, hash) => {
      if (err) reject(err);

      resolve({ hash, salt });
    });
  });
};

const verifyPassword = (password, hash, salt) => {
  return new Promise((resolve, reject) => {
    hash({ password, salt }, (err, pass, hash2, salt) => {
      if (err) reject(err);

      if (hash === hash2) {
        resolve(true);
      }

      resolve(false);
    });
  });
};

module.exports = { encryptPassword, verifyPassword };
