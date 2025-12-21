import { useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-zvioleta to-znaranja bg-clip-text">
            404
          </h1>
        </div>

        {/* Error Icon */}
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zvioleta/10 rounded-full">
            <FaExclamationTriangle className="text-zvioleta text-2xl" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-2">
            La página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <FaArrowLeft className="text-xs" />
            Volver
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg transition-colors text-sm"
          >
            <FaHome className="text-xs" />
            Ir al Inicio
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Si necesitas ayuda, contacta al administrador del sistema
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>Error 404</span>
            <span>•</span>
            <span>Desarrollando Talentos</span>
            <span>•</span>
            <span>Sistema de Evaluaciones</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
