import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { URLBASE } from "../lib/actions";
import { BarChartPromedio, LineChartPromedio, PieChartCumplimiento } from "../pages/GraficaAvances";
import { Card } from "antd";
import Loading from "./Loading";
import { useUser } from "../context/UserContext";
import { desviacionEstandar, filtrarSedes } from "../lib/utils";
import { toast } from "sonner";
import { FaChartBar, FaSearch, FaTachometerAlt } from 'react-icons/fa';

const DashboardUI = () => {
  const [competencias, setCompetencias] = useState([]);
  const [promediosUsuario, setPromediosUsuario] = useState([]);
  const [cubrimiento, setCubrimiento] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [empresas, setEmpresas] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [infoSelect, setInfoSelect] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Form states
  const [idEvaluacion, setIdEvaluacion] = useState('0');
  const [idNivelCargo, setIdNivelCargo] = useState('');
  const [area, setArea] = useState('');
  const [idSede, setIdSede] = useState('');
  const [idEmpresa, setIdEmpresa] = useState('');

  const user = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [calificacionesRes, empresasRes, evaluacionesRes] = await Promise.all([
          axios.get(`${URLBASE}/respuestas/calificacion`),
          axios.get(`${URLBASE}/usuarios/empresassedes`, { params: { idUsuario: user?.user.idUsuario } }),
          axios.get(`${URLBASE}/evaluaciones/gestionar`)
        ]);
        setEmpresas(empresasRes.data?.data || [])
        setCalificaciones(calificacionesRes.data?.data || []);
        setEvaluaciones(evaluacionesRes.data?.data || []);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.user?.idUsuario]);


  const dataPie = cubrimiento.totalUsuariosEmpresa?.flatMap(item => [
    { value: item.Evaluacion, name: "Respuestas" },
    { value: item.Usuarios, name: "Usuarios" },
    { ...item }
  ])

  const resultado = promediosUsuario.reduce(
    (acc, curr) => {
      if (curr.promedio > 3.5) {
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
      : 100 - (resultado.totalMenor * 100) / resultado.totalSupera;


  const dataPieSede = cubrimiento.totalUsuariosSede?.flatMap(item => [
    { value: item.Evaluacion, name: "Respuestas" },
    { value: item.Usuarios, name: "Usuarios" },
    { ...item }
  ])

  const handleChangeEmpresa = async () => {
    if (idEvaluacion === '0' || idEvaluacion === 0) {
      toast.error("Debe seleccionar una evaluación", { position: "top-right", toastId: "error" });
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);
      const [competenciasRes, cubrimientoRes] = await Promise.all([
        axios.get(`${URLBASE}/informes/resultados`, {
          params: { 
            idEmpresa: idEmpresa, 
            idEvaluacion: idEvaluacion, 
            idNivelCargo: idNivelCargo, 
            area: area, 
            idSede: idSede 
          },
        }),
        axios.get(`${URLBASE}/informes/grafica/all`, { 
          params: { 
            idEmpresa: idEmpresa, 
            idEvaluacion: idEvaluacion, 
            idNivelCargo: idNivelCargo, 
            area: area, 
            idSede: idSede 
          } 
        }),
      ]);
      setCubrimiento(cubrimientoRes.data?.data || []);
      setCompetencias(competenciasRes.data?.data || []);
      setPromediosUsuario(competenciasRes.data?.informe || []);
      setInfoSelect(competenciasRes.data?.dataSelect || []);
    } catch (error) {
      console.log(error.response.data.message);
      toast.error(`Ups! ${error.response.data.message}`, { position: "top-right", toastId: "error" });
    } finally {
      setIsLoading(false);
    }
  };


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


  const empresasOrdenadas = useMemo(() => {
    return empresas?.Empresas?.sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [empresas])

  useEffect(() => {
    setSedes(filtrarSedes(empresas, idEmpresa));
  }, [idEmpresa, empresas]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Dashboard General
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaSearch className="text-gray-500" size={20} />
            <h2 className="text-lg font-medium text-gray-900">Filtros de Consulta</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col">
              <label htmlFor="id-evaluacion" className="block text-sm font-medium text-gray-700 mb-2">
                Evaluación
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                name="evaluacion" 
                id="id-evaluacion"
                value={idEvaluacion}
                onChange={(e) => setIdEvaluacion(e.target.value)}
              >
                <option value="0">Seleccione una evaluación...</option>
                {evaluaciones.map((evaluacion, index) => (
                  <option key={index} value={evaluacion.idEvaluacion}>
                    {`${evaluacion.nombre} ${evaluacion.year}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="id-empresa" className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                name="empresa" 
                id="id-empresa"
                value={idEmpresa}
                onChange={(e) => setIdEmpresa(e.target.value)}
              >
                <option value="">Seleccione una empresa...</option>
                {empresasOrdenadas?.map((empresa, index) => (
                  <option key={index} value={empresa.idEmpresa}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="id-sede" className="block text-sm font-medium text-gray-700 mb-2">
                Sede
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                name="sede" 
                id="id-sede"
                value={idSede}
                onChange={(e) => setIdSede(e.target.value)}
              >
                <option value="">Seleccione una sede...</option>
                {sedes?.map((sede, index) => (
                  <option key={index} value={sede.idSede}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="id-area" className="block text-sm font-medium text-gray-700 mb-2">
                Área
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                name="area" 
                id="id-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="">Seleccione un área...</option>
                {infoSelect?.areas?.map((area, index) => (
                  <option key={index} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="id-nivel" className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de cargo
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-zvioleta px-4 py-2.5 bg-white text-gray-900"
                name="nivel" 
                id="id-nivel"
                value={idNivelCargo}
                onChange={(e) => setIdNivelCargo(e.target.value)}
              >
                <option value="">Seleccione un nivel...</option>
                {infoSelect?.niveles?.map((nivel) => (
                  <option key={nivel.idNivelCargo} value={nivel.idNivelCargo}>
                    {nivel.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button 
                className="bg-zvioleta hover:bg-zvioleta/90 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleChangeEmpresa}
                disabled={idEvaluacion === '0'}
              >
                <FaSearch size={16} />
                Consultar
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {!hasSearched && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaTachometerAlt className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard General</h3>
            <p className="text-gray-600">
              Selecciona una evaluación y configura los filtros para ver el dashboard general de desempeño.
            </p>
          </div>
        )}

        {hasSearched && groupedData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaChartBar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-600">
              No se encontraron datos para mostrar el dashboard con los filtros seleccionados.
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
                nombre={dataPie?.length > 0 ? 'Cubrimiento' : 'Cargando...'} 
                data={cubrimiento?.totalUsuariosEmpresa?.length == 1 ? dataPie : dataPieSede} 
              />
              <LineChartPromedio 
                data={calificacionesData} 
                nombre={calificacionesData.length > 0 ? "Curva de Desempeño" : 'Cargando...'} 
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

export default DashboardUI;