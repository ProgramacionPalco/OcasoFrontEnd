import { createContext, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const login = async (userName, password) => {

    const res = await api.post("/auth/login", {
      userName: userName,   //Ajuste a lo que espera el backend
      password: password
    });

    const { token, roles } = res.data;

    localStorage.setItem("token", token);

    setUser({
      userName,
      roles
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}