import { useState } from "react"
import { FaPlay, FaTimes, FaCalendarAlt, FaClock, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from "react-icons/fa"

const IniciarEvaluacion = ({ onClose, setOnStart, fechas }) => {
  
  const [finish, setFinish] = useState(false)
  if (fechas.fechaHoy > fechas.fechaFin) {
    setFinish(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-zvioleta to-zvioletaopaco text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaInfoCircle className="text-lg" />
              <div>
                <h1 className="text-lg font-bold">Instrucciones</h1>
                <p className="text-white/90 text-xs">Lee antes de comenzar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status Banner */}
          {finish ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800 text-sm">Evaluación Finalizada</h3>
                  <p className="text-red-700 text-xs">Finalizó el {formatDate(fechas.fechaFin)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800 text-sm">Evaluación Disponible</h3>
                  <p className="text-green-700 text-xs">Hasta el {formatDate(fechas.fechaFin)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
              <FaInfoCircle className="text-zvioleta text-xs" />
              Recomendaciones
            </h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <div className="w-1 h-1 bg-zvioleta rounded-full mt-1.5 flex-shrink-0"></div>
                <p>Asegúrate de estar en un lugar tranquilo</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <div className="w-1 h-1 bg-zvioleta rounded-full mt-1.5 flex-shrink-0"></div>
                <p>Lee cuidadosamente cada pregunta</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <div className="w-1 h-1 bg-zvioleta rounded-full mt-1.5 flex-shrink-0"></div>
                <p>No podrás modificar respuestas después del envío</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <div className="w-1 h-1 bg-zvioleta rounded-full mt-1.5 flex-shrink-0"></div>
                <p>Registra comentarios y acciones de mejora al final de la evaluación</p>
              </div>
            </div>
          </div>

          {/* Evaluation Details */}
          {!finish && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <FaCalendarAlt className="text-zvioleta text-xs" />
                Fechas
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-gray-200 rounded text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FaCalendarAlt className="text-znaranja text-xs" />
                    <span className="text-xs text-gray-600">Inicio</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{formatDate(fechas.fechaInicio)}</p>
                </div>
                <div className="p-2 border border-gray-200 rounded text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FaClock className="text-znaranja text-xs" />
                    <span className="text-xs text-gray-600">Límite</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{formatDate(fechas.fechaFin)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="p-3 bg-yellow-50 border-l-2 border-yellow-400 rounded">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-yellow-600 text-sm mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 text-xs mb-1">Importante</h3>
                <p className="text-yellow-700 text-xs">
                  Las respuestas no se guardan automáticamente si sales de la página.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-xs" />
              Cancelar
            </button>
            <button
              onClick={() => setOnStart(false)}
              disabled={finish}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FaPlay className="text-xs" />
              {finish ? 'Finalizada' : 'Iniciar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IniciarEvaluacion
