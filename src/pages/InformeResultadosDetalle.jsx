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
import { Select } from 'antd';
import { useUser } from '../context/UserContext';
import Loading from './Loading';

const InformeResultadosDetalle = () => {
    const [datos, setDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [empresas, setEmpresas] = useState([])
    const user = useUser()
    const [value, setValue] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empresasRes] = await Promise.all([
                    axios.get(`${URLBASE}/usuarios/empresassedes`, { params: { idUsuario: user?.user.idUsuario } })
                ])
                setEmpresas(empresasRes?.data.data || [])
            } catch (error) {
                console.error('Error fetching data:', error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.user?.idUsuario]);


    const handleChangeEmpresa = async (newValue) => {
        setValue(newValue);
        setIsLoading(true)
        try {
            const response = await axios.get(`${URLBASE}/informes/resultados/detalle`, {
                params: { idEmpresa: newValue },
            })
            setDatos(response.data.informe)
        } catch (error) {
            console.error("Error al cargar las competencias:", error);
        } finally {
            setIsLoading(false)
        }
    };
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
        columnHelper.accessor('competenciaEval', {
            header: 'Competencia',
            size: 200,
        }),
        columnHelper.accessor('promedioCompetenciaEval', {
            header: 'Promedio Competencia',
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

    const optionEmpresas = empresas?.Empresas?.map(empresa => {
        return { value: empresa.idEmpresa, label: empresa.nombre }
    })


    const sharedProps = {
        mode: 'multiple',
        style: {
            width: '600px',
        },
        options: optionEmpresas,
        placeholder: 'Seleccione una empresa...',
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
            <Select
                value={value}
                onChange={handleChangeEmpresa}
                {...sharedProps}
                className='mb-5'
            />
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

export default InformeResultadosDetalle;
