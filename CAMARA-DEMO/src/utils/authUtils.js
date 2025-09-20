export const getAcrFromToken = (token) => {
  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    return tokenPayload.acr || "Not specified";
  } catch (e) {
    return "Could not decode";
  }
};
