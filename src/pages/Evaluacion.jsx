import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { URLBASE } from '../lib/actions';
import { useUser } from '../context/UserContext';
import ComentariosAcciones from '../components/ComentariosAcciones';
import { toast } from 'react-toastify';
import Loading from './Loading';


const Evaluacion = () => {
  const [selectedValues, setSelectedValues] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [calificaciones, setCalificaciones] = useState([]);
  const [evaluacion, setEvaluacion] = useState([]);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Para controlar el modal de confirmación
  const { idUsuario } = useParams();
  const user = useUser();

  const evaluadorId = user?.user.idUsuario; // Evaluador siempre es el usuario actual

  const competencias = evaluacion?.Competencias || [];
  const competenciaActual = competencias[currentPage]; // Obtener la competencia actual

  const usuario = user?.colaboradores?.colaboradores.find(c => c.idUsuario == idUsuario) || user?.colaboradores || user?.user;
  const dataParams = {
    idEmpresa: usuario?.Empresas[0].idEmpresa || null,
    idNivelCargo: usuario?.idNivelCargo
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
      } catch{
        toast.error("Ocurrio un error durante la obtención de los datos!");
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
      setCurrentPage(currentPage - 1);
    }
  };

  // Mostrar el diálogo de confirmación antes de enviar
  const handleFinalizarClick = (e) => {
    e.preventDefault();
    if (validatePage()) {
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
    <div className="flex flex-col justify-center items-center mx-10 lg:mx-32 my-10">
      <h1 className="font-bold text-2xl text-zvioleta">{`${evaluacion.nombre}  ${evaluacion.año}`}</h1>
      <p className="font-light text-znaranja">{`Evaluando a: ${usuario.nombre}`}</p>
       {currentPage === 0 ? <p className=' py-7 text-xl my-5'>A continuación, encontrarás las competencias con sus definiciones y los comportamientos a evaluar según el desempeño observado, junto con las responsabilidades en formación y seguridad y salud en el trabajo (SST). Usa la escala de 5 niveles para calificar cada aspecto.</p> : null}
      <form className="w-full" onSubmit={handleFinalizarClick}>
        {!completed ? (
          <div className="border-2 mt-4 p-2 rounded-lg w-full">
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">¿Confirmar el envío de la evaluación?</h2>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-znaranja hover:bg-znaranja/90 rounded-md"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-zvioleta rounded-md hover:bg-zvioleta/90"
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