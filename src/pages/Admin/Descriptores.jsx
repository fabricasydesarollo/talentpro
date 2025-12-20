import axios from "axios";
import { useEffect, useState } from "react";
import { URLBASE } from "../../lib/actions";
import { toast } from "sonner";
import { FaUsers, FaSearch, FaTimes, FaCheck, FaClipboardList, FaTag } from "react-icons/fa";

const Descriptores = () => {
    const [nivelesCargo, setNivelesCargo] = useState([]);
    const [competenciasDisponibles, setCompetenciasDisponibles] = useState([]);
    const [descriptoresDisponibles, setDescriptoresDisponibles] = useState([]);
    const [selectedNivelCargo, setSelectedNivelCargo] = useState(null);
    const [selectedCompetencias, setSelectedCompetencias] = useState([]);
    const [selectedDescriptores, setSelectedDescriptores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("competencias");

    // Cargar los datos de las APIs
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [nivelCargoRes, competenciasRes, descriptoresRes] = await Promise.all([
                    axios.get(`${URLBASE}/usuarios/nivelcargos`),
                    axios.get(`${URLBASE}/competencias`),
                    axios.get(`${URLBASE}/competencias/descriptores`)
                ]);

                setNivelesCargo(nivelCargoRes.data?.data || []);
                setCompetenciasDisponibles(competenciasRes.data?.data || []);
                setDescriptoresDisponibles(descriptoresRes.data?.data || []);
            } catch (err) {
                toast.error('Error al cargar los datos: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleNivelCargoClick = (nivelCargo) => {
        setSelectedNivelCargo(nivelCargo);
        setSelectedCompetencias(nivelCargo.Competencias?.map((comp) => comp.idCompetencia) || []);
        setSelectedDescriptores(nivelCargo.Descriptores?.map((desc) => desc.idDescriptor) || []);
        setActiveTab("competencias");
    };

    const handleAssignCompetencias = async () => {
        if (selectedCompetencias.length === 0) {
            toast.error("Debes seleccionar al menos una competencia");
            return;
        }

        const payload = {
            idNivelCargo: selectedNivelCargo.idNivelCargo,
            competencias: selectedCompetencias,
        };

        try {
            const response = await axios.post(`${URLBASE}/competencias/asignarCompCargo`, payload);
            if (response.status === 201) {
                toast.success("Competencias asignadas correctamente");
                setSelectedNivelCargo(null);
                // Recargar datos
                const nivelCargoRes = await axios.get(`${URLBASE}/usuarios/nivelcargos`);
                setNivelesCargo(nivelCargoRes.data?.data || []);
            }
        } catch (error) {
            toast.error('Error al asignar competencias: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleAssignDescriptores = async () => {
        if (selectedDescriptores.length === 0) {
            toast.error("Debes seleccionar al menos un descriptor");
            return;
        }

        const payload = {
            idNivelCargo: selectedNivelCargo.idNivelCargo,
            descriptores: selectedDescriptores,
        };

        try {
            const response = await axios.post(`${URLBASE}/competencias/asignarDescCargo`, payload);
            if (response.status === 201) {
                toast.success("Descriptores asignados correctamente");
                setSelectedNivelCargo(null);
                // Recargar datos
                const nivelCargoRes = await axios.get(`${URLBASE}/usuarios/nivelcargos`);
                setNivelesCargo(nivelCargoRes.data?.data || []);
            }
        } catch (error) {
            toast.error('Error al asignar descriptores: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredNivelesCargo = nivelesCargo.filter((nivelCargo) =>
        nivelCargo?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleCompetencia = (idCompetencia) => {
        setSelectedCompetencias(prev => 
            prev.includes(idCompetencia) 
                ? prev.filter(id => id !== idCompetencia)
                : [...prev, idCompetencia]
        );
    };

    const toggleDescriptor = (idDescriptor) => {
        setSelectedDescriptores(prev => 
            prev.includes(idDescriptor) 
                ? prev.filter(id => id !== idDescriptor)
                : [...prev, idDescriptor]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zvioleta mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <FaUsers className="text-zvioleta text-2xl" />
                        <h1 className="text-2xl font-bold text-zvioleta">Asociar Competencias y Descriptores</h1>
                    </div>
                    <p className="text-gray-600 mt-2">Gestiona las competencias y descriptores por nivel de cargo</p>
                </div>

                {/* Search and Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar nivel de cargo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-transparent"
                            />
                        </div>
                        {searchTerm && (
                            <p className="text-sm text-gray-600 mt-2">
                                {filteredNivelesCargo.length} nivel(es) de cargo encontrado(s)
                            </p>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                                <tr>
                                    <th className="px-6 py-3">Nivel de Cargo</th>
                                    <th className="px-6 py-3">Competencias Asignadas</th>
                                    <th className="px-6 py-3">Descriptores Asignados</th>
                                    <th className="px-6 py-3">Fecha de Actualización</th>
                                    <th className="px-6 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNivelesCargo.length > 0 ? (
                                    filteredNivelesCargo.map((nivelCargo) => (
                                        <tr key={nivelCargo.idNivelCargo} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{nivelCargo.nombre}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {nivelCargo.Competencias?.length || 0} competencias
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {nivelCargo.Descriptores?.length || 0} descriptores
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(nivelCargo.updatedAt).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleNivelCargoClick(nivelCargo)}
                                                        className="bg-zvioleta hover:bg-zvioleta/90 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                                                    >
                                                        Gestionar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            {searchTerm ? 'No se encontraron niveles de cargo que coincidan con la búsqueda' : 'No hay niveles de cargo registrados'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {selectedNivelCargo && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-zvioleta flex items-center gap-2">
                                            <FaUsers className="text-zvioleta" />
                                            Gestionar: {selectedNivelCargo.nombre}
                                        </h2>
                                        <p className="text-gray-600 text-sm mt-1">Asigna competencias y descriptores a este nivel de cargo</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedNivelCargo(null)} 
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-gray-200 mb-6">
                                    <button
                                        onClick={() => setActiveTab("competencias")}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                            activeTab === "competencias"
                                                ? "border-zvioleta text-zvioleta"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        <FaClipboardList className="inline mr-2" />
                                        Competencias ({selectedCompetencias.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("descriptores")}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                            activeTab === "descriptores"
                                                ? "border-zvioleta text-zvioleta"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        <FaTag className="inline mr-2" />
                                        Descriptores ({selectedDescriptores.length})
                                    </button>
                                </div>

                                {/* Tab Content */}
                                {activeTab === "competencias" && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Competencias</h3>
                                        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                                            {competenciasDisponibles.map((competencia) => (
                                                <div
                                                    key={competencia.idCompetencia}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                        selectedCompetencias.includes(competencia.idCompetencia)
                                                            ? "border-zvioleta bg-purple-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                    onClick={() => toggleCompetencia(competencia.idCompetencia)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                                    selectedCompetencias.includes(competencia.idCompetencia)
                                                                        ? "border-zvioleta bg-zvioleta"
                                                                        : "border-gray-300"
                                                                }`}>
                                                                    {selectedCompetencias.includes(competencia.idCompetencia) && (
                                                                        <FaCheck className="text-white text-xs" />
                                                                    )}
                                                                </div>
                                                                <h4 className="font-medium text-gray-900">{competencia.nombre}</h4>
                                                            </div>
                                                            {competencia.Empresas && competencia.Empresas.length > 0 && (
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    Empresas: {competencia.Empresas.map(empresa => empresa.nombre).join(", ")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === "descriptores" && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Descriptores</h3>
                                        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                                            {descriptoresDisponibles.map((descriptor) => (
                                                <div
                                                    key={descriptor.idDescriptor}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                        selectedDescriptores.includes(descriptor.idDescriptor)
                                                            ? "border-zvioleta bg-purple-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                    onClick={() => toggleDescriptor(descriptor.idDescriptor)}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-1 ${
                                                            selectedDescriptores.includes(descriptor.idDescriptor)
                                                                ? "border-zvioleta bg-zvioleta"
                                                                : "border-gray-300"
                                                        }`}>
                                                            {selectedDescriptores.includes(descriptor.idDescriptor) && (
                                                                <FaCheck className="text-white text-xs" />
                                                            )}
                                                        </div>
                                                        <p className="text-gray-900 flex-1">{descriptor.descripcion}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Modal Actions */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                                    <button 
                                        onClick={() => setSelectedNivelCargo(null)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    {activeTab === "competencias" && (
                                        <button 
                                            onClick={handleAssignCompetencias}
                                            className="px-6 py-2 bg-zvioleta hover:bg-zvioleta/90 text-white rounded-lg transition-colors"
                                        >
                                            Asignar Competencias ({selectedCompetencias.length})
                                        </button>
                                    )}
                                    {activeTab === "descriptores" && (
                                        <button 
                                            onClick={handleAssignDescriptores}
                                            className="px-6 py-2 bg-znaranja hover:bg-znaranja/90 text-white rounded-lg transition-colors"
                                        >
                                            Asignar Descriptores ({selectedDescriptores.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Descriptores;
