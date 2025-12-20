import axios from "axios"
import { useEffect, useState } from "react"
import { URLBASE } from "../../lib/actions"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { PiPencilSimpleLineFill } from "react-icons/pi"
import { IoEyeSharp } from "react-icons/io5";
import AsignarEvaluacion from "../../components/AsignarEvaluacion"
import { Tab } from "@mui/material"
import EvaluacionForm from "../../components/evaluacion/EvaluacionForm"
import CompetenciasSection from "../../components/evaluacion/CompetenciasSection"
import UsuariosSection from "../../components/evaluacion/UsuariosSection"
import EmpresasSection from "../../components/evaluacion/EmpresasSection"


const AdmEvaluacion = () => {

  const [evaluaciones, setEvaluaciones] = useState([])
  const [tipoCompetencias, setTipoCompetencias] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [refreshData, setRefreshData] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [detalleCompetencia, setDetalleCompetencia] = useState({})
  const [currentEval, setCurrentEval] = useState({})
  const [setEmpresasAsignadas, setSetEmpresasAsignadas] = useState([])
  const { register, handleSubmit, reset } = useForm()
  const [showAsignar, setShowAsignar] = useState(false)

  useEffect(() => {

    const fecthAllInfo = async () => {

      const [evaluacionesData, tiposData, empresasData] = await Promise.all([
        axios.get(`${URLBASE}/evaluaciones/gestionar`),
        axios.get(`${URLBASE}/competencias/tipo`),
        axios.get(`${URLBASE}/empresas`),
      ])
      setEvaluaciones(evaluacionesData.data?.data)
      setTipoCompetencias(tiposData.data?.data)
      setEmpresas(empresasData.data?.data)
    }

    fecthAllInfo()

  }, [refreshData])


  const createEvaluacion = (data) => {
    axios.post(`${URLBASE}/evaluaciones/gestionar`, data)
      .then(res => {
        toast.success(`${res.data.message}, Finalizado con exito!`)
        reset({ nombre: "", año: "", estado: "" })
        setRefreshData(!refreshData)
      })
      .catch(err => toast.error(err.response.data.message))
  }

  const showModal = (competencia) => {
    setViewModal(true)
    setDetalleCompetencia(competencia)
  }

  const selcEmpresas = []


  return (
      <div className="flex flex-col mx-auto w-full px-10">
        <h1 className="text-zvioleta text-2xl font-bold my-4">Administrar Evaluaciones</h1>
        
        {/* Tabs o navegación */}
        <nav className="flex gap-6 border-b pb-2">
          <button>Datos Generales</button>
          <button>Competencias</button>
          <button>Usuarios</button>
          <button>Empresas</button>
        </nav>

        {/* Aquí renderizas cada sección */}
        <EvaluacionForm />
        <CompetenciasSection />
        <UsuariosSection />
        {/* <EmpresasSection /> */}
      </div>
    )
}

export default AdmEvaluacion