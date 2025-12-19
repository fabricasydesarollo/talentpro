import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { toast } from 'react-toastify';

const normalizeList = (list) => {
    return list
        .filter((item) => item.idEmpresa || item.idSede || item.idUsuario) // Filtrar solo elementos con algún id definido
        .map((item, index) => ({
            ...item,
            id: item.idEmpresa || item.idSede || item.idUsuario, // Asignar `id` genérico
            tipo: item.idEmpresa ? 'empresa' : item.idSede ? 'sede' : 'usuario', // Asignar el tipo
            uniqueKey: `${item.idUsuario}-${index}`, // Generar clave única con `id`, tipo e índice
        }));
};


const Modal = ({ showModal, type, onClose, data, idUsuario }) => {
    const { disponibles, asignados, onChange } = data;

    const [disponiblesList, setDisponiblesList] = useState([]);
    const [asignadosList, setAsignadosList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDisponibles, setSelectedDisponibles] = useState([]);
    const [selectedAsignados, setSelectedAsignados] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([])
    const [idEvaluacion, setIdEvaluacion] = useState(0)
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${URLBASE}/evaluaciones/gestionar`)
                setEvaluaciones(response.data?.data || [])

            } catch (error) {
                toast.error('Ocurrio un error al obtener las evaluaciones', { toastId: 'eval-id' })
            }
        }
        fetchData()
    }, [idUsuario]);

    useEffect(() => {
        if (showModal && disponibles && asignados) {
            setAsignadosList(normalizeList(asignados?.filter(user => user?.idEvaluacion == idEvaluacion)));
            setDisponiblesList(normalizeList(disponibles).filter(
                (item) => !normalizeList(asignados).some((a) => a.id === item.id && a.idEvaluacion === idEvaluacion)
            ));
            setSelectedDisponibles([]);
            setSelectedAsignados([]);
            setSearchTerm('');
        }
    }, [showModal, disponibles, asignados, idEvaluacion]);

    const filterList = (list) => {
        return list.filter(
            (item) =>
                item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toString().includes(searchTerm)
        );
    };

    const toggleSelection = (id, isAvailableList) => {
        if (isAvailableList) {
            setSelectedDisponibles((prev) =>
                prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
            );
        } else {
            setSelectedAsignados((prev) =>
                prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
            );
        }
    };

    const asignarSeleccionados = () => {
        const toAsignar = disponiblesList.filter((item) => selectedDisponibles.includes(item.id));
        setAsignadosList((prev) => [...prev, ...toAsignar]);
        setDisponiblesList((prev) => prev.filter((item) => !selectedDisponibles.includes(item.id)));
        setSelectedDisponibles([]);
    };

    const desasignarSeleccionados = () => {
        const toDesasignar = asignadosList.filter((item) => selectedAsignados.includes(item.id));
        setDisponiblesList((prev) => [...prev, ...toDesasignar]);
        setAsignadosList((prev) => prev.filter((item) => !selectedAsignados.includes(item.id)));
        setSelectedAsignados([]);
    };

    const handleSave = () => {
        if (idEvaluacion === 0) {
            setError('Por favor selecciona una evaluación antes de guardar.');
            return;
        }
        const colaboradoresAsignados = asignadosList.map((item) => ({
            idUsuario: item.idUsuario || item.idEmpresa || item.idSede,
            id: item.id,
            nombre: item.nombre,
            idEvaluacion: item.idEvaluacion
        }));

        
        const usuariosAsignados = (colaboradoresAsignados?.length > 0 ?
            colaboradoresAsignados.map(asignados => ({
                idEvaluador: idUsuario,
                idUsuario: asignados.id,
                idEvaluacion: idEvaluacion
            })) : [{
                idEvaluador: idUsuario,
                idUsuario: null
            }]
        );

        axios.post(`${URLBASE}/usuarios/colaboradores`, {usuarios: usuariosAsignados})
        .then(res => toast.success(res.data.message, {toastId: "toast-id-ok"}))
        .catch(() => toast.error("No fue posible asignar los colaboradores!", {toastId: "idToast-err", position: 'top-center', theme: 'colored'}));
        
        onChange(colaboradoresAsignados);
        onClose();
    };

    if(error){
        toast.error(error, { toastId: 'modal-error-id', autoClose: 3000, position: 'top-center', theme: 'colored' });
        setError(null);
    }

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold mb-4 text-znaranja">{`Asignar ${type}`}</h2>
                <div className="flex flex-col mb-4">
                    <label htmlFor="id-evaluacion">Seleccione una Evaluación</label>
                    <select
                        value={idEvaluacion}
                        onChange={(e) => setIdEvaluacion(Number(e.target.value))}
                        className={`${idEvaluacion === 0 ? 'border-red-500 border-2' : 'border-gray-300'} w-full rounded-md focus:ring-2 focus:ring-offset-1 focus:ring-zvioleta focus:outline-none focus:border-transparent`} name="evaluacion" id="id-evaluacion" >
                        <option value="0" selected>Seleccione...</option>
                        {evaluaciones.map((evaluacion, index) => (
                            <option key={index} value={evaluacion.idEvaluacion}>{`${evaluacion.nombre} ${evaluacion.year}`}</option>
                        ))}
                    </select>
                </div>
                    {
                        idEvaluacion === 0 && <p className="text-red-500 text-sm mt-1 mb-4">* Debes seleccionar una evaluación antes de guardar.</p>
                    }
                    <p className='text-znaranja text-sm mt-1 mb-4'>** Asegurate que la evaluación seleccionada es la correcta **</p>
                <input
                    type="text"
                    placeholder="Buscar por documento o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-offset-1 focus:ring-zvioleta focus:outline-none focus:border-transparent"
                />
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <h3 className="text-lg font-semibold mb-2">Disponibles</h3>
                        <ul className="border rounded-lg p-2 h-64 overflow-y-auto">
                            {filterList(disponiblesList).map((item) => (
                                <li key={item.uniqueKey} className="flex items-center p-2 border-b">
                                    <input
                                        type="checkbox"
                                        checked={selectedDisponibles.includes(item.id)}
                                        onChange={() => toggleSelection(item.id, true)}
                                        className="mr-2 h-4 w-4
                                                border border-znaranja rounded-md
                                                checked:bg-znaranja checked:border-znaranja 
                                                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-znaranja
                                                cursor-pointer"
                                    />
                                    <span>{`${item.id} - ${item.nombre}`}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={asignarSeleccionados}
                            disabled={!selectedDisponibles.length}
                            className="mt-2 bg-zverde text-white px-3 py-1 rounded"
                        >
                            Asignar
                        </button>
                    </div>

                    <div className="w-1/2">
                        <h3 className="text-lg font-semibold mb-2">Asignados</h3>
                        <ul className="border rounded-lg p-2 h-64 overflow-y-auto">
                            {filterList(asignadosList).map((item) => (
                                <li key={item.uniqueKey} className="flex items-center p-2 border-b">
                                    <input
                                        type="checkbox"
                                        checked={selectedAsignados.includes(item.id)}
                                        onChange={() => toggleSelection(item.id, false)}
                                        className="mr-2 h-4 w-4
                                                border border-znaranja rounded-md
                                                checked:bg-znaranja checked:border-znaranja 
                                                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-znaranja
                                                cursor-pointer"
                                    />
                                    <span>{`${item.id} - ${item.nombre}`}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={desasignarSeleccionados}
                            disabled={!selectedAsignados.length}
                            className="mt-2 bg-zvioleta text-white px-3 py-1 rounded"
                        >
                            Quitar
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="bg-znaranja text-white px-4 py-2 rounded-lg">
                        Cancelar
                    </button>
                    <button type='button' 
                        onClick={handleSave} className="bg-zvioleta text-white px-4 py-2 rounded-lg">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    idUsuario: PropTypes.number.isRequired,
    data: PropTypes.shape({
        disponibles: PropTypes.arrayOf(
            PropTypes.shape({
                idEmpresa: PropTypes.number,
                idSede: PropTypes.number,
                idUsuario: PropTypes.number,
                nombre: PropTypes.string.isRequired,
            })
        ).isRequired,
        asignados: PropTypes.arrayOf(
            PropTypes.shape({
                idEmpresa: PropTypes.number,
                idSede: PropTypes.number,
                idUsuario: PropTypes.number,
                nombre: PropTypes.string.isRequired,
            })
        ).isRequired,
        onChange: PropTypes.func.isRequired,
    }).isRequired,
};

export default Modal;