import type { User } from "../types";
import axios from "./axios";

export const getUser = async (): Promise<User> => {
  const res = await axios.get("/user/");
  return res.data;
};

export const updateUser = async (user: Partial<User>): Promise<User> => {
  const res = await axios.put("/user/", user);
  return res.data;
};
