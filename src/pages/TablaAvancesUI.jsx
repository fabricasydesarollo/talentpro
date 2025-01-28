import axios from 'axios';
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper,
} from 'material-react-table';
import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { useEffect, useState } from 'react';
import { URLBASE } from '../lib/actions';
import { Select } from 'antd';
import { useUser } from '../context/UserContext';
import Loading from './Loading';

// Configuración para exportación CSV
const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

const columnHelper = createMRTColumnHelper();

// Definición de columnas con `createMRTColumnHelper`
const columns = [
    columnHelper.accessor('documento', {
        header: '# Documento',
        size: 150,
    }),
    columnHelper.accessor('nombreEvaluador', {
        header: 'Evaluador',
        size: 150,
    }),
    columnHelper.accessor('nombreEmpresa', {
        header: 'Empresa',
        size: 200,
    }),
    columnHelper.accessor('sedesNombre', {
        header: 'Sede',
        size: 150,
    }),
    columnHelper.accessor('Respuestas', {
        header: 'Finalizados',
        size: 120,
    }),
    columnHelper.accessor('Usuarios', {
        header: 'Total',
        size: 120,
    }),
    columnHelper.accessor('avance', {
        header: '% Avance',
        size: 120,
    })
];

export default function TablaAvancesUI() {
    const [informes, setInformes] = useState([]);
    const [empresas, setEmpresas] = useState({})
    const [isLoading, setIsLoading] = useState(true); // Estado para cargar datos
    const [selectedEmpresa, setSelectedEmpresa] = useState(null); // Estado para Empresa seleccionada
    const [selectedSede, setSelectedSede] = useState(null);

    const user = useUser()

    // Obtener los datos de la API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const empresasRes = await axios.get(`${URLBASE}/usuarios/empresassedes`, { params: { idUsuario: user?.user.idUsuario } })
                setEmpresas(empresasRes.data?.data || [])
            } catch (error) {
                console.error("Error al obtener los informes:", error);
            } finally {
                setIsLoading(false)
            }
        };
        fetchData();
    }, [user?.user.idUsuario]);

    // Configuración de la tabla con `useMaterialReactTable`
    const table = useMaterialReactTable({
        columns,
        data: informes,
        enableRowSelection: false,
        columnFilterDisplayMode: 'popover',
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        enableDensityToggle: false,
        enableColumnResizing: false,
        enableFullScreenToggle: false,
        renderTopToolbarCustomActions: () => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '16px',
                    padding: '8px',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    onClick={() => handleExportData(informes)}
                    startIcon={<FileDownloadIcon />}
                    color='success'
                >
                    Exportar todo
                </Button>
            </Box>

        ),
    });


    const handleChangeSede = async (value) => {
        try {
            setSelectedSede(value); // Actualiza la sede seleccionada
            setSelectedEmpresa(null);
            setIsLoading(true)
            const res = await axios.get(`${URLBASE}/informes`, { params: { idSede: value } });
            const normalizedData = res?.data?.informe?.map((item) => ({
                documento: item.documento,
                nombreEvaluador: item.nombre,
                nombreEmpresa: item.empresa,
                sedesNombre: item.sede == null ? "No Asignado" : item.sede,
                Usuarios: item.colaboradores,
                Respuestas: item.respuestas,
                avance: `${((item.respuestas * 100) / item.colaboradores).toFixed()}%`
            }));
            setInformes(normalizedData);
        } catch (error) {
            console.error("Error al cargar las competencias:", error);
        } finally {
            setIsLoading(false)
        }
    }
    const handleChangeEmpresa = async (value) => {
        try {
            setSelectedEmpresa(value); // Actualiza la empresa seleccionada
            setSelectedSede(null);
            setIsLoading(true)
            const res = await axios.get(`${URLBASE}/informes`, { params: { idEmpresa: value } });
            const normalizedData = res?.data?.informe?.map((item) => ({
                documento: item.documento,
                nombreEvaluador: item.nombre,
                nombreEmpresa: item.empresa,
                sedesNombre: item.sede == null ? "No Asignado" : item.sede,
                Usuarios: item.colaboradores,
                Respuestas: item.respuestas,
                avance: `${((item.respuestas * 100) / item.colaboradores).toFixed()}%`
            }));
            setInformes(normalizedData);
        } catch (error) {
            console.error("Error al cargar las competencias:", error);
        } finally {
            setIsLoading(false)
        }
    };

    const optionEmpresas = empresas?.Empresas?.map(empresa => {
        return { value: empresa.idEmpresa, label: empresa.nombre }
    })

    const optionSedes = empresas?.Sedes?.map(sede => {
        return { value: sede.idSede, label: sede.nombre }
    })

    if (isLoading) {
        return <Loading />
    }

    // Función para exportar todos los datos
    const handleExportData = (data) => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    return (

        <div className='m-10'>
            <div className="flex flex-col md:flex-row md:gap-4 mb-6">
                <Select
                    showSearch
                    className="w-64 h-10 outline-none"
                    placeholder="Selecciona una empresa"
                    filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={optionEmpresas}
                    onChange={handleChangeEmpresa}
                    value={selectedEmpresa}
                />
                <Select
                    showSearch
                    className="w-64 h-10 outline-none"
                    placeholder="Selecciona una sede"
                    filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={optionSedes}
                    onChange={handleChangeSede}
                    value={selectedSede}
                />
            </div>
            <MaterialReactTable table={table} />
        </div>
    );
}