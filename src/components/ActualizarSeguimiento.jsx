import { useState, useEffect } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { toast } from 'sonner';
import PropTypes from 'prop-types';

const ActualizarSeguimiento = ({idColaborador, idEvaluacion, idEvaluador}) => {
  const [comentariosGenerales, setComentariosGenerales] = useState('');
  const [accionesMejoramiento, setAccionesMejoramiento] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [retroalimentacion, setRetroalimentacion] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${URLBASE}/evaluaciones/comentarios`, {
          params: { idColaborador, idEvaluacion, idEvaluador }
        });
        const data = response.data?.data;
        if (data) {
          setComentariosGenerales(data.comentario || '');
          setRetroalimentacion(data.retroalimentacion || false);
          setAccionesMejoramiento(
            data.Compromisos.map((compromiso) => ({
              idCompromiso: compromiso.idCompromiso,
              idCompetencia: compromiso.Competencia.idCompetencia,
              comentario: compromiso.comentario,
              estado: compromiso.estado,
              fechaCumplimiento: compromiso.fechaCumplimiento.split('T')[0],
            }))
          );
          setCompetencias(
            data.Compromisos.map((compromiso) => ({
              idCompromiso: compromiso.idCompromiso,
              idCompetencia: compromiso.Competencia.idCompetencia,
              nombre: compromiso.Competencia.nombre,
            }))
          );
        }
      } catch {
        toast.error("Ocurrió un error al obtener los datos.");
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [idColaborador, idEvaluacion]);

  const handleAccionChange = (index, field, value) => {
    const nuevasAcciones = [...accionesMejoramiento];
    nuevasAcciones[index][field] = value;
    setAccionesMejoramiento(nuevasAcciones);
  };
  
  const submitComentarios = async () => {
    const pass = retroalimentacion &&
      (
        (competencias.length >= 3 && accionesMejoramiento.length >= 3) ||
        (competencias.length <= 3 && accionesMejoramiento.length === competencias.length)
      );

    if (pass) {
      try {
        const payload = {
          idEvaluacion,
          idEvaluador,
          idColaborador,
          comentario: comentariosGenerales,
          accionesMejoramiento
        };

        const response = await axios.patch(`${URLBASE}/evaluaciones/compromisos`, payload);

        if (response.status === 200) {
          toast.success("Datos guardados con éxito!", { position: 'top-center' });
        } else {
          toast.error('Error al guardar los datos.', { position: 'top-center' });
        }
      } catch {
        toast.error("Error al comunicarse con el servidor.");
      }
    } else {
      toast.error("Debes completar correctamente el formulario.");
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 bg-white rounded-lg shadow-md space-y-6">
      {/* Título de la sección */}
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2 text-zvioleta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h2 className="text-lg font-semibold text-zvioleta">Actualizar Seguimiento</h2>
      </div>

      {/* Sección de comentarios generales */}
      <div className="space-y-3">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-md font-medium text-gray-900">Comentarios Generales</h3>
        </div>
        
        <div>
          <label htmlFor="comentarios-seguimiento" className="block text-sm font-medium text-gray-700 mb-1">
            Comentario <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comentarios-seguimiento"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-zvioleta focus:border-zvioleta resize-none"
            placeholder="Actualiza tus comentarios sobre el seguimiento..."
            value={comentariosGenerales}
            rows={4}
            required
            onChange={(e) => setComentariosGenerales(e.target.value)}
          />
        </div>
      </div>

      {/* Sección de acciones de mejoramiento */}
      <div className="space-y-4">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-md font-medium text-gray-900">Acciones de Mejoramiento</h3>
        </div>

        {accionesMejoramiento?.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-gray-500 text-sm">No hay acciones de mejoramiento registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accionesMejoramiento.map((accion, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Acción de Mejoramiento #{index + 1}</h4>
                  <span className="text-xs text-gray-500">Campos requeridos *</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Competencia */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Competencia <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-zvioleta focus:border-zvioleta"
                      value={accion.idCompetencia}
                      onChange={(e) => handleAccionChange(index, 'idCompetencia', e.target.value)}
                      required
                    >
                      <option value="">Selecciona una competencia</option>
                      {competencias.map(competencia => (
                        <option key={competencia.idCompetencia} value={competencia.idCompetencia}>
                          {competencia.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-zvioleta focus:border-zvioleta appearance-none"
                        value={accion.estado}
                        onChange={(e) => handleAccionChange(index, 'estado', e.target.value)}
                        required
                      >
                        <option value="Por Iniciar">Por iniciar</option>
                        <option value="En curso">En curso</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-zvioleta focus:border-zvioleta resize-none"
                    placeholder="Actualiza la descripción de la acción de mejoramiento..."
                    value={accion.comentario}
                    rows={3}
                    onChange={(e) => handleAccionChange(index, 'comentario', e.target.value)}
                    required
                  />
                </div>

                {/* Fecha de cumplimiento */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fecha de cumplimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-zvioleta focus:border-zvioleta"
                    value={accion.fechaCumplimiento}
                    onChange={(e) => handleAccionChange(index, 'fechaCumplimiento', e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkbox de confirmación */}
      <div className="bg-orange-50 border-l-4 border-znaranja rounded p-3">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="retroalimentacion-seguimiento-checkbox"
            checked={retroalimentacion}
            onChange={(e) => setRetroalimentacion(e.target.checked)}
            className="h-4 w-4 text-znaranja focus:ring-zvioleta border-gray-300 rounded mt-0.5"
          />
          <label htmlFor="retroalimentacion-seguimiento-checkbox" className="ml-2 text-sm text-gray-700">
            <span className="font-medium">Confirmo que he realizado la retroalimentación de seguimiento</span>
            <p className="text-xs text-gray-600 mt-1">
              Es necesario confirmar que se ha proporcionado retroalimentación actualizada sobre el progreso de las acciones de mejoramiento.
            </p>
          </label>
        </div>
      </div>

      {/* Botón de envío */}
      <div className="pt-4 border-t border-gray-200">
        <button 
          onClick={submitComentarios} 
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-zvioleta hover:bg-zvioleta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zvioleta transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Guardar y Finalizar
        </button>
      </div>
    </div>
  );
}

ActualizarSeguimiento.propTypes = {
  idEvaluacion: PropTypes.string,
  idColaborador: PropTypes.string,
  idEvaluador: PropTypes.string,
};

export default ActualizarSeguimiento;
