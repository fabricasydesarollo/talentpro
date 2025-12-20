import { useEffect, useState } from 'react';
import {
  MaterialReactTable,
  createMRTColumnHelper,
} from 'material-react-table';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { Button, Box } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Loading from './Loading';
import PropTypes from 'prop-types';
import { DocumentScannerRounded } from '@mui/icons-material';
import { toast } from 'sonner';
import LoadingGenerate from '../components/LoadingGenerate';

const InformeResultados = ({idEvaluacion, idEmpresa, idSede, changeSelect}) => {
  const [datos, setDatos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isGenerate, setIsGenerate] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${URLBASE}/informes/detalle`, {
          params: {idEvaluacion, idEmpresa: idEmpresa == 0 ? null : idEmpresa, idSede: idSede == 0 ? null : idSede},
        });
        setDatos(response.data?.informe);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idEvaluacion, idEmpresa, changeSelect, idSede]);

  const columnHelper = createMRTColumnHelper();

  const columns = [
    // Configuración de columnas (igual a la anterior)
    columnHelper.accessor('ID_Evaluador', {
      header: '# Documento',
      size: 150,
    }),
    columnHelper.accessor('Evaluador', {
      header: 'Nombre evaluador',
      size: 250,
    }),
    columnHelper.accessor('cargo_evaluador', {
      header: 'Cargo evaluador',
      size: 250,
    }),
    columnHelper.accessor('empresa_evaluador', {
      header: 'Empresa',
      size: 200,
    }),
    columnHelper.accessor('ID_Colaborador', {
      header: '# Documento',
      size: 200,
    }),
    columnHelper.accessor('Colaborador', {
      header: 'Nombre colaborador',
      size: 250,
    }),
    columnHelper.accessor('cargo', {
      header: 'Cargo colaborador',
      size: 250,
    }),
    columnHelper.accessor('area', {
      header: 'Área colaborador',
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
    columnHelper.accessor('AUTOEVALUACION', {
      header: 'Prom. Autoevaluación',
      size: 200,
    }),
    columnHelper.accessor('EVALUACION', {
      header: 'Prom. Evaluación',
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
  if (isGenerate) {
    return (
      <LoadingGenerate />
    );
  }

  const exportPdfs = async (dataSelected) => {
    const idusers = dataSelected.map(item => item.ID_Colaborador);
    setIsGenerate(true)
  
    try {
      const response = await axios.post(
        `${URLBASE}/respuestas/pdfs`, 
        { idusers, idEvaluacion },
        { 
          withCredentials: true,
          responseType: 'blob' // Recibe el archivo como un blob
        }
      );

      if (response.data) {
        setIsGenerate(false)
      }
  
      // Obtener el nombre del archivo desde los headers
      const contentDisposition = response.headers["content-disposition"];
      const timestamp = new Date().toLocaleString('en-CA', { timeZone: 'America/Bogota' }).replace(',', '')
      let filename = `documents_${timestamp}.zip`; // Nombre por defecto
  
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1]; // Extrae el nombre real del archivo
        }
      }
  
      // Crear un Blob con los datos del ZIP
      const blob = new Blob([response.data], { type: "application/zip" });
  
      // Generar un enlace de descarga dinámico
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename; // Usar el nombre obtenido del servidor
      document.body.appendChild(a);
      a.click();
  
      // Limpiar la URL temporal
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error("Error al descargar el ZIP:", error);
      toast.error("Error al descargar el archivo");
    }
  };
  

  return (
    <div>
      <h1 className="text-xl font-bold text-start my-5">
        Informe de resultados
      </h1>
      <MaterialReactTable
        columns={columns}
        data={datos}
        enableColumnResizing
        enableSorting
        enablePagination
        enableRowSelection
        state={{ rowSelection }}
        onRowSelectionChange={(updater) => {
          const newRowSelection = typeof updater === "function" ? updater(rowSelection) : updater;
          setRowSelection(newRowSelection);
          const selectedData = Object.keys(newRowSelection).map(index => datos[index]);
          setSelectedRows(selectedData);
        }}
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
            <Button
              onClick={() => exportPdfs(selectedRows)}
              startIcon={<DocumentScannerRounded />}
              color="error"
            >
              Exportar PDF
            </Button>
          </Box>
        )}
      />
    </div>
  );
};

InformeResultados.propTypes = {
  idEvaluacion: PropTypes.string.isRequired,
  idEmpresa: PropTypes.string.isRequired,
  idSede: PropTypes.string.isRequired,
  changeSelect: PropTypes.bool
};

export default InformeResultados;
