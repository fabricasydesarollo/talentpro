import { useState, useEffect } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types'

const ComentariosAcciones = ({ idEvaluacion, idEvaluador, idColaborador }) => {
  const [comentariosGenerales, setComentariosGenerales] = useState('');
  const [accionesMejoramiento, setAccionesMejoramiento] = useState([]);
  const [competenciasFiltradas, setCompetenciasFiltradas] = useState([]);
  const [retroalimentacion, setRetroalimentacion] = useState(false);
  const [respuestas, setRespuestas] = useState([])
  const [esEvaluador, setEsEvaluador] = useState(Number(idColaborador) != Number(idEvaluador));
  const navigate = useNavigate();
  

  // Fetch competencias solo si es evaluador
  useEffect(() => {
      const obtenerDatos = async () => {
        try {
          const responseCompetencias = await axios.get(`${URLBASE}/respuestas`, { params: { idEvaluador, idColaborador, idEvaluacion } });
          setRespuestas(responseCompetencias.data)
          setCompetenciasFiltradas(responseCompetencias.data?.evaluacion);
        } catch {
          toast.error("Ocurrió un error al obtener las competencias.");
        }
      };
      obtenerDatos();
  }, [idColaborador, idEvaluador, esEvaluador, idEvaluacion, retroalimentacion]);

  // Manejar cambio en acciones de mejoramiento
  const handleAccionChange = (index, field, value) => {
    const nuevasAcciones = [...accionesMejoramiento];
    nuevasAcciones[index][field] = value;
    setAccionesMejoramiento(nuevasAcciones);
  };

  // Agregar una nueva acción de mejoramiento
  const agregarAccion = () => {
    setAccionesMejoramiento([...accionesMejoramiento, { idCompetencia: '', comentario: '', estado: '', fechaCumplimiento: '' }]);
  };

  const quitarAccion = () => {
    if (accionesMejoramiento.length > 0) {
      setAccionesMejoramiento(accionesMejoramiento.slice(0, -1));
    }
  };

  const calcularPromedio = (competencias) => {
    if (competencias?.length === 0) return 0
    const sumaPromedio = competencias?.reduce((acc, curr) => acc + curr.promedio, 0)
    const promedio = sumaPromedio / competencias?.length
    return promedio.toFixed(1)
  }

  const promedio = calcularPromedio(respuestas?.autoevaluacion?.length > 0 ? respuestas?.autoevaluacion : respuestas?.evaluacion)
  const competencias = competenciasFiltradas?.filter(competencia => competencia.promedio < 3.4)

  // Manejo de envío de datos
  const submitComentarios = async () => {
    const pass = esEvaluador && retroalimentacion && (
      (competencias.length === 0) || (competencias.length > 0 && accionesMejoramiento.length >= 1)
    );

    const puedeEnviar = comentariosGenerales.length > 0 && (!esEvaluador || pass);

    if (puedeEnviar) {
      try {
        const payload = {
          idEvaluacion,
          idEvaluador,
          idColaborador,
          comentario: comentariosGenerales,
          promedio,
          accionesMejoramiento: esEvaluador ? accionesMejoramiento : [],
          retroalimentacion
        };

        const response = await axios.post(`${URLBASE}/evaluaciones/comentarios`, payload);

        if (response.status === 200) {
          const idEvalRealizada = response.data?.data?.idEvalRealizada;
          toast.success("Comentarios guardados con éxito!", {position: 'top-center', toastId: 'comentarios-id-succes'});

          if (!esEvaluador) {
            navigate("/home")
            return
          }

          if (pass) {
            for (const accion of accionesMejoramiento) {
              const compromisoPayload = {
                idCompetencia: accion.idCompetencia,
                idEvalRealizada,
                comentario: accion.comentario,
                estado: accion.estado,
                fechaCumplimiento: accion.fechaCumplimiento
              };
              await axios.post(`${URLBASE}/evaluaciones/compromisos`, compromisoPayload);
            }
            toast.success("Compromisos guardados con éxito!", {position: 'top-center',toastId: 'err-id-mejoramiento'});
            setTimeout(() => {
              navigate("/evaluar")
            }, 1500);
          }else{
            toast.error('Debes registrar las acciones de mejoramiento!', {position: 'top-center', toastId: 'err-id-mejoramiento'})
          }
        } else {
          toast.error('Ya has agregado un comentario!', {position: 'top-center',toastId: 'err-id-mejoramiento'});
        }
      } catch {
        toast.error("Ocurrió un error en la comunicación con el servidor.");
      }
    } else {
      toast.error("Debes llenar todos los campos", {position: 'top-center',toastId: 'err-id-mejoramiento'})
    }
  };

  return (
    <div className="w-full mx-auto p-4 bg-white rounded-lg shadow-md space-y-6">
      {/* Sección de comentarios generales */}
      <div className="space-y-3">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-zvioleta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className="text-lg font-semibold text-zvioleta">Comentarios Generales</h2>
        </div>
        
        <div>
          <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-1">
            Comentario <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comentarios"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-zvioleta focus:border-zvioleta resize-none"
            placeholder="Escribe tus comentarios sobre la evaluación..."
            value={comentariosGenerales}
            rows={4}
            required
            onChange={(e) => setComentariosGenerales(e.target.value)}
          />
        </div>
      </div>

      {/* Sección de acciones de mejoramiento (solo para evaluadores) */}
      {esEvaluador && (
        <div className="space-y-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-zvioleta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-zvioleta">Acciones de Mejoramiento</h2>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="mb-1">Elabora el plan de desarrollo enfocado en competencias con puntajes por debajo de lo esperado (mínimo 1, máximo 3).</p>
                <p>
                  Consulta las ideas en{' '}
                  <a 
                    href="https://grupozentria-my.sharepoint.com/:f:/g/personal/nini_cifuentes_zentria_com_co/IgDfjlLV-zrGTpS0Iixn3CetAc2Rdvh7UWwxOV1YZle_tKo?e=gVE9k6" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline text-znaranja hover:text-znaranja/80"
                  >
                    Guía de Desarrollo
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Lista de acciones de mejoramiento */}
          <div className="space-y-4">
            {accionesMejoramiento.map((accion, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Acción de Mejoramiento #{index + 1}</h3>
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
                      required
                      onChange={(e) => handleAccionChange(index, 'idCompetencia', e.target.value)}
                    >
                      <option value="">Selecciona una competencia</option>
                      {competencias.map(competencia => (
                        <option key={competencia.idCompetencia} value={competencia.idCompetencia}>
                          {`${competencia.nombre} (${competencia.promedio.toFixed(1)})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-zvioleta focus:border-zvioleta"
                      value={accion.estado}
                      required
                      onChange={(e) => handleAccionChange(index, 'estado', e.target.value)}
                    >
                      <option value="">Selecciona el estado</option>
                      <option value="Por iniciar">Por iniciar</option>
                      <option value="En curso">En curso</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-zvioleta focus:border-zvioleta resize-none"
                    placeholder="Describe la acción de mejoramiento..."
                    value={accion.comentario}
                    rows={3}
                    required
                    onChange={(e) => handleAccionChange(index, 'comentario', e.target.value)}
                  />
                </div>

                {/* Fecha de cumplimiento */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fecha de cumplimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-zvioleta focus:border-zvioleta"
                    value={accion.fechaCumplimiento}
                    onChange={(e) => handleAccionChange(index, 'fechaCumplimiento', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Botones para gestionar acciones */}
          <div className="flex gap-2">
            <button 
              onClick={agregarAccion} 
              disabled={competencias.length === accionesMejoramiento.length || accionesMejoramiento.length >= 3}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-zvioleta hover:bg-zvioleta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zvioleta disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Acción
            </button>
            
            <button 
              onClick={quitarAccion} 
              disabled={accionesMejoramiento.length === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zvioleta disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
              Quitar Acción
            </button>
          </div>

          {/* Checkbox de confirmación */}
          <div className="bg-orange-50 border-l-4 border-znaranja rounded p-3">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="retroalimentacion-checkbox"
                checked={retroalimentacion}
                onChange={(e) => setRetroalimentacion(e.target.checked)}
                className="h-4 w-4 text-znaranja focus:ring-zvioleta border-gray-300 rounded mt-0.5"
              />
              <label htmlFor="retroalimentacion-checkbox" className="ml-2 text-sm text-gray-700">
                <span className="font-medium">Confirmo que he realizado la retroalimentación</span>
                <p className="text-xs text-gray-600 mt-1">
                  Es necesario confirmar que se ha proporcionado retroalimentación al colaborador sobre los resultados de la evaluación.
                </p>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Botón de envío */}
      <div className="pt-4 border-t border-gray-200">
        <button 
          type="button" 
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
};

ComentariosAcciones.propTypes = {
  idEvaluacion: PropTypes.number,
  idEvaluador: PropTypes.number,
  idColaborador: PropTypes.number,
  esEvaluador: PropTypes.bool
};

export default ComentariosAcciones;
