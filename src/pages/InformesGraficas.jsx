import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { BarChartAdvance, PieChartCumplimiento } from './GraficaAvances';
import Loading from './Loading';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';


const InformesGraficas = () => {
  const [cubrimiento, setCubrimiento] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para cargar datos
  const [sedes, setSedes] = useState([]);
  const [empresa, setEmpresa] = useState({})
  const [evaluaciones, setEvaluaciones] = useState([])
  const [idEvaluacion, setIdEvaluacion] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  // const idSede = React.useRef(0);
  // const idEmpresa = React.useRef(0);


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

  console.log(isLoading)

  useEffect(() => {
    function filtrarSedes() {
      setSedes(cubrimiento?.totalUsuariosSede?.filter(sede => sede.idEmpresa == empresa.idEmpresa))
    }
    filtrarSedes()
  }, [empresa])

  console.log(cubrimiento)
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
    <div className="w-11/12 p-5">
      <h1 className="text-3xl font-bold mb-4 text-zvioleta text-center">Gráficas - Avance General</h1>
      <div className="mb-4 flex gap-2">
        <div className="flex flex-col">
          <label htmlFor="id-evaluacion">Evaluación</label>
          <select
            value={idEvaluacion}
            onChange={(e) => setIdEvaluacion(Number(e.target.value))}
            className="w-80 border-gray-300 rounded-md" name="evaluacion" id="id-evaluacion" >
            <option disabled selected value={0}>Seleccione...</option>
            {evaluaciones.map((evaluacion, index) => (
              <option key={index} value={evaluacion.idEvaluacion}>{`${evaluacion.nombre} ${evaluacion.year}`}</option>
            ))}
          </select>
        </div>
        <div className='flex items-end'>
          <button onClick={handleChangeSede} className="bg-zvioleta py-2 px-10 rounded-lg text-white hover:scale-105 shadow-md">Consultar</button>
        </div>
      </div>
      {
        cubrimiento.length == 0 && !isLoading ? (
          <p className="text-center text-znaranja">*Seleccione una evaluación para ver las gráficas.*</p>
        ) : isLoading ? (
          <Loading />
        ) : (
          <div className="flex flex-col justify-center">
            <div className='flex shadow-lg bg-slate-100 rounded-md mb-4'>
              <PieChartCumplimiento data={dataPieEvaluacion} nombre='Avance Zentria Evaluación' />
              <PieChartCumplimiento data={dataPieAutoevaluacion} nombre='Avance Zentria Autoevaluación' />
            </div>
            <div className="shadow-lg rounded-md bg-slate-100">
              <BarChartAdvance data={cubrimiento?.totalUsuariosEmpresa} nombre={'Empresas'} setEmpresa={setEmpresa} setOpenModal={setOpenModal} />
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
