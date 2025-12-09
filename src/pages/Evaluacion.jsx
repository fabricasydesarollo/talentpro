import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { URLBASE } from '../lib/actions';
import { useUser } from '../context/UserContext';
import ComentariosAcciones from '../components/ComentariosAcciones';
import { toast } from 'react-toastify';
import Loading from './Loading';
import IniciarEvaluacion from '../components/IniciarEvaluacion';
import { smoothScrollTo } from '../lib/utils';


const Evaluacion = () => {
  const [selectedValues, setSelectedValues] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [calificaciones, setCalificaciones] = useState([]);
  const [evaluacion, setEvaluacion] = useState([]);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Para controlar el modal de confirmación
  const { idUsuario, idEvaluacion } = useParams();
  const [onStart, setOnStart] = useState(true);
  const user = useUser();
  const navigate = useNavigate();

  const evaluadorId = user?.user.idUsuario; // Evaluador siempre es el usuario actual

  const colaborador = evaluadorId != idUsuario

  const competencias = evaluacion?.Competencias || [];
  const competenciaActual = competencias[currentPage]; // Obtener la competencia actual

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
        toast.error(`Ocurrio un error durante la obtención de los datos!, ${err.response.data?.message}`);
        navigate("/evaluar")
      }
    };

    fetchData();
  }, [user]); // Dependiendo de 'user' para evitar re-renderizados innecesarios

  // Manejar la selección de calificación
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

  // Manejar el cambio de página
  const nextPage = () => {
    smoothScrollTo(0, 500);
    if (validatePage()) {
      if (currentPage < competencias.length - 1) {
        setCurrentPage(currentPage + 1);
      }
    } else {
      toast.error("Por favor, selecciona una respuesta para cada descriptor.");
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      smoothScrollTo(0, 500);
      setCurrentPage(currentPage - 1);
    }
  };

  // Mostrar el diálogo de confirmación antes de enviar
  const handleFinalizarClick = (e) => {
    e.preventDefault();
    if (validatePage()) {
      console.log('Esto se esta ejecutando al cargar comentarios')
      setShowConfirmDialog(true); // Mostrar el diálogo de confirmación
    } else {
      toast.error("Por favor, selecciona una respuesta para cada descriptor antes de finalizar.");
    }
  };

  // Confirmar el envío
  const confirmSubmit = async () => {
    const idEvaluacion = evaluacion.idEvaluacion; // ID de la evaluación actual
    const respuestas = Object.entries(selectedValues).map(([idDescriptor, idCalificacion]) => ({
      idDescriptor: parseInt(idDescriptor),
      idCalificacion,
      idEvaluacion,
      idColaborador: usuario.idUsuario,
      idEvaluador: evaluadorId, // Evaluador es el usuario actual
    }));

    try {
      await axios.post(`${URLBASE}/respuestas`, { respuestas });
      setCompleted(true); // Marcar como completado después de enviar
      setMostrarComentarios(true);
      setShowConfirmDialog(false); // Ocultar el diálogo de confirmación
    } catch {
      toast.warn("Respuestas ya registradas!");
    }
  };

  if (isLoading) {
    return <Loading />
  }


  return (
    <div className="w-full flex flex-col justify-center items-center p-10">
      <h1 className="font-bold text-2xl text-zvioleta">{evaluacion.nombre}</h1>
      <p className="font-light text-znaranja">{`Evaluando a: ${usuario.nombre}`}</p>
       {currentPage === 0 && onStart ? <IniciarEvaluacion onClose={onClose} setOnStart={setOnStart} fechas={fechas} /> : null}
      <form className="w-full" onSubmit={handleFinalizarClick}>
        {!completed ? (
          <div className="border-2 mt-4 p-2 rounded-lg w-full bg-white/5 shadow-lg">
            {/* Renderización de la evaluación por competencias */}
            {currentPage < competencias.length ? (
              <>
                <div className="bg-gray-50 mt-2 pt-2 pb-2 text-center">
                  <h1 className="font-bold text-2xl text-zvioleta">{competenciaActual?.nombre || 'Nombre de la competencia'}</h1>
                  <p className="italic text-start">{competenciaActual?.tipoCompetencium?.nombre}</p>
                  <p className="italic text-start m-4">{competenciaActual?.descripcion}</p>
                </div>

                {competenciaActual?.Descriptores?.map((descriptor) => (
                  <div key={descriptor.idDescriptor} className="w-full">
                    <div className="bg-gray-50 mt-1 items-start justify-start flex w-full">
                      <p className="font-semibold m-3">{descriptor.descripcion}</p>
                    </div>

                    <div className="bg-gray-50 mt-2 p-6 w-full flex gap-2 flex-col">
                      {calificaciones.sort((a, b) => b.valor - a.valor).map((calificacion) => {
                        const isSelected = selectedValues[descriptor.idDescriptor] === calificacion.idCalificacion;
                        return (
                          <div
                            key={calificacion.idCalificacion}
                            className={`cursor-pointer p-4 border-2 rounded-lg flex items-center space-x-2 ${isSelected ? 'border-zvioleta bg-zvioletaopaco/15 text-zvioleta' : 'border-gray-300'}`}
                            onClick={() => handleRadioChange(descriptor.idDescriptor, calificacion.idCalificacion)}
                          >
                            <div className={`w-3 h-3 rounded-full border-2 ${isSelected ? 'bg-zvioletaopaco  border-zvioleta' : 'border-gray-300'}`} />
                            <label className="cursor-pointer">{calificacion.valor} - {calificacion.descripcion}</label>
                          </div>
                        );
                      })}
                    </div>    
                  </div>
                ))}

                {/* Botones de navegación */}
                <div className="mt-4 mb-8 flex justify-between">
                  {currentPage >= 0 && (
                    <button
                      type="button"
                      onClick={prevPage}
                      disabled={currentPage <= 0}
                      className={`px-4 py-2 text-md font-medium text-white  bg-zvioleta hover:bg-zvioleta/90 rounded-md ${currentPage <= 0 ? "cursor-not-allowed hover:bg-zvioleta": null}`}
                    >
                      Atrás
                    </button>
                  )}
                  {!completed && (
                    currentPage === competencias.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleFinalizarClick}
                        className="px-4 py-2 text-md font-medium text-white bg-zvioleta hover:bg-zvioleta/90 rounded-md"
                      >
                        Finalizar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={nextPage}
                        className="px-4 py-2 text-md font-medium text-white bg-zvioleta hover:bg-zvioleta/90 rounded-md"
                      >
                        Siguiente
                      </button>
                    )
                  )}
                </div>
              </>
            ) : null}
          </div>
        ) : (
          mostrarComentarios && <ComentariosAcciones idColaborador={usuario?.idUsuario} idEvaluador={evaluadorId} idEvaluacion={evaluacion?.idEvaluacion} esEvaluador={!(usuario?.idUsuario === evaluadorId)} />
        )}
      </form>

      {/* Modal de confirmación */}
      {showConfirmDialog && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div className="bg-white w-full max-w-md mx-4 p-6 rounded-lg shadow-xl animate-fadeIn">
              <h2
                id="confirm-dialog-title"
                className="text-xl font-semibold text-gray-800 mb-4"
              >
                ¿Confirmar el envío de la evaluación?
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Esta acción enviará la evaluación y no podrá modificarse después.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-zvioleta hover:bg-zvioleta/90 rounded-md transition-colors"
                  onClick={confirmSubmit}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>

      )}
    </div>
  );
};

export default Evaluacion;