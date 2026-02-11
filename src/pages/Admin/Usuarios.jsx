import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'sonner';
import { URLBASE } from '../../lib/actions';
import Modal from '../../components/Modal';
import EvaluacionesModal from '../../components/EvaluacionesModal';
import Pagination from '../../components/Pagination';
import { IoMdCheckboxOutline } from "react-icons/io";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import Loading from '../Loading';
import { FaSearch, FaUser, FaBuilding, FaPlus, FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa';


// import TableComponent from '../../components/TableComponent';

const Usuarios = () => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { register: registerBusiness, handleSubmit: handleSubmitBusiness, reset: resetBusiness } = useForm();
  const { register: registerSearch, handleSubmit: handleSubmitSearch, reset: resetSearch, formState: { errors: errorsSearcg } } = useForm();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [perfiles, setPerfiles] = useState([]);
  const [nivelesCargo, setNivelesCargo] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [asignadasEmpresas, setAsignadasEmpresas] = useState([]);
  const [asignadasSedes, setAsignadasSedes] = useState([]);
  const [asignadosColaboradores, setAsignadosColaboradores] = useState([]);
  const [showModal, setShowModal] = useState({ type: '', open: false });
  const [evaluacion, setEvaluacion] = useState([])
  const [sedesRender, setSedesRender] = useState([])
  const [dataRender, setDataRender] = useState({
    empresas: []
  })
  const [isCreate, setIsCreate] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfilesRes, nivelesCargoRes] = await Promise.all([
          axios.get(`${URLBASE}/usuarios/perfiles`),
          axios.get(`${URLBASE}/usuarios/nivelcargos`),
        ]);
        setPerfiles(perfilesRes.data?.data);
        setNivelesCargo(nivelesCargoRes.data?.data);
      } catch {
        toast.error('Error al cargar datos iniciales.');
      }
    };
    fetchData();
  }, []);


  const buscarUsuario = async (data) => {
    const { idUsuario, correo } = data;
    setLoading(true);
    try {
      const response = await axios.get(`${URLBASE}/usuarios`, { params: { idUsuario, correo } });
      const userData = response.data?.data;

      if (userData) {
        setUsuario(userData);
        setEvaluacion(response.data?.evaluacion)
        setAsignadasEmpresas(userData.Empresas || []);
        setAsignadasSedes(userData.Sedes || []);
        setAsignadosColaboradores(userData.colaboradores?.map(item => ({
          id: item.idUsuario,
          idUsuario: item.idUsuario,
          idEvaluador: item.idEvaluador,
          nombre: item.nombre,
          idEvaluacion: item.idEvaluacion
        })) || []);
        setIsCreate(false)
        setShowPassword(false);

        const [empresasRes, colaboradoresRes] = await Promise.all([
          axios.get(`${URLBASE}/empresas`),
          axios.get(`${URLBASE}/usuarios/colaboradores`)
        ]);
        setEmpresas(empresasRes.data?.data);
        setColaboradores(colaboradoresRes.data?.data);

        setValue('idUsuario', userData.idUsuario);
        setValue('nombre', userData.nombre);
        setValue('correo', userData.correo);
        setValue('cargo', userData.cargo);
        setValue('idPerfil', userData.idPerfil);
        setValue('idNivelCargo', userData.idNivelCargo);
        setValue('contrasena');
        setValue('defaultContrasena', userData.defaultContrasena);
        setValue('activo', userData.activo);
        setValue('fechaIngreso', userData.fechaIngreso?.split('T')[0]);
        setValue('area', userData.area);

        await new Promise((resolve) => setTimeout(resolve, 100));
      } else {
        toast.error('Usuario no encontrado.');
      }
    } catch {
      toast.error('Error al buscar usuario.');
    } finally {
      setLoading(false);
    }
  };

  const actualizarUsuario = (data) => {
    if (isCreate) {
      axios.post(`${URLBASE}/usuarios`, data)
        .then(() => {
          toast.success('Usuario creado exitosamente!.', { toastId: "create-user-success", position: 'top-center', theme: 'colored', transition: 'Flip' })
          buscarUsuario(data)
        })
        .catch(() => toast.success('Error al actualizar usuario.', { toastId: "create-user-err", position: 'top-center', theme: 'colored', transition: 'Flip' }))
    } else {
      axios.put(`${URLBASE}/usuarios/${data.idUsuario}`, data)
        .then(() => {
          toast.success('Usuario actualizado exitosamente.')

        })
        .catch(() => toast.success('Error al actualizar usuario.'))
    }
  };

  const cancelarBusqueda = () => {
    reset();
    resetSearch();
    setUsuario(null);
    setAsignadasEmpresas([]);
    setAsignadasSedes([]);
    setDataRender({ empresas: [] });
    setEvaluacion([]);
    setColaboradores([]);
    setAsignadosColaboradores([]);
    setIsCreate(true);
    setShowPassword(false);
  };

  const empresasSedesUsuarios = asignadasSedes?.map(sede => {
    const empresa = asignadasEmpresas.find(empresa => sede.idEmpresa === empresa.idEmpresa);

    return {
      nombre: sede.nombre,
      idSede: sede.idSede,
      principal: sede.principal,
      reporte: sede.reportes,
      empresa: empresa ? {
        nombre: empresa.nombre,
        idEmpresa: empresa.idEmpresa,
        principal: empresa.principal,
        reporte: empresa.reportes,
        activo: empresa.activo
      } : null
    };
  })

  const changeSedes = (idEmpresa) => {
    const sedesByEmpresa = empresas.find(empresa => empresa.idEmpresa == idEmpresa)
    setSedesRender(sedesByEmpresa ? sedesByEmpresa.Sedes : [])
  }

  const asignarEmpresa = (data) => {
    if (!usuario?.idUsuario) {
      toast.error("Debe crear o buscar un usuario!")
      return
    }
    const dataSend = {
      idUsuario: usuario.idUsuario,
      idEmpresa: data.idEmpresa,
      idSede: data.idSede,
      principal: data.principal,
      repEmpresa: data.repEmpresa,
      repSede: data.repSede,
      activo: data.activo
    }
    axios.post(`${URLBASE}/usuarios/empresassedes`, dataSend)
      .then(res => {
        toast.success(`¡${res.data.message}!`)
        buscarUsuario(dataSend)
      })
      .catch(err => {
        toast.error(err.response.data.message)
      })
  }

  const updateBusiness = (idEmpresa, idSede) => {
    const business = empresasSedesUsuarios?.find(sede => sede.idSede == idSede && sede.empresa.idEmpresa == idEmpresa)
    const objReset = {
      idEmpresa: business?.empresa.idEmpresa,
      idSede: business.idSede,
      principal: business.principal,
      repEmpresa: business?.empresa.reporte,
      repSede: business.reporte,
      activo: business.activo
    }
    changeSedes(objReset.idEmpresa)
    resetBusiness(objReset)
  }

  const cancelAction = () => {
    resetBusiness({
      idEmpresa: "",
      idSede: "",
      principal: "",
      repEmpresa: "",
      repSede: "",
      activo: ""
    })
  }


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 w-full">
      <Loading loading={loading} />
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Administrar Usuarios
          </h1>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaSearch className="text-gray-500" size={20} />
            <h2 className="text-lg font-medium text-gray-900">Buscar Usuario</h2>
          </div>

          <form onSubmit={handleSubmitSearch(buscarUsuario)} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Documento
              </label>
              <input
                type="number"
                {...registerSearch('idUsuario', { required: 'Este campo es obligatorio' })}
                placeholder="Ingrese el número de documento"
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
              />
              {
                errorsSearcg.idUsuario && <p className="text-red-500 text-sm">{errorsSearcg.idUsuario.message}</p>
              }
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo (Deshabilitado)
              </label>
              <input
                type="email"
                disabled={true}
                {...registerSearch('correo')}
                placeholder="Correo electrónico"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 cursor-not-allowed bg-gray-50 text-gray-500"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="bg-zvioleta hover:bg-zvioleta/90 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm"
                disabled={loading}
              >
                <FaSearch size={16} />
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>
        </div>

        {/* User Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaUser className="text-gray-500" size={20} />
            <h2 className="text-lg font-medium text-gray-900">
              {isCreate ? 'Crear Usuario' : 'Editar Usuario'}
            </h2>
          </div>

          <form onSubmit={handleSubmit(actualizarUsuario)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Usuario <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  {...register('idUsuario', { required: "Este campo es obligatorio" })}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 ${isCreate ? 'focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta' : 'cursor-not-allowed bg-gray-50 text-gray-500'}`}
                  disabled={!isCreate}
                />
                {errors.idUsuario && <p className="text-red-500 text-sm">{errors.idUsuario.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('nombre', { required: "Este campo es obligatorio" })}
                  onChange={(e) => setValue("nombre", e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
                />
                {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder='Ej: nombre.apellido@zentria.com.co'
                  {...register('correo', { required: "Este campo es obligatorio" })}
                  onChange={(e) => setValue("correo", e.target.value.toLowerCase())}
                  className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
                />
                {errors.correo && <p className="text-red-500 text-sm">{errors.correo.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('cargo', { required: "Este campo es obligatorio" })}
                  onChange={(e) => setValue("cargo", e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
                />
                {errors.cargo && <p className="text-red-500 text-sm">{errors.cargo.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Área <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('area', { required: "Este campo es obligatorio" })}
                  onChange={(e) => setValue("area", e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
                />
                {errors.area && <p className="text-red-500 text-sm">{errors.area.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de ingreso <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  {...register('fechaIngreso', { required: "Este campo es obligatorio" })}
                  className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
                />
                {errors.fechaIngreso && <p className="text-red-500 text-sm">{errors.fechaIngreso.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Perfil <span className="text-red-500">*</span></label>
                <select
                  {...register('idPerfil', { required: "Este campo es obligatorio" })}
                  className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
                >
                  <option value="">Seleccione un perfil...</option>
                  {perfiles.length > 0 ? perfiles?.map((perfil) => (
                    <option key={perfil.idPerfil} value={perfil.idPerfil}>{perfil.nombre}</option>
                  )) : (
                    <option value="">Cargando perfiles...</option>
                  )}
                </select>
                {errors.idPerfil && <p className="text-red-500 text-sm">{errors.idPerfil.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Cargo <span className="text-red-500">*</span></label>
                <select
                  {...register('idNivelCargo', { required: "Este campo es obligatorio" })}
                  className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
                >
                  <option value="">Seleccione un nivel...</option>
                  {nivelesCargo?.map((nivel) => (
                    <option key={nivel.idNivelCargo} value={nivel.idNivelCargo}>{nivel.nombre}</option>
                  ))}
                </select>
                {errors.idNivelCargo && <p className="text-red-500 text-sm">{errors.idNivelCargo.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {isCreate && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('contrasena', {
                      required: isCreate ? "Este campo es obligatorio al crear un usuario" : false
                    })}
                    placeholder={isCreate ? "Ingrese la contraseña" : "Dejar vacío para mantener la actual"}
                    className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 pr-12"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.contrasena && <p className="text-red-500 text-sm">{errors.contrasena.message}</p>}
              </div>
              <div className="flex justify-around items-center">
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">¿Cambiar contraseña?</label>
                  <input
                    type="checkbox"
                    {...register('defaultContrasena', { required: isCreate ? "Este campo es obligatorio" : false })}
                    className="w-5 h-5 text-zvioleta border-gray-300 rounded focus:ring-zvioleta"
                    defaultChecked
                  />
                  {errors.defaultContrasena && <p className="text-red-500 text-sm">{errors.defaultContrasena.message}</p>}
                </div>
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">¿Activo?</label>
                  <input
                    type="checkbox"
                    {...register('activo', { required: isCreate ? "Este campo es obligatorio" : false })}
                    className="w-5 h-5 text-zvioleta border-gray-300 rounded focus:ring-zvioleta"
                    defaultChecked
                  />
                  {errors.activo && <p className="text-red-500 text-sm">{errors.activo.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowModal({ type: 'Colaboradores', open: true })}
                className="bg-zvioleta hover:bg-zvioleta/90 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <FaUser size={16} />
                Asignar Colaboradores
              </button>
              <EvaluacionesModal
                evaluaciones={evaluacion}
                idColaborador={usuario?.idUsuario}
                buscarUsuario={() => buscarUsuario({ idUsuario: usuario?.idUsuario })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-zverde hover:bg-zverde/90 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                {isCreate ? 'Crear Usuario' : 'Actualizar Usuario'}
              </button>
              <button
                type="button"
                onClick={cancelarBusqueda}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
        {/* Companies and Locations Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaBuilding className="text-gray-500" size={20} />
            <h2 className="text-lg font-medium text-gray-900">Empresas y Sedes Asignadas</h2>
          </div>

          <form onSubmit={handleSubmitBusiness(asignarEmpresa)} className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                <select
                  className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
                  {...registerBusiness("idEmpresa", {
                    onChange: (e) => changeSedes(e.target.value)
                  })}
                >
                  <option value="">Seleccione una empresa...</option>
                  {empresas.map(empresa => (
                    <option value={empresa.idEmpresa} key={empresa.idEmpresa}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sede</label>
                <select
                  className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5"
                  {...registerBusiness("idSede")}
                >
                  <option value="">Seleccione una sede...</option>
                  {sedesRender?.map(sede => (
                    <option value={sede?.idSede} key={sede?.idSede}>
                      {sede?.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-center justify-center">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">¿Principal?</label>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-zvioleta border-gray-300 rounded focus:ring-zvioleta"
                  {...registerBusiness("principal")}
                />
              </div>

              <div className="flex flex-col items-center justify-center">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">¿Rep Empresa?</label>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-zvioleta border-gray-300 rounded focus:ring-zvioleta"
                  {...registerBusiness("repEmpresa")}
                />
              </div>

              <div className="flex flex-col items-center justify-center">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">¿Rep Sede?</label>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-zvioleta border-gray-300 rounded focus:ring-zvioleta"
                  {...registerBusiness("repSede")}
                />
              </div>

              <div className="flex flex-col items-center justify-center">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">¿Activo?</label>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="w-5 h-5 text-zvioleta border-gray-300 rounded focus:ring-zvioleta"
                  {...registerBusiness("activo")}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-zverde hover:bg-zverde/90 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <FaPlus size={14} />
                Agregar
              </button>
              <button
                type="button"
                onClick={cancelAction}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Empresa</th>
                  <th scope="col" className="px-6 py-3">Sede</th>
                  <th scope="col" className="px-6 py-3 text-center">¿Principal?</th>
                  <th scope="col" className="px-6 py-3 text-center">¿Reporte Empresa?</th>
                  <th scope="col" className="px-6 py-3 text-center">¿Reporte Sede?</th>
                  <th scope="col" className="px-6 py-3 text-center">¿Activo?</th>
                  <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dataRender.empresas?.map((sede, index) => (
                  <tr className="odd:bg-white even:bg-gray-50 border-b border-gray-200" key={`empresas-${index}`}>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {sede.empresa?.nombre}
                    </th>
                    <td className="px-6 py-4">
                      {sede.nombre || 'Sin asignar'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sede.principal ?
                        <IoMdCheckboxOutline className="text-znaranja text-lg mx-auto" /> :
                        <MdOutlineCheckBoxOutlineBlank className="text-gray-400 text-lg mx-auto" />
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sede.empresa?.reporte ?
                        <IoMdCheckboxOutline className="text-znaranja text-lg mx-auto" /> :
                        <MdOutlineCheckBoxOutlineBlank className="text-gray-400 text-lg mx-auto" />
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sede.reporte ?
                        <IoMdCheckboxOutline className="text-znaranja text-lg mx-auto" /> :
                        <MdOutlineCheckBoxOutlineBlank className="text-gray-400 text-lg mx-auto" />
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                        <IoMdCheckboxOutline className="text-znaranja text-lg mx-auto" />
                      
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => updateBusiness(sede.empresa?.idEmpresa, sede?.idSede)}
                        className="text-zvioleta hover:text-zvioleta/80 transition-colors duration-200"
                        title="Editar"
                      >
                        <FaEdit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              dataFetch={empresasSedesUsuarios?.sort((a, b) => a.empresa?.nombre.localeCompare(b.empresa?.nombre))}
              clave={"empresas"}
              key={1}
              totalRows={10}
              setData={setDataRender}
            />
          </div>
        </div>

        {/* Modal */}
        <Modal
          showModal={showModal.open}
          idUsuario={usuario?.idUsuario || 1}
          type={showModal.type}
          onClose={() => setShowModal({ type: '', open: false })}
          data={{
            disponibles: colaboradores,
            asignados: asignadosColaboradores,
            onChange: (items) => {
              setAsignadosColaboradores(items);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Usuarios;


