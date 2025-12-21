import { useEffect, useState } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import Loading from './Loading';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import DataTable from '../components/DataTable';

const InformeResultadosDetalle = ({idEvaluacion, idEmpresa, idSede, changeSelect}) => {

    const [datos, setDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const user = useUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [informeRes] = await Promise.all([
                    axios.get(`${URLBASE}/informes/resultados/detalle`, { params: { idEmpresa, idEvaluacion, idSede }})
                ]);
                setDatos(informeRes.data.informe || []);
            } catch (error) {
                console.error('Error fetching data:', error.message);
                toast.error('Error al cargar datos', {
                    description: 'No se pudieron obtener los resultados detallados'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.user?.idUsuario, idEmpresa, idSede, idEvaluacion, changeSelect]);

    // Definir columnas para DataTable
    const columns = [
        { field: 'tipo', headerName: 'Tipo' },
        { field: 'ID_Evaluador', headerName: '# Doc. Evaluador' },
        { field: 'Evaluador', headerName: 'Nombre Evaluador' },
        { field: 'cargo_evaluador', headerName: 'Cargo Evaluador' },
        { field: 'empresa_evaluador', headerName: 'Empresa Evaluador' },
        { field: 'ID_Colaborador', headerName: '# Doc. Colaborador' },
        { field: 'Colaborador', headerName: 'Nombre Colaborador' },
        { field: 'cargo', headerName: 'Cargo Colaborador' },
        { field: 'area', headerName: 'Área Colaborador' },
        { field: 'fechaIngreso', headerName: 'Fecha Ingreso' },
        { field: 'Empresa', headerName: 'Empresa Colaborador' },
        { field: 'Sede', headerName: 'Sede Colaborador' },
        { field: 'Competencia', headerName: 'Competencia' },
        { field: 'promedio', headerName: 'Promedio Competencia' },
    ];


    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Informe Detallado por Competencias
                </h1>
                <p className="text-gray-600">
                    Consulta detallada de evaluaciones por competencia y colaborador
                </p>
            </div>

            <DataTable
                columns={columns}
                data={datos}
                enableExcelExport={true}
                enableRowSelection={false}
                title="Informe Detallado por Competencias"
            />
        </div>
    );
};
InformeResultadosDetalle.propTypes = {
  idEvaluacion: PropTypes.string.isRequired,
  idEmpresa: PropTypes.string.isRequired,
  idSede: PropTypes.string,
  changeSelect: PropTypes.bool.isRequired,
};

export default InformeResultadosDetalle;
