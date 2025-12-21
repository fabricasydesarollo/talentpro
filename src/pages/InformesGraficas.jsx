import { useEffect, useState } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { BarChartAdvance, PieChartCumplimiento } from './GraficaAvances';
import Loading from './Loading';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { FaSearch } from 'react-icons/fa';


const InformesGraficas = () => {
  const [cubrimiento, setCubrimiento] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para cargar datos
  const [sedes, setSedes] = useState([]);
  const [empresa, setEmpresa] = useState({})
  const [evaluaciones, setEvaluaciones] = useState([])
  const [idEvaluacion, setIdEvaluacion] = useState(0)
  const [openModal, setOpenModal] = useState(false);


  const user = useUser()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evaluacionesRes] = await Promise.all([
          axios.get(`${URLBASE}/evaluaciones/gestionar`),
        ])
        setEvaluaciones(evaluacionesRes.data?.data || [])

      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user?.user?.idUsuario]);

  const handleChangeSede = async () => {
    try {
      setIsLoading(true)
      const [cubrimientoRes, empresasRes] = await Promise.all([
        axios.get(`${URLBASE}/informes/grafica/all`, { params: { idEvaluacion: idEvaluacion } }),
        axios.get(`${URLBASE}/usuarios/empresassedes`, { params: { idUsuario: user?.user.idUsuario } }),
      ])
      setCubrimiento(cubrimientoRes.data?.data || [])
      setSedes(empresasRes.data?.data || [])
    } catch (error) {
      console.error("Error al cargar las competencias:", error);
      toast.error(`Ups! No se pudo cargar las competencias. ${error.response?.data?.message || 'Algo salio mal'}`);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    function filtrarSedes() {
      setSedes(cubrimiento?.totalUsuariosSede?.filter(sede => sede.idEmpresa == empresa.idEmpresa))
    }
    filtrarSedes()
  }, [empresa])

  const dataPieEvaluacion = cubrimiento?.avanceGlobal?.flatMap(item => {
    const rename = {
      ...item,
      Respuestas: item.Evaluacion,
    }
    return [
      { value: rename.Respuestas, name: "Respuestas" },
      { value: rename.Usuarios, name: "Usuarios" },
      { ...rename }
    ]
  })
  const dataPieAutoevaluacion = cubrimiento?.avanceGlobal?.flatMap(item => {
    const rename = {
      ...item,
      Respuestas: item.Autoevaluacion,
    }
    return [
      { value: rename.Respuestas, name: "Respuestas" },
      { value: rename.Usuarios, name: "Usuarios" },
      { ...rename }
    ]
  })

  return (
    <div className="w-11/12 p-5 mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
          Gráficas - Avance General
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FaSearch className="text-gray-500" size={20} />
          <h2 className="text-lg font-medium text-gray-900">Seleccionar Evaluación</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 min-w-0">
            <label 
              htmlFor="id-evaluacion" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Evaluación
            </label>
            <select
              value={idEvaluacion}
              onChange={(e) => setIdEvaluacion(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
              name="evaluacion" 
              id="id-evaluacion"
            >
              <option value={0}>Seleccione una evaluación...</option>
              {evaluaciones.map((evaluacion, index) => (
                <option key={index} value={evaluacion.idEvaluacion}>
                  {`${evaluacion.nombre} ${evaluacion.year}`}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleChangeSede} 
            className="bg-zvioleta hover:bg-zvioleta/90 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={idEvaluacion === 0}
          >
            <FaSearch size={16} />
            Consultar
          </button>
        </div>
      </div>
      {
        cubrimiento.length == 0 && !isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FaSearch size={48} className="mx-auto" />
            </div>
            <p className="text-lg text-gray-600 mb-2">No hay datos disponibles</p>
            <p className="text-sm text-gray-700">Seleccione una evaluación para ver las gráficas</p>
          </div>
        ) : isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-6">
            {/* Charts Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Avance de Evaluaciones</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <PieChartCumplimiento data={dataPieEvaluacion} nombre='Avance Zentria Evaluación' />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <PieChartCumplimiento data={dataPieAutoevaluacion} nombre='Avance Zentria Autoevaluación' />
                </div>
              </div>
            </div>
            
            {/* Bar Chart Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Avance por Empresas</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[500px]">
                <BarChartAdvance data={cubrimiento?.totalUsuariosEmpresa} nombre={'Empresas'} setEmpresa={setEmpresa} setOpenModal={setOpenModal} />
              </div>
            </div>
          </div>
        )
      }
      {
        openModal && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setOpenModal(false)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 overflow-auto transition duration-300"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto relative">
              <button className='bg-znaranja text-white rounded-full aspect-square w-8 shadow-lg shadow-znaranjaclaro absolute top-1 right-1 font-bold hover:scale-105 transition-transform duration-300' onClick={() => setOpenModal(false)}>X</button>
              <h1 className='text-zvioleta font-bold text-xl text-center mb-10'>Detalle: Sedes de <span className='text-znaranja'>{empresa?.nombre}</span></h1>
              {
                sedes.length === 0 ? (
                  <p className='text-zinc-700'>** No hay información para esta empresa</p>
                ) : (
                  <BarChartAdvance data={sedes} nombre={'Sede'} setEmpresa={setEmpresa} setOpenModal={setOpenModal} />
                )
              }
            </div>
          </div>
        )
      }
    </div>
  );
};

export default InformesGraficas;
