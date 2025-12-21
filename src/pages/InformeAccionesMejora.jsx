import axios from "axios";
import { useEffect, useState } from "react";
import { URLBASE } from '../lib/actions.js';
import { toast } from "sonner";
import DataTable from "../components/DataTable";
import { useUser } from "../context/UserContext";
import Loading from "./Loading";
import { FaSearch, FaClipboardList, FaFileAlt } from 'react-icons/fa';

const InformeAccionesMejora = () => {
    const [acciones, setAcciones] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [idEvaluacion, setIdEvaluacion] = useState(0);
    const [idEmpresa, setIdEmpresa] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const { user } = useUser();

    useEffect(() => {
        const fetchEvaluaciones = async () => {
            try {
                const evaluacionesResponse = await axios.get(`${URLBASE}/evaluaciones/gestionar`);
                setEvaluaciones(evaluacionesResponse?.data?.data || []);
            } catch (error) {
                console.error(error);
                toast.error("Error al obtener las evaluaciones!");
            }
        };
        fetchEvaluaciones();
    }, []);

    async function getAcciones() {
        if (idEvaluacion === 0) {
            toast.warning("Por favor selecciona una evaluación");
            return;
        }

        try {
            setIsLoading(true);
            setHasSearched(true);
            const response = await axios.get(`${URLBASE}/informes/acciones`, { 
                params: { idEvaluacion: idEvaluacion, idEmpresa: idEmpresa }, 
                withCredentials: true 
            });
            if (response.status === 200) {
                setAcciones(response.data?.informe || []);
                if (response.data?.informe?.length === 0) {
                    toast.info("No se encontraron acciones de mejora para los filtros seleccionados");
                }
            }
        } catch (error) {
            toast.error('Ocurrió un error al obtener los datos, inténtalo de nuevo: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <Loading />;
    }

    const columnsTable = [
        { field: 'evaluacion', headerName: 'Evaluación' },
        { field: 'EvaluadorCC', headerName: '# Evaluador' },
        { field: 'Evaluador', headerName: 'Nombre Evaluador' },
        { field: 'EvaluadorCargo', headerName: 'Cargo Evaluador' },
        { field: 'EvaluadorArea', headerName: 'Área Evaluador' },
        { field: 'activoEvaluador', headerName: 'Activo Evaluador' },
        { field: 'EvaluadorEmpresa', headerName: 'Empresa Evaluador' },
        { field: 'sedeEvaluador', headerName: 'Sede Evaluador' },
        { field: 'ColaboradorCC', headerName: '# Colaborador' },
        { field: 'Colaborador', headerName: 'Nombre Colaborador' },
        { field: 'cargo', headerName: 'Cargo Colaborador' },
        { field: 'area', headerName: 'Área Colaborador' },
        { field: 'activo', headerName: 'Activo Colaborador' },
        { field: 'Empresa', headerName: 'Empresa Colaborador' },
        { field: 'Sede', headerName: 'Sede Colaborador' },
        { field: 'competencia', headerName: 'Competencia' },
        { field: 'tipoCompetencia', headerName: 'Tipo Competencia' },
        { field: 'comentario', headerName: 'Comentario' },
        { field: 'estado', headerName: 'Estado' },
        { field: 'fechaCumplimiento', headerName: 'Fecha Cumplimiento' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 w-full">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                        Informe de Acciones de Mejora
                    </h1>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FaSearch className="text-gray-500" size={20} />
                        <h2 className="text-lg font-medium text-gray-900">Filtros de Consulta</h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 min-w-0">
                            <label 
                                htmlFor="id-evaluacion" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Evaluación
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                                name="evaluacion"
                                id="id-evaluacion"
                                value={idEvaluacion}
                                onChange={(e) => setIdEvaluacion(Number(e.target.value))}
                            >
                                <option value={0}>Seleccione una evaluación...</option>
                                {evaluaciones.map((evaluacion, index) => (
                                    <option key={index} value={evaluacion.idEvaluacion}>
                                        {`${evaluacion.nombre} ${evaluacion.year}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-0">
                            <label 
                                htmlFor="id-empresa" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Empresa
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                                name="empresa"
                                id="id-empresa"
                                value={idEmpresa}
                                onChange={(e) => setIdEmpresa(Number(e.target.value))}
                            >
                                <option value={0}>TODAS</option>
                                {user?.Empresas?.map((empresa, index) => (
                                    <option key={index} value={empresa.idEmpresa}>
                                        {empresa.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button 
                            className="bg-zvioleta hover:bg-zvioleta/90 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={getAcciones}
                            disabled={idEvaluacion === 0}
                        >
                            <FaSearch size={16} />
                            Consultar
                        </button>
                    </div>
                </div>

                {/* Results */}
                {!hasSearched && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaClipboardList className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Acciones de Mejora</h3>
                        <p className="text-gray-600">
                            Selecciona una evaluación y haz clic en "Consultar" para ver el informe de acciones de mejora.
                        </p>
                    </div>
                )}

                {hasSearched && acciones.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaFileAlt className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
                        <p className="text-gray-600">
                            No se encontraron acciones de mejora para los filtros seleccionados.
                        </p>
                    </div>
                )}

                {hasSearched && acciones.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FaClipboardList className="text-gray-500" size={20} />
                            <h2 className="text-lg font-medium text-gray-900">Resultados</h2>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                                {acciones.length} registros
                            </span>
                        </div>
                        
                        <DataTable 
                            columns={columnsTable} 
                            data={acciones} 
                            enableExcelExport={true} 
                            title="Informe de Acciones de Mejora" 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default InformeAccionesMejora;
