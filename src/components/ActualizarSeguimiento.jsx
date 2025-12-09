import { useState, useEffect } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const ActualizarSeguimiento = ({idColaborador, idEvaluacion}) => {
  const [comentariosGenerales, setComentariosGenerales] = useState('');
  const [accionesMejoramiento, setAccionesMejoramiento] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [retroalimentacion, setRetroalimentacion] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const response = await axios.get(`${URLBASE}/evaluaciones/comentarios`, {
          params: { idColaborador, idEvaluacion }
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
              fechaCumplimiento: compromiso.fechaCumplimiento.split('T')[0], // Parse date
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

  return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-zvioleta">Comentarios Generales</h2>
        <p className='mt-2'>Comentario <span className='text-red-600 font-bold'>*</span></p>
        <textarea
          className="border w-full p-2 rounded-md focus:ring-1 focus:ring-znaranjaclaro focus:border-znaranjaclaro"
          placeholder="Escribe tus comentarios..."
          value={comentariosGenerales}
          required
          onChange={(e) => setComentariosGenerales(e.target.value)}
        />

        <>
          <h2 className="text-lg font-bold mt-4 text-zvioleta">Acciones de Mejoramiento</h2>
          {accionesMejoramiento?.length === 0 && <p className='text-gray-800'>No hay acciones de mejoramiento registradas.</p>}
          {accionesMejoramiento?.map((accion, index) => (
            <div key={index} className="mt-2 flex flex-col gap-3 border-b-2">
              <p className='-mb-2 mt-2'>Competencia <span className='text-red-600 font-bold'>*</span></p>
              <select
                className="border w-full rounded-md focus:ring-1 focus:ring-znaranjaclaro focus:border-znaranjaclaro"
                value={accion.idCompetencia}
                onChange={(e) => handleAccionChange(index, 'idCompetencia', e.target.value)}
                required
              >
                <option value="">Selecciona una competencia</option>
                {
                  competencias.map(competencia => (
                    <option key={competencia.idCompetencia} value={competencia.idCompetencia}>
                      {`${competencia.nombre}`}
                    </option>
                  ))
                }
              </select>
              <textarea
                className="border w-full rounded-md focus:ring-1 focus:ring-znaranjaclaro focus:border-znaranjaclaro"
                placeholder="Describe la acción de mejoramiento..."
                value={accion.comentario}
                onChange={(e) => handleAccionChange(index, 'comentario', e.target.value)}
                required
              />
              <select
                className="border w-full rounded-md focus:ring-1 focus:ring-znaranjaclaro focus:border-znaranjaclaro"
                value={accion.estado}
                onChange={(e) => handleAccionChange(index, 'estado', e.target.value)}
                required
              >
                <option value="">Selecciona el estado</option>
                <option value="Por Iniciar">Por iniciar</option>
                <option value="En curso">En curso</option>
                <option value="Finalizado">Finalizado</option>
              </select>
              <input
                type="date"
                value={accion.fechaCumplimiento}
                onChange={(e) => handleAccionChange(index, 'fechaCumplimiento', e.target.value)}
                required
              />
            </div>
          ))}
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
        <button onClick={submitComentarios} className="bg-zvioleta hover:bg-zvioleta/90 hover:scale-105 text-white p-2 rounded-md mt-4">
          Guardar y finalizar
        </button>
      </div>
  );
}

ActualizarSeguimiento.propTypes = {
  idEvaluacion: PropTypes.string,
  idColaborador: PropTypes.string,
};

export default ActualizarSeguimiento;
