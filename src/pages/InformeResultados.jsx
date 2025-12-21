import { useEffect, useState } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { FaFilePdf } from 'react-icons/fa';
import Loading from './Loading';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import LoadingGenerate from '../components/LoadingGenerate';
import DataTable from '../components/DataTable';

const InformeResultados = ({idEvaluacion, idEmpresa, idSede, changeSelect}) => {
  const [datos, setDatos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isGenerate, setIsGenerate] = useState(false);
  const [clearTableSelection, setClearTableSelection] = useState(false);

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
        toast.error('Error al cargar datos', {
          description: 'No se pudieron obtener los resultados'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idEvaluacion, idEmpresa, changeSelect, idSede]);

  // Definir columnas para DataTable
  const columns = [
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
    { field: 'AUTOEVALUACION', headerName: 'Prom. Autoevaluación' },
    { field: 'EVALUACION', headerName: 'Prom. Evaluación' },
  ];

  // Manejar cambios en la selección de filas
  const handleRowSelectionChange = (selectedData) => {
    setSelectedRows(selectedData);
  };

  // Exportar PDFs de usuarios seleccionados
  const exportPdfs = async () => {
    if (selectedRows.length === 0) {
      toast.error('Selección requerida', {
        description: 'Selecciona al menos un registro para exportar PDF'
      });
      return;
    }

    const idusers = selectedRows.map(item => item.ID_Colaborador);
    const documentCount = selectedRows.length;
    setIsGenerate(true);

    // Mostrar toast de inicio
    toast.info('Iniciando generación de PDFs', {
      description: `Procesando ${documentCount} ${documentCount === 1 ? 'documento' : 'documentos'}...`
    });
  
    try {
      const response = await axios.post(
        `${URLBASE}/respuestas/pdfs`, 
        { idusers, idEvaluacion },
        { 
          withCredentials: true,
          responseType: 'blob'
        }
      );

      // Obtener el nombre del archivo desde los headers
      const contentDisposition = response.headers["content-disposition"];
      const timestamp = new Date().toLocaleString('en-CA', { timeZone: 'America/Bogota' }).replace(',', '');
      let filename = `evaluaciones_${timestamp}.zip`;
  
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
  
      // Crear un Blob con los datos del ZIP
      const blob = new Blob([response.data], { type: "application/zip" });
  
      // Generar un enlace de descarga dinámico
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
  
      // Limpiar la URL temporal
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Limpiar la selección después de descarga exitosa
      setSelectedRows([]);
      setClearTableSelection(true);
      
      // Reset el flag de limpieza después de un breve delay
      setTimeout(() => setClearTableSelection(false), 100);
      
      toast.success('PDFs generados exitosamente', {
        description: `${documentCount} documentos descargados en ${filename}`
      });
      
    } catch (error) {
      console.error("Error al descargar el ZIP:", error);
      toast.error("Error al exportar PDFs", {
        description: error.response?.data?.message || "No se pudieron generar los documentos"
      });
    } finally {
      setIsGenerate(false);
    }
  };

  // Acciones personalizadas para la tabla
  const customActions = (
    <button
      onClick={exportPdfs}
      disabled={selectedRows.length === 0 || isGenerate}
      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FaFilePdf className="text-sm" />
      {isGenerate ? 'Generando...' : `Exportar PDF (${selectedRows.length})`}
    </button>
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isGenerate) {
    return (
      <LoadingGenerate 
        message="Generando PDFs de Evaluaciones"
        subtitle="Estamos procesando las evaluaciones seleccionadas y generando los documentos PDF. Este proceso puede tomar varios minutos."
        selectedCount={selectedRows.length}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Informe de Resultados
        </h1>
        <p className="text-gray-600">
          Consulta y exporta los resultados de las evaluaciones realizadas
        </p>
      </div>

      <DataTable
        columns={columns}
        data={datos}
        enableExcelExport={true}
        enableRowSelection={true}
        onRowSelectionChange={handleRowSelectionChange}
        title="Informe de Resultados"
        customActions={customActions}
        clearSelection={clearTableSelection}
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
