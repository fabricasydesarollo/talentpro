import { useState } from "react"

const IniciarEvaluacion = ({ onClose, setOnStart, fechas }) => {
  
  const [finish, setFinish] = useState(false)
  if (fechas.fechaHoy > fechas.fechaFin) {
    setFinish(true)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white rounded-2xl p-8 w-11/12 md:w-2/3 lg:w-1/2 shadow-2xl">
        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Instrucciones</h1>

        {/* Contenido */}
        <p className="text-gray-600 mb-2">
          Antes de comenzar, por favor ten en cuenta las siguientes recomendaciones:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>Asegúrate de estar en un lugar tranquilo sin interrupciones.</li>
          <li>Lee cuidadosamente cada pregunta antes de responder.</li>
          <li>Una vez enviada la evaluación, no podrás modificar tus respuestas.</li>
        </ul>

        {/* Detalles */}
        <div className="text-gray-700 mb-6">
          {
            finish ? (
              <p className="text-red-400 text-center py-4">** La evaluación finalizo el <span className="font-bold">{fechas.fechaFin}</span> **</p>
            ) : (
              <>
                <p><span className="font-semibold">Descripción:</span> Evaluación de desempeño anual.</p>
                <p><span className="font-semibold">Fecha de inicio:</span> {fechas.fechaInicio}</p>
                <p><span className="font-semibold">Fecha de fin:</span> {fechas.fechaFin}</p>
              </>
            )
          }
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => setOnStart(false)}
            className="bg-zverde text-white px-6 py-2 rounded-lg shadow-md hover:bg-zverde/70 transition disabled:bg-zverde/70 disabled:cursor-not-allowed"
            disabled={finish}
          >
            Iniciar Evaluación
          </button>
        </div>
      </div>
    </div>
  )
}

export default IniciarEvaluacion
