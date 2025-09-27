export const validateInput = (model, data) => {
  const errors = {};
  for (const key in model) {
    if (["string", "hashed string"].includes(model[key])) {
      if (!data[key] || typeof data[key] !== "string") {
        errors[key] = `${key} is required and must be a string`;
      }
    }
  }

  if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "Email is not valid";
  }

  if (data.password && data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};
