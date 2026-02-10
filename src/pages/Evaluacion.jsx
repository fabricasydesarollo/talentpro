import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import ComentariosAcciones from '../components/ComentariosAcciones';
import { toast } from 'sonner';
import Loading from './Loading';
import IniciarEvaluacion from '../components/IniciarEvaluacion';
import { smoothScrollTo } from '../lib/utils';
import { FaUser, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

const Evaluacion = () => {
  const [selectedValues, setSelectedValues] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [calificaciones, setCalificaciones] = useState([]);
  const [evaluacion, setEvaluacion] = useState([]);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { idUsuario, idEvaluacion } = useParams();
  const [onStart, setOnStart] = useState(true);
  const user = useUser();
  const navigate = useNavigate();

  const evaluadorId = user?.user.idUsuario;
  const colaborador = evaluadorId != idUsuario
  const competencias = evaluacion?.Competencias || [];
  const competenciaActual = competencias[currentPage];
  const usuario = colaborador ? user?.colaboradores?.colaboradores.find(c => c.idUsuario == idUsuario) : user?.user;

  const dataParams = {
    idEmpresa: usuario?.Empresas[0].idEmpresa || null,
    idNivelCargo: usuario?.idNivelCargo,
    idEvaluacion: idEvaluacion,
  };

  const onClose = () => {
    navigate(-1)
  }

  const fechas = {
    fechaInicio: evaluacion?.fechaInicio?.split('T')[0],
    fechaFin: evaluacion?.fechaFin?.split('T')[0],
    fechaHoy: new Date().toISOString().split('T')[0]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const calificacionesResponse = await axios.get(`${URLBASE}/respuestas/calificacion`);
        setCalificaciones(calificacionesResponse.data?.data || []);

        const evaluacionResponse = await axios.get(`${URLBASE}/evaluaciones`, {
          params: dataParams
        });
        setEvaluacion(evaluacionResponse.data?.data || []);
        setIsLoading(false);
      } catch (err) {
        toast.error('Error al cargar datos', {
          description: err.response?.data?.message || 'No se pudieron obtener los datos'
        });
        navigate("/evaluar")
      }
    };

    fetchData();
  }, [user]);

  const handleRadioChange = (descriptorId, calificacionId) => {
    setSelectedValues(prevState => ({
      ...prevState,
      [descriptorId]: calificacionId,
    }));
  };

  const validatePage = () => {
    const descriptores = competencias[currentPage]?.Descriptores || [];
    return descriptores.every(descriptor => selectedValues[descriptor.idDescriptor]);
  };

  const nextPage = () => {
    smoothScrollTo(0, 500);
    if (validatePage()) {
      if (currentPage < competencias.length - 1) {
        setCurrentPage(currentPage + 1);
      }
    } else {
      toast.error("Respuestas incompletas", {
        description: "Por favor, selecciona una respuesta para cada descriptor."
      });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      smoothScrollTo(0, 500);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFinalizarClick = (e) => {
    e.preventDefault();
    if (validatePage()) {
      setShowConfirmDialog(true);
    } else {
      toast.error("Evaluación incompleta", {
        description: "Por favor, selecciona una respuesta para cada descriptor antes de finalizar."
      });
    }
  };

  const confirmSubmit = async () => {
    const idEvaluacion = evaluacion.idEvaluacion;
    const respuestas = Object.entries(selectedValues).map(([idDescriptor, idCalificacion]) => ({
      idDescriptor: parseInt(idDescriptor),
      idCalificacion,
      idEvaluacion,
      idColaborador: usuario.idUsuario,
      idEvaluador: evaluadorId,
    }));

    try {
      await axios.post(`${URLBASE}/respuestas`, { respuestas });
      setCompleted(true);
      setMostrarComentarios(true);
      setShowConfirmDialog(false);
      toast.success("Respuestas enviadas", {
        description: "Las respuestas se ha registrado correctamente, continua con los comentarios y acciones de mejora"
      });
    } catch {
      toast.warning("Evaluación ya registrada", {
        description: "Las respuestas ya fueron enviadas anteriormente"
      });
      navigate(`/seguimiento/${idUsuario}/${idEvaluacion}`)
    }
  };

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-zvioleta/10 rounded-lg">
              <FaClipboardList className="text-zvioleta text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zvioleta">{evaluacion.nombre}</h1>
              <div className="flex items-center gap-2 text-znaranja">
                <FaUser className="text-sm" />
                <p className="font-medium">Evaluando a: {usuario.nombre}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {!completed && competencias.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progreso de la evaluación</span>
                <span>{currentPage + 1} de {competencias.length} competencias</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-zvioleta to-znaranja h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / competencias.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {currentPage === 0 && onStart ? (
          <IniciarEvaluacion onClose={onClose} setOnStart={setOnStart} fechas={fechas} />
        ) : null}

        <form className="w-full" onSubmit={handleFinalizarClick}>
          {!completed ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {currentPage < competencias.length ? (
                <>
                  {/* Competencia Header */}
                  <div className="bg-gradient-to-r from-zvioleta to-zvioletaopaco text-white p-6">
                    <h2 className="text-xl font-bold mb-2">{competenciaActual?.nombre || 'Nombre de la competencia'}</h2>
                    <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                      <span className="px-2 py-1 bg-white/20 rounded-md">
                        {competenciaActual?.tipoCompetencium?.nombre}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">{competenciaActual?.descripcion}</p>
                  </div>

                  {/* Descriptores */}
                  <div className="p-6 space-y-6">
                    {competenciaActual?.Descriptores?.map((descriptor, index) => (
                      <div key={descriptor.idDescriptor} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center sm:flex-row flex-col">
                          <div className="w-6 h-6 bg-zvioleta text-white text-xs font-bold rounded-full flex justify-center items-center mr-2">
                            <span>{index + 1}</span>
                          </div>
                            <h3 className="font-semibold text-gray-900 w-full">
                              {descriptor.descripcion}
                            </h3>
                        </div>

                        <div className="p-4 space-y-3">
                          {calificaciones.sort((a, b) => b.valor - a.valor).map((calificacion) => {
                            const isSelected = selectedValues[descriptor.idDescriptor] === calificacion.idCalificacion;
                            return (
                              <div
                                key={calificacion.idCalificacion}
                                className={`cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${isSelected
                                    ? 'border-zvioleta bg-zvioleta/5 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                onClick={() => handleRadioChange(descriptor.idDescriptor, calificacion.idCalificacion)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-zvioleta border-zvioleta' : 'border-gray-300'
                                    }`}>
                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-semibold ${isSelected ? 'text-zvioleta' : 'text-gray-700'}`}>
                                        {calificacion.valor}
                                      </span>
                                      <span className="text-gray-600">-</span>
                                      <span className={`${isSelected ? 'text-zvioleta' : 'text-gray-700'}`}>
                                        {calificacion.descripcion}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={prevPage}
                        disabled={currentPage <= 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${currentPage <= 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gray-600 hover:bg-gray-700 text-white"
                          }`}
                      >
                        Anterior
                      </button>

                      {currentPage === competencias.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleFinalizarClick}
                          className="flex items-center gap-2 px-6 sm:py-3 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg font-medium transition-colors text-sm sm:text-lg py-3.5"
                        >
                          Continuar y Avanzar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={nextPage}
                          className="flex items-center gap-2 px-6 py-3 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg font-medium transition-colors"
                        >
                          Siguiente
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            mostrarComentarios && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ComentariosAcciones
                  idColaborador={usuario?.idUsuario}
                  idEvaluador={evaluadorId}
                  idEvaluacion={evaluacion?.idEvaluacion}
                />
              </div>
            )
          )}
        </form>

        {/* Confirmation Modal */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg mx-4 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-znaranja/10 rounded-lg">
                    <FaExclamationTriangle className="text-znaranja text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {colaborador ? '¡Atención! Confirmar envío de evaluación' : 'Confirmar envío de autoevaluación'}
                  </h2>
                </div>

                <p className="text-gray-700 mb-6 font-medium">
                  Estás a punto de finalizar la evaluación. Esta acción no se puede deshacer.
                </p>

                {/* Recordatorio prominente sobre comentarios - Solo para evaluadores */}
                {colaborador && (
                  <>
                    <div className="bg-znaranja/5 border-2 border-znaranja rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-znaranja rounded-full flex-shrink-0">
                          <FaClipboardList className="text-white text-sm" />
                        </div>
                        <div>
                          <h3 className="font-bold text-znaranja text-lg mb-2">
                            Recordatorio importante.
                          </h3>
                          <p className="text-znaranja font-semibold mb-2">
                            Como evaluador, es NECESARIO que registres:
                          </p>
                          <ul className="text-znaranja space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-znaranja rounded-full"></span>
                              <strong>Comentarios detallados</strong> sobre el desempeño
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-znaranja rounded-full"></span>
                              <strong>Acciones de mejora (Si aplica)</strong> específicas y medibles
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-znaranja rounded-full"></span>
                              <strong>Retroalimentación constructiva</strong> para el colaborador
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Confirmación adicional - Solo para evaluadores */}
                    <div className="bg-yellow-100 border border-yellow-100 rounded-lg p-4 mb-6">
                      <p className="text-yellow-600 text-sm font-medium">
                        <strong>⚠️ Importante:</strong> Después de enviar la evaluación, serás dirigido automáticamente
                        a la sección de comentarios donde <strong>DEBES completar</strong> la retroalimentación para el colaborador.
                      </p>
                    </div>
                  </>
                )}

                {/* Mensaje simple para autoevaluación */}
                {!colaborador && (
                  <div className="bg-zvioleta/5 border border-zvioleta rounded-lg p-4 mb-6">
                    <p className="text-zvioleta text-sm">
                      <strong>Nota:</strong> Después de enviar tu autoevaluación, registra un comentario.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
                <button
                  className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-4 py-3 text-white bg-zvioleta hover:bg-zvioleta/90 rounded-lg font-bold transition-colors shadow-lg"
                  onClick={confirmSubmit}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Evaluacion;