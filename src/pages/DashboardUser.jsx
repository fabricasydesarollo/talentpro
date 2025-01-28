import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { URLBASE } from "../lib/actions";
import { BarChartPromedio, LineChartPromedio, PieChartCumplimiento } from "../pages/GraficaAvances";
import { Card } from "antd";
import Loading from "./Loading";
import { useUser } from "../context/UserContext";

const DashboardUser = () => {
  const [competencias, setCompetencias] = useState([]);
  const [cubrimiento, setCubrimiento] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para cargar datos

  const user = useUser()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [calificacionesRes,competenciasRes, cubrimientoRes] = await Promise.all([
            axios.get(`${URLBASE}/respuestas/calificacion`),
            axios.get(`${URLBASE}/informes/resultados`,{params: {idEvaluador: user?.user?.idUsuario}}),
            axios.get(`${URLBASE}/informes/resultados/${user?.user?.idUsuario}`),
        ]);
        setCalificaciones(calificacionesRes.data?.data || []);
        setCubrimiento(cubrimientoRes.data?.data || [])
        setCompetencias(competenciasRes.data?.data || []);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.user?.idUsuario]);

  const calificacionesData = calificaciones.flatMap(calificacion => [
    { valor: calificacion.valor, promedio: Math.floor(Math.random() * 5) }
  ])

  const dataPie = cubrimiento?.flatMap(item => [
    { value: item.Respuestas, name: "Respuestas" },
    { value: item.Usuarios, name: "Usuarios" },
    { ...item }
  ])


  const resultado = competencias.reduce(
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

  const porcentaje =
    resultado.totalMenor === 0
      ? 100
      : 100 - (resultado.totalMenor * 100) / resultado.totalSupera;



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
    <div className="m-10">
      <h1 className="text-zvioleta text-3xl font-bold text-center my-5">
        Dashboard equipo
      </h1>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        <PieChartCumplimiento nombre={dataPie?.length > 0 ? 'Cubrimiento' : null} data={dataPie} />
        <LineChartPromedio data={calificacionesData} nombre={calificacionesData.length > 0 ? "Curva de Desempeño": null} />
        <div className="flex flex-col items-center gap-10">
          <h2 className="text-znaranja font-bold text-xl">Índice de Desempeño:</h2>
          <Card className="bg-zvioletaopaco text-white text-center" >
            <p>{porcentaje.toFixed(1)}%</p>
            <p>Evaluaciones con resultado esperado y superior</p>
          </Card>
        </div>
        {groupedData.map((competencia) => (
          <BarChartPromedio
            key={competencia.tipo}
            nombre={competencia?.tipo}
            data={competencia.competencias}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardUser;