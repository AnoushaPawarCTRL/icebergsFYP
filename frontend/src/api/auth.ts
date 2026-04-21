import axios from "axios";

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post("http://localhost:5000/login", {
    email,
    password,
  });

  return response.data;
};