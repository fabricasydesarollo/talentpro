import { useEffect, useMemo, useState } from "react";
import InformeResultados from "./InformeResultados";
import InformeResultadosDetalle from "./InformeResultadosDetalle";
import axios from "axios";
import { URLBASE } from "../lib/actions";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";
import { filtrarSedes } from "../lib/utils";
import Loading from "./Loading";
import { FaSearch, FaFileExcel, FaDownload } from 'react-icons/fa';

export const InformesExcel = () => {
  const [tipoReporte, setTipoReporte] = useState(0);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [changeSelect, setChangeSelect] = useState(false);
  const [idEmpresa, setIdEmpresa] = useState(0);
  const [idSede, setIdSede] = useState(0);
  const [idEvaluacion, setIdEvaluacion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const user = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [evaluacionesRes, empresasRes] = await Promise.all([
          axios.get(`${URLBASE}/evaluaciones/gestionar`),
          axios.get(`${URLBASE}/usuarios/empresassedes`, { params: { idUsuario: user?.user.idUsuario } })
        ]);
        setEvaluaciones(evaluacionesRes.data?.data || []);
        setEmpresas(empresasRes.data?.data || []);
      } catch (e) {
        toast.error("Ocurrió un error al cargar los datos");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const empresasOrdenadas = useMemo(() => {
    return empresas?.Empresas?.sort((a, b) => a.nombre.localeCompare(b.nombre)) || [];
  }, [empresas]);

  useEffect(() => {
    setSedes(filtrarSedes(empresas, idEmpresa));
  }, [idEmpresa, empresas]);

  const handleConsultar = () => {
    if (idEvaluacion === 0 || tipoReporte === 0) {
      toast.warning("Debe seleccionar una evaluación y un tipo de reporte");
      return;
    }
    setHasSearched(true);
    setChangeSelect(prev => !prev);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Resultados de Evaluaciones
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaSearch className="text-gray-500" size={20} />
            <h2 className="text-lg font-medium text-gray-900">Configurar Informe</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            {/* Evaluaciones */}
            <div className="flex flex-col">
              <label 
                htmlFor="id-evaluacion" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Evaluación
              </label>
              <select 
                value={idEvaluacion}
                onChange={(e) => setIdEvaluacion(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                id="id-evaluacion"
              >
                <option value={0}>Seleccione una evaluación...</option>
                {evaluaciones.map((evaluacion) => (
                  <option key={evaluacion.idEvaluacion} value={evaluacion.idEvaluacion}>
                    {`${evaluacion.nombre} ${evaluacion.year}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Empresas */}
            <div className="flex flex-col">
              <label 
                htmlFor="id-empresa" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Empresa
              </label>
              <select 
                value={idEmpresa}
                onChange={(e) => setIdEmpresa(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                id="id-empresa"
              >
                <option value={0}>Todas las empresas</option>
                {empresasOrdenadas.map((empresa) => (
                  <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sedes */}
            <div className="flex flex-col">
              <label 
                htmlFor="id-sede" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sede
              </label>
              <select
                value={idSede}
                onChange={(e) => setIdSede(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                id="id-sede"
              >
                <option value={0}>Todas las sedes</option>
                {sedes.map((sede) => (
                  <option key={sede.idSede} value={sede.idSede}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo reporte */}
            <div className="flex flex-col">
              <label 
                htmlFor="id-tipo" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Reporte
              </label>
              <select 
                value={tipoReporte}
                onChange={(e) => setTipoReporte(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                id="id-tipo"
              >
                <option value={0}>Seleccione un tipo...</option>
                <option value={1}>Resultados</option>
                <option value={2}>Resultados Detalle</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button 
                className="bg-zvioleta hover:bg-zvioleta/90 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConsultar}
                disabled={idEvaluacion === 0 || tipoReporte === 0}
              >
                <FaSearch size={16} />
                Generar
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {!hasSearched && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaFileExcel className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generar Informe Excel</h3>
            <p className="text-gray-600">
              Selecciona una evaluación y tipo de reporte, luego haz clic en "Generar" para crear el informe.
            </p>
          </div>
        )}

        {hasSearched && (idEvaluacion === 0 || tipoReporte === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaDownload className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración incompleta</h3>
            <p className="text-gray-600">
              Seleccione una evaluación y un tipo de reporte para generar el informe.
            </p>
          </div>
        )}

        {hasSearched && idEvaluacion !== 0 && tipoReporte !== 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaFileExcel className="text-gray-500" size={20} />
              <h2 className="text-lg font-medium text-gray-900">Informe Generado</h2>
            </div>
            
            {tipoReporte === 1 ? (
              <InformeResultados 
                changeSelect={changeSelect} 
                idEvaluacion={idEvaluacion} 
                idEmpresa={idEmpresa} 
                idSede={idSede} 
              />
            ) : tipoReporte === 2 ? (
              <InformeResultadosDetalle 
                changeSelect={changeSelect} 
                idEvaluacion={idEvaluacion} 
                idEmpresa={idEmpresa} 
                idSede={idSede} 
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}