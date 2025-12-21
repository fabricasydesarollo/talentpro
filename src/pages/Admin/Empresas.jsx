import axios from "axios";
import { useEffect, useState } from "react"
import { MdDelete, MdExpandLess, MdExpandMore } from "react-icons/md";
import { URLBASE } from "../../lib/actions";
import { useForm } from "react-hook-form";
import { PiPencilSimpleLineFill } from "react-icons/pi";
import { toast } from "sonner";
import { FaBuilding, FaMapMarkerAlt, FaCity, FaPlus, FaImage, FaSearch } from "react-icons/fa";
import Pagination from "../../components/Pagination";
import Loading from "../Loading";

const Empresas = () => {
    const [showCreate, setShowCreate] = useState({
        empresas: false,
        sedes: false,
        ciudades: false,
        departamentos: false
    })

    const [idUpdate, setIdUpdate] = useState(false)
    const [refreshData, setRefreshData] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchEmpresa, setSearchEmpresa] = useState("")
    const [searchSede, setSearchSede] = useState("")

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

            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
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
        setShowCreate(prev => ({
            ...prev,
            [location]: !prev[location]
        }))
    }

    const { register, handleSubmit, setValue, reset } = useForm()
    const { register: registerHeadquarters, handleSubmit: handleSubmitHeadquarters, reset: resetHeadquarters } = useForm()
    const { register: registerDepartament, handleSubmit: handleSubmitDepartament, reset: resetDepartament } = useForm()
    const { register: registerCity, handleSubmit: handleSubmitCity, reset: resetCity } = useForm()

    const createBussines = async (data) => {
        try {
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
                const response = await axios.put(`${URLBASE}/empresas`, formData)
                toast.success(`${response.data.message}`)
                setIdUpdate(false)
            } else {
                const response = await axios.post(`${URLBASE}/empresas`, formData)
                toast.success(`${response.data.message}`)
            }
            
            reset({ nombre: "", nit: "", idHub: "", urlLogo: null });
            setFilePreview(null);
            setFileName("");
            setRefreshData(!refreshData)
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || 'Error desconocido'}`)
        }
    }

    const editBussines = (idEmpresa) => {
        const bussines = dataFetch.empresas.find(empresa => empresa.idEmpresa == idEmpresa)
        reset(bussines)
        setFilePreview(bussines.urlLogo)
        setIdUpdate(idEmpresa)
    }

    const createHeadquarters = async (data) => {
        try {
            const Headquarters = {
                nombre: data.nombre,
                siglas: data.siglas,
                idEmpresa: data.idEmpresa,
                idCiudad: data.idCiudad
            }

            if (idUpdate) {
                const idSede = idUpdate
                const res = await axios.patch(`${URLBASE}/empresas/sedes/${idSede}`, Headquarters)
                toast.success(`${res.data?.message}`)
                setIdUpdate(false)
            } else {
                const res = await axios.post(`${URLBASE}/empresas/sedes`, Headquarters)
                toast.success(`${res.data?.message}`)
            }
            
            resetHeadquarters({ nombre: "", siglas: "", idEmpresa: "", idCiudad: "" })
            setRefreshData(!refreshData)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al procesar sede')
        }
    }

    const createDepartment = async (data) => {
        try {
            const departamento = { nombre: data.nombre }
            const response = await axios.post(`${URLBASE}/ciudades/departamentos`, departamento)
            toast.success(`Departamento creado: ${response.data.message}`)
            resetDepartament({ nombre: "" })
            setRefreshData(!refreshData)
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || 'Error desconocido'}`)
        }
    }

    const createCity = async (data) => {
        try {
            const city = {
                nombre: data.nombre,
                idDepartamento: data.idDepartamento
            }
            const res = await axios.post(`${URLBASE}/ciudades`, city)
            toast.success(res.data.message)
            resetCity({ nombre: "", idDepartamento: "" })
            setRefreshData(!refreshData)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al crear ciudad')
        }
    }

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true)
                const [empresasData, sedesData, hubsData, ciudadesData, departamentosData] = await Promise.all([
                    axios.get(`${URLBASE}/empresas`),
                    axios.get(`${URLBASE}/empresas/sedes`),
                    axios.get(`${URLBASE}/empresas/hubs`),
                    axios.get(`${URLBASE}/ciudades`),
                    axios.get(`${URLBASE}/ciudades/departamentos`),
                ])
                setDataFetch({
                    empresas: empresasData.data?.data,
                    sedes: sedesData.data?.data,
                    hubs: hubsData.data?.data,
                    ciudades: ciudadesData.data?.data,
                    departamentos: departamentosData.data?.data
                })
            } catch (error) {
                toast.error('Error al cargar los datos')
            } finally {
                setLoading(false)
            }
        }
        fetchAllData()
    }, [refreshData])

    const deleteHeadquarters = async (idSede) => {
        try {
            const res = await axios.delete(`${URLBASE}/empresas/sedes/${idSede}`)
            toast.success(`${res.data.message}`)
            setRefreshData(!refreshData)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar sede')
        }
    }

    const editHeadquarters = (idSede) => {
        const headquarter = dataFetch.sedes.find(sede => sede.idSede == idSede)
        const headquarterObj = { 
            ...headquarter, 
            idEmpresa: headquarter.Empresa.idEmpresa, 
            idCiudad: headquarter.Ciudade.idCiudad 
        }
        resetHeadquarters(headquarterObj)
        setIdUpdate(idSede)
    }

    const actionCancel = () => {
        reset({ nombre: "", nit: "", idHub: "", urlLogo: null });
        resetDepartament({ nombre: "" })
        resetHeadquarters({ nombre: "", siglas: "", idEmpresa: "", idCiudad: "" })
        resetCity({ nombre: "", idDepartamento: "" })
        setFilePreview(null);
        setFileName("");
        setIdUpdate(false)
    }

    // Filtros de búsqueda
    const filteredEmpresas = dataRender.empresas?.filter(empresa => {
        if (!searchEmpresa.trim()) return true; // Si no hay búsqueda, mostrar todos
        
        const searchTerm = searchEmpresa.toLowerCase();
        const nombre = empresa?.nombre?.toLowerCase() || '';
        const nit = empresa?.nit?.toLowerCase() || '';
        const hub = empresa?.Hub?.nombre?.toLowerCase() || '';
        
        return nombre.includes(searchTerm) || 
               nit.includes(searchTerm) || 
               hub.includes(searchTerm);
    }) || []

    const filteredSedes = dataRender.sedes?.filter(sede => {
        if (!searchSede.trim()) return true; // Si no hay búsqueda, mostrar todos
        
        const searchTerm = searchSede.toLowerCase();
        const nombre = sede?.nombre?.toLowerCase() || '';
        const siglas = sede?.siglas?.toLowerCase() || '';
        const empresa = sede?.Empresa?.nombre?.toLowerCase() || '';
        const ciudad = sede?.Ciudade?.nombre?.toLowerCase() || '';
        
        return nombre.includes(searchTerm) || 
               siglas.includes(searchTerm) || 
               empresa.includes(searchTerm) || 
               ciudad.includes(searchTerm);
    }) || []

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zvioleta mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando datos...</p>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gray-50 p-6 w-full">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <FaBuilding className="text-zvioleta text-2xl" />
                        <h1 className="text-2xl font-bold text-zvioleta">Administrar Unidades de Negocio</h1>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Empresas Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaBuilding className="text-zvioleta text-xl" />
                                    <h2 className="text-xl font-semibold text-zvioleta">Empresas</h2>
                                </div>
                                <button 
                                    onClick={() => showFormCreate("empresas")}
                                    className="flex items-center gap-2 text-zvioleta hover:text-zvioleta/80 transition-colors"
                                >
                                    {showCreate.empresas ? (
                                        <>
                                            <MdExpandLess className="text-2xl" />
                                            <span>Ocultar</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="text-sm" />
                                            <span>Gestionar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {showCreate.empresas && (
                            <div className="p-6">
                                {/* Form */}
                                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                    <h3 className="text-lg font-medium text-zvioleta mb-4 flex items-center gap-2">
                                        <FaPlus className="text-zvioleta" />
                                        {idUpdate ? 'Editar Empresa' : 'Nueva Empresa'}
                                    </h3>
                                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit(createBussines)} encType="multipart/form-data">
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre de la Empresa
                                            </label>
                                            <input 
                                                type="text" 
                                                id="nombre" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                placeholder="Ingrese el nombre de la empresa"
                                                {...register("nombre", { required: true })} 
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="nit" className="block text-sm font-medium text-gray-700 mb-1">
                                                NIT
                                            </label>
                                            <input 
                                                type="text" 
                                                id="nit" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                placeholder="Número de identificación tributaria"
                                                {...register("nit", { required: true })} 
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="idHub" className="block text-sm font-medium text-gray-700 mb-1">
                                                Hub
                                            </label>
                                            <select 
                                                name="idHub" 
                                                id="idHub" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                {...register("idHub", { required: true })}
                                            >
                                                <option value="">Seleccione un hub</option>
                                                {dataFetch.hubs?.map(hub => (
                                                    <option key={hub.idHub} value={hub.idHub}>{hub.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Logo de la Empresa
                                            </label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-zvioleta transition-colors">
                                                <div className="space-y-1 text-center">
                                                    {filePreview ? (
                                                        <div className="relative">
                                                            <img src={filePreview} alt="Vista previa" className="mx-auto h-32 w-32 object-contain rounded-lg" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setFilePreview(null);
                                                                    setFileName("");
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                                                            <div className="flex text-sm text-gray-600">
                                                                <label htmlFor="urlLogo" className="relative cursor-pointer bg-white rounded-md font-medium text-zvioleta hover:text-zvioleta/80">
                                                                    <span>Subir archivo</span>
                                                                    <input
                                                                        id="urlLogo"
                                                                        name="file"
                                                                        type="file"
                                                                        className="sr-only"
                                                                        accept="image/*"
                                                                        onChange={handleFileChange}
                                                                    />
                                                                </label>
                                                                <p className="pl-1">o arrastrar y soltar</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {fileName && (
                                                <p className="text-sm text-gray-600 mt-2">{fileName}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                            <button 
                                                type="button" 
                                                onClick={actionCancel}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                type="submit"
                                                className="px-6 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg transition-colors"
                                            >
                                                {idUpdate ? 'Actualizar' : 'Crear'} Empresa
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Buscador de Empresas */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar empresas por nombre, NIT o hub..."
                                            value={searchEmpresa}
                                            onChange={(e) => setSearchEmpresa(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent"
                                        />
                                    </div>
                                    {searchEmpresa && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {filteredEmpresas.length} empresa(s) encontrada(s)
                                        </p>
                                    )}
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                                            <tr>
                                                <th className="px-6 py-3">Empresa</th>
                                                <th className="px-6 py-3">NIT</th>
                                                <th className="px-6 py-3">Hub</th>
                                                <th className="px-6 py-3">Logo</th>
                                                <th className="px-6 py-3 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredEmpresas.length > 0 ? (
                                                filteredEmpresas.map(empresa => (
                                                    <tr key={empresa.idEmpresa} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{empresa.nombre}</td>
                                                        <td className="px-6 py-4 text-gray-600">{empresa.nit}</td>
                                                        <td className="px-6 py-4 text-gray-600">{empresa.Hub?.nombre || 'Sin asignar'}</td>
                                                        <td className="px-6 py-4">
                                                            <img className="w-16 h-16 object-contain rounded-lg border border-gray-200" src={empresa.urlLogo} alt={empresa.nombre} />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center">
                                                                <button 
                                                                    onClick={() => editBussines(empresa.idEmpresa)} 
                                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                                    title="Editar empresa"
                                                                >
                                                                    <PiPencilSimpleLineFill className="text-lg" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                        {searchEmpresa ? 'No se encontraron empresas que coincidan con la búsqueda' : 'No hay empresas registradas'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4">
                                    <Pagination dataFetch={dataFetch.empresas} setData={setDataRender} totalRows={10} clave={"empresas"} />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Sedes Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaMapMarkerAlt className="text-zvioleta text-xl" />
                                    <h2 className="text-xl font-semibold text-zvioleta">Sedes</h2>
                                </div>
                                <button 
                                    onClick={() => showFormCreate("sedes")}
                                    className="flex items-center gap-2 text-zvioleta hover:text-zvioleta/80 transition-colors"
                                >
                                    {showCreate.sedes ? (
                                        <>
                                            <MdExpandLess className="text-2xl" />
                                            <span>Ocultar</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="text-sm" />
                                            <span>Gestionar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {showCreate.sedes && (
                            <div className="p-6">
                                {/* Form */}
                                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                    <h3 className="text-lg font-medium text-zvioleta mb-4 flex items-center gap-2">
                                        <FaPlus className="text-zvioleta" />
                                        {idUpdate ? 'Editar Sede' : 'Nueva Sede'}
                                    </h3>
                                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmitHeadquarters(createHeadquarters)}>
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre de la Sede
                                            </label>
                                            <input 
                                                type="text" 
                                                id="nombre" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                placeholder="Ingrese el nombre de la sede"
                                                {...registerHeadquarters("nombre", { required: true })} 
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="siglas" className="block text-sm font-medium text-gray-700 mb-1">
                                                Siglas
                                            </label>
                                            <input 
                                                type="text" 
                                                id="siglas" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                placeholder="Siglas de la sede"
                                                {...registerHeadquarters("siglas", { required: true })} 
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="idEmpresa" className="block text-sm font-medium text-gray-700 mb-1">
                                                Empresa
                                            </label>
                                            <select 
                                                name="idEmpresa" 
                                                id="idEmpresa" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                {...registerHeadquarters("idEmpresa", { required: true })}
                                            >
                                                <option value="">Seleccione una empresa</option>
                                                {dataFetch.empresas?.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(empresa => (
                                                    <option key={empresa.idEmpresa} value={empresa.idEmpresa}>{empresa.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="idCiudad" className="block text-sm font-medium text-gray-700 mb-1">
                                                Ciudad
                                            </label>
                                            <select 
                                                name="idCiudad" 
                                                id="idCiudad" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                {...registerHeadquarters("idCiudad", { required: true })}
                                            >
                                                <option value="">Seleccione una ciudad</option>
                                                {dataFetch.ciudades?.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(ciudad => (
                                                    <option key={ciudad.idCiudad} value={ciudad.idCiudad}>{ciudad.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                            <button 
                                                type="button" 
                                                onClick={actionCancel}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                type="submit"
                                                className="px-6 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg transition-colors"
                                            >
                                                {idUpdate ? 'Actualizar' : 'Crear'} Sede
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Buscador de Sedes */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar sedes por nombre, siglas, empresa o ciudad..."
                                            value={searchSede}
                                            onChange={(e) => setSearchSede(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent"
                                        />
                                    </div>
                                    {searchSede && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {filteredSedes.length} sede(s) encontrada(s)
                                        </p>
                                    )}
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                                            <tr>
                                                <th className="px-6 py-3">Empresa</th>
                                                <th className="px-6 py-3">Sede</th>
                                                <th className="px-6 py-3">Siglas</th>
                                                <th className="px-6 py-3">Ciudad</th>
                                                <th className="px-6 py-3 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSedes.length > 0 ? (
                                                filteredSedes.map(sede => (
                                                    <tr key={sede.idSede} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{sede.Empresa.nombre}</td>
                                                        <td className="px-6 py-4 text-gray-600">{sede.nombre}</td>
                                                        <td className="px-6 py-4 text-gray-600">{sede.siglas}</td>
                                                        <td className="px-6 py-4 text-gray-600">{sede.Ciudade.nombre}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center gap-2">
                                                                <button 
                                                                    onClick={() => editHeadquarters(sede.idSede)} 
                                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                                    title="Editar sede"
                                                                >
                                                                    <PiPencilSimpleLineFill className="text-lg" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => deleteHeadquarters(sede.idSede)}
                                                                    className="text-red-600 hover:text-red-800 p-1"
                                                                    title="Eliminar sede"
                                                                >
                                                                    <MdDelete className="text-lg" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                        {searchSede ? 'No se encontraron sedes que coincidan con la búsqueda' : 'No hay sedes registradas'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4">
                                    <Pagination dataFetch={dataFetch.sedes.sort((a, b) => a.Empresa.nombre.localeCompare(b.Empresa.nombre))} totalRows={10} setData={setDataRender} clave={"sedes"} />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Departamentos Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaMapMarkerAlt className="text-zvioleta text-xl" />
                                    <h2 className="text-xl font-semibold text-zvioleta">Departamentos</h2>
                                </div>
                                <button 
                                    onClick={() => showFormCreate("departamentos")}
                                    className="flex items-center gap-2 text-zvioleta hover:text-zvioleta/80 transition-colors"
                                >
                                    {showCreate.departamentos ? (
                                        <>
                                            <MdExpandLess className="text-2xl" />
                                            <span>Ocultar</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="text-sm" />
                                            <span>Gestionar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {showCreate.departamentos && (
                            <div className="p-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-zvioleta mb-4 flex items-center gap-2">
                                        <FaPlus className="text-zvioleta" />
                                        Nuevo Departamento
                                    </h3>
                                    <form className="flex gap-4 items-end" onSubmit={handleSubmitDepartament(createDepartment)}>
                                        <div className="flex-1">
                                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre del Departamento
                                            </label>
                                            <input 
                                                type="text" 
                                                id="nombre" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                placeholder="Ingrese el nombre del departamento"
                                                {...registerDepartament("nombre", { required: true })} 
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button 
                                                type="button" 
                                                onClick={actionCancel}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                type="submit"
                                                className="px-6 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg transition-colors"
                                            >
                                                Crear Departamento
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ciudades Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaCity className="text-zvioleta text-xl" />
                                    <h2 className="text-xl font-semibold text-zvioleta">Ciudades</h2>
                                </div>
                                <button 
                                    onClick={() => showFormCreate("ciudades")}
                                    className="flex items-center gap-2 text-zvioleta hover:text-zvioleta/80 transition-colors"
                                >
                                    {showCreate.ciudades ? (
                                        <>
                                            <MdExpandLess className="text-2xl" />
                                            <span>Ocultar</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="text-sm" />
                                            <span>Gestionar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {showCreate.ciudades && (
                            <div className="p-6">
                                {/* Form */}
                                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                    <h3 className="text-lg font-medium text-zvioleta mb-4 flex items-center gap-2">
                                        <FaPlus className="text-zvioleta" />
                                        Nueva Ciudad
                                    </h3>
                                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmitCity(createCity)}>
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre de la Ciudad
                                            </label>
                                            <input 
                                                type="text" 
                                                id="nombre" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                placeholder="Ingrese el nombre de la ciudad"
                                                {...registerCity("nombre", { required: true })} 
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="idDepartamento" className="block text-sm font-medium text-gray-700 mb-1">
                                                Departamento
                                            </label>
                                            <select 
                                                name="idDepartamento" 
                                                id="idDepartamento" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent" 
                                                {...registerCity("idDepartamento", { required: true })}
                                            >
                                                <option value="">Seleccione un departamento</option>
                                                {dataFetch.departamentos?.map(departamento => (
                                                    <option key={departamento.idDepartamento} value={departamento.idDepartamento}>
                                                        {departamento.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                            <button 
                                                type="button" 
                                                onClick={actionCancel}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                type="submit"
                                                className="px-6 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg transition-colors"
                                            >
                                                Crear Ciudad
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                                            <tr>
                                                <th className="px-6 py-3">Ciudad</th>
                                                <th className="px-6 py-3">Departamento</th>
                                                <th className="px-6 py-3">Fecha de Actualización</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataRender.ciudades?.map(ciudad => (
                                                <tr key={ciudad.idCiudad} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{ciudad.nombre}</td>
                                                    <td className="px-6 py-4 text-gray-600">{ciudad.Departamento?.nombre}</td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        {new Date(ciudad.updatedAt).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4">
                                    <Pagination dataFetch={dataFetch.ciudades} totalRows={10} setData={setDataRender} clave={"ciudades"} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Empresas