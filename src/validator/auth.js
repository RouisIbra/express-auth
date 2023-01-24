const yup = require("yup/lib");

const registerBodySchema = yup.object({
  username: yup
    .string()
    .min(4, "Username length must be between 4 and 25 characters")
    .max(25, "Username length must be between 4 and 25 characters")
    .required("Username is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .max(254)
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password length must be between 6 and 40 characters")
    .max(40, "Password length must be between 6 and 40 characters")
    .required("Password is required"),
});

const validateRegisterBody = (body) => {
  return registerBodySchema.validateSync(body);
};

module.exports = { validateRegisterBody };
