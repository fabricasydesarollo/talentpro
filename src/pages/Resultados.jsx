import axios from 'axios';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { FaPrint, FaArrowLeft, FaUser, FaClipboardList } from 'react-icons/fa';
import Loading from './Loading';

const Resultados = () => {
  const { idUsuario, idEvaluacion } = useParams();
  const user = useUser();
  const navigate = useNavigate();

  // Estados optimizados
  const [respuestas, setRespuestas] = useState({});
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoizar valores derivados para evitar re-renders
  const colaborador = useMemo(() =>
    idUsuario != user?.user?.idUsuario,
    [idUsuario, user?.user?.idUsuario]
  );

  const usuario = useMemo(() =>
    colaborador
      ? user?.colaboradores?.colaboradores?.find(c => c.idUsuario == idUsuario)
      : user?.user,
    [colaborador, user?.colaboradores?.colaboradores, idUsuario, user?.user]
  );

  const evaluacion = useMemo(() =>
    usuario?.Evaluaciones?.find(ev => ev.idEvaluacion == idEvaluacion),
    [usuario?.Evaluaciones, idEvaluacion]
  );

  // Extraer comentarios de forma segura
  const comentariosData = useMemo(() => {
    if (!respuestas?.comentarios) return [];

    return respuestas.comentarios
      .map((c, index) => ({
        id: c.id || `comentario-${index}`,
        comentario: c.comentario || '',
        evaluador: c.evaluador || '',
        createdAt: c.fecha
      }));
  }, [respuestas?.comentarios]);

  // Fecha de registro memoizada
  const dateRegister = useMemo(() => {
    return respuestas?.comentarios
      ?.map(({ fecha }) => fecha)?.[0];
  }, [respuestas?.comentarios]);

  // Función para formatear fecha memoizada
  const formatearFecha = useCallback((fecha) => {
    if (!fecha) return '--/--/----';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '--/--/----';

    const opciones = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    };
    return new Intl.DateTimeFormat('es-ES', opciones).format(date).replace(',', '');
  }, []);

  // Función para calcular promedio memoizada
  const calcularPromedio = useCallback((competencias) => {
    if (!competencias?.length) return 0;
    const sumaPromedio = competencias.reduce((acc, curr) => acc + curr.promedio, 0);
    const promedio = sumaPromedio / competencias.length;
    return promedio.toFixed(1);
  }, []);

  useEffect(() => {
    // Evitar fetch si no tenemos los datos necesarios
    if (!user?.user?.idUsuario || !usuario?.idUsuario || !idEvaluacion) {
      return;
    }

    const fetchRespuestas = async () => {
      try {
        const [respuestasRes, calificacionesRes] = await Promise.all([
          axios.get(`${URLBASE}/respuestas`, {
            params: {
              idEvaluador: user.user.idUsuario,
              idColaborador: usuario.idUsuario,
              idEvaluacion: idEvaluacion
            }
          }),
          axios.get(`${URLBASE}/respuestas/calificacion`, { withCredentials: true })
        ]);

        setRespuestas(respuestasRes.data || {});
        setCalificaciones(calificacionesRes.data?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Ocurrió un error al obtener los resultados!");
      } finally {
        setLoading(false);
      }
    };

    fetchRespuestas();
  }, [user?.user?.idUsuario, usuario?.idUsuario, idEvaluacion]);

  if (loading) {
    return <Loading />;
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuario no encontrado</h2>
          <p className="text-gray-600 mb-6">No se pudo encontrar la información del usuario solicitado.</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-zvioleta hover:bg-zvioleta/90 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
          >
            <FaArrowLeft className="text-sm" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (respuestas?.evaluacion?.length === 0 && respuestas?.autoevaluacion?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaClipboardList className="text-yellow-600 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin resultados disponibles</h2>
          <p className="text-gray-600 mb-6">
            Aún no se han registrado resultados para la evaluación de <span className="font-medium text-znaranja">{usuario?.nombre}</span>.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-zvioleta hover:bg-zvioleta/90 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
          >
            <FaArrowLeft className="text-sm" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 print:p-0">
      {/* Header - No Print */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-zvioleta">DETALLE DE EVALUACIÓN</h1>
          <p className="text-znaranja">{usuario?.nombre}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded"
          >
            <FaArrowLeft />
            Volver
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-znaranja hover:bg-znaranja/90 text-white px-3 py-2 rounded"
          >
            <FaPrint />
            Imprimir
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded shadow-sm border border-gray-300 overflow-hidden print:shadow-none print:border-gray-400 print:rounded-none">
        <table className='w-full border-collapse' id='tabla-resultados'>
          {/* Header */}
          <thead>
            <tr>
              <td colSpan="4" className="p-0">
                <div className='grid grid-cols-3 border-b border-gray-400'>
                  <div className='flex justify-center items-center p-3 border-r border-gray-400'>
                    <img className='w-20 h-auto' src={usuario?.Empresas[0]?.urlLogo} alt={`logo-empresa-${usuario?.Empresas[0]?.nombre}`} />
                  </div>
                  <div className='text-center p-3 border-r border-gray-400'>
                    <h2 className='font-bold text-base'>{evaluacion?.nombre}</h2>
                    <p className='text-sm'>PROCESO: GESTIÓN HUMANA</p>
                  </div>
                  <div className='text-center p-3'>
                    <p className='text-sm'>Versión: 1</p>
                  </div>
                </div>
              </td>
            </tr>
          </thead>

          <tbody>
            {/* Información del Evaluado */}
            <tr>
              <td className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm'>Nombre del evaluado</td>
              <td className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm'>Cargo</td>
              <td className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm'>Fecha de ingreso</td>
              <td className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm'>Periodo</td>
            </tr>
            <tr>
              <td className='border border-gray-400 p-2 text-sm'>{usuario.nombre}</td>
              <td className='border border-gray-400 p-2 text-sm'>{usuario.cargo}</td>
              <td className='border border-gray-400 p-2 text-sm'>{formatearFecha(usuario.fechaIngreso)}</td>
              <td className='border border-gray-400 p-2 text-sm'>Año {evaluacion.year}</td>
            </tr>
            <tr>
              <td className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm'>Nombre del evaluador</td>
              <td colSpan="3" className='border border-gray-400 p-2 text-sm'>
                {respuestas?.evaluador?.map(ev => ev?.nombre?.toUpperCase()).join(', ') || 'Aún no disponible'}
              </td>
            </tr>

            {/* Objetivo */}
            <tr>
              <td colSpan="4" className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm'>OBJETIVO</td>
            </tr>
            <tr>
              <td colSpan="4" className='border border-gray-400 p-3 text-sm'>
                El objetivo de esta evaluación es valorar las competencias para identificar las fortalezas y puntos de mejora en cuanto al desempeño esperado.
              </td>
            </tr>

            {/* Espacio entre objetivo y escala */}
            <tr>
              <td colSpan="4" className='p-2'></td>
            </tr>

            {/* Escala de Calificación */}
            <tr>
              <td colSpan="4" className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm text-center'>ESCALA DE CALIFICACIÓN</td>
            </tr>
            {calificaciones?.map((calificacion) => (
              <tr key={calificacion.valor}>
                <td colSpan="3" className='border border-gray-400 p-2 text-sm'>{calificacion.descripcion}</td>
                <td className='border border-gray-400 p-2 text-center font-semibold'>{calificacion.valor}</td>
              </tr>
            ))}

            <tr>
              <td colSpan="4" className='p-2'></td>
            </tr>

            {/* Resultados */}
            <tr>
              <td colSpan="3" className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm'>COMPETENCIA</td>
              <td className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm text-center'>PROMEDIO</td>
            </tr>
            {respuestas?.evaluacion?.map((item, idx) => (
              <tr key={`evaluacion-${item.idCompetencia || item.index || idx}`}>
                <td colSpan="3" className='border border-gray-400 p-2 text-sm'>{item.nombre}</td>
                <td className='border border-gray-400 p-2 text-center font-semibold'>{item.promedio.toFixed(1)}</td>
              </tr>
            ))}

            <tr>
              <td colSpan="4" className='p-2'></td>
            </tr>

            {/* Promedios Finales */}
            <tr>
              <td colSpan="3" className='border border-gray-400 p-2 text-sm font-semibold'>AUTOEVALUACIÓN</td>
              <td className='border border-gray-400 p-2 text-center font-bold'>
                {respuestas?.autoevaluacion?.length > 0
                  ? calcularPromedio(respuestas?.autoevaluacion)
                  : 'En espera de resultados'
                }
              </td>
            </tr>
            <tr>
              <td colSpan="3" className='border border-gray-400 p-2 text-sm font-semibold'>EVALUACIÓN</td>
              <td className='border border-gray-400 p-2 text-center font-bold'>
                {respuestas?.evaluacion?.length > 0
                  ? calcularPromedio(respuestas?.evaluacion)
                  : colaborador && respuestas?.autoevaluacion?.length > 0
                    ? calcularPromedio(respuestas?.autoevaluacion)
                    : 'En espera de resultados'
                }
              </td>
            </tr>

            {/* Espacio entre promedios y comentarios */}
            <tr>
              <td colSpan="4" className='p-2'></td>
            </tr>

            {/* Comentarios */}
            <tr>
              <td colSpan="4" className='border border-gray-400 p-2 bg-gray-100 font-semibold text-sm'>COMENTARIOS</td>
            </tr>
            <tr>
              <td colSpan="4" className='border border-gray-400 p-3'>
                {comentariosData.length > 0 ? (
                  <div className='space-y-2'>
                    {comentariosData.map((comentario) => (
                      <div key={comentario.id} className='text-sm'>
                        <span className='font-semibold'>{comentario.evaluador}:</span>
                        <span className='ml-2'>{comentario.comentario || 'Sin comentario disponible'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center text-gray-500 italic text-sm'>
                    Aún no se han registrado comentarios
                  </div>
                )}
              </td>
            </tr>

            {/* Firmas */}
            <tr>
              <td colSpan="2" className='border border-gray-400 p-6 text-center'>
                <div>
                  <p className='text-xs text-gray-600 mb-1'>
                    {usuario?.nombre?.toUpperCase()}
                  </p>
                  <p className='text-xs text-gray-500 mb-6'>
                    ID: {usuario?.idUsuario}
                  </p>
                  <div className='border-t border-gray-400 pt-3'>
                    <div className='font-semibold text-sm'>EVALUADO</div>
                  </div>
                </div>
              </td>
              <td colSpan="2" className='border border-gray-400 p-6 text-center'>
                <div>
                  <p className='text-xs text-gray-600 mb-1'>
                    {respuestas?.evaluador?.map(ev => ev?.nombre?.toUpperCase()).join(', ') || 'PENDIENTE'}
                  </p>
                  {respuestas?.evaluador?.length > 0 && (
                    <p className='text-xs text-gray-500 mb-6'>
                      ID: {respuestas?.evaluador?.map(ev => ev?.idUsuario).join(', ')}
                    </p>
                  )}
                  {!respuestas?.evaluador?.length && (
                    <div className='mb-6'></div>
                  )}
                  <div className='border-t border-gray-400 pt-3'>
                    <div className='font-semibold text-sm'>EVALUADOR</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>

          {/* Footer */}
          <tfoot>
            <tr>
              <td colSpan="2" className='border border-gray-400 p-2 bg-gray-50 text-center'>
                <div className='text-xs'>
                  <span className='font-semibold'>Fecha registro:</span>
                  <span className='ml-1'>{formatearFecha(dateRegister)}</span>
                </div>
              </td>
              <td colSpan="2" className='border border-gray-400 p-2 bg-gray-50 text-center'>
                <div className='text-xs'>
                  <span className='font-semibold'>Fecha impresión:</span>
                  <span className='ml-1'>{formatearFecha(new Date())}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Resultados;
