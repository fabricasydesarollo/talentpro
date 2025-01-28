import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { URLBASE } from '../lib/actions';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import Loading from './Loading';

const Resultados = () => {
  const { idUsuario } = useParams();
  const user = useUser();
  const [respuestas, setRespuestas] = useState({});
  const [calificaciones, setCalificaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRespuestas = async () => {
      try {
        const respuesta = await axios.get(`${URLBASE}/respuestas`, { params: { idEvaluador: user.user?.idUsuario, idColaborador: usuario?.idUsuario, idEvaluacion: 1 } });
        setRespuestas(respuesta.data);

        const calificacionesRes = await axios.get(`${URLBASE}/respuestas/calificacion`, { withCredentials: true })
        setCalificaciones(calificacionesRes.data?.data)
      } catch {
        toast.error("Ocurrio un error al obtener los resultados!")
      } finally {
        setLoading(false)
      }
    };

    fetchRespuestas();
  }, [idUsuario, user?.user?.idUsuario]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 0;
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 0; // Verifica si la fecha es válida
    const opciones = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    };
    return new Intl.DateTimeFormat('es-ES', opciones).format(date).replace(',', '');
  };

  const usuario = user?.colaboradores?.colaboradores.find(c => c.idUsuario == idUsuario) || user?.colaboradores || user?.user;

  if (!respuestas || !respuestas.evaluacion?.length === 0 || !respuestas.autoevaluacion?.length === 0) {
    return <p className='text-center pt-10'>Aún no hay registros</p>
  }

  
  const dateRegister = respuestas?.compromisos?.filter(({ TipoEvaluacione }) => TipoEvaluacione.nombre === "EVALUACIÓN")
  .map(({ createdAt }) => createdAt)[0];
  
  const calcularPromedio = (competencias) => {
    if (competencias?.length === 0) return 0
    const sumaPromedio = competencias?.reduce((acc, curr) => acc + curr.promedio, 0)
    const promedio = sumaPromedio / competencias?.length
    return promedio.toFixed(1)
  }

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-7xl my-2 mx-auto print:shadow-none">
      <h1 className="text-2xl font-bold mb-6 text-zvioleta text-center my-5 print:hidden">{`Resultados de evaluación ${usuario?.nombre}`}</h1>
      <div className='w-full flex justify-end'>
        <button
          onClick={() => window.print()}
          className="bg-znaranja text-white py-2 px-4 rounded-lg mb-2 print:hidden"
        >
          Imprimir
        </button>
      </div>
      {/* Estructura de tabla */}
      <table className='w-full flex flex-col' id='tabla-resultados'>
        <thead className=''>
          <tr className='grid border grid-cols-3 font-semibold justify-items-center items-center'>
            <th className='row-span-2'>
              <img className=' w-32 p-1 h-auto' src={usuario.Empresas[0].urlLogo} alt={`logo-empresa-${usuario.Empresas[0].nombre}`} />
            </th>
            <th className='border-b py-2'>EVALUACIÓN DE DESEMPEÑO</th>
            <th className='border-l px-4 row-span-2'>{`Versión: ${1}`}</th>
            <th>PROCESO: GESTIÓN HUMANA</th>
          </tr>
        </thead>
        <tbody className=''>
          <tr className='grid grid-cols-4 mt-4 border p-1'>
            <th className='border-b text-start'>Nombre del evaluado</th>
            <th className='border-b text-start'>Cargo</th>
            <th className='border-b text-start'>Fecha de ingreso</th>
            <th className='border-b text-start'>Periodo</th>
            <td className='border-b'>{usuario.nombre}</td>
            <td className='border-b'>{usuario.cargo}</td>
            <td className='border-b'>{formatearFecha(usuario.fechaIngreso)}</td>
            <td className='border-b'>Año 2024</td>
            <th className='text-start'>Nombre del evaluador</th>
            <td className='col-span-3'>{user.user.nombre}</td>
          </tr>
          <tr className='grid grid-cols-2 border mt-2'>
            <th className='col-span-2 text-start border-b'>Objetivo</th>
            <td className='col-span-2 pb-2'>El objetivo de esta evaluación es valorar las competencias para identificar las fortalezas y puntos de mejora en cuanto al desempeño esperado.</td>
          </tr>
          <tr className='grid grid-cols-4 mt-4 p-1 mb-4'>
            <th className='col-span-4 border font-bold my-3'>Escala de calificación</th>
            {
              calificaciones?.map((calificacion) => (
                <>
                  <td className='col-span-3 p-1 border' key={calificacion.descripcion}>{calificacion.descripcion}</td>
                  <td className='text-center border' key={calificacion.valor}>{calificacion.valor}</td>
                </>
              ))
            }
          </tr>
          <tr className="mt-2 grid grid-cols-4">
            <th className="border border-gray-300 col-span-3 px-4 py-2 text-left">Competencia</th>
            <th className="border border-gray-300 px-4 py-2 col-span-1 text-left">Promedio</th>
          </tr>
          {respuestas?.evaluacion?.map(({ index, nombre, promedio }) => {
            return (
              <tr key={index} className="grid grid-cols-4">
                <td className="border border-gray-300 px-4 py-2 col-span-3">
                  {nombre}
                </td>
                <td className="border border-gray-300 px-4 py-2 col-span-1 text-center">
                  {promedio.toFixed(1)}
                </td>
              </tr>
            );
          })}
          <tr className='grid  grid-cols-4 border my-1'>
            <th className='col-span-3'>PROMEDIO EVALUACIÓN</th>
            <th className='col-span-1 text-center'>{respuestas?.evaluacion.length > 0 ? calcularPromedio(respuestas?.evaluacion) : 'En espera de resultados'}</th>
          </tr>
          <tr className='grid  grid-cols-4 border my-1'>
            <th className='col-span-3'>PROMEDIO AUTOEVALUACIÓN</th>
            <th className='col-span-1 text-center'>{respuestas?.evaluacion.length > 0 ? calcularPromedio(respuestas?.autoevaluacion) : 'En espera de resultados'}</th>
          </tr>
          <tr className='grid grid-cols-1 border'>
            <th className='text-start'>Comentarios</th>
            {respuestas?.compromisos?.map(({ index, TipoEvaluacione, comentario }) => (
              <td key={index} className='border'>{`${TipoEvaluacione.nombre === "EVALUACIÓN" ? comentario : '*'}`}</td>
            ))}
          </tr>
          <tr className='grid grid-cols-2 border justify-items-center border-collapse gap-3'>
            <th>Nombre y cédula evaluador</th>
            <th>Nombre y cédula evaluado</th>
            <td>{user.user.nombre} - {user.user.idUsuario}</td>
            <td>{usuario.nombre} - {usuario.idUsuario}</td>
          </tr>
        </tbody>
        <tfoot className='border grid grid-cols-2 my-4'>
          <tr className='flex justify-center'>
            <th>Fecha registro</th>
            <th className='font-normal ml-3'>{formatearFecha(dateRegister)}</th>
          </tr>
          <tr className='flex justify-center'>
            <th>Fecha impresión</th>
            <th className='font-normal ml-3'>{formatearFecha(new Date())}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Resultados;
