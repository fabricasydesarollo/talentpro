import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { URLBASE } from "../lib/actions";
import { BarChartPromedio, LineChartPromedio, PieChartCumplimiento } from "../pages/GraficaAvances";
import { Card } from "antd";
import Loading from "./Loading";
import { useUser } from "../context/UserContext";
import { desviacionEstandar } from "../lib/utils";
import { FaChartBar, FaSearch, FaTachometerAlt } from 'react-icons/fa';

const DashboardUser = () => {
  const [competencias, setCompetencias] = useState([]);
  const [cubrimiento, setCubrimiento] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para cargar datos
  const [promediosUsuario, setPromediosUsuario] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([])
  const [idEvaluacion, setIdEvaluacion] = useState('0');
  const [hasSearched, setHasSearched] = useState(false);

  const user = useUser();

  useEffect(() => {

    const fetchData = async () => {
      try {
        const [evaluacionesRes] = await Promise.all([
          axios.get(`${URLBASE}/evaluaciones/gestionar`)
        ]);
        setEvaluaciones(evaluacionesRes.data?.data || []);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.user?.idUsuario]);


  const dataPie = cubrimiento?.flatMap(item => [
    { value: item.Respuestas, name: "Respuestas" },
    { value: item.Usuarios, name: "Usuarios" },
    { ...item }
  ])


  const loadDataDashboard = async () => {
    if (idEvaluacion === '0') {
      return;
    }
    
    try {
      setIsLoading(true);
      setHasSearched(true);
      const [calificacionesRes, competenciasRes, cubrimientoRes] = await Promise.all([
        axios.get(`${URLBASE}/respuestas/calificacion`),
        axios.get(`${URLBASE}/informes/resultados`, { params: { idEvaluador: user?.user?.idUsuario, idEvaluacion: idEvaluacion } }),
        axios.get(`${URLBASE}/informes/resultados/evaluador`, { params: { idEvaluador: user?.user?.idUsuario, idEvaluacion: idEvaluacion } }),
      ]);
      setCalificaciones(calificacionesRes.data?.data || []);
      setCubrimiento(cubrimientoRes.data?.data || []);
      setCompetencias(competenciasRes.data?.data || []);
      setPromediosUsuario(competenciasRes.data?.informe || []);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const resultado = competencias.reduce(
    (acc, curr) => {
      if (curr.promedio >= 3.5) {
        acc.totalSupera++;
      } else {
        acc.totalMenor++;
      }
      return acc;
    },
    { totalSupera: 0, totalMenor: 0 } // Inicialización del acumulador
  );

  //1. Lista de promedios de competencias
  const promedios = promediosUsuario.map((competencia) => competencia.promedio);
  const newCalificaciones = calificaciones.map(calificacion => calificacion.valor)
  //2. Con la lista de promedios debo calcular la desviación estandar
  const distribucion = desviacionEstandar(promedios, newCalificaciones)
  //3. Con la desviación estandar, el valor de las calificaciones y la media de las competencias debo calcular la distribución normal
  const calificacionesData = distribucion?.sort((a, b) => a.valor - b.valor)

  const porcentaje =
    resultado.totalMenor === 0
      ? 100
      : (resultado.totalSupera * 100) / (resultado.totalMenor + resultado.totalSupera);

  const groupedData = useMemo(() => {
    return competencias.reduce((acc, curr) => {
      const existingGroup = acc.find((group) => group.tipo === curr.tipoCompetencia);
      if (existingGroup) {
        existingGroup.competencias.push({
          idCompetencia: curr.idCompetencia,
          nombre: curr.nombre,
          promedio: curr.promedio,
        });
      } else {
        acc.push({
          tipo: curr.tipoCompetencia,
          competencias: [
            {
              idCompetencia: curr.idCompetencia,
              nombre: curr.nombre,
              promedio: curr.promedio,
            },
          ],
        });
      }
      return acc;
    }, []);
  }, [competencias]);


  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Mi Equipo - Dashboard de Desempeño
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaSearch className="text-gray-500" size={20} />
            <h2 className="text-lg font-medium text-gray-900">Seleccionar Evaluación</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 min-w-0">
              <label 
                htmlFor="id-evaluacion" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Evaluación
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                name="evaluacion" 
                id="id-evaluacion" 
                value={idEvaluacion}
                onChange={(e) => setIdEvaluacion(e.target.value)}
              >
                <option value='0'>Seleccione una evaluación...</option>
                {evaluaciones.map((evaluacion, index) => (
                  <option key={index} value={evaluacion.idEvaluacion}>
                    {`${evaluacion.nombre} ${evaluacion.year}`}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              className="bg-zvioleta hover:bg-zvioleta/90 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={loadDataDashboard}
              disabled={idEvaluacion === '0'}
            >
              <FaSearch size={16} />
              Consultar
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {!hasSearched && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaTachometerAlt className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard de Desempeño</h3>
            <p className="text-gray-600">
              Selecciona una evaluación y haz clic en "Consultar" para ver el dashboard de desempeño de tu equipo.
            </p>
          </div>
        )}

        {hasSearched && groupedData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaChartBar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-600">
              No se encontraron datos para mostrar el dashboard de la evaluación seleccionada.
            </p>
          </div>
        )}

        {hasSearched && groupedData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaChartBar className="text-gray-500" size={20} />
              <h2 className="text-lg font-medium text-gray-900">Métricas de Desempeño</h2>
            </div>
            
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              <PieChartCumplimiento 
                nombre={dataPie?.length > 0 ? 'Cubrimiento' : null} 
                data={dataPie} 
              />
              <LineChartPromedio 
                data={calificacionesData} 
                nombre={calificacionesData.length > 0 ? "Curva de Desempeño" : null} 
              />
              
              <div className="flex flex-col items-center justify-center gap-4 p-6 bg-gradient-to-br from-zvioleta/10 to-znaranja/10 rounded-lg border border-gray-200">
                <h3 className="text-znaranja font-semibold text-lg text-center">Índice de Desempeño</h3>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center min-w-full">
                  <div className="text-3xl font-bold text-zvioleta mb-2">
                    {porcentaje.toFixed(1)}%
                  </div>
                  <p className="text-gray-600 text-sm">
                    Evaluaciones con resultado esperado y superior
                  </p>
                </div>
              </div>

              {groupedData.map((competencia, index) => (
                <BarChartPromedio
                  key={competencia.tipo}
                  nombre={competencia?.tipo}
                  data={competencia.competencias}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardUser;