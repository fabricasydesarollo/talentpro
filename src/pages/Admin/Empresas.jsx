import axios from "axios";
import { useEffect, useState } from "react"
import { MdDelete, MdExpandLess, MdExpandMore } from "react-icons/md";
import { URLBASE } from "../../lib/actions";
import { useForm } from "react-hook-form";
import { PiPencilSimpleLineFill } from "react-icons/pi";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";



const Empresas = () => {

    const [showCreate, setSetshowCreate] = useState({
        empresas: false,
        sedes: false,
        ciudades: false,
        departamentos: false
    })

    const [idUpdate, setIdUpdate] = useState(false)
    const [refreshData, setRefreshData] = useState(false)

    const [dataRender, setDataRender] = useState({
        empresas: [],
        sedes: [],
        ciudades: []
    })

    const [filePreview, setFilePreview] = useState(null);
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setValue("urlLogo", e.target.files);

            // Si es una imagen, generar vista previa
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null); // Si no es imagen, no hay preview
            }
        }
    };

    const [dataFetch, setDataFetch] = useState({
        empresas: [],
        sedes: [],
        hubs: [],
        ciudades: [],
        departamentos: []
    })

    const showFormCreate = (location) => {
        setSetshowCreate(prev => {
            return {
                ...prev,
                [location]: !prev[location]
            }
        })
    }

    const { register, handleSubmit, setValue, reset } = useForm()
    const { register: registerHeadquarters, handleSubmit: handleSubmitHeadquarters, reset: resetHeadquarters } = useForm()
    const { register: registerDepartament, handleSubmit: handleSubmitDepartament, reset: resetDepartament } = useForm()
    const { register: registerCity, handleSubmit: handleSubmitCity, reset: resetCity } = useForm()

    const createBussines = data => {
        const formData = new FormData();
        formData.append("nombre", data.nombre)
        formData.append("nit", data.nit)
        formData.append("idHub", data.idHub)

        if (data.urlLogo[0]) {
            formData.append("file", data.urlLogo[0])
        } else {
            toast.error("Debe seleccionar un archivo!")
            return
        }

        if (idUpdate) {
            formData.append('idEmpresa', idUpdate)
            axios.put(`${URLBASE}/empresas`, formData)
                .then(response => {
                    toast.success(`${response.data.message}`)
                    reset({ nombre: "", nit: "", idHub: "", urlLogo: null });
                    setIdUpdate(false)
                    setRefreshData(!refreshData)
                })
                .catch(error => {
                    toast.error(`Error al actualizar la empresa, ${error.response.data.message}`)
                })
        } else {
            axios.post(`${URLBASE}/empresas`, formData)
                .then(response => {
                    toast.success(`${response.data.message}`)
                    reset({ nombre: "", nit: "", idHub: "", urlLogo: null });
                    setRefreshData(!refreshData)
                })
                .catch(error => {
                    toast.error(`Error al crear la empresa, ${error.response.data.message}`)
                })
        }

    }

    const editBussines = (idEmpresa) => {
        const bussines = dataFetch.empresas.find(empresa => empresa.idEmpresa == idEmpresa)
        reset(bussines)
        setFilePreview(bussines.urlLogo)
        setIdUpdate(idEmpresa)
    }

    const createHeadquarters = data => {
        const Headquarters = {
            nombre: data.nombre,
            siglas: data.siglas,
            idEmpresa: data.idEmpresa,
            idCiudad: data.idCiudad
        }

        if (idUpdate) {
            const idSede = idUpdate
            axios.patch(`${URLBASE}/empresas/sedes/${idSede}`, Headquarters)
                .then(res => {
                    toast.success(`${res.data?.message}`)
                    resetHeadquarters({ nombre: "", siglas: "", idEmpresa: "", idCiudad: "" })
                    setRefreshData(!refreshData)
                    setIdUpdate(false)
                })
                .catch(err => {
                    toast.err(err.response.data.message)
                })
        } else {
            axios.post(`${URLBASE}/empresas/sedes`, Headquarters)
                .then(res => {
                    toast.success(`${res.data?.message}`)
                    resetHeadquarters({ nombre: "", siglas: "", idEmpresa: "", idCiudad: "" })
                    setRefreshData(!refreshData)
                })
                .catch(err => {
                    toast.err(err.response.data.message)
                })
        }
    }
    const createDepartment = data => {
        const departamento = {
            nombre: data.nombre
        }
        resetDepartament({
            nombre: ""
        })
        axios.post(`${URLBASE}/ciudades/departamentos`, departamento)
            .then(response => {
                toast.success(`Departamento creado, ${response.data.message}`)
                setRefreshData(!refreshData)
            })
            .catch(error => {
                toast.error(`Error al crear el departamento, ${error.response.data.message}`)
            })
    }
    const createCity = data => {
        const city = {
            nombre: data.nombre,
            idDepartamento: data.idDepartamento
        }
        axios.post(`${URLBASE}/ciudades`, city)
            .then(res => {
                toast.success(res.data.message)
                resetCity({nombre: "", idDepartamento: ""})
                setRefreshData(!refreshData)
            })
            .catch(err => toast.error(err.response.message))

    }

    useEffect(() => {
        const fetchAllData = async () => {

            const [empresasData, sedesData, hubsData, ciudadesData, departamentosData] = await Promise.all([
                axios.get(`${URLBASE}/empresas`),
                axios.get(`${URLBASE}/empresas/sedes`),
                axios.get(`${URLBASE}/empresas/hubs`),
                axios.get(`${URLBASE}/ciudades`),
                axios.get(`${URLBASE}/ciudades/departamentos`),
            ])
            setDataFetch(prev => {
                return {
                    ...prev,
                    empresas: empresasData.data?.data,
                    sedes: sedesData.data?.data,
                    hubs: hubsData.data?.data,
                    ciudades: ciudadesData.data?.data,
                    departamentos: departamentosData.data?.data
                }
            })

        }
        fetchAllData(dataFetch)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshData])


    const deleteHeadquarters = (idSede) => {
        axios.delete(`${URLBASE}/empresas/sedes/${idSede}`)
            .then(res => {
                toast.success(`${res.data.message}`)
                setRefreshData(!refreshData)
            })
            .catch(err => toast.error(err))
    }

    const editHeadquarters = (idSede) => {
        const headquarter = dataFetch.sedes.find(sede => sede.idSede == idSede)
        const headquarterObj = { ...headquarter, idEmpresa: headquarter.Empresa.idEmpresa, idCiudad: headquarter.Ciudade.idCiudad }
        resetHeadquarters(headquarterObj)
        setIdUpdate(idSede)
    }

    const actionCancel = () => {
        reset({ nombre: "", nit: "", idHub: "", urlLogo: null });
        resetDepartament({ nombre: "" })
        resetHeadquarters({ nombre: "", siglas: "", idEmpresa: "", idCiudad: "" })
        resetCity({nombre: "", idDepartamento: ""})
    }


    return (
        <div className="p-8 bg-gray-50 rounded-lg shadow-md mx-auto text-lg w-full min-h-full">
            <h1 className="text-zvioleta text-3xl font-bold text-center mb-4">Administrar Unidades de Negocio</h1>
            <div className="mx-auto text-lg xl:w-2/3 w-full">
                <h2 className="text-zvioleta text-2xl font-bold">Empresas</h2>
                <button onClick={() => showFormCreate("empresas")} className="text-5xl border-b-zvioleta border-b-2 w-full flex justify-end items-center mb-4">
                    <span className="inline-flex">{showCreate.empresas ? <MdExpandLess className="text-zverde" /> : <MdExpandMore className="text-zverde" />}</span>
                </button>
                {
                    showCreate.empresas && (
                        <>
                            <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit(createBussines)} encType="multipart/form-data">
                                {/* formulario para crear las empresas */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="nombre" className="font-semibold text-gray-700">Nombre empresa</label>
                                    <input type="text" id="nombre" className="input-custom" {...register("nombre")} />
                                </div>
                                <div>
                                    <label htmlFor="nit" className="font-semibold text-gray-700">Nit</label>
                                    <input type="text" id="nit" className="input-custom" {...register("nit")} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="urlLogo" className="font-semibold text-gray-700">Logo</label>

                                    <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-zvioleta transition-all relative overflow-hidden">
                                        {filePreview ? (
                                            <img src={filePreview} alt="Vista previa" className="absolute inset-0 object-contain w-full h-full rounded-lg" />
                                        ) : (
                                            <span className="text-gray-500">Haz clic para subir un archivo</span>
                                        )}
                                        <input
                                            type="file"
                                            id="urlLogo"
                                            name="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    {fileName && (
                                        <p className="text-sm text-gray-600 mt-1 text-center">{fileName}</p>
                                    )}
                                </div>
                                <label htmlFor="idHub" className="font-semibold text-gray-700">Hub</label>
                                <select name="idHub" id="idHub" className="input-custom" {...register("idHub")} defaultValue="">
                                    <option selected value="">Seleccione</option>
                                    {
                                        dataFetch.hubs?.map(hub => (
                                            <option key={hub.idHub} value={hub.idHub}>{hub.nombre}</option>
                                        ))
                                    }
                                </select>
                                <div className="flex justify-around items-center gap-12">
                                    <button className="bg-zvioleta text-white p-3 text-lg rounded-md hover:bg-zvioleta/90 mb-8 w-full">Guardar</button>
                                    <button type="button" onClick={actionCancel} className="bg-zcinza text-black p-3 text-lg rounded-md hover:bg-zcinza/90 mb-8 w-full">Cancelar</button>
                                </div>
                            </form>
                            <table className="w-full text-md text-left rtl:text-right text-gray-500 mb-8">
                                <thead className="text-md text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Empresa
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Hub
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            logo
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        dataRender.empresas?.map(empresa => (
                                            <tr className="odd:bg-white even:bg-gray-50 border-b border-gray-200" key={empresa.idEmpresa}>
                                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                                                    {empresa.nombre}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {empresa.Hub?.nombre || 'Sin asignar'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <img className="w-20" src={empresa.urlLogo} alt={empresa.nombre} />
                                                </td>
                                                <td className="px-6 py-4 text-lg flex justify-center items-center gap-4">
                                                    <button onClick={() => editBussines(empresa.idEmpresa)} className="text-zverde"><PiPencilSimpleLineFill /></button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <Pagination dataFetch={dataFetch.empresas} setData={setDataRender} totalRows={10} clave={"empresas"} key={1} />
                        </>
                    )
                }
                <h2 className="text-zvioleta text-2xl font-bold">Sedes</h2>
                <button onClick={() => showFormCreate("sedes")} className="text-5xl border-b-zvioleta border-b-2 w-full flex justify-end items-center mb-4">
                    <span className="inline-flex">{showCreate.sedes ? <MdExpandLess className="text-zverde" /> : <MdExpandMore className="text-zverde" />}</span>
                </button>
                {
                    showCreate.sedes && (
                        <>
                            <form className="flex flex-col gap-4" onSubmit={handleSubmitHeadquarters(createHeadquarters)}>
                                {/* formulario para crear las empresas */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="nombre">Nombre sede</label>
                                    <input type="text" id="nombre" className="input-custom" {...registerHeadquarters("nombre")} />
                                </div>
                                <div>
                                    <label htmlFor="siglas">Siglas</label>
                                    <input type="text" id="siglas" className="input-custom" {...registerHeadquarters("siglas")} />
                                </div>
                                <label htmlFor="idEmpresa">Empresa</label>
                                <select name="idEmpresa" id="idEmpresa" className="input-custom" {...registerHeadquarters("idEmpresa")}>
                                    <option selected value="">Seleccione</option>
                                    {
                                        dataFetch.empresas?.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(empresa => (
                                            <option key={empresa.idEmpresa} value={empresa.idEmpresa} >{empresa.nombre}</option>
                                        ))
                                    }
                                </select>
                                <label htmlFor="idCiudad">Ciudad</label>
                                <select name="idCiudad" id="idCiudad" className="input-custom" {...registerHeadquarters("idCiudad")}>
                                    <option selected value="">Seleccione</option>
                                    {
                                        dataFetch.ciudades?.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(ciudad => (
                                            <option key={ciudad.idCiudad} value={ciudad.idCiudad} >{ciudad.nombre}</option>
                                        ))
                                    }
                                </select>
                                <div className="flex justify-around items-center gap-12">
                                    <button className="bg-zvioleta text-white p-3 text-lg rounded-md hover:bg-zvioleta/90 mb-8 w-full">Guardar</button>
                                    <button type="button" onClick={actionCancel} className="bg-zcinza text-black p-3 text-lg rounded-md hover:bg-zcinza/90 mb-8 w-full">Cancelar</button>
                                </div>
                            </form>
                            <table className="w-full text-md text-left rtl:text-right text-gray-500 mb-8">
                                <thead className="text-md text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Empresa
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Sede
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Siglas
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Ciudad
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        dataRender.sedes?.map(sede => (
                                            <tr className="odd:bg-white even:bg-gray-50 border-b border-gray-200" key={sede.idSede}>
                                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                                                    {sede.Empresa.nombre}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {sede.nombre}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sede.siglas}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sede.Ciudade.nombre}
                                                </td>
                                                <td className="px-6 py-4 text-lg flex justify-center items-center gap-4">
                                                    <button onClick={() => deleteHeadquarters(sede.idSede)}><MdDelete className="text-red-500" /></button>
                                                    <button onClick={() => editHeadquarters(sede.idSede)} className="text-zverde"><PiPencilSimpleLineFill /></button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <Pagination dataFetch={dataFetch.sedes.sort((a, b) => a.Empresa.nombre.localeCompare(b.Empresa.nombre))} totalRows={10} setData={setDataRender} key={3} clave={"sedes"} />
                        </>
                    )
                }
                <h2 className="text-zvioleta text-2xl font-bold">Departamentos</h2>
                <button onClick={() => showFormCreate("departamentos")} className="text-5xl border-b-zvioleta border-b-2 w-full flex justify-end items-center mb-4">
                    <span className="inline-flex">{showCreate.departamentos ? <MdExpandLess className="text-zverde" /> : <MdExpandMore className="text-zverde" />}</span>
                </button>
                {
                    showCreate.departamentos && (
                        <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmitDepartament(createDepartment)}>
                            {/* formulario para crear las empresas */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="nombre">Nombre departamento</label>
                                <input type="text" id="nombre" className="input-custom" {...registerDepartament("nombre")} />
                            </div>
                            <div className="flex justify-around items-center gap-12">
                                    <button className="bg-zvioleta text-white p-3 text-lg rounded-md hover:bg-zvioleta/90 mb-8 w-full">Guardar</button>
                                    <button type="button" onClick={actionCancel} className="bg-zcinza text-black p-3 text-lg rounded-md hover:bg-zcinza/90 mb-8 w-full">Cancelar</button>
                                </div>
                        </form>
                    )
                }
                <h2 className="text-zvioleta text-2xl font-bold">Ciudades</h2>
                <button onClick={() => showFormCreate("ciudades")} className="text-5xl border-b-zvioleta border-b-2 w-full flex justify-end items-center mb-4">
                    <span className="inline-flex">{showCreate.ciudades ? <MdExpandLess className="text-zverde" /> : <MdExpandMore className="text-zverde" />}</span>
                </button>
                {
                    showCreate.ciudades && (
                        <>
                            <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmitCity(createCity)}>
                                {/* formulario para crear las empresas */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="nombre">Nombre ciudad</label>
                                    <input type="text" id="nombre" className="input-custom" {...registerCity("nombre")} />
                                </div>
                                <label htmlFor="idDepartamento">Departamento</label>
                                <select name="idDepartamento" id="idDepartamento" className="input-custom" {...registerCity("idDepartamento")}>
                                    <option selected value="" defaultValue="">Seleccione</option>
                                    {
                                        dataFetch.departamentos?.map(departamento => (
                                            <option key={departamento.idDepartamento} value={departamento.idDepartamento}>{departamento.nombre}</option>
                                        ))
                                    }
                                </select>
                                <div className="flex justify-around items-center gap-12">
                                    <button className="bg-zvioleta text-white p-3 text-lg rounded-md hover:bg-zvioleta/90 mb-8 w-full">Guardar</button>
                                    <button type="button" onClick={actionCancel} className="bg-zcinza text-black p-3 text-lg rounded-md hover:bg-zcinza/90 mb-8 w-full">Cancelar</button>
                                </div>
                            </form>
                            <table className="w-full text-md text-left rtl:text-right text-gray-500">
                                <thead className="text-md text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Ciudad
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Departamento
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Fecha de actualización
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        dataRender.ciudades?.map(ciudad => (
                                            <tr className="odd:bg-white even:bg-gray-50 border-b border-gray-200" key={ciudad.idCiudad}>
                                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                                                    {ciudad.nombre}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {ciudad.Departamento?.nombre}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Date(ciudad.updatedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <Pagination dataFetch={dataFetch.ciudades} totalRows={10} setData={setDataRender} key={2} clave={"ciudades"} />
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default Empresas