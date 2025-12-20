import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import Loading from './Loading';
import DetallesEvaluación from '../components/DetallesEvaluación';
import { toast } from 'sonner';

const Evaluar = () => {
  const user = useUser();

  const [loading, setLoading] = useState(true);
  const [filteredColaboradores, setFilteredColaboradores] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
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
    <div className="bg-gray-50 min-h-screen w-full p-3">
      <h1 className="text-3xl font-bold text-zvioleta mb-6 text-center flex items-center justify-center">
        <svg className="w-7 h-7 mr-3 text-zvioleta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Evaluar Colaboradores
      </h1>

      {/* Filtros compactos */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-zvioleta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-800">Filtros</h2>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {filteredColaboradores.length} colaborador{filteredColaboradores.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Filtro de Evaluación */}
          <div>
            <label htmlFor="evaluacion" className="block text-xs font-medium text-gray-700 mb-1">
              Evaluación <span className="text-red-500">*</span>
            </label>
            <select
              id="evaluacion"
              value={idEvaluacion}
              onChange={(e) => setIdEvaluacion(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-1 focus:ring-zvioleta focus:border-zvioleta px-3 py-2 pr-8 appearance-none"
            >
              {evaluaciones.map((evaluacion) => (
                <option key={evaluacion.idEvaluacion} value={evaluacion.idEvaluacion}>
                  {evaluacion.nombre} {evaluacion.year}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Empresa */}
          <div>
            <label htmlFor="empresa" className="block text-xs font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <select
              id="empresa"
              value={filters.empresa}
              onChange={(e) => setFilters({ ...filters, empresa: e.target.value })}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-1 focus:ring-zvioleta focus:border-zvioleta px-3 py-2 pr-8 appearance-none"
            >
              {empresasDisponibles.map((empresa) => (
                <option key={empresa} value={empresa}>
                  {empresa}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Nombre */}
          <div>
            <label htmlFor="nombre-colaborador" className="block text-xs font-medium text-gray-700 mb-1">
              Buscar colaborador
            </label>
            <div className="relative">
              <input
                type="text"
                id="nombre-colaborador"
                value={filters.nombre}
                onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-1 focus:ring-zvioleta focus:border-zvioleta px-3 py-2 pl-8"
                placeholder="Nombre..."
              />
              <div className="absolute inset-y-0 left-0 flex items-center px-2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {filters.nombre && (
                <button
                  onClick={() => setFilters({ ...filters, nombre: '' })}
                  className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {(filters.empresa !== 'Todas' || filters.nombre) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setFilters({ empresa: 'Todas', nombre: '' })}
              className="text-xs text-zvioleta hover:text-zvioleta/80 font-medium flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de colaboradores compacta */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        {filteredColaboradores.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h4 className="text-sm font-medium text-gray-900 mb-1">No se encontraron colaboradores</h4>
            <p className="text-xs text-gray-500">
              {filters.empresa !== 'Todas' || filters.nombre
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay colaboradores disponibles para evaluar'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleColaboradores.map((colaborador, index) => (
                  <tr
                    key={colaborador.idUsuario}
                    className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-7 w-7">
                          <div className="h-7 w-7 rounded-full bg-zvioleta/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-zvioleta">
                              {colaborador.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {colaborador.nombre.toLowerCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {colaborador.idUsuario}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900 capitalize">
                        {colaborador.cargo.toLowerCase()}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {colaborador.Empresas.length > 0 ? (
                          colaborador.Empresas.map((empresa) => (
                            <span
                              key={empresa.idEmpresa}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {empresa.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Sin asignar
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => {
                          setOpenModal(true);
                          setIdUsuario(colaborador.idUsuario);
                        }}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-zverde hover:bg-zverdeclaro focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zverde transition-colors"
                        aria-label={`Ver acciones para ${colaborador.nombre}`}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Acciones
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación compacta */}
      {itemsPerPage && (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 px-4 py-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-700">
              <span>
                {startIndex + 1}-{Math.min(endIndex, filteredColaboradores.length)} de {filteredColaboradores.length}
              </span>
            </div>

            <nav className="flex items-center space-x-1" aria-label="Paginación">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="px-2 py-1 text-xs text-gray-700">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página siguiente"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      )}
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
