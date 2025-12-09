import axios from "axios";
import { useEffect, useState } from "react";
import { URLBASE } from '../lib/actions';
import { toast } from "react-toastify";
import DataTable from "../components/DataTable";
import { useUser } from "../context/UserContext";
import Loading from "./Loading";

const InformeAccionesMejora = () => {
    const [acciones, setAcciones] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [idEvaluacion, setIdEvaluacion] = useState(0);
    const [idEmpresa, setIdEmpresa] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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
        try {
            setIsLoading(true);
            const response = await axios.get(`${URLBASE}/informes/acciones`, { params: { idEvaluacion: idEvaluacion, idEmpresa: idEmpresa }, withCredentials: true });
            if (response.status === 200) {
                setAcciones(response.data?.informe || []);
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
    ]

    return (
        <div className="max-w-screen-2xl p-5 lg:max-w-screen-xl box-content mx-auto">
            <h1 className="text-4xl font-extrabold text-zvioleta mb-8 text-center tracking-tight">Informe de Acciones de Mejora</h1>
            <div className="flex md:gap-4 gap-2 items-end text-gray-800 mb-4">
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
                <div className="flex flex-col">
                    <label htmlFor="id-empresa">Seleccione una Empresa</label>
                    <select
                        className="w-80 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zcinza focus:border-zcinza px-3 py-2"
                        name="empresa"
                        id="id-empresa"
                        value={idEmpresa}
                        onChange={(e) => setIdEmpresa(Number(e.target.value))}
                    >
                        <option value={0}>TODAS</option>
                        {user?.Empresas.map((empresa, index) => (

                            <option key={index} value={empresa.idEmpresa}>
                                {`${empresa.nombre}`}
                            </option>
                        ))}
                    </select>
                </div>
                <button className="bg-zvioleta py-2 px-10 rounded-lg text-white hover:scale-105 shadow-md h-10" onClick={getAcciones}>Consultar</button>
            </div>
            <DataTable columns={columnsTable} data={acciones} enableExcelExport={true} title="Informe de Acciones de Mejora" />
        </div>
    );
};

export default InformeAccionesMejora;
