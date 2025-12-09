import { useState, useEffect } from 'react';
import axios from 'axios'; // Para hacer peticiones HTTP
import { URLBASE } from '../lib/actions.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Para la redirección
import PropTypes from 'prop-types'

const ComentariosAcciones = ({ idEvaluacion, idEvaluador, idColaborador, esEvaluador }) => {
  const [comentariosGenerales, setComentariosGenerales] = useState('');
  const [accionesMejoramiento, setAccionesMejoramiento] = useState([]);
  const [competenciasFiltradas, setCompetenciasFiltradas] = useState([]);
  const [retroalimentacion, setRetroalimentacion] = useState(false);
  const [respuestas, setRespuestas] = useState([])
  const navigate = useNavigate(); // Hook para navegar

  // Fetch competencias solo si es evaluador
  useEffect(() => {
      const obtenerDatos = async () => {
        try {
          const responseCompetencias = await axios.get(`${URLBASE}/respuestas`, { params: { idEvaluador, idColaborador, idEvaluacion } });
          setRespuestas(responseCompetencias.data)
          setCompetenciasFiltradas(responseCompetencias.data?.evaluacion);
        } catch {
          toast.error("Ocurrió un error al obtener las competencias ???.");
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

    console.log("¿Puede enviar?", pass);

    const puedeEnviar = comentariosGenerales.length > 0 && (!esEvaluador || pass);

    console.log(puedeEnviar)
    if (puedeEnviar) {
      try {
        // Guardar comentarios generales
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
                idEvalRealizada, // Obtenido del comentario registrado
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
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-zvioleta">Comentarios Generales</h2>
        <p className='mt-2'>Comentario <span className='text-red-600 font-bold'>*</span></p>
        <textarea
          className={`border w-full p-2 rounded-md focus:ring-1 focus:ring-znaranjaclaro focus:border-znaranjaclaro`}
          placeholder="Escribe tus comentarios..."
          value={comentariosGenerales}
          required
          onChange={(e) => setComentariosGenerales(e.target.value)}
        />

      {esEvaluador && (
        <>
          <h2 className="text-lg font-bold mt-4 text-zvioleta">Acciones de Mejoramiento</h2>
          <p className='my-2'>
          A continuación, elabora el plan de desarrollo enfocado en las competencias con puntajes por debajo de lo esperado. Selecciona mínimo 1 máximo 3. 
          </p>
          <p>Consulta las ideas que te damos en Guía de Desarrollo haciendo clic <a href="https://grupozentria.sharepoint.com/:f:/s/TD-TI-Zentria/RRHH/ErcFIunNaDlLjoaRMWxog3cByTRhRz7bz_9EtNFtgwHcIg" target='_blank' className='underline text-znaranja'>aquí.</a></p>
          {accionesMejoramiento.map((accion, index) => (
            <div key={index} className="mt-2 flex flex-col gap-3 border-b-2">
              <p className='-mb-2 mt-2'>Competencia <span className='text-red-600 font-bold'>*</span></p>
              <select
                className="border w-full rounded-md focus:ring-1 focus:ring-znaranjaclaro focus:border-znaranjaclaro"
                value={accion.idCompetencia}
                required
                onChange={(e) => handleAccionChange(index, 'idCompetencia', e.target.value)}
              >
                <option value="">Selecciona una competencia</option>
                {
                  competencias.map(competencia => (
                      <option key={competencia.idCompetencia} value={competencia.idCompetencia}>{`${competencia.nombre} (${competencia.promedio.toFixed(1)})`}</option>
                  ))
                }
              </select>
              <p className='-mb-2 mt-2'>Descripción <span className='text-red-600 font-bold'>*</span></p>
              <textarea
                className="border w-full rounded-md focus:ring-1 focus:ring-znaranjaclaro focus:border-znaranjaclaro"
                placeholder="Describe la acción de mejoramiento..."
                value={accion.comentario}
                required
                onChange={(e) => handleAccionChange(index, 'comentario', e.target.value)}
              />
              <p className='-mb-2'>Estado <span className='text-red-600 font-bold'>*</span></p>
              <select
                className="border w-full rounded-md focus:ring-1 focus:ring-znaranjaclaro focus:border-znaranjaclaro"
                value={accion.estado}
                required
                onChange={(e) => handleAccionChange(index, 'estado', e.target.value)}
              >
                <option value="" className=''>Selecciona el estado</option>
                <option value="En curso">En curso</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Por iniciar">Por iniciar</option>
              </select>
              <p className='-mb-2'>Fecha de cumplimiento <span className='text-red-600 font-bold'>*</span></p>
              <input
                type="date"
                required
                className="border w-full rounded-md focus:ring-1 focus:ring-znaranjaclaro focus:border-znaranjaclaro mb-7"
                value={accion.fechaCumplimiento}
                onChange={(e) => handleAccionChange(index, 'fechaCumplimiento', e.target.value)}
                title='Fecha del compromiso'
              />
            </div>
          ))}
          <button onClick={agregarAccion} disabled={competencias.length === accionesMejoramiento.length} className={`bg-zvioleta text-white p-2 rounded-md mt-4 mr-4 ${competencias.length === accionesMejoramiento.length ? 'cursor-not-allowed': null}`} >
            Agregar Acción
          </button>
          <button onClick={quitarAccion} disabled={accionesMejoramiento.length === 0 } className={`bg-zvioleta text-white p-2 rounded-md mt-4 ${accionesMejoramiento.length === 0 ? 'cursor-not-allowed': null}`} >
            Quitar Acción
          </button>
          <div className="my-6 mt-10 flex items-center">
            <input
              type="checkbox"
              id="retroalimentacion-checkbox"
              checked={retroalimentacion}
              onChange={(e) => setRetroalimentacion(e.target.checked)}
              className="h-5 w-5 rounded-lg appearance-none border-znaranja focus:ring-zvioleta text-znaranja  checked:bg-znaranja checked:border-znaranja focus:outline-none focus:ring-2"
            />
            <label htmlFor="retroalimentacion-checkbox" className="ml-2">
              Confirmo que he realizado la retroalimentación
            </label>
          </div>
        </>

      )}
      <button type='button' onClick={submitComentarios} className="bg-zvioleta hover:bg-zvioleta/90 hover:scale-105 text-white p-2 rounded-md mt-4">
        Guardar y finalizar
      </button>
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
