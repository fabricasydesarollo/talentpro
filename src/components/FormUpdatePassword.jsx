import axios from "axios";
import { useState } from "react";
import { URLBASE } from "../lib/actions";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const FormUpdatePassword = () => {
  const [contrasena, setContrasena] = useState("");
  const [contrasenaConfirmada, setContrasenaConfirmada] = useState("");
  const [error, setError] = useState("");

  const user = useUser()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Expresión regular para validar la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (contrasena !== contrasenaConfirmada) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!passwordRegex.test(contrasena)) {
      setError("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, un número y un carácter especial.");
    }
    setError("");

    try {
        await axios.patch(`${URLBASE}/usuarios/${user.user.idUsuario}`, {contrasena, defaultContrasena: false }, {withCredentials: true} )
        toast.success("Contraseña actualizada!", {toastId: "password-ok"})
          navigate('/home')
        user?.setUser((prevUser) => ({
          ...prevUser,
            defaultContrasena: false
          
        }))
        return; 
    } catch {
        setError("Error al actualizar la contraseña")
    }

  };

  return (
    <div className="max-w-md mt-36 m-auto">
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Ingresa la nueva contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
          <input
            id="confirmpassword"
            name="confirmpassword"
            type="password"
            placeholder="Confirma la contraseña"
            value={contrasenaConfirmada}
            onChange={(e) => setContrasenaConfirmada(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>} {/* Mensaje de error */}
        <button
          type="submit"
          className="w-full px-4 py-2 text-xl font-medium text-white bg-zvioleta hover:bg-zvioleta/90 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zvioleta"
        >
          Actualizar
        </button>
      </form>
    </div>
  );
};

export default FormUpdatePassword;
