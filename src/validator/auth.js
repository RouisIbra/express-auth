const yup = require("yup/lib");

const usernameSchema = yup
  .string()
  .min(4, "Username length must be between 4 and 25 characters")
  .max(25, "Username length must be between 4 and 25 characters")
  .required("Username is required");

const emailSchema = yup
  .string()
  .email("Invalid email format")
  .max(254)
  .required("Email is required");

const passwordSchema = yup
  .string()
  .min(6, "Password length must be between 6 and 40 characters")
  .max(40, "Password length must be between 6 and 40 characters")
  .required("Password is required");

const registerBodySchema = yup.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const loginBodySchema = yup.object({
  username: usernameSchema,
  password: passwordSchema,
});

const validateRegisterBody = (body) => {
  return registerBodySchema.validateSync(body);
};

/**
 * Warning: This is async!
 */
const validateLoginBody = (body) => {
  return loginBodySchema.validate(body);
};

module.exports = { validateRegisterBody, validateLoginBody };
