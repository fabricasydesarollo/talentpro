import { useEffect, useState } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import Loading from './Loading';
import { toast } from 'react-toastify';
import CustomTable from '../components/DataTable';

const InformeDetalleGrupo = () => {
    const [datos, setDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const user = useUser()
    const [evaluaciones, setEvaluaciones] = useState([])
    const [idEvaluacion, setIdEvaluacion] = useState(0)

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
        if (idEvaluacion == null) return
        setIsLoading(true);
        try {
            const informeResponse = await axios.get(`${URLBASE}/informes/resultados/detalle`, {
                params: { idEvaluador: user?.user?.idUsuario, idEvaluacion: idEvaluacion},
            });
            setDatos(informeResponse.data.informe);
        } catch (error) {
            console.error(error);
            toast.error("Error al obtener los datos!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Loading />
        );
    }


    return (
        <div className='max-w-screen-2xl p-5 lg:max-w-screen-xl box-content mx-auto'>
            <h1 className="text-4xl font-extrabold text-zvioleta mb-8 text-center tracking-tight">Mi equipo - Detalle de evaluaciones</h1>
            <div className="flex md:gap-4 gap-2 items-end text-gray-800">
                <div className="flex flex-col">
                <label htmlFor="id-evaluacion">Seleccione una evaluación</label>
                    <select
                    className="w-80 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zcinza focus:border-zcinza px-3 py-2"
                    name="evaluacion"
                    id="id-evaluacion"
                    value={idEvaluacion}
                    onChange={(e) => setIdEvaluacion(Number(e.target.value))}
                    >
                    <option value={0}>Seleccione...</option>
                    {evaluaciones.map((evaluacion, index) => (
                        <option key={index} value={evaluacion.idEvaluacion}>
                        {`${evaluacion.nombre} ${evaluacion.year}`}
                        </option>
                    ))}
                    </select>
                </div>
                <button className="bg-zvioleta py-2 px-10 rounded-lg text-white hover:scale-105 shadow-md h-10" onClick={fetchData}>Consultar</button>
            </div>
            <CustomTable
                columns={columnsTable}
                data={datos}
                enableExcelExport={true}
                onSelectionChange={(selected) => console.log(selected)}
                title="Informe Detalle Grupo"
            />
        </div>
    );
};

export default InformeDetalleGrupo;
