import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { URLBASE } from '../../lib/actions';
import Modal from '../../components/Modal';
import EvaluacionesModal from '../../components/EvaluacionesModal';
import { PiPencilSimpleLineFill } from 'react-icons/pi';
import Pagination from '../../components/Pagination';
import { IoMdCheckboxOutline } from "react-icons/io";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import Loading from '../Loading';


// import TableComponent from '../../components/TableComponent';

const Usuarios = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const { register: registerBusiness, handleSubmit: handleSubmitBusiness, reset: resetBusiness } = useForm();
  const { register: registerSearch, handleSubmit: handleSubmitSearch, reset: resetSearch } = useForm();
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
  const [isCreate, setIsCreate] = useState(true)


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
              nombre: item.nombre,
              idEvaluacion: item.usuariosEvaluadores?.idEvaluacion
          })) || []);
        setIsCreate(false)

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
      if(isCreate) {
        axios.post(`${URLBASE}/usuarios`, data)
        .then(() => {
          toast.success('Usuario creado exitosamente!.')
          buscarUsuario(data)
        })
        .catch(() => toast.success('Error al actualizar usuario.'))
      }else{
        axios.put(`${URLBASE}/usuarios/${data.idUsuario}`, data)
          .then(() => {
            toast.success('Usuario actualizado exitosamente.')
            
          })
          .catch(() => toast.success('Error al actualizar usuario.'))
      }
  };

  const cancelarBusqueda = () => {
    reset();
    resetSearch()
    setUsuario([]);
    setAsignadasEmpresas([])
    setAsignadasSedes([])
    setDataRender({ empresas: [] })
    setEvaluacion([])
    setColaboradores([])
    setAsignadosColaboradores([])
    setIsCreate(true)
  };

  const empresasSedesUsuarios = asignadasSedes?.map(sede => {
    const empresa = asignadasEmpresas.find(empresa => sede.idEmpresa === empresa.idEmpresa);

    return {
      nombre: sede.nombre,
      idSede: sede.idSede,
      principal: sede.UsuariosSedes.principal,
      reporte: sede.UsuariosSedes.reportes,
      empresa: empresa ? {
        nombre: empresa.nombre,
        idEmpresa: empresa.idEmpresa,
        principal: empresa.UsuariosEmpresas.principal,
        reporte: empresa.UsuariosEmpresas.reportes
      } : null
    };
  })

  const changeSedes = (idEmpresa) => {
    const sedesByEmpresa = empresas.find(empresa => empresa.idEmpresa == idEmpresa)
    setSedesRender(sedesByEmpresa ? sedesByEmpresa.Sedes : [])
  }

  const asignarEmpresa = (data) => {
    if(!usuario?.idUsuario) {
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
    <div className="p-8 bg-gray-50 rounded-lg shadow-md mx-auto w-10/12">
      <Loading loading={loading} />
      <h1 className="text-4xl font-bold mb-8 text-center text-zvioleta">Administrar Usuarios</h1>

      <div className="mb-8">
        <form onSubmit={handleSubmitSearch(buscarUsuario)} className="flex gap-4">
          <input
            type="number"
            {...registerSearch('idUsuario')}
            placeholder="Buscar por numero de documento"
            className="border p-3 rounded-lg w-full"
          />
          <input
            type="email"
            disabled={true}
            {...registerSearch('correo')}
            placeholder="Correo"
            className="border p-3 rounded-lg w-full cursor-not-allowed bg-gray-50 border-gray-300 text-gray-600"
          />
          <button className="bg-zvioleta text-white px-6 py-3 rounded-lg">
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      <form onSubmit={handleSubmit(actualizarUsuario)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">ID Usuario</label>
            <input type="number" {...register('idUsuario', { required: true })} className={`border p-3 rounded-lg w-full ${isCreate ? '': 'cursor-not-allowed bg-gray-50'}`} disabled={!isCreate} />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Nombre</label>
            <input type="text" {...register('nombre', { required: true })} className="border p-3 rounded-lg w-full" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Correo</label>
            <input type="email" {...register('correo', { required: true })} className="border p-3 rounded-lg w-full" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Cargo</label>
            <input type="text" {...register('cargo', { required: true })} className="border p-3 rounded-lg w-full" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Área</label>
            <input type="text" {...register('area')} className="border p-3 rounded-lg w-full" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Fecha de ingreso</label>
            <input type="date" {...register('fechaIngreso')} className="border p-3 rounded-lg w-full" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Perfil</label>
            <select {...register('idPerfil', { required: true })} className="border p-3 rounded-lg w-full">
              {perfiles.length > 0 ? perfiles?.map((perfil) => (
                <option key={perfil.idPerfil} value={perfil.idPerfil}>{perfil.nombre}</option>
              )) : (
                <option defaultValue={""} value="">Cargando perfiles...</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Nivel de Cargo</label>
            <select {...register('idNivelCargo', { required: true })} className="border p-3 rounded-lg w-full">
              {nivelesCargo?.map((nivel) => (
                <option key={nivel.idNivelCargo} value={nivel.idNivelCargo}>{nivel.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <input type="password" {...register('contrasena')} className="border p-3 rounded-lg w-full" />
          </div>
          <div className='flex justify-around items-center'>
            <div className='flex flex-col'>
              <label className="block text-gray-700 mb-2">¿Cambiar contraseña?</label>
              <input type="checkbox" {...register('defaultContrasena')} className="border p-3 rounded-lg" />
            </div>
            <div className='flex flex-col'>
              <label className="block text-gray-700 mb-2">¿Activo?</label>
              <input type="checkbox" {...register('activo')} className="border p-3 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">

          <button
            type="button"
            onClick={() => setShowModal({ type: 'Colaboradores', open: true })}
            className="bg-zvioleta text-white px-4 py-2 rounded-lg"
          >
            Asignar Colaboradores
          </button>
          <EvaluacionesModal evaluaciones={evaluacion} idColaborador={usuario?.idUsuario} buscarUsuario={() => buscarUsuario({ idUsuario: usuario?.idUsuario })} />
        </div>
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
        <div className="flex gap-4 mt-8 w-1/3">
          <button type="submit" className="bg-zverde text-white px-6 py-3 rounded-lg w-full hover:scale-105">Guardar</button>
          <button type="button" onClick={cancelarBusqueda} className="bg-zcinza text-black px-6 py-3 rounded-lg w-full hover:scale-105">
            Cancelar
          </button>
        </div>
      </form>
      <h2 className='text-zvioleta text-2xl font-bold my-4'>Empresas y sedes asignadas</h2>
      <form className='flex gap-4 w-full justify-around items-center' onSubmit={handleSubmitBusiness(asignarEmpresa)}>
        <div className='' >
          <label htmlFor={`empresa`}>Empresa</label>
          <select
            name="empresa"
            id={`empresa`}
            className='input-custom'
            {...registerBusiness("idEmpresa", {
              onChange: (e) => changeSedes(e.target.value)
            })}
          >
            <option value="" selected defaultValue={""} >Seleccione</option>
            {
              empresas.map(empresa => (
                <option value={empresa.idEmpresa} key={empresa.idEmpresa}>{empresa.nombre}</option>
              ))
            }
          </select>
        </div>
        <div className=''>
          <label htmlFor={`sede`}>Sede</label>
          <select name="sede" id={`sede`} className='input-custom' {...registerBusiness("idSede")}>
            <option value="" selected defaultValue={""} >Seleccione</option>
            {
              sedesRender?.map(sede => (
                <option value={sede?.idSede} key={sede?.idSede}>{sede?.nombre}</option>
              ))
            }
          </select>
        </div>
        <div className='flex justify-center items-center flex-col'>
          <label htmlFor={`principal`} className='block text-gray-500'>¿Principal?</label>
          <input type="checkbox" name="principal" id={`principal`} className='border p-2 rounded-lg' {...registerBusiness("principal")} />
        </div>
        <div className='flex justify-center items-center flex-col'>
          <label htmlFor={`rep-empresa`} className='block text-gray-500'>¿Rep Empresa?</label>
          <input type="checkbox" name="reporte-empresa" id={`rep-empresa`} className='border p-2 rounded-lg' {...registerBusiness("repEmpresa")} />
        </div>
        <div className='flex justify-center items-center flex-col'>
          <label htmlFor={`rep-sede`} className='block text-gray-500'>¿Rep Sede?</label>
          <input type="checkbox" name="reporte" id={`rep-sede`} className='border p-2 rounded-lg' {...registerBusiness("repSede")} />
        </div>
        <div className='flex justify-center items-center flex-col'>
          <label htmlFor={`activo`} className='block text-gray-500'>¿Activo?</label>
          <input type="checkbox" defaultChecked={true} name="activo" id={`activo`} className='border p-2 rounded-lg'{...registerBusiness("activo")} />
        </div>
        <div className='flex gap-2'>
          <button className='bg-zverde text-white py-1 px-3 rounded-md hover:scale-105 hover:bg-zverde/90'>Agregar</button>
          <button type='button' onClick={cancelAction} className='bg-zcinza text-black py-1 px-3 rounded-md hover:scale-105 hover:bg-zcinza/90'>Cancelar</button>
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
              ¿Principal?
            </th>
            <th scope="col" className="px-6 py-3">
              ¿Reporte Empresa?
            </th>
            <th scope="col" className="px-6 py-3">
              ¿Reporte Sede?
            </th>
            <th scope="col" className="px-6 py-3">
              ¿Activo?
            </th>
            <th scope="col" className="px-6 py-3">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {
            dataRender.empresas?.map((sede, index) => (
              <tr className="odd:bg-white even:bg-gray-50 border-b border-gray-200" key={`empresas-${index}`}>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                  {sede.empresa?.nombre}
                </th>
                <td className="px-6 py-4">
                  {sede.nombre || 'Sin asignar'}
                </td>
                <td className="px-6 py-4">
                  {sede.principal ? <IoMdCheckboxOutline className='text-znaranja text-lg font-bold' /> : <MdOutlineCheckBoxOutlineBlank className='text-lg font-bold' />}
                </td>
                <td className="px-6 py-4">
                  {sede.empresa?.reporte ? <IoMdCheckboxOutline className='text-znaranja text-lg font-bold' /> : <MdOutlineCheckBoxOutlineBlank className='text-lg font-bold' />}
                </td>
                <td className="px-6 py-4">
                  {sede.reporte ? <IoMdCheckboxOutline className='text-znaranja text-lg font-bold' /> : <MdOutlineCheckBoxOutlineBlank className='text-lg font-bold' />}
                </td>
                <td className="px-6 py-4">
                  {sede.activo ? <IoMdCheckboxOutline className='text-znaranja text-lg font-bold' /> : <MdOutlineCheckBoxOutlineBlank className='text-lg font-bold' />}
                </td>
                <td className="px-6 py-4 text-lg flex justify-center items-center gap-4">
                  <button onClick={() => updateBusiness(sede.empresa?.idEmpresa, sede?.idSede)} className="text-zverde"><PiPencilSimpleLineFill /></button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      <Pagination dataFetch={empresasSedesUsuarios?.sort((a, b) => a.empresa?.nombre.localeCompare(b.empresa?.nombre))} clave={"empresas"} key={1} totalRows={10} setData={setDataRender} />
    </div>

  );
};

export default Usuarios;


