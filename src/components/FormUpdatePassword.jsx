import axios from "axios";
import { useState } from "react";
import { URLBASE } from "../lib/actions";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaCheckCircle } from "react-icons/fa";

const FormUpdatePassword = () => {
  const [contrasena, setContrasena] = useState("");
  const [contrasenaConfirmada, setContrasenaConfirmada] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user = useUser();
  const navigate = useNavigate();

  // Validación simple de longitud
  const isPasswordValid = contrasena.length >= 8;
  const passwordsMatch = contrasena === contrasenaConfirmada && contrasena.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!passwordsMatch) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await axios.patch(
        `${URLBASE}/usuarios/${user.user.idUsuario}`, 
        { contrasena, defaultContrasena: false }, 
        { withCredentials: true }
      );
      
      toast.success("Contraseña actualizada correctamente", { 
        toastId: "password-ok",
        description: "Tu contraseña ha sido cambiada exitosamente"
      });
      
      user?.setUser((prevUser) => ({
        ...prevUser,
        defaultContrasena: false
      }));
      
      navigate('/home');
    } catch (error) {
      console.error(error);
      setError("Error al actualizar la contraseña. Inténtalo de nuevo.");
      toast.error("Error al actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-zvioleta/10 rounded-full mb-4">
          <FaShieldAlt className="text-zvioleta text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Actualizar Contraseña</h2>
        <p className="text-gray-600">
          Por seguridad, debes cambiar tu contraseña predeterminada
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Nueva Contraseña */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Nueva contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu nueva contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-colors"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Validación de longitud */}
        {contrasena.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className={`flex items-center gap-2 text-sm ${contrasena.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
              <FaCheckCircle className={contrasena.length >= 8 ? 'text-green-500' : 'text-gray-300'} />
              Mínimo 8 caracteres {contrasena.length > 0 && `(${contrasena.length}/8)`}
            </div>
          </div>
        )}

        {/* Confirmar Contraseña */}
        <div className="space-y-2">
          <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="confirmpassword"
              name="confirmpassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirma tu nueva contraseña"
              value={contrasenaConfirmada}
              onChange={(e) => setContrasenaConfirmada(e.target.value)}
              required
              className={`w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                contrasenaConfirmada.length > 0
                  ? passwordsMatch
                    ? 'border-green-300 focus:ring-green-500/50 focus:border-green-500'
                    : 'border-red-300 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-gray-300 focus:ring-zvioleta/50 focus:border-zvioleta'
              }`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {contrasenaConfirmada.length > 0 && (
            <p className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
              {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isPasswordValid || !passwordsMatch || isLoading}
          className="w-full px-4 py-3 text-white font-medium bg-zvioleta hover:bg-zvioleta/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zvioleta transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Actualizando...
            </>
          ) : (
            <>
              <FaShieldAlt />
              Actualizar Contraseña
            </>
          )}
        </button>
      </form>

      {/* Security Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Nota de seguridad:</strong> Tu nueva contraseña será encriptada y almacenada de forma segura. 
          Asegúrate de recordarla para futuros accesos.
        </p>
      </div>
    </div>
  );
};

export default FormUpdatePassword;
