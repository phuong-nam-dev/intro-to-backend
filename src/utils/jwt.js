import jwt from "jsonwebtoken";

const getAccessSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  return secret;
};

export const signAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    getAccessSecret(),
    { expiresIn: "15m" }
  );
};

export const signRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    getRefreshSecret(),
    { expiresIn: "7d" }
  );
};
