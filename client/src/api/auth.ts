import axios from "./axios";

export const login = async (email: string, password: string) => {
  const res = await axios.post("/auth/login", { email, password });
  localStorage.setItem("token", res.data.token);
  return res.data;
};

export const register = async (
  username: string,
  email: string,
  password: string
) => {
  return axios.post("/auth/register", { username, email, password });
};
