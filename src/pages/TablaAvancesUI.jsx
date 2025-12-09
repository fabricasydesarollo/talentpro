import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import Loading from './Loading';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { filtrarSedes } from '../lib/utils';


export default function TablaAvancesUI() {
    const [informes, setInformes] = useState([]);
    const [empresas, setEmpresas] = useState({})
    const [isLoading, setIsLoading] = useState(true); // Estado para cargar datos
    const [idEmpresa, setIdEmpresa] = useState(null); // Estado para Empresa seleccionada
    const [idSede, setIdSede] = useState(null); // Estado para Sede seleccionada
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [idEvaluacion, setIdEvaluacion] = useState('0');
    const [sedes, setSedes] = useState([])

    const user = useUser()

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

        if (!idEvaluacion || !idEmpresa){
            toast.error("Debe seleccionar una evaluación y una empresa")
            return null
        }

        setIsLoading(true);
        
        axios.get(`${URLBASE}/informes`, {
            params: { idEmpresa: idEmpresa, idEvaluacion: idEvaluacion }
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
        return <Loading />
    }

    return (

        <div className='max-w-screen-3xl p-5 box-content mx-auto'>
            <h1 className='text-zvioleta text-3xl font-bold text-center my-4'>Avance de evaluaciones por responsable</h1>
            <div className="flex flex-col md:flex-row md:gap-4 mb-6">
                <div className="flex flex-col text-zinc-700">
                    <label htmlFor="id-evaluacion">Evaluación</label>
                    <select
                        className="w-80 border-gray-300 rounded-md" name="evaluacion" id="id-evaluacion"
                        value={idEvaluacion}
                        onChange={(e) => setIdEvaluacion(e.target.value)}
                    >
                        <option selected value='0' disabled>Seleccione...</option>
                        {evaluaciones.map((evaluacion, index) => (
                            <option key={index} value={evaluacion.idEvaluacion}>{`${evaluacion.nombre} ${evaluacion.year}`}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col text-zinc-700">
                    <label htmlFor="id-evaluacion">Empresas</label>
                    <select
                        className="w-80 border-gray-300 rounded-md" name="evaluacion" id="id-evaluacion"
                        value={idEmpresa}
                        onChange={(e) => setIdEmpresa(e.target.value)}
                    >
                        <option selected value='0' disabled>Seleccione...</option>
                        {empresasOrdenadas.map((empresa, index) => (
                            <option key={index} value={empresa.idEmpresa}>{empresa.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col text-zinc-700">
                    <label htmlFor="id-evaluacion">Sedes</label>
                    <select
                        className="w-80 border-gray-300 rounded-md" name="evaluacion" id="id-evaluacion"
                        value={idSede}
                        onChange={(e) => setIdSede(e.target.value)}
                    >
                        <option selected value='0'>TODAS</option>
                        {sedes?.map((sede, index) => (
                            <option key={index} value={sede.idSede}>{sede.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className='flex justify-center items-end'>
                    <button onClick={fetchData} className="bg-zvioleta py-2 px-10 rounded-lg text-white hover:scale-105 shadow-md h-10">Consultar</button>
                </div>
            </div>
            <DataTable columns={columnsTable} data={informes} enableExcelExport={true} title="Avance por responsable" />
        </div>
    );
}