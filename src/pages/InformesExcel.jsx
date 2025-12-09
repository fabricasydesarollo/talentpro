import { useEffect, useMemo, useState } from "react"
import InformeResultados from "./InformeResultados"
import InformeResultadosDetalle from "./InformeResultadosDetalle"
import axios from "axios"
import { URLBASE } from "../lib/actions"
import { useUser } from "../context/UserContext"
import { toast } from "react-toastify"
import { filtrarSedes } from "../lib/utils"
import Loading from "./Loading"

export const InformesExcel = () => {
  const [tipoReporte, setTipoReporte] = useState(0)
  const [evaluaciones, setEvaluaciones] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [sedes, setSedes] = useState([])
  const [changeSelect, setChangeSelect] = useState(false)
  const [idEmpresa, setIdEmpresa] = useState(null)
  const [idSede, setIdSede] = useState(null)
  const [idEvaluacion, setIdEvaluacion] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const user = useUser()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [evaluacionesRes, empresasRes] = await Promise.all([
          axios.get(`${URLBASE}/evaluaciones/gestionar`),
          axios.get(`${URLBASE}/usuarios/empresassedes`, { params: { idUsuario: user?.user.idUsuario } })
        ])
        setEvaluaciones(evaluacionesRes.data?.data || [])
        setEmpresas(empresasRes.data?.data || [])
      } catch (e) {
        toast.error("Ocurrió un error al cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user])

  const empresasOrdenadas = useMemo(() => {
    return empresas?.Empresas?.sort((a, b) => a.nombre.localeCompare(b.nombre)) || []
  }, [empresas])

  useEffect(() => {
    setSedes(filtrarSedes(empresas, idEmpresa))
  }, [idEmpresa, empresas])

  if (isLoading) return <Loading />

  return (
    <div className="w-full p-5">
      <h1 className="text-center text-zvioleta text-3xl font-bold my-5">Resultados de Evaluaciones</h1>
      <div className="flex gap-4 items-end text-gray-800 flex-col sm:flex-row flex-wrap">
        
        {/* Evaluaciones */}
        <div className="flex flex-col">
          <label htmlFor="id-evaluacion">Evaluación</label>
          <select 
            value={idEvaluacion}
            onChange={(e) => setIdEvaluacion(Number(e.target.value))}
            className="w-80 border-gray-300 rounded-md"
            id="id-evaluacion"
          >
            <option value={0} disabled>Seleccione...</option>
            {evaluaciones.map((evaluacion) => (
              <option key={evaluacion.idEvaluacion} value={evaluacion.idEvaluacion}>
                {`${evaluacion.nombre} ${evaluacion.year}`}
              </option>
            ))}
          </select>
        </div>

        {/* Empresas */}
        <div className="flex flex-col">
          <label htmlFor="id-empresa">Empresa</label>
          <select 
            value={idEmpresa}
            onChange={(e) => setIdEmpresa(Number(e.target.value))}
            className="w-80 border-gray-300 rounded-md"
            id="id-empresa"
          >
            <option value={0}>Seleccione...</option>
            {empresasOrdenadas.map((empresa) => (
              <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
                {empresa.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Sedes */}
        <div className="flex flex-col">
          <label htmlFor="id-sede">Sede</label>
          <select
            value={idSede}
            onChange={(e) => setIdSede(Number(e.target.value))}
            className="w-80 border-gray-300 rounded-md"
            id="id-sede"
          >
            <option value={0}>Seleccione...</option>
            {sedes.map((sede) => (
              <option key={sede.idSede} value={sede.idSede}>
                {sede.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo reporte */}
        <div className="flex flex-col">
          <label htmlFor="id-tipo">Tipo reporte</label>
          <select 
            value={tipoReporte}
            onChange={(e) => setTipoReporte(Number(e.target.value))}
            className="w-80 border-gray-300 rounded-md"
            id="id-tipo"
          >
            <option value={0}>Seleccione...</option>
            <option value={1}>RESULTADOS</option>
            <option value={2}>RESULTADOS DETALLE</option>
          </select>
        </div>

        <button 
          className="bg-zvioleta py-2 px-10 rounded-lg text-white hover:scale-105 shadow-md" 
          onClick={() => setChangeSelect(prev => !prev)}
        >
          Consultar
        </button>
      </div>

      {/* Renderizado condicional */}
      {idEvaluacion == 0 || tipoReporte == 0 ? (
        <p className="text-center text-red-500 font-semibold my-10">
          Seleccione una evaluación para generar el informe
        </p>
      ) : tipoReporte === 1 ? (
        <InformeResultados 
          changeSelect={changeSelect} 
          idEvaluacion={idEvaluacion} 
          idEmpresa={idEmpresa} 
          idSede={idSede} 
        />
      ) : tipoReporte === 2 ? (
        <InformeResultadosDetalle 
          changeSelect={changeSelect} 
          idEvaluacion={idEvaluacion} 
          idEmpresa={idEmpresa} 
          idSede={idSede} 
        />
      ) : null}
    </div>
  )
}