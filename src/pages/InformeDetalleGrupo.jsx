import { useEffect, useState } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import Loading from './Loading';
import { toast } from 'sonner';
import CustomTable from '../components/DataTable';
import { FaUsers, FaSearch, FaFileAlt } from 'react-icons/fa';

const InformeDetalleGrupo = () => {
    const [datos, setDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const user = useUser();
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [idEvaluacion, setIdEvaluacion] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

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

    const columnsTable = [
        { field: "tipo", headerName: "Tipo" },
        { field: "ID_Evaluador", headerName: "# Evaluador" },
        { field: "Evaluador", headerName: "Nombre Evaluador" },
        { field: "cargo_evaluador", headerName: "Cargo Evaluador" },
        { field: "empresa_evaluador", headerName: "Empresa" },
        { field: "ID_Colaborador", headerName: "# Colaborador" },
        { field: "Colaborador", headerName: "Nombre Colaborador" },
        { field: "cargo", headerName: "Cargo Colaborador" },
        { field: "area", headerName: "Área Colaborador" },
        { field: "fechaIngreso", headerName: "Fecha Ingreso Colaborador" },
        { field: "Empresa", headerName: "Empresa Colaborador" },
        { field: "Sede", headerName: "Sede Colaborador" },
        { field: "Competencia", headerName: "Competencia" },
        { field: "promedio", headerName: "Promedio competencia" },
    ];

    const fetchData = async () => {
        if (idEvaluacion == null || idEvaluacion === 0) {
            toast.warning("Por favor selecciona una evaluación");
            return;
        }
        setIsLoading(true);
        setHasSearched(true);
        try {
            const informeResponse = await axios.get(`${URLBASE}/informes/resultados/detalle`, {
                params: { idEvaluador: user?.user?.idUsuario, idEvaluacion: idEvaluacion },
            });
            setDatos(informeResponse.data.informe);
            if (informeResponse.data.informe.length === 0) {
                toast.info("No se encontraron datos para la evaluación seleccionada");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al obtener los datos!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 w-full">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FaUsers className="text-zvioleta" size={28} />
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                            Mi Equipo - Detalle de Evaluaciones
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Consulta el detalle completo de las evaluaciones realizadas por tu equipo
                    </p>
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
                                Seleccione una evaluación
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
                        
                        <button 
                            className="bg-zvioleta hover:bg-zvioleta/90 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm"
                            onClick={fetchData}
                            disabled={idEvaluacion === 0}
                        >
                            <FaSearch size={16} />
                            Consultar
                        </button>
                    </div>
                </div>

                {/* Results */}
                {datos.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FaFileAlt className="text-gray-500" size={20} />
                            <h2 className="text-lg font-medium text-gray-900">Resultados</h2>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                                {datos.length} registros
                            </span>
                        </div>
                        
                        <CustomTable
                            columns={columnsTable}
                            data={datos}
                            enableExcelExport={true}
                            onSelectionChange={(selected) => console.log(selected)}
                            title="Informe Detalle Grupo"
                        />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && hasSearched && datos.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaFileAlt className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
                        <p className="text-gray-600">
                            No se encontraron registros para la evaluación seleccionada.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InformeDetalleGrupo;
