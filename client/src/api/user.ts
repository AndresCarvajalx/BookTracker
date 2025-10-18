import type { User } from "../types";
import axios from "./axios";

export const getUser = async (): Promise<User> => {
  const res = await axios.get("/user/");
  return res.data;
};
