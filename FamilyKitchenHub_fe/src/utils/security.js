export const isValidJWT = (token) => {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3;
};
