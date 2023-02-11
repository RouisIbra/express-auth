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

const resetCodeSchema = yup.string().required();

const registerBodySchema = yup
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .required();

const loginBodySchema = yup
  .object({
    username: usernameSchema,
    password: passwordSchema,
  })
  .required();

const resetPasswordRequestBodySchema = yup
  .object({
    email: emailSchema,
  })
  .required();

const resetPasswordBodySchema = yup
  .object({
    resetcode: resetCodeSchema,
    password: passwordSchema,
  })
  .required();

const validateRegisterBody = (body) => {
  return registerBodySchema.validateSync(body);
};

const validateLoginBody = (body) => {
  return loginBodySchema.validate(body);
};

const validateResetPasswordRequestBody = (body) => {
  return resetPasswordRequestBodySchema.validate(body);
};

const validateResetPasswordBody = (body) => {
  return resetPasswordBodySchema.validateSync(body);
};

module.exports = {
  validateRegisterBody,
  validateLoginBody,
  validateResetPasswordRequestBody,
  validateResetPasswordBody,
};
