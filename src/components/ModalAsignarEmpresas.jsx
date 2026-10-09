import axios from "axios";
import { useEffect, useState } from "react";
import { FaBuilding, FaTimes } from "react-icons/fa";
import { URLBASE } from "../lib/actions";
import { toast } from "sonner";
import Loading from "../pages/Loading";

const ModalAsignarEmpresas = ({ setViewModal, detalleCompetencia }) => {

    const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
    const [empresasAsignadasState, setEmpresasAsignadas] = useState(detalleCompetencia?.Empresas || []);

    const [selectedDisponibles, setSelectedDisponibles] = useState([])
    const [selectedAsignadas, setSelectedAsignadas] = useState([])
    const [loading, setLoading] = useState([])

    useEffect(() => {
        setEmpresasAsignadas(detalleCompetencia?.Empresas || []);
    }, [detalleCompetencia]);

    useEffect(() => {
        const fetchEmpresasDisponibles = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`${URLBASE}/empresas`);
                const empresas = response.data?.data || [];
                const empresasAsignadasIds = new Set(empresasAsignadasState.map(e => e.idEmpresa));
                const disponibles = empresas.filter(e => !empresasAsignadasIds.has(e.idEmpresa));
                setEmpresasDisponibles(disponibles);
                setLoading(false)
            } catch (error) {
                toast.error('Error al obtener las empresas disponibles. Por favor, inténtelo de nuevo más tarde.');
                setLoading(false)
            }
        };
        fetchEmpresasDisponibles();
    }, []);

    if (loading) {
        return <Loading message="Cargando empresas..." />
    }


    const handleGuardarCambios = async () => {
        try {
            const response = await axios.put(`${URLBASE}/competencias/${detalleCompetencia?.idCompetencia}/empresas`, {
                idCompetencia: detalleCompetencia.idCompetencia,
                empresas: empresasAsignadasState.map(e => e.idEmpresa)
            });
            toast.success('Cambios guardados correctamente.');
        } catch (error) {
            toast.error('Error al guardar los cambios. Por favor, inténtelo de nuevo más tarde.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <FaBuilding className="text-zvioleta" />
                            Gestión de competencia <span className="text-znaranja">{detalleCompetencia?.nombre}</span>
                        </h2>
                        <button
                            onClick={() => setViewModal(false)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Available Companies */}
                        <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <FaBuilding className="text-gray-600" />
                                Empresas Disponibles
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {empresasDisponibles?.map(empresa => (
                                    <div key={empresa?.idEmpresa} className="flex items-center gap-2 p-2 bg-white rounded border">
                                        <input
                                            type="checkbox"
                                            id={`disponible-${empresa.idEmpresa}`}
                                            className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                                            onChange={(e) => setSelectedDisponibles(prev => {
                                                if (e.target.checked) {
                                                    return [...prev, empresa.idEmpresa];
                                                } else {
                                                    return prev.filter(id => id !== empresa.idEmpresa);
                                                }
                                            })}
                                        />
                                        <label htmlFor={`disponible-${empresa.idEmpresa}`} className="text-sm text-gray-700">
                                            {empresa.nombre}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transfer Buttons */}
                        <div className="flex flex-col justify-center items-center gap-4">
                            <button
                                type="button"
                                className="bg-zvioleta hover:bg-zvioleta/90 text-white px-4 py-2 rounded-lg transition-colors"
                                onClick={() => {
                                    // Move selected available companies to assigned list
                                    const selectedEmpresas = empresasDisponibles.filter(empresa => selectedDisponibles.includes(empresa.idEmpresa));
                                    setEmpresasAsignadas(prev => [...prev, ...selectedEmpresas]);
                                    // Remove them from available list
                                    const updatedDisponibles = empresasDisponibles.filter(empresa => !selectedDisponibles.includes(empresa.idEmpresa));
                                    setEmpresasDisponibles(updatedDisponibles);
                                    // Clear selected checkboxes
                                    setSelectedDisponibles([]);
                                }}
                            >
                                Asignar →
                            </button>
                            <button
                                type="button"
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                                onClick={() => {
                                    // Remove selected companies from assigned list
                                    const updatedAsignadas = empresasAsignadasState.filter(empresa => !selectedAsignadas.includes(empresa.idEmpresa));
                                    setEmpresasAsignadas(updatedAsignadas);
                                }}
                            >
                                ← Quitar
                            </button>
                        </div>

                        {/* Assigned Companies */}
                        <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <FaBuilding className="text-zvioleta" />
                                Empresas Asignadas
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {empresasAsignadasState?.map(empresa => (
                                    <div key={empresa.idEmpresa} className="flex items-center gap-2 p-2 bg-white rounded border">
                                        <input
                                            type="checkbox"
                                            id={`asignada-${empresa.idEmpresa}`}
                                            className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                                            onChange={(e) => setSelectedAsignadas(prev => {
                                                if (e.target.checked) {
                                                    return [...prev, empresa.idEmpresa];
                                                } else {
                                                    return prev.filter(id => id !== empresa.idEmpresa);
                                                }
                                            })}
                                        />
                                        <label htmlFor={`asignada-${empresa.idEmpresa}`} className="text-sm text-gray-700">
                                            {empresa.nombre}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={() => setViewModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="px-6 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg transition-colors"
                            onClick={handleGuardarCambios}
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};


export default ModalAsignarEmpresas;
