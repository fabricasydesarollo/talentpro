import { FaFilePdf, FaSpinner, FaClock } from 'react-icons/fa';
import PropTypes from 'prop-types';

const LoadingGenerate = ({ 
  message = "Generando PDFs...", 
  subtitle = "Este proceso puede tomar unos minutos dependiendo de la cantidad de documentos",
  selectedCount = 0 
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header con icono */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-zvioleta to-zvioletaopaco rounded-full mb-4">
            <FaFilePdf className="text-white text-2xl" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {message}
          </h2>
          
          {selectedCount > 0 && (
            <p className="text-sm text-gray-600 mb-2">
              Procesando {selectedCount} {selectedCount === 1 ? 'documento' : 'documentos'}
            </p>
          )}
          
          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        </div>

        {/* Barra de progreso animada */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-zvioleta to-zvioletaopaco rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Estado actual */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <FaSpinner className="text-zvioleta animate-spin text-lg" />
          <span className="text-gray-700 font-medium">Procesando en el servidor...</span>
        </div>

        {/* Información de tiempo estimado */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-blue-600 text-sm" />
            <span className="text-sm font-medium text-blue-800">Tiempo estimado</span>
          </div>
          <p className="text-xs text-blue-700">
            {selectedCount <= 5 ? '1-2 minutos' : 
             selectedCount <= 15 ? '2-5 minutos' : 
             selectedCount <= 30 ? '5-10 minutos' : 
             '10+ minutos'}
          </p>
        </div>

        {/* Mensaje de espera */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Por favor, no cierres esta ventana ni navegues a otra página mientras se completa el proceso.
          </p>
        </div>
      </div>
    </div>
  );
};

LoadingGenerate.propTypes = {
  message: PropTypes.string,
  subtitle: PropTypes.string,
  selectedCount: PropTypes.number
};

export default LoadingGenerate;
  