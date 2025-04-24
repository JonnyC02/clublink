export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => {
  const token = getToken();
  console.log(token);
  return !!token;
};
