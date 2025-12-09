import axios from "axios"
import { useEffect, useState } from "react"
import { URLBASE } from "../../lib/actions"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { PiPencilSimpleLineFill } from "react-icons/pi"
import { IoEyeSharp } from "react-icons/io5";
import AsignarEvaluacion from "../../components/AsignarEvaluacion"


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
    <div className="flex flex-col mx-auto text-sm w-full px-36 justify-center items-center relative">
      <h1 className="text-zvioleta text-2xl font-bold my-2">Administrar evaluaciones</h1>
      <form className="flex gap-5 w-full justify-between" onSubmit={handleSubmit(createEvaluacion)}>
        <div className="w-full">
          <label htmlFor="" className="text-gray-700">Nombre</label>
          <input className="input-custom" type="text" {...register("nombre")} />
        </div>
        <div className="w-1/2">
          <label htmlFor="" className="text-gray-700">Año</label>
          <input className="input-custom" type="number" {...register("year")} />
        </div>
        <div className="w-1/2">
          <label htmlFor="" className="text-gray-700">Fecha Inicio</label>
          <input className="input-custom" type="date" {...register("fechaInicio")} />
        </div>
        <div className="w-1/2">
          <label htmlFor="" className="text-gray-700">Fecha Fin</label>
          <input className="input-custom" type="date" {...register("fechaFin")} />
        </div>
        <div className="w-1/2">
          <label htmlFor="" className="text-gray-700">Objetivo</label>
          <input className="input-custom" type="text" {...register("fechaFin")} />
        </div>
        <div className="flex justify-center flex-col items-center">
          <label htmlFor="activo" className="text-gray-700">¿Activo?</label>
          <input className="border p-2 rounded-lg" type="checkbox" defaultChecked={true} {...register("estado")} />
        </div>
        <div className="flex justify-center flex-col items-center pl-10">
          <button className="bg-zvioleta text-white hover:bg-zvioleta/90 hover:scale-105 px-4 py-2 rounded-md">Guardar</button>
        </div>
      </form>
      <div className="w-full gap-4 mt-5 border-b border-gray-300">
        {evaluaciones.map(evaluacion => (
          <div key={evaluacion.idEvaluacion} className={`${currentEval.idEvaluacion == evaluacion.idEvaluacion ? 'bg-zvioleta text-white rounded-md' : ''} flex justify-between items-center`} >
            <p onClick={() => setCurrentEval(evaluacion)} className='border-b border-gray-200 p-2'>{`${evaluacion.nombre} ${evaluacion.year}`}</p>
            <button className="bg-znaranja rounded-md p-1" onClick={() => setShowAsignar(true)}>Asignar Usuarios</button>          
          </div>
        ))}
        <form className="flex items-center justify-center gap-4">
          <div className="flex justify-center flex-col items-center w-10/12">
            <label htmlFor="">Nombre</label>
            <input className="input-custom" type="text" />
          </div>
          <div className="flex justify-center flex-col items-center w-full">
            <label htmlFor="">Descripcion</label>
            <input className="input-custom" type="text" />
          </div>
          <div className="flex justify-center flex-col items-center w-10/12">
            <label htmlFor="">Tipo de competencia</label>
            <select className="input-custom" name="" id="">
              <option value="">Seleccione</option>
              {
                tipoCompetencias.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(tipo => (
                  <option key={tipo.idTipo} value={tipo.idTipo}>{tipo.nombre}</option>
                ))
              }
            </select>
          </div>
          <div className="flex justify-center flex-col items-center pl-10">
            <button className="bg-zvioleta text-white hover:bg-zvioleta/90 hover:scale-105 px-4 py-2 rounded-md">Guardar</button>
          </div>
        </form>
        <table className="w-full text-md text-left rtl:text-right text-gray-500 mb-8">
          <thead className="text-md text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                id
              </th>
              <th scope="col" className="px-6 py-3">
                Competencia
              </th>
              <th scope="col" className="px-6 py-3">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {
              currentEval.Competencias?.map(competencia => (
                <tr className="odd:bg-white even:bg-gray-50 border-b border-gray-200" key={competencia.idCompetencia}>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                    {competencia.idCompetencia}
                  </th>
                  <td className="px-6 py-4">
                    {competencia.nombre || 'Sin asignar'}
                  </td>
                  <td className="px-6 py-4">
                    {competencia.TipoCompetencium.nombre}
                  </td>
                  <td className="px-6 py-4 text-lg flex justify-center items-center gap-4">
                    <button className="text-green-700"><PiPencilSimpleLineFill /></button>
                    <button onClick={() => showModal(competencia)} className="text-blue-700"><IoEyeSharp /></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {
        viewModal && (
          <div className="w-full h-full bg-white/45 absolute top-0 flex justify-center items-start">
            <form className="w-1/2 h-auto bg-white shadow-lg p-6 mt-52 grid grid-cols-[2fr_1fr_2fr] gap-4">

              {/* Título */}
              <h1 className="col-span-3 text-lg font-semibold text-center mb-4">
                Empresas de {detalleCompetencia?.nombre}
              </h1>

              {/* Empresas disponibles */}
              <div className="flex flex-col gap-2">
                <h3 className="font-medium">Empresas disponibles</h3>
                {
                  detalleCompetencia?.Empresas?.map(empresa => (
                    <div key={empresa?.idEmpresa} className="flex gap-2 items-center">
                      <input type="checkbox" className="border p-1 rounded-lg" checked={console.log(selcEmpresas.includes(empresa.idEmpresa))} onChange={() => console.log(empresa)} />
                      <label>{empresa.nombre}</label>
                    </div>
                  ))
                }
              </div>

              {/* Botones para asignar/desasignar */}
              <div className="flex flex-col justify-center items-center gap-2">
                <button type="button" className="bg-gray-300 hover:bg-gray-400 p-2 rounded">{`>>`}</button>
                <button onClick={() => console.log()} type="button" className="bg-gray-300 hover:bg-gray-400 p-2 rounded">{`<<`}</button>
              </div>

              {/* Empresas asignadas */}
              <div className="flex flex-col gap-2">
                <h3 className="font-medium">Empresas asignadas</h3>
                {
                  empresas?.map(empresa => (
                    <div key={empresa.idEmpresa} className="flex gap-2 items-center">
                      <input type="checkbox" className="border p-1 rounded-lg" checked={console.log(selcEmpresas.includes(empresa.idEmpresa))} onChange={() => setSetEmpresasAsignadas(prev => {
                        return {
                          ...prev,
                          idEmpresa: empresa.idEmpresa,
                          nombre: empresa.nombre
                        }
                      })} />
                      <label>{empresa.nombre}</label>
                    </div>
                  ))
                }
              </div>

              {/* Botones de acción */}
              <div className="col-span-3 flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setViewModal(false)} className="bg-gray-300 text-black py-2 px-4 rounded-md hover:scale-105 hover:bg-gray-400">
                  Cancelar
                </button>
                <button type="button" className="bg-purple-600 text-white py-2 px-4 rounded-md hover:scale-105 hover:bg-purple-700">
                  Guardar
                </button>
              </div>

            </form>
          </div>
        )
      }

      {showAsignar && <AsignarEvaluacion idEvaluacion={currentEval?.idEvaluacion} setShowAsignar={setShowAsignar} />}

    </div>
  )
}

export default AdmEvaluacion