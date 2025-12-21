import axios from "axios";
import { useEffect, useState } from "react";
import { URLBASE } from "../lib/actions";
import { normalizarData } from "../lib/utils";
import { FaTimes, FaSave, FaUsers, FaBuilding, FaSearch, FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";

const AsignarEvaluacion = ({ idEvaluacion, setShowAsignar }) => {

  const [usuarios, setUsuarios] = useState([])
  const [evaluaciones, setEvaluaciones] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([])
  const [usuariosNormalizados, setUsuariosNormalizados] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [filtroEmpresa, setFiltroEmpresa] = useState('')
  const [filtroNombre, setFiltroNombre] = useState('')

  useEffect(() => {
    const fechData = async () => {
      try {
        setIsLoading(true)
        const [usuariosRes, evaluacionesRes] = await Promise.all([
          axios.get(`${URLBASE}/usuarios/obtenerListaUsuarios`),
          axios.get(`${URLBASE}/evaluaciones/obtenerEvaluacionesAsignadas`, {
            params: {
              idEvaluacion: idEvaluacion
            }
          })
        ])
        setUsuarios(usuariosRes.data?.resultados)
        setEvaluaciones(evaluacionesRes.data?.resultados)
      } catch (error) {
        toast.error('Error al cargar datos', {
          description: 'No se pudieron obtener los usuarios'
        })
      } finally {
        setIsLoading(false)
      }
    }
    fechData()
  }, [idEvaluacion])

  useEffect(() => {
    const empresasMap = new Map();
    usuarios.forEach(user => {
      if (user.idEmpresa != null && user.empresa != null) {
        empresasMap.set(user.idEmpresa, {
          idEmpresa: user.idEmpresa,
          nombre: user.empresa
        });
      }
    });

    setEmpresas(Array.from(empresasMap.values()));
  }, [usuarios]);

  useEffect(() => {
    const normalized = normalizarData(usuarios, evaluaciones);
    setUsuariosNormalizados(normalized);
    // Apply current filters to the normalized data
    aplicarFiltros(normalized, filtroEmpresa, filtroNombre);
  }, [usuarios, evaluaciones, filtroEmpresa, filtroNombre]);

  function aplicarFiltros(usuarios, empresa, nombre) {
    let filtrados = usuarios;

    // Filtrar por empresa
    if (empresa !== '') {
      filtrados = filtrados.filter(user => user.idEmpresa == empresa);
    }

    // Filtrar por nombre o documento
    if (nombre !== '') {
      filtrados = filtrados.filter(user =>
        user.nombre.toLowerCase().includes(nombre.toLowerCase()) ||
        user.idUsuario.toString().includes(nombre)
      );
    }

    setUsuariosFiltrados(filtrados);
    setCurrentPage(1);
  }

  function filtrarUsuariosEmpresas(idEmpresa) {
    setFiltroEmpresa(idEmpresa);
    // Reset to first page when filter changes
    setCurrentPage(1);
  }

  function filtrarUsuariosNombre(nombre) {
    setFiltroNombre(nombre);
    // Reset to first page when filter changes
    setCurrentPage(1);
  }

  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(usuariosFiltrados.length / pageSize);
  const paginatedData = usuariosFiltrados.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function toggleSeleccionarTodosEvaluacion(checked) {
    setUsuariosFiltrados(prev =>
      prev.map(user => ({ ...user, evaluacion: checked }))
    );
  }

  function toggleSeleccionarTodosAutoEvaluacion(checked) {
    setUsuariosFiltrados(prev =>
      prev.map(user => ({ ...user, autoevaluacion: checked }))
    );
  }

  function dividirLista(lista, tamanioSublistas) {
    const sublistas = [];
    for (let i = 0; i < lista.length; i += tamanioSublistas) {
      sublistas.push(lista.slice(i, i + tamanioSublistas));
    }
    return sublistas;
  }

  async function handleGuardarAsignacion() {
    setIsSaving(true);
    const ListaAsignar = usuariosFiltrados.map(u => ({
      idUsuario: u.idUsuario,
      evaluacion: u.evaluacion,
      autoevaluacion: u.autoevaluacion,
      idEvaluacion: idEvaluacion
    }));

    const sublistas = dividirLista(ListaAsignar, 100);

    try {
      await Promise.all(
        sublistas.map(sublista =>
          axios.post(`${URLBASE}/evaluaciones/asignarEvaluaciones`, {
            ListaAsignar: sublista
          })
        )
      );
      
      toast.success('Asignaciones guardadas', {
        description: 'Las evaluaciones se asignaron correctamente'
      });
      
      setShowAsignar(false);
    } catch (error) {
      toast.error('Error al guardar', {
        description: 'No se pudieron guardar las asignaciones'
      });
    } finally {
      setIsSaving(false);
    }
  }

  const selectedCount = usuariosFiltrados.filter(u => u.evaluacion || u.autoevaluacion).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-zvioleta to-zvioletaopaco text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaUsers className="text-2xl" />
              <div>
                <h1 className="text-2xl font-bold">Asignar Evaluación</h1>
                <p className="text-white/90 text-sm">Selecciona usuarios para asignar evaluaciones</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedCount > 0 && (
                <div className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                  {selectedCount} seleccionados
                </div>
              )}
              <button
                onClick={handleGuardarAsignacion}
                disabled={isSaving || selectedCount === 0}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave className="text-sm" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowAsignar(false)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaTimes className="text-sm" />
                Cerrar
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaSearch className="text-zvioleta" />
                Filtros
              </h3>
              {(filtroEmpresa !== '' || filtroNombre !== '') && (
                <button
                  onClick={() => {
                    setFiltroEmpresa('');
                    setFiltroNombre('');
                  }}
                  className="text-sm text-zvioleta hover:text-zvioletaopaco transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa {filtroEmpresa !== '' && <span className="text-zvioleta">•</span>}
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <select
                    onChange={(e) => filtrarUsuariosEmpresas(e.target.value)}
                    id="empresa"
                    value={filtroEmpresa}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all ${
                      filtroEmpresa !== '' ? 'border-zvioleta bg-zvioleta/5' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Todas las empresas</option>
                    {empresas?.map(empresa => (
                      <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
                        {empresa?.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario {filtroNombre !== '' && <span className="text-zvioleta">•</span>}
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    id="usuario"
                    placeholder="Buscar por nombre o documento"
                    value={filtroNombre}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all ${
                      filtroNombre !== '' ? 'border-zvioleta bg-zvioleta/5' : 'border-gray-300'
                    }`}
                    onChange={(e) => filtrarUsuariosNombre(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="evaluacion-all"
                    className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                    onChange={(e) => toggleSeleccionarTodosEvaluacion(e.target.checked)}
                  />
                  <label htmlFor="evaluacion-all" className="text-sm font-medium text-gray-700">
                    Seleccionar todas las evaluaciones
                  </label>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoevaluacion-all"
                    className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                    onChange={(e) => toggleSeleccionarTodosAutoEvaluacion(e.target.checked)}
                  />
                  <label htmlFor="autoevaluacion-all" className="text-sm font-medium text-gray-700">
                    Seleccionar todas las autoevaluaciones
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zvioleta"></div>
              <span className="ml-3 text-gray-600">Cargando usuarios...</span>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-900">Documento</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-900">Nombre</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-900">Empresa</th>
                        <th className="px-6 py-3 text-center font-medium text-gray-900">Evaluación</th>
                        <th className="px-6 py-3 text-center font-medium text-gray-900">Autoevaluación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedData?.map((user, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{user.idUsuario}</td>
                          <td className="px-6 py-4 text-gray-700">{user.nombre}</td>
                          <td className="px-6 py-4 text-gray-700">{user.empresa || '-'}</td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={user?.evaluacion}
                              onChange={(e) => {
                                setUsuariosFiltrados(prev =>
                                  prev.map(u =>
                                    u.idUsuario === user.idUsuario ? { ...u, evaluacion: e.target.checked } : u
                                  )
                                );
                              }}
                              className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={user?.autoevaluacion}
                              onChange={(e) => {
                                setUsuariosFiltrados(prev =>
                                  prev.map(u =>
                                    u.idUsuario === user.idUsuario ? { ...u, autoevaluacion: e.target.checked } : u
                                  )
                                );
                              }}
                              className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, usuariosFiltrados.length)} de {usuariosFiltrados.length} usuarios
                          {(filtroEmpresa !== '' || filtroNombre !== '') && (
                            <span className="text-zvioleta"> (filtrados de {usuariosNormalizados.length})</span>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label htmlFor="pageSize" className="text-sm text-gray-700">Por página:</label>
                          <select
                            id="pageSize"
                            value={pageSize}
                            onChange={(e) => {
                              setCurrentPage(1);
                              setPageSize(Number(e.target.value));
                            }}
                            className="appearance-none border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta bg-white cursor-pointer"
                          >
                            <option value="15">15</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaChevronLeft className="text-sm" />
                          </button>
                          
                          <span className="text-sm text-gray-700 px-3">
                            {currentPage} de {totalPages}
                          </span>
                          
                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaChevronRight className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {usuariosFiltrados.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <FaUsers className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                  <p className="text-gray-500">
                    {filtroEmpresa !== '' || filtroNombre !== '' 
                      ? 'Intenta ajustar los filtros de búsqueda' 
                      : 'No hay usuarios disponibles'
                    }
                  </p>
                  {(filtroEmpresa !== '' || filtroNombre !== '') && (
                    <button
                      onClick={() => {
                        setFiltroEmpresa('');
                        setFiltroNombre('');
                      }}
                      className="mt-3 text-zvioleta hover:text-zvioletaopaco transition-colors text-sm"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsignarEvaluacion;