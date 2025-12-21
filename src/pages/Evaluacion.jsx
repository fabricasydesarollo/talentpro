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
import { FaArrowLeft, FaArrowRight, FaCheck, FaUser, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';


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
      } catch(err){
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
      toast.success("Evaluación enviada", {
        description: "La evaluación se ha registrado correctamente"
      });
    } catch {
      toast.warning("Evaluación ya registrada", {
        description: "Las respuestas ya fueron enviadas anteriormente"
      });
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
                        <div className="bg-gray-50 p-4 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-6 h-6 bg-zvioleta text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            {descriptor.descripcion}
                          </h3>
                        </div>

                        <div className="p-4 space-y-3">
                          {calificaciones.sort((a, b) => b.valor - a.valor).map((calificacion) => {
                            const isSelected = selectedValues[descriptor.idDescriptor] === calificacion.idCalificacion;
                            return (
                              <div
                                key={calificacion.idCalificacion}
                                className={`cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                                  isSelected 
                                    ? 'border-zvioleta bg-zvioleta/5 shadow-sm' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleRadioChange(descriptor.idDescriptor, calificacion.idCalificacion)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-zvioleta border-zvioleta' : 'border-gray-300'
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
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                          currentPage <= 0 
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                            : "bg-gray-600 hover:bg-gray-700 text-white"
                        }`}
                      >
                        <FaArrowLeft className="text-sm" />
                        Anterior
                      </button>

                      {currentPage === competencias.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleFinalizarClick}
                          className="flex items-center gap-2 px-6 py-3 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg font-medium transition-colors"
                        >
                          <FaCheck className="text-sm" />
                          Finalizar Evaluación
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={nextPage}
                          className="flex items-center gap-2 px-6 py-3 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg font-medium transition-colors"
                        >
                          Siguiente
                          <FaArrowRight className="text-sm" />
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
                  esEvaluador={!(usuario?.idUsuario === evaluadorId)} 
                />
              </div>
            )
          )}
        </form>

        {/* Confirmation Modal */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FaExclamationTriangle className="text-yellow-600 text-lg" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Confirmar envío
                  </h2>
                </div>
                
                <p className="text-gray-600 mb-4">
                  ¿Estás seguro de que deseas enviar la evaluación? Esta acción no se puede deshacer.
                </p>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Recordatorio:</strong> Podrás agregar comentarios después de enviar la evaluación.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
                <button
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-4 py-2 text-white bg-zvioleta hover:bg-zvioleta/90 rounded-lg font-medium transition-colors"
                  onClick={confirmSubmit}
                >
                  Confirmar
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