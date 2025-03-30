export const login = async (email: string, password: string) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const { token } = await response.json();
  return token;
};
