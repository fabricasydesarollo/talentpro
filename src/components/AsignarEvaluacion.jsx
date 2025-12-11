import axios from "axios";
import { useEffect, useState } from "react";
import { URLBASE } from "../lib/actions";
import { normalizarData } from "../lib/utils";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { LuSave } from "react-icons/lu";
import { toast } from "react-toastify";
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";

const AsignarEvaluacion = ({ idEvaluacion, setShowAsignar }) => {

  const [usuarios, setUsuarios] = useState([])
  const [evaluaciones, setEvaluaciones] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([])
  const [usuariosNormalizados, setUsuariosNormalizados] = useState([])

  useEffect(() => {
    const fechData = async () => {
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

    }
    fechData()
  }, [])


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
    setUsuariosNormalizados(normalizarData(usuarios, evaluaciones));
    setUsuariosFiltrados(usuariosNormalizados);
  }, [usuarios, evaluaciones]);


  function filtrarUsuariosEmpresas(idEmpresa) {
    if (idEmpresa === '') {
      setUsuariosFiltrados(usuariosNormalizados);
    } else {
      const filtrados = usuariosNormalizados.filter(user => user.idEmpresa == idEmpresa);
      setUsuariosFiltrados(filtrados);
    }
  }


  function filtrarUsuariosNombre(nombre) {
    if (nombre === '') {
      setUsuariosFiltrados(usuariosNormalizados);
    } else {
      const filtrados = usuariosFiltrados.filter(user =>
        user.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
      if (filtrados.length === 0) {
        const filtroDocumento = usuariosNormalizados.filter(user =>
          user.idUsuario.toString().includes(nombre)
        );
        setUsuariosFiltrados(filtroDocumento);
        return;
      }
      setUsuariosFiltrados(filtrados);
    }
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

  function handleGuardarAsignacion() {
    const ListaAsignar = usuariosFiltrados.map(u => ({
      idUsuario: u.idUsuario,
      evaluacion: u.evaluacion,
      autoevaluacion: u.autoevaluacion,
      idEvaluacion: idEvaluacion
    }));

    const sublistas = dividirLista(ListaAsignar, 100);

    // Mostrar toast de carga y guardar su id
    const toastId = toast.loading('Asignando evaluaciones, por favor espere...');

    Promise.all(
      sublistas.map(sublista =>
        axios.post(`${URLBASE}/evaluaciones/asignarEvaluaciones`, {
          ListaAsignar: sublista
        })
      )
    )
      .then(() => {
        toast.update(toastId, {
          render: 'Asignaciones guardadas con éxito',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      })
      .catch(() => {
        toast.update(toastId, {
          render: 'Error al guardar las asignaciones',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        });
      });
  }


  return (
    <div className="fixed bg-black inset-0 bg-opacity-50 flex justify-center items-center overflow-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-screen overflow-y-auto relative">
        <button onClick={() => setShowAsignar(false)} className="absolute top-4 right-4 text-white px-4 py-2 rounded-lg bg-znaranja shadow-md shadow-znaranja hover:scale-105 text-md active:scale-95 transition-transform duration-300"><IoIosCloseCircleOutline /></button>
        <button
          onClick={handleGuardarAsignacion}
          className="absolute top-4 right-20 text-white px-4 py-2 rounded-lg bg-zvioleta shadow-md shadow-zvioleta hover:scale-105 text-md active:scale-95 transition-transform duration-300"><LuSave />
        </button>
        <h1 className="text-znaranja text-2xl text-center font-semibold py-3">Asignar evaluación a usuarios</h1>

        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <label htmlFor="empresa" className="text-sm font-medium">Filtrar por empresa</label>
            <select
              onChange={(e) => filtrarUsuariosEmpresas(e.target.value)}
              id="empresa"
              className="border border-gray-300 rounded-md w-full p-2 text-gray-500 focus:outline-none focus:ring-1 focus:ring-zvioleta focus:border-zvioleta">
              <option value="">Todos</option>
              {
                empresas?.map(empresa => (
                  <option key={empresa.idEmpresa} value={empresa.idEmpresa}>{empresa?.nombre}</option>
                ))
              }
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="usuario" className="text-sm font-medium"
            >Filtrar por usuarios</label>
            <input type="text" id="usuario" placeholder="Buscar por usuario" className="border border-gray-300 rounded-md w-full p-2 text-gray-500 focus:outline-none focus:ring-1 focus:ring-zvioleta focus:border-zvioleta" onChange={(e) => filtrarUsuariosNombre(e.target.value)} />
          </div>
          <div className="flex justify-around items-center gap-4">
            <div className="flex flex-col items-center">
              <label htmlFor="evaluacion-all" className="text-sm">Evaluación</label>
              <input type="checkbox" id="evaluacion-all" className="mt-1 border-gray-400 rounded-md"
                defaultChecked={false}
                onClick={(e) => toggleSeleccionarTodosEvaluacion(e.target.checked)} />
            </div>
            <div className="flex flex-col items-center">
              <label htmlFor="autoevaluacion-all" className="text-sm">Autoevaluación</label>
              <input type="checkbox" id="autoevaluacion-all" className="mt-1 border-gray-400 rounded-md"
                defaultChecked={false}
                onClick={(e) => toggleSeleccionarTodosAutoEvaluacion(e.target.checked)} />
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="overflow-x-auto border border-gray-300 rounded-md">
          <table className="min-w-full text-sm text-gray-700 relative">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-2 text-left"># Documento</th>
                <th scope="col" className="px-4 py-2 text-left">Nombre</th>
                <th scope="col" className="px-4 py-2 text-left">Empresa</th>
                <th scope="col" className="px-4 py-2 text-center">Evaluación</th>
                <th scope="col" className="px-4 py-2 text-center">Autoevaluación</th>
              </tr>
            </thead>
            {
              usuariosNormalizados.length > 0 ? (
                <tbody className="text-gray-500">
                  {
                    paginatedData?.map((user, idx) => (
                      <tr className="border-t" key={idx}>
                        <td className="px-4 py-2">{user.idUsuario}</td>
                        <td className="px-4 py-2">{user.nombre}</td>
                        <td className="px-4 py-2">{user.empresa || '-'}</td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            name="evaluacion"
                            checked={user?.evaluacion}
                            onChange={(e) => {
                              setUsuariosFiltrados(prev =>
                                prev.map(u =>
                                  u.idUsuario === user.idUsuario ? { ...u, evaluacion: e.target.checked } : u
                                )
                              );
                            }}
                            className="rounded-md border-gray-400"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            name="autoevaluacion"
                            checked={user?.autoevaluacion}
                            onChange={(e) => {
                              setUsuariosFiltrados(prev =>
                                prev.map(u =>
                                  u.idUsuario === user.idUsuario ? { ...u, autoevaluacion: e.target.checked } : u
                                )
                              );
                            }}
                            className="rounded-md border-gray-400"
                          />
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              ) : (
                <div className="w-full h-full flex justify-center items-center bg-white absolute bottom-0 left-0">
                  <p className="text-center p-4 text-gray-500 text-2xl">Cargando datos, por favor espere...</p>
                </div>
              )
            }
          </table>
          {totalPages >= 1 && (
                  <div className="flex justify-center items-center p-4 gap-4 border-t border-gray-200 flex-wrap">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 text-gray-600 disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <IoChevronBackSharp />
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentPage} de {totalPages}
                    </span>
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 text-gray-600 disabled:opacity-50"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <IoChevronForwardSharp />
                    </button>
                      <select id="pageSize" className="border border-gray-300 rounded-lg cursor-pointer text-sm pr-6  text-gray-600 focus:outline-none focus:ring-1 focus:ring-zcinza focus:border-zcinza px-3 py-2" 
                        onChange={(e) => {
                        setCurrentPage(1);
                        setPageSize(Number(e.target.value));
                      }} value={pageSize}>
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                  </div>
                )}
        </div>
      </div>
    </div>
  );
};

export default AsignarEvaluacion;