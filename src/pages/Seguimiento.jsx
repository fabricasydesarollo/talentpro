import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import ComentariosAcciones from '../components/ComentariosAcciones';
import { useUser } from '../context/UserContext';
import ActualizarSeguimiento from '../components/ActualizarSeguimiento';
import Loading from './Loading';
import apiClient from '../lib/utils.js';

const Seguimiento = () => {
  const [competencias, setCompetencias] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga

  const { idUsuario, idEvaluacion } = useParams();
  const idColaborador = idUsuario;
  const user = useUser();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const response = await apiClient.get(`/evaluaciones/comentarios`, {
          params: { idColaborador, idEvaluacion, idEvaluador: user.user?.idUsuario },
        });
        setCompetencias(response.data?.data);
      } catch {
        toast.error("Ocurrió un error al obtener los datos.");
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };

    obtenerDatos();
  }, [idColaborador, idEvaluacion]);

  if (loading) {
    return (
      <Loading />
    );
  }


  return (
    Object.keys(competencias).length > 1 ? (
      <div className='w-9/12 h-auto'>
        <ActualizarSeguimiento
          idColaborador={idColaborador}
          idEvaluacion={idEvaluacion}
          idEvaluador={user?.user?.idUsuario}
        />
      </div>
    ) : (
      <div className='w-9/12 h-auto'>
        <ComentariosAcciones
          idColaborador={Number(idColaborador)}
          idEvaluacion={Number(idEvaluacion)}
          idEvaluador={user?.user?.idUsuario}
        />
      </div>
    )
  );
};

export default Seguimiento;
