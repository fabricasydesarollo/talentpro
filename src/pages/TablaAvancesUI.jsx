import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import Loading from './Loading';
import DataTable from '../components/DataTable';
import { toast } from 'sonner';
import { filtrarSedes } from '../lib/utils';
import { FaSearch, FaTable, FaFileAlt } from 'react-icons/fa';


export default function TablaAvancesUI() {
    const [informes, setInformes] = useState([]);
    const [empresas, setEmpresas] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [idEmpresa, setIdEmpresa] = useState('0');
    const [idSede, setIdSede] = useState('0');
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [idEvaluacion, setIdEvaluacion] = useState('0');
    const [sedes, setSedes] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const user = useUser();

    // Obtener los datos de la API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [evaluacionesRes, empresasRes] = await Promise.all([
                    axios.get(`${URLBASE}/evaluaciones/gestionar`),
                    axios.get(`${URLBASE}/usuarios/empresassedes`, { params: { idUsuario: user?.user.idUsuario } })
                ]);

                setEvaluaciones(evaluacionesRes.data?.data || []);
                setEmpresas(empresasRes.data?.data || [])
            } catch (error) {
                console.error("Error al obtener los informes:", error);
            } finally {
                setIsLoading(false)
            }
        };
        fetchData();
    }, [user?.user.idUsuario]);

    const empresasOrdenadas = useMemo(() => {
        return empresas?.Empresas?.sort((a, b) => a.nombre.localeCompare(b.nombre))
    }, [empresas])

    useEffect(() => {
        setSedes(filtrarSedes(empresas, idEmpresa));
    }, [idEmpresa, empresas]);


    const columnsTable = [
        { field: 'documento', headerName: '# Documento' },
        { field: 'nombre', headerName: 'Evaluador' },
        { field: 'empresa', headerName: 'Empresa' },
        { field: 'sede', headerName: 'Sede' },
        { field: 'colaboradores', headerName: 'Usuarios' },
        { field: 'respuestas', headerName: 'Finalizados' },
        { field: "avance", headerName: '% Avance' }
    ]


    const fetchData = () => {
        if (idEvaluacion === '0' || idEmpresa === '0') {
            toast.error("Debe seleccionar una evaluación y una empresa");
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        
        axios.get(`${URLBASE}/informes`, {
            params: { 
                idEmpresa: idEmpresa, 
                idEvaluacion: idEvaluacion, 
                idSede: idSede === '0' ? null : idSede 
            }
        })
            .then(res => {
                const informesRaw = res.data?.informe || [];

                // Agregar el campo "avance" calculado
                const informesConAvance = informesRaw.map(item => ({
                    ...item,
                    avance: item.colaboradores > 0
                        ? `${((item.respuestas / item.colaboradores) * 100).toFixed(0)}%`
                        : `${0}%`
                }));

                setInformes(informesConAvance);
            })
            .catch(err => toast.error("Error al cargar informes: " + err))
            .finally(() => setIsLoading(false));
    };


    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                        Avance de Evaluaciones por Responsable
                    </h1>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FaSearch className="text-gray-500" size={20} />
                        <h2 className="text-lg font-medium text-gray-900">Filtros de Consulta</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex flex-col">
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
                                onChange={(e) => setIdEvaluacion(e.target.value)}
                            >
                                <option value='0'>Seleccione una evaluación...</option>
                                {evaluaciones.map((evaluacion, index) => (
                                    <option key={index} value={evaluacion.idEvaluacion}>
                                        {`${evaluacion.nombre} ${evaluacion.year}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
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
                                onChange={(e) => setIdEmpresa(e.target.value)}
                            >
                                <option value='0'>Seleccione una empresa...</option>
                                {empresasOrdenadas?.map((empresa, index) => (
                                    <option key={index} value={empresa.idEmpresa}>
                                        {empresa.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label 
                                htmlFor="id-sede" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Sede
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                                name="sede" 
                                id="id-sede"
                                value={idSede}
                                onChange={(e) => setIdSede(e.target.value)}
                            >
                                <option value='0'>TODAS</option>
                                {sedes?.map((sede, index) => (
                                    <option key={index} value={sede.idSede}>
                                        {sede.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col justify-end">
                            <button 
                                onClick={fetchData} 
                                className="bg-zvioleta hover:bg-zvioleta/90 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={idEvaluacion === '0' || idEmpresa === '0'}
                            >
                                <FaSearch size={16} />
                                Consultar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {!hasSearched && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaTable className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Avance de Evaluaciones</h3>
                        <p className="text-gray-600">
                            Selecciona una evaluación y empresa, luego haz clic en "Consultar" para ver el avance por responsable.
                        </p>
                    </div>
                )}

                {hasSearched && informes.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaFileAlt className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
                        <p className="text-gray-600">
                            No se encontraron informes para los filtros seleccionados.
                        </p>
                    </div>
                )}

                {hasSearched && informes.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FaTable className="text-gray-500" size={20} />
                            <h2 className="text-lg font-medium text-gray-900">Resultados</h2>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                                {informes.length} registros
                            </span>
                        </div>
                        
                        <DataTable 
                            columns={columnsTable} 
                            data={informes} 
                            enableExcelExport={true} 
                            title="Avance por responsable" 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}