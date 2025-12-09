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
import PropTypes from 'prop-types';

const InformeResultadosDetalle = ({idEvaluacion, idEmpresa, idSede, changeSelect}) => {

    console.log(idEmpresa, idSede)
    const [datos, setDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const user = useUser()


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const [informeRes] = await Promise.all([
                    axios.get(`${URLBASE}/informes/resultados/detalle`, { params: { idEmpresa, idEvaluacion, idSede }})
                ])
                setDatos(informeRes.data.informe || [])
            } catch (error) {
                console.error('Error fetching data:', error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.user?.idUsuario, idEmpresa, idSede, idEvaluacion, changeSelect]);

    const columnHelper = createMRTColumnHelper();

    const columns = [
        // Configuración de columnas (igual a la anterior)
        columnHelper.accessor('tipo', {
            header: 'Tipo',
            size: 200,
        }),
        columnHelper.accessor('ID_Evaluador', {
            header: '# Documento evaluador',
            size: 200,
        }),
        columnHelper.accessor('Evaluador', {
            header: 'Nombre evaluador',
            size: 200,
        }),
        columnHelper.accessor('cargo_evaluador', {
            header: 'Cargo Evaluador',
            size: 200,
        }),
        columnHelper.accessor('empresa_evaluador', {
            header: 'Empresa evaluador',
            size: 200,
        }),
        columnHelper.accessor('ID_Colaborador', {
            header: '# Documento',
            size: 200,
        }),
        columnHelper.accessor('Colaborador', {
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
        columnHelper.accessor('fechaIngreso', {
            header: 'Fecha Ingreso Colaborador',
            size: 200,
        }),
        columnHelper.accessor('Empresa', {
            header: 'Empresa Colaborador',
            size: 200,
        }),
        columnHelper.accessor('Sede', {
            header: 'Sede Colaborador',
            size: 200,
        }),
        columnHelper.accessor('Competencia', {
            header: 'Competencia',
            size: 200,
        }),
        columnHelper.accessor('promedio', {
            header: 'Promedio competencia',
            size: 200,
        })
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
        <div>
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
InformeResultadosDetalle.propTypes = {
  idEvaluacion: PropTypes.string.isRequired,
  idEmpresa: PropTypes.string.isRequired,
  idSede: PropTypes.string,
  changeSelect: PropTypes.bool.isRequired,
};

export default InformeResultadosDetalle;
