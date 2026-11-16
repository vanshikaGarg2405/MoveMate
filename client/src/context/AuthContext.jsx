
import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import api from "../services/api";

import {
  connectSocket,
  disconnectSocket,
} from "../services/socketService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () => sessionStorage.getItem("token")
  );

  const [authLoading, setAuthLoading] = useState(true);

  // ==========================================
  // 1. LOGIN
  // ==========================================

  const login = async (credentials) => {
    const response = await api.post(
      "/auth/login",
      credentials
    );

    const { token: newToken, user: loggedInUser } =
      response.data;

    sessionStorage.setItem("token", newToken);

    setToken(newToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  // ==========================================
  // 2. REGISTER
  // ==========================================

  const register = async (userData) => {
    const response = await api.post(
      "/auth/register",
      userData
    );

    return response.data;
  };

  // ==========================================
  // 3. LOGOUT
  // ==========================================

  const logout = () => {
    disconnectSocket();

    sessionStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  // ==========================================
  // 4. RESTORE SESSION
  // ==========================================

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = sessionStorage.getItem("token");

      if (!savedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await api.get("/users/me");

        setUser(response.data.user);
      } catch (error) {
        disconnectSocket();

        sessionStorage.removeItem("token");

        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ==========================================
  // 5. SOCKET.IO CONNECTION
  // ==========================================

  useEffect(() => {
    if (authLoading || !token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    return () => {
      disconnectSocket();
    };
  }, [token, authLoading]);

  // ==========================================
  // 6. AUTH CONTEXT
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        authLoading,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
