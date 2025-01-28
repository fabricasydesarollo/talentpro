import { useEffect, useState } from 'react';
import {
    MaterialReactTable,
    createMRTColumnHelper,
} from 'material-react-table';
import axios from 'axios';
import { URLBASE } from '../lib/actions';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { Button, Box } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useUser } from '../context/UserContext';
import Loading from './Loading';
import { toast } from 'react-toastify';

const InformeDetalleGrupo = () => {
    const [datos, setDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const user = useUser()


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${URLBASE}/informes/resultados/detalle`, {
                    params: { idEvaluador: user?.user?.idUsuario, idEmpresa: user?.user?.Empresas[0].idEmpresa },
                })
                setDatos(response.data.informe)
            } catch {
                toast.error("Error al obtener los datos!")
            } finally {
                setIsLoading(false)
            }
        };
        fetchData();
    }, [user?.user?.idUsuario, user?.user?.Empresas]);



    const columnHelper = createMRTColumnHelper();

    const columns = [
        // Configuración de columnas (igual a la anterior)
        columnHelper.accessor('idEvaluador', {
            header: '# Documento',
            size: 200,
        }),
        columnHelper.accessor('nombreEvaluador', {
            header: 'Nombre Evaluador',
            size: 200,
        }),
        columnHelper.accessor('cargoEval', {
            header: 'Cargo Evaluador',
            size: 200,
        }),
        columnHelper.accessor('areaEval', {
            header: 'Área Evaluador',
            size: 200,
        }),
        columnHelper.accessor('nivelCargoEval', {
            header: 'Nivel Cargo Evaluador',
            size: 200,
        }),
        columnHelper.accessor('empresaEval', {
            header: 'Empresa',
            size: 200,
        }),
        columnHelper.accessor('sedeEval', {
            header: 'Sede',
            size: 200,
        }),
        columnHelper.accessor('tipoEval', {
            header: 'Tipo Evaluación',
            size: 200,
        }),
        columnHelper.accessor('promedioEval', {
            header: 'Promedio Final',
            size: 200,
        }),
        columnHelper.accessor('idUsuario', {
            header: '# Documento',
            size: 200,
        }),
        columnHelper.accessor('nombre', {
            header: 'Nombre Colaborador',
            size: 200,
        }),
        columnHelper.accessor('cargo', {
            header: 'Cargo Colaborador',
            size: 200,
        }),
        columnHelper.accessor('area', {
            header: 'Área Colaborador',
            size: 200,
        }),
        columnHelper.accessor('nivelCargo', {
            header: 'Nivel Cargo Colaborador',
            size: 200,
        }),
        columnHelper.accessor('fechaIngreso', {
            header: 'Fecha Ingreso Colaborador',
            size: 200,
        }),
        columnHelper.accessor('empresa', {
            header: 'Empresa Colaborador',
            size: 200,
        }),
        columnHelper.accessor('sede', {
            header: 'Sede Colaborador',
            size: 200,
        }),
        columnHelper.accessor('competencia', {
            header: 'Competencia',
            size: 200,
        }),
        columnHelper.accessor('promedioCompetencia', {
            header: 'Promedio competencia',
            size: 200,
        }),
        columnHelper.accessor('tipo', {
            header: 'Tipo Evaluación',
            size: 200,
        }),
        columnHelper.accessor('promedio', {
            header: 'Promedio Final Colaborador',
            size: 200,
        }),
    ];

    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
    });

    const handleExportData = (data) => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    if (isLoading) {
        return (
            <Loading />
        );
    }

    return (
        <div className='ml-20'>
            <h1 className="text-xl font-bold text-start my-5">
                Informe de Evaluadores y Colaboradores Detalle
            </h1>
            <MaterialReactTable
                columns={columns}
                data={datos}
                enableColumnResizing
                enableSorting
                enablePagination
                renderTopToolbarCustomActions={() => (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '16px',
                            padding: '8px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Button
                            onClick={() => handleExportData(datos)}
                            startIcon={<FileDownloadIcon />}
                            color="success"
                        >
                            Exportar todo
                        </Button>
                    </Box>
                )}
            />
        </div>
    );
};

export default InformeDetalleGrupo;
