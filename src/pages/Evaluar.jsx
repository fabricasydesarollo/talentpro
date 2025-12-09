import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import Loading from './Loading';
import DetallesEvaluación from '../components/DetallesEvaluación';
import { toast } from 'react-toastify';

const Evaluar = () => {
  const user = useUser();

  // Estados para manejar la data, filtros y paginación
  const [loading, setLoading] = useState(true);
  const [filteredColaboradores, setFilteredColaboradores] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [openModal, setOpenModal] = useState(false);
  const [idUsuario, setIdUsuario] = useState(null);
  const [idEvaluacion, setIdEvaluacion] = useState(0);

  const [filters, setFilters] = useState({
    empresa: 'Todas',
    nombre: '',
  });

  
  useEffect(() => {
    async function fetchEvaluaciones() {
      if (user?.user?.idUsuario) {
        try {
          setLoading(true);
          const res = await axios.get(`${URLBASE}/evaluaciones/gestionar`);
          setEvaluaciones(res.data?.data || []);
          // Setea el ID maximo por defecto
          setIdEvaluacion(res.data?.data[0]?.idEvaluacion || null);
          setIdEvaluacion(Math.max(...res.data?.data.map(ev => ev.idEvaluacion)))
        } catch (error) {
          toast.error("Ocurrió un error al cargar las evaluaciones", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchEvaluaciones();
  }, [user?.user?.idUsuario]);


  useEffect(() => {
    async function fetchColaboradores() {
      if (user?.user?.idUsuario && idEvaluacion) {
        try {
          setLoading(true);
          const res = await axios.get(`${URLBASE}/usuarios/evaluar`, {
            params: {
              idUsuario: user.user.idUsuario,
              idEvaluacion: idEvaluacion,
            },
          });
          user.setColaboradores(res.data.data || []);
          setFilteredColaboradores(res.data.data?.colaboradores || []);
        } catch (error) {
          toast.error("Ocurrió un error al cargar los colaboradores", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchColaboradores();
  }, [idEvaluacion, user?.user?.idUsuario]);


  // Filtrado dinámico basado en los filtros seleccionados
  useEffect(() => {
    if (user?.colaboradores?.colaboradores) {
      const { completado, empresa, nombre } = filters;
      const filtered = user?.colaboradores?.colaboradores.filter((colaborador) => {
        const empresaFilter = empresa === 'Todas' || colaborador.Empresas.some(e => e.nombre === empresa);
        const cargoFilter = nombre === '' || colaborador.nombre.toLowerCase().includes(nombre.toLowerCase());
        return empresaFilter && cargoFilter;
      });
      setFilteredColaboradores(filtered);
      setCurrentPage(1); // Reiniciar a la primera página cuando se actualizan los filtros
    }
  }, [filters, user?.colaboradores?.colaboradores]);

  // Obtener lista única de empresas para el filtro
  const empresasDisponibles = useMemo(() => {
    const empresas = user?.colaboradores?.colaboradores?.flatMap(colaborador => colaborador.Empresas) || [];
    const nombresEmpresas = [...new Set(empresas.map(empresa => empresa.nombre))];
    return ['Todas', ...nombresEmpresas];
  }, [user?.colaboradores?.colaboradores]);

  // Determinar el rango de colaboradores a mostrar en la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleColaboradores = filteredColaboradores.slice(startIndex, endIndex);

  // Funciones para manejar la paginación
  const totalPages = Math.ceil(filteredColaboradores.length / itemsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return <Loading />
  }

  return (
    <div className=" bg-gray-50 min-h-screen w-full p-5">
      <h1 className="text-4xl font-extrabold text-zvioleta mb-8 text-center tracking-tight">
        Evaluación de equipo
      </h1>

      {/* Filtros */}
      <div className="mb-6 flex justify-between w-full items-center">
        <select
          id="evaluacion"
          value={idEvaluacion}
          onChange={(e) => setIdEvaluacion(Number(e.target.value))}
          className="w-full max-w-sm bg-white border border-zvioleta text-zvioleta text-sm rounded-lg focus:ring-zvioleta focus:border-zvioleta block px-4 py-2 shadow-sm transition duration-150 ease-in-out"
        >
          {evaluaciones.map((evaluacion) => (
            <option key={evaluacion.idEvaluacion} value={evaluacion.idEvaluacion}>
              {evaluacion.nombre} {evaluacion.year}
            </option>
          ))}
        </select>
        <select
          id="empresa"
          value={filters.empresa}
          onChange={(e) => setFilters({ ...filters, empresa: e.target.value })}
          className="w-full max-w-sm bg-white border border-zvioleta text-zvioleta text-sm rounded-lg focus:ring-zvioleta focus:border-zvioleta block px-4 py-2 shadow-sm transition duration-150 ease-in-out"
        >
          {empresasDisponibles.map((empresa) => (
            <option key={empresa} value={empresa}>
              {empresa}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={filters.nombre}
          onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
          className="w-full max-w-sm bg-white border border-zvioleta text-zvioleta text-sm rounded-lg focus:ring-zvioleta focus:border-zvioleta block px-4 py-2 shadow-sm transition duration-150 ease-in-out"
          placeholder="Nombre del colaborador"
        />
      </div>

      {/* Lista de colaboradores */}
      <ul className="divide-y divide-gray-200">
        {visibleColaboradores.map((colaborador) => (
          <li key={colaborador.idUsuario} className="py-4">
            <div className="flex justify-between items-center md:flex-row lg:flex-row flex-col">
              <div className="md:grid md:grid-cols-4 w-3/4 capitalize md:w-full flex flex-col justify-items-center lg:justify-items-start">
                <h2 className="text-lg font-semibold text-gray-700">{colaborador.nombre.toLowerCase()}</h2>
                <p className="text-gray-500 capitalize pr-6">{colaborador.cargo.toLowerCase()}</p>
                <p className="text-gray-500">
                  {colaborador.Empresas.length > 0
                    ? colaborador.Empresas.map((empresa) => (
                      <span key={empresa.idEmpresa} className="text-gray-500">
                        {empresa.nombre}{' '}
                      </span>
                    ))
                    : '❌ No asignado'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => { setOpenModal(true); setIdUsuario(colaborador.idUsuario); }}
                  className='bg-zverde text-white py-1 px-3 rounded-md shadow-md hover:bg-zverdeclaro/90 hover:text-black/35 hover:scale-105 focus:outline-none transition'>
                  Acciones
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Paginación */}
      <div className="flex justify-center mt-6">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm disabled:cursor-not-allowed font-medium text-white bg-zvioleta hover:bg-zvioleta/90 rounded-md"
        >
          Anterior
        </button>
        <span className="px-4 py-2">{`Página ${currentPage} de ${totalPages}`}</span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-white bg-zvioleta hover:bg-zvioleta/90 rounded-md"
        >
          Siguiente
        </button>
      </div>
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 overflow-auto">
          <div className="bg-white rounded-lg p-6 lg:w-7/12 md:w-9/12 sm:w-8/12 max-h-screen overflow-y-auto relative">
            <button onClick={() => setOpenModal(false)} className="bg-znaranja text-white w-8 h-8 m-2 absolute top-0 right-0 rounded-full flex items-center justify-center hover:scale-105 hover:shadow-3xl hover:bg-znaranja/90"> X </button>
            <DetallesEvaluación setOpenModal={setOpenModal} idUsuario={idUsuario} idEvaluacion={idEvaluacion} colaborador={true} />
          </div>
        </div>)}
    </div>
  );
};

export default Evaluar;
