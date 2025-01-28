import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URLBASE } from '../lib/actions';
import { useUser } from '../context/UserContext';
import { FaCheckCircle } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import Loading from './Loading';

const Evaluar = () => {
  const navigate = useNavigate();
  const user = useUser();
  
  // Estados para manejar la data, filtros y paginación
  const [loading, setLoading] = useState(true);
  const [filteredColaboradores, setFilteredColaboradores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    completado: 'todos',
    empresa: 'Todas',
    nombre: '',
  });

  const evaluarColaborador = (path, idUsuario) => {
    navigate(`/${path}/${idUsuario}`);
  };

  // Cargar los colaboradores al montar el componente
  useEffect(() => {
    if (user?.user?.idUsuario) {
      axios
        .get(`${URLBASE}/usuarios/evaluar`, { params: { idUsuario: user?.user.idUsuario } })
        .then((res) => {
          user.setColaboradores(res.data?.data);
          setFilteredColaboradores(res.data?.data.colaboradores || []);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  }, [user?.user?.idUsuario]);

  // Filtrado dinámico basado en los filtros seleccionados
  useEffect(() => {
    if (user?.colaboradores?.colaboradores) {
      const { completado, empresa, nombre } = filters;
      const filtered = user?.colaboradores?.colaboradores.filter((colaborador) => {
        const completadoFilter = completado === 'todos' || colaborador.usuariosEvaluadores.estado === (completado === "true");
        const empresaFilter = empresa === 'Todas' || colaborador.Empresas.some(e => e.nombre === empresa);
        const cargoFilter = nombre === '' || colaborador.nombre.toLowerCase().includes(nombre.toLowerCase());
        return completadoFilter && empresaFilter && cargoFilter;
      });
      setFilteredColaboradores(filtered);
      setCurrentPage(1); // Reiniciar a la primera página cuando se actualizan los filtros
    }
  }, [filters, user?.colaboradores?.colaboradores]);

  // Obtener lista única de empresas para el filtro
  // const empresasDisponibles = useMemo(() => {
  //   const empresas = user?.colaboradores?.colaboradores?.flatMap(colaborador => colaborador.Empresas) || [];
  //   const nombresEmpresas = [...new Set(empresas.map(empresa => empresa.nombre))];
  //   return ['Todas', ...nombresEmpresas];
  // }, [user?.colaboradores?.colaboradores]);

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
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-zvioleta">
        Lista de colaboradores a evaluar
      </h1>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap justify-between">
        <div className="mb-4">
          <label className="mr-2 font-semibold">Completado:</label>
          <select
            value={filters.completado}
            onChange={(e) => setFilters({ ...filters, completado: e.target.value })}
            className="border rounded px-2 py-1"
          >
            <option value="todos">Todos</option>
            <option value={true}>Completado</option>
            <option value={false}>No Completado</option>
          </select>
        </div>

        {/* <div className="mb-4">
          <label className="mr-2 font-semibold">Empresa:</label>
          <select
            value={filters.empresa}
            onChange={(e) => setFilters({ ...filters, empresa: e.target.value })}
            className="border rounded px-2 py-1"
          >
            {empresasDisponibles.map((empresa) => (
              <option key={empresa} value={empresa}>
                {empresa}
              </option>
            ))}
          </select>
        </div> */}

        <div className="mb-4">
          <label className="mr-2 font-semibold">Nombre:</label>
          <input
            type="text"
            value={filters.nombre}
            onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
            className="border rounded px-2 py-1"
            placeholder="Nombre de usuario"
          />
        </div>
      </div>

      {/* Lista de colaboradores */}
      <ul className="divide-y divide-gray-200">
        {visibleColaboradores.map((colaborador) => (
          <li key={colaborador.idUsuario} className="py-4">
            <div className="flex justify-between items-center lg:flex-row flex-col">
              <div className="md:grid md:grid-cols-4 w-3/4 capitalize md:w-full flex flex-col justify-items-center lg:justify-items-start">
                <h2 className="text-lg font-semibold text-gray-700">{colaborador.nombre.toLowerCase()}</h2>
                <p className="text-gray-500 capitalize pr-6">{colaborador.cargo.toLowerCase()}</p>
                {/* <p className="text-gray-500">
                  {colaborador.Empresas.length > 0
                    ? colaborador.Empresas.map((empresa) => (
                        <span key={empresa.idEmpresa} className="text-gray-500">
                          {empresa.nombre}{' '}
                        </span>
                      ))
                    : '❌ No asignado'}
                </p> */}
                {colaborador.usuariosEvaluadores.estado ? (
                  <FaCheckCircle color="#07bc0c" size={25} />
                ) : (
                  <MdCancel color="#ff2d55" size={25} />
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => evaluarColaborador('evaluacion', colaborador.idUsuario)}
                  disabled={colaborador.usuariosEvaluadores.estado || !colaborador?.Empresas[0]?.idEmpresa}
                  className="bg-green-600 text-white py-1 disabled:cursor-not-allowed disabled:bg-green-600/50 px-3 rounded-md shadow-md hover:bg-green-700 focus:outline-none transition"
                >
                  Evaluar
                </button>
                <button
                  onClick={() => evaluarColaborador('resultados', colaborador.idUsuario)}
                  className="bg-blue-600 text-white py-1 px-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none transition disabled:cursor-not-allowed disabled:bg-blue-600/50"
                  disabled={!colaborador?.Empresas[0]?.idEmpresa}
                >
                  Resultados
                </button>
                <button
                  onClick={() => evaluarColaborador('seguimiento', colaborador.idUsuario)}
                  disabled={!colaborador?.Empresas[0]?.idEmpresa}
                  className="bg-yellow-500 text-white py-1 px-3 rounded-md shadow-md hover:bg-yellow-600 focus:outline-none transition disabled:cursor-not-allowed disabled:bg-yellow-500/50"
                >
                  Seguimiento
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
    </div>
  );
};

export default Evaluar;
