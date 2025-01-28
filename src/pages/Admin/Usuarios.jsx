import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { URLBASE } from '../../lib/actions';
import Modal from '../../components/Modal';
import EvaluacionesModal from '../../components/EvaluacionesModal';
// import TableComponent from '../../components/TableComponent';

const Usuarios = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [perfiles, setPerfiles] = useState([]);
  const [nivelesCargo, setNivelesCargo] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [asignadasEmpresas, setAsignadasEmpresas] = useState([]);
  const [asignadasSedes, setAsignadasSedes] = useState([]);
  const [asignadosColaboradores, setAsignadosColaboradores] = useState([]);
  const [showModal, setShowModal] = useState({ type: '', open: false });
  const [evaluacion, setEvaluacion] = useState([])


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
        setAsignadosColaboradores(userData.colaboradores || []);

        const [empresasRes, sedesRes, colaboradoresRes] = await Promise.all([
          axios.get(`${URLBASE}/empresas`),
          axios.get(`${URLBASE}/empresas/sedes`),
          axios.get(`${URLBASE}/usuarios/colaboradores`),
          axios.get(`${URLBASE}/usuarios/colaboradores`)
        ]);
        setEmpresas(empresasRes.data?.data);
        setSedes(sedesRes.data?.data);
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
      } else {
        toast.error('Usuario no encontrado.');
      }
    } catch {
      toast.error('Error al buscar usuario.');
    } finally {
      setLoading(false);
    }
  };

  const actualizarUsuario = async (data) => {
    try {
      await axios.put(`${URLBASE}/usuarios/${data.idUsuario}`, data);
      toast.success('Usuario actualizado exitosamente.');
    } catch {
      toast.error('Error al actualizar usuario.');
    }
  };

  const cancelarBusqueda = () => {
    reset();
    setUsuario(null);
  };

  return (
    <div className="p-8 bg-gray-50 rounded-lg shadow-md max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-zvioleta">Administrar Usuarios</h1>

      <div className="mb-8">
        <form onSubmit={handleSubmit(buscarUsuario)} className="flex gap-4">
          <input
            type="text"
            {...register('idUsuario')}
            placeholder="Buscar por numero de documento"
            className="border p-3 rounded-lg w-full"
          />
          <input
            type="email"
            disabled={true}
            {...register('correo')}
            placeholder="Correo"
            className="border p-3 rounded-lg w-full cursor-not-allowed bg-gray-50 border-gray-300 text-gray-600"
          />
          <button type="submit" className="bg-zvioleta text-white px-6 py-3 rounded-lg">
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {usuario && (
        <form onSubmit={handleSubmit(actualizarUsuario)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">ID Usuario</label>
              <input type="text" {...register('idUsuario')} className="border p-3 rounded-lg w-full" disabled />
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
                )): (
                  <option value="">Cargando perfiles...</option>
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
            {/* <TableComponent usuario={usuario} empresas={empresas}/> */}

          <div className="flex gap-4 mt-6">
            {/* <button
              type="button"
              onClick={() => setShowModal({ type: 'Empresas', open: true })}
              className="bg-zvioleta text-white px-4 py-2 rounded-lg"
            >
              Asignar Empresas
            </button> */}
            <button
              type="button"
              onClick={() => setShowModal({ type: 'Colaboradores', open: true })}
              className="bg-zvioleta text-white px-4 py-2 rounded-lg"
            >
              Asignar Colaboradores
            </button>
          <EvaluacionesModal evaluaciones={evaluacion} idColaborador={usuario?.idUsuario} buscarUsuario={() => buscarUsuario({idUsuario: usuario?.idUsuario})} />
          </div>
          <Modal
            showModal={showModal.open}
            idUsuario={usuario.idUsuario}
            type={showModal.type}
            onClose={() => setShowModal({ type: '', open: false })}
            data={{
              disponibles: showModal.type === 'Empresas' ? empresas : showModal.type === 'Sedes' ? sedes : colaboradores,
              asignados:
                showModal.type === 'Empresas'
                  ? asignadasEmpresas
                  : showModal.type === 'Sedes'
                    ? asignadasSedes
                    : asignadosColaboradores,
              onChange: (items) => {
                if (showModal.type === 'Empresas') setAsignadasEmpresas(items);
                else if (showModal.type === 'Sedes') setAsignadasSedes(items);
                else setAsignadosColaboradores(items);
              }
            }}
          />
          <div className="flex gap-4 mt-8">
            <button type="submit" className="bg-zverde text-white px-6 py-3 rounded-lg">Actualizar</button>
            <button type="button" onClick={cancelarBusqueda} className="bg-znaranja text-white px-6 py-3 rounded-lg">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Usuarios;


