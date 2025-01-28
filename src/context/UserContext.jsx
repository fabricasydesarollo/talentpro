import { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  // Inicializar el estado del usuario desde el localStorage, manejando posibles errores
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      return null;
    }
  });

  // Inicializar el estado de los colaboradores desde el localStorage
  const [colaboradores, setColaboradores] = useState(() => {
    try {
      const savedColaboradores = localStorage.getItem("colaboradores");
      return savedColaboradores ? JSON.parse(savedColaboradores) : null;
    } catch (error) {
      console.error("Error parsing colaboradores from localStorage", error);
      return null;
    }
  });

  // Sincronizar el estado con localStorage cada vez que user o colaboradores cambian
  useEffect(() => {
    // Si el usuario cambia, actualizar o eliminar del localStorage
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    // Si los colaboradores cambian, actualizar o eliminar del localStorage
    if (colaboradores) {
      localStorage.setItem("colaboradores", JSON.stringify(colaboradores));
    } else {
      localStorage.removeItem("colaboradores");
    }
  }, [user, colaboradores]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        colaboradores,
        setColaboradores,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
