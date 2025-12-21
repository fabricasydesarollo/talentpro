import axios from "axios";
import { useEffect, useState } from "react";
import { URLBASE } from "../../lib/actions";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FaPlus, FaTimes, FaClipboardList, FaUsers, FaBuilding, FaEye } from "react-icons/fa";
import { PiPencilSimpleLineFill } from "react-icons/pi";
import { IoEyeSharp } from "react-icons/io5";
import AsignarEvaluacion from "../../components/AsignarEvaluacion";
import Loading from "../Loading";


const AdmEvaluacion = () => {
  const [evaluaciones, setEvaluaciones] = useState([])
  const [tipoCompetencias, setTipoCompetencias] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [refreshData, setRefreshData] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [detalleCompetencia, setDetalleCompetencia] = useState({})
  const [currentEval, setCurrentEval] = useState({})
  const [empresasAsignadas, setEmpresasAsignadas] = useState([])
  const { register, handleSubmit, reset } = useForm()
  const [showAsignar, setShowAsignar] = useState(false)
  const [openEval, setOpenEval] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllInfo = async () => {
      try {
        setLoading(true)
        const [evaluacionesData, tiposData, empresasData] = await Promise.all([
          axios.get(`${URLBASE}/evaluaciones/gestionar`),
          axios.get(`${URLBASE}/competencias/tipo`),
          axios.get(`${URLBASE}/empresas`),
        ])
        setEvaluaciones(evaluacionesData.data?.data)
        setTipoCompetencias(tiposData.data?.data)
        setEmpresas(empresasData.data?.data)
      } catch (error) {
        toast.error('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    fetchAllInfo()
  }, [refreshData])


  const createEvaluacion = async (data) => {
    try {
      const res = await axios.post(`${URLBASE}/evaluaciones/gestionar`, data)
      toast.success(`${res.data.message}, Finalizado con éxito!`)
      reset({ nombre: "", año: "", estado: "" })
      setRefreshData(!refreshData)
      setOpenEval(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear evaluación')
    }
  }

  const showModal = (competencia) => {
    setViewModal(true)
    setDetalleCompetencia(competencia)
  }

  if (loading) {
    return (
      <Loading message="Cargando evaluaciones..." />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaClipboardList className="text-zvioleta text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">Administrar Evaluaciones</h1>
            </div>
            <button 
              onClick={() => setOpenEval(true)}
              className="flex items-center gap-2 bg-zvioleta hover:bg-zvioletaopaco text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus className="text-sm" />
              Crear Evaluación
            </button>
          </div>
        </div>

        {/* Evaluaciones List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Evaluaciones */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaClipboardList className="text-zvioleta" />
                Evaluaciones
              </h2>
              <div className="space-y-2">
                {evaluaciones.map(evaluacion => (
                  <div 
                    key={evaluacion.idEvaluacion} 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      currentEval.idEvaluacion === evaluacion.idEvaluacion 
                        ? 'bg-zvioleta/10 border-zvioleta/30 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentEval(evaluacion)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{evaluacion.nombre}</p>
                        <p className="text-sm text-gray-500">Año {evaluacion.year}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowAsignar(true)
                        }}
                        className="flex items-center gap-1 bg-znaranja hover:bg-znaranja/90 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        <FaUsers className="text-xs" />
                        Asignar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Competencias */}
          <div className="lg:col-span-2">
            {currentEval.idEvaluacion ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaBuilding className="text-zvioleta" />
                    Competencias - {currentEval.nombre}
                  </h2>
                </div>

                {/* Add Competencia Form */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Agregar Nueva Competencia</h3>
                  <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all" 
                        type="text" 
                        placeholder="Nombre de la competencia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <input 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all" 
                        type="text" 
                        placeholder="Descripción"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Competencia</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all">
                        <option value="">Seleccione</option>
                        {tipoCompetencias.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(tipo => (
                          <option key={tipo.idTipo} value={tipo.idTipo}>{tipo.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      type="button"
                      className="bg-zvioleta hover:bg-zvioleta/90 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Guardar
                    </button>
                  </form>
                </div>

                {/* Competencias Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Competencia</th>
                        <th className="px-6 py-3">Tipo</th>
                        <th className="px-6 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEval.Competencias?.map(competencia => (
                        <tr key={competencia.idCompetencia} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{competencia.idCompetencia}</td>
                          <td className="px-6 py-4">{competencia.nombre || 'Sin asignar'}</td>
                          <td className="px-6 py-4">{competencia.TipoCompetencium?.nombre}</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button className="text-zvioleta hover:text-zvioleta/80 p-1 transition-colors">
                                <PiPencilSimpleLineFill className="text-lg" />
                              </button>
                              <button 
                                onClick={() => showModal(competencia)} 
                                className="text-znaranja hover:text-znaranja/80 p-1 transition-colors"
                              >
                                <IoEyeSharp className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FaClipboardList className="text-gray-300 text-6xl mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una Evaluación</h3>
                <p className="text-gray-500">Elige una evaluación de la lista para ver y gestionar sus competencias</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Create Evaluation Modal */}
      {openEval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaPlus className="text-zvioleta" />
                  Crear Nueva Evaluación
                </h2>
                <button 
                  onClick={() => setOpenEval(false)} 
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit(createEvaluacion)}>
                <div className="md:col-span-2">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Evaluación
                  </label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all" 
                    type="text" 
                    id="nombre" 
                    placeholder="Ingrese el nombre de la evaluación"
                    {...register("nombre", { required: true })} 
                  />
                </div>
                
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all" 
                    type="number" 
                    id="year" 
                    placeholder="2024"
                    {...register("year", { required: true })} 
                  />
                </div>
                
                <div>
                  <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all" 
                    type="date" 
                    id="fechaInicio" 
                    {...register("fechaInicio", { required: true })} 
                  />
                </div>
                
                <div>
                  <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin
                  </label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all" 
                    type="date" 
                    id="fechaFin" 
                    {...register("fechaFin", { required: true })} 
                  />
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center h-full">
                    <input 
                      className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50" 
                      type="checkbox" 
                      id="estado"
                      defaultChecked={true} 
                      {...register("estado")} 
                    />
                    <label htmlFor="estado" className="ml-2 text-sm font-medium text-gray-700">
                      Evaluación Activa
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-3">
                  <label htmlFor="objetivo" className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo de la Evaluación
                  </label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all" 
                    id="objetivo" 
                    rows="3"
                    placeholder="Describe el objetivo de esta evaluación..."
                    {...register("objetivo")} 
                  />
                </div>
                
                <div className="md:col-span-3 flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setOpenEval(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg transition-colors"
                  >
                    Crear Evaluación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Company Assignment Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaBuilding className="text-zvioleta" />
                  Empresas de {detalleCompetencia?.nombre}
                </h2>
                <button 
                  onClick={() => setViewModal(false)} 
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Available Companies */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FaBuilding className="text-gray-600" />
                    Empresas Disponibles
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {detalleCompetencia?.Empresas?.map(empresa => (
                      <div key={empresa?.idEmpresa} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50" 
                          onChange={() => console.log(empresa)} 
                        />
                        <label className="text-sm text-gray-700">{empresa.nombre}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transfer Buttons */}
                <div className="flex flex-col justify-center items-center gap-4">
                  <button 
                    type="button" 
                    className="bg-zvioleta hover:bg-zvioleta/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Asignar →
                  </button>
                  <button 
                    type="button" 
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    ← Quitar
                  </button>
                </div>

                {/* Assigned Companies */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FaBuilding className="text-zvioleta" />
                    Empresas Asignadas
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {empresasAsignadas?.map(empresa => (
                      <div key={empresa.idEmpresa} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50" 
                          onChange={() => setEmpresasAsignadas(prev => 
                            prev.filter(e => e.idEmpresa !== empresa.idEmpresa)
                          )} 
                        />
                        <label className="text-sm text-gray-700">{empresa.nombre}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button 
                  type="button" 
                  onClick={() => setViewModal(false)} 
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="px-6 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Assignment Modal */}
      {showAsignar && (
        <AsignarEvaluacion 
          idEvaluacion={currentEval?.idEvaluacion} 
          setShowAsignar={setShowAsignar} 
        />
      )}
    </div>
  )
}

export default AdmEvaluacion