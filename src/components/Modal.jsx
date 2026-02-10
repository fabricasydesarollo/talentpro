import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { toast } from 'sonner';
import { FaTimes, FaSearch, FaArrowRight, FaArrowLeft, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const normalizeList = (list) => {
    return list
        .filter((item) => item.idEmpresa || item.idSede || item.idUsuario)
        .map((item, index) => ({
            ...item,
            id: item.idEmpresa || item.idSede || item.idUsuario,
            tipo: item.idEmpresa ? 'empresa' : item.idSede ? 'sede' : 'usuario',
            uniqueKey: `${item.idUsuario}-${index}`,
        }));
};

const Modal = ({ showModal, type, onClose, data, idUsuario }) => {
    const { disponibles, asignados, onChange } = data;

    const [disponiblesList, setDisponiblesList] = useState([]);
    const [asignadosList, setAsignadosList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDisponibles, setSelectedDisponibles] = useState([]);
    const [selectedAsignados, setSelectedAsignados] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [idEvaluacion, setIdEvaluacion] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${URLBASE}/evaluaciones/gestionar`);
                setEvaluaciones(response.data?.data || []);
            } catch (error) {
                toast.error('Error al obtener las evaluaciones');
            } finally {
                setLoading(false);
            }
        };
        if (showModal) {
            fetchData();
        }
    }, [showModal, idUsuario]);

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
        if (!searchTerm.trim()) return list;
        return list.filter(
            (item) =>
                item?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item?.id?.toString().includes(searchTerm)
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

    const handleSave = async () => {
        if (idEvaluacion === 0) {
            toast.error('Por favor selecciona una evaluación antes de guardar', {
                position: 'top-center',
                theme: 'colored'
            });
            return;
        }

        try {
            setSaving(true);
            const colaboradoresAsignados = asignadosList.map((item) => ({
                idUsuario: item.idUsuario || item.idEmpresa || item.idSede,
                id: item.id,
                nombre: item.nombre,
                idEvaluacion: item.idEvaluacion
            }));

            const usuariosAsignados = colaboradoresAsignados?.length > 0
                ? colaboradoresAsignados.map(asignados => ({
                    idEvaluador: idUsuario,
                    idUsuario: asignados.id,
                    idEvaluacion: idEvaluacion
                }))
                : [{
                    idEvaluador: idUsuario,
                    idUsuario: null,
                    idEvaluacion: idEvaluacion
                }];            

            const res = await axios.post(`${URLBASE}/usuarios/colaboradores`, { usuarios: usuariosAsignados });
            toast.success(res.data.message);
            onChange(colaboradoresAsignados);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "No fue posible asignar los colaboradores", {
                position: 'top-center',
                theme: 'colored'
            });
        } finally {
            setSaving(false);
        }
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-zvioleta flex items-center gap-2">
                                <FaCheck className="text-znaranja" />
                                Asignar {type}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">Selecciona una evaluación y gestiona las asignaciones</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    {/* Evaluation Selection */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <label htmlFor="id-evaluacion" className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Evaluación *
                        </label>
                        <select
                            value={idEvaluacion}
                            onChange={(e) => setIdEvaluacion(Number(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent transition-colors ${
                                idEvaluacion === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                            }`}
                            name="evaluacion" 
                            id="id-evaluacion"
                        >
                            <option value="0">Seleccione una evaluación...</option>
                            {evaluaciones.map((evaluacion) => (
                                <option key={evaluacion.idEvaluacion} value={evaluacion.idEvaluacion}>
                                    {`${evaluacion.nombre} ${evaluacion.year}`}
                                </option>
                            ))}
                        </select>
                        {idEvaluacion === 0 && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <FaExclamationTriangle className="text-xs" />
                                <span>Debes seleccionar una evaluación antes de guardar</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-znaranja text-sm">
                            <FaExclamationTriangle className="text-xs" />
                            <span>Asegúrate que la evaluación seleccionada es la correcta</span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por documento o nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Assignment Interface */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Available List */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                                    Disponibles
                                    <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {filterList(disponiblesList).length}
                                    </span>
                                </h3>
                            </div>
                            <div className="p-2">
                                <div className="h-64 overflow-y-auto">
                                    {filterList(disponiblesList).length > 0 ? (
                                        filterList(disponiblesList).map((item) => (
                                            <div
                                                key={item.uniqueKey}
                                                className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                    selectedDisponibles.includes(item.id) ? 'bg-blue-50 border-blue-200' : ''
                                                }`}
                                                onClick={() => toggleSelection(item.id, true)}
                                            >
                                                <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                                                    selectedDisponibles.includes(item.id)
                                                        ? 'border-znaranja bg-znaranja'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {selectedDisponibles.includes(item.id) && (
                                                        <FaCheck className="text-white text-xs" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {item.nombre}
                                                    </p>
                                                    <p className="text-xs text-gray-500">ID: {item.id}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                            {searchTerm ? 'No se encontraron resultados' : 'No hay elementos disponibles'}
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 border-t border-gray-200">
                                    <button
                                        onClick={asignarSeleccionados}
                                        disabled={!selectedDisponibles.length}
                                        className="w-full flex items-center justify-center gap-2 bg-zverde hover:bg-zverde/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors text-sm"
                                    >
                                        <FaArrowRight className="text-xs" />
                                        Asignar ({selectedDisponibles.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Assigned List */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                                    Asignados
                                    <span className="text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        {filterList(asignadosList).length}
                                    </span>
                                </h3>
                            </div>
                            <div className="p-2">
                                <div className="h-64 overflow-y-auto">
                                    {filterList(asignadosList).length > 0 ? (
                                        filterList(asignadosList).map((item) => (
                                            <div
                                                key={item.uniqueKey}
                                                className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                    selectedAsignados.includes(item.id) ? 'bg-red-50 border-red-200' : ''
                                                }`}
                                                onClick={() => toggleSelection(item.id, false)}
                                            >
                                                <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                                                    selectedAsignados.includes(item.id)
                                                        ? 'border-zvioleta bg-zvioleta'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {selectedAsignados.includes(item.id) && (
                                                        <FaCheck className="text-white text-xs" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {item.nombre}
                                                    </p>
                                                    <p className="text-xs text-gray-500">ID: {item.id}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                            {searchTerm ? 'No se encontraron resultados' : 'No hay elementos asignados'}
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 border-t border-gray-200">
                                    <button
                                        onClick={desasignarSeleccionados}
                                        disabled={!selectedAsignados.length}
                                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors text-sm"
                                    >
                                        <FaArrowLeft className="text-xs" />
                                        Quitar ({selectedAsignados.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving || idEvaluacion === 0}
                            className="px-6 py-2 bg-zvioleta hover:bg-zvioleta/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <FaCheck className="text-sm" />
                                    Guardar Asignaciones
                                </>
                            )}
                        </button>
                    </div>
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