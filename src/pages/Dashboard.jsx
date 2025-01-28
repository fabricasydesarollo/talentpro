import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { URLBASE } from "../lib/actions";
import { BarChartPromedio, LineChartPromedio, PieChartCumplimiento } from "../pages/GraficaAvances";
import { Card, Select } from "antd";
import Loading from "./Loading";
import { useUser } from "../context/UserContext";

const DashboardUI = () => {
  const [competencias, setCompetencias] = useState([]);
  const [cubrimiento, setCubrimiento] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [empresas, setEmpresas] = useState({})
  const [isLoading, setIsLoading] = useState(true); // Estado para cargar datos
  const [selectedEmpresa, setSelectedEmpresa] = useState(null); // Estado para Empresa seleccionada
  const [selectedSede, setSelectedSede] = useState(null); 

  const user = useUser()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [calificacionesRes, empresasRes] = await Promise.all([
          axios.get(`${URLBASE}/respuestas/calificacion`),
          axios.get(`${URLBASE}/usuarios/empresassedes`, { params: { idUsuario: user?.user.idUsuario } })
        ]);
        setEmpresas(empresasRes.data?.data || [])
        setCalificaciones(calificacionesRes.data?.data || []);
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


  const dataPie = cubrimiento.totalUsuariosEmpresa?.flatMap(item => [
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


  const dataPieSede = cubrimiento.totalUsuariosSede?.flatMap(item => [
    { value: item.Respuestas, name: "Respuestas" },
    { value: item.Usuarios, name: "Usuarios" },
    { ...item }

  ])

  const handleChangeSede = async (value) => {
    try {
      setSelectedSede(value); // Actualiza la sede seleccionada
      setSelectedEmpresa(null);
      setIsLoading(true)
      const [competenciasRes, cubrimientoRes] = await Promise.all([
        axios.get(`${URLBASE}/informes/resultados`, {
          params: { idSede: value },
        }),
        axios.get(`${URLBASE}/informes/grafica/all`, { params: { idSede: value } }),
      ])
      setCubrimiento(cubrimientoRes.data?.data || [])
      setCompetencias(competenciasRes.data?.data || []);
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
      const [competenciasRes, cubrimientoRes] = await Promise.all([
        axios.get(`${URLBASE}/informes/resultados`, {
          params: { idEmpresa: value },
        }),
        axios.get(`${URLBASE}/informes/grafica/all`, { params: { idEmpresa: value } }),
      ])
      setCubrimiento(cubrimientoRes.data?.data || [])
      setCompetencias(competenciasRes.data?.data || []);
    } catch (error) {
      console.error("Error al cargar las competencias:", error);
    } finally {
      setIsLoading(false)
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

  const optionEmpresas = empresas?.Empresas?.map(empresa => {
    return { value: empresa.idEmpresa, label: empresa.nombre }
  })

  const optionSedes = empresas?.Sedes?.map(sede => {
    return { value: sede.idSede, label: sede.nombre }
  })

  if (isLoading) {
    return <Loading />
  }



  return (
    <div className="m-10">
      <h1 className="text-zvioleta text-3xl font-bold text-center my-5">
        Dashboard resultados
      </h1>
      <div className="flex flex-col md:flex-row md:gap-4">
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
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        <PieChartCumplimiento nombre={dataPie?.length > 0 ? 'Cubrimiento' : null} data={cubrimiento?.totalUsuariosEmpresa?.length == 1 ? dataPie : dataPieSede} />
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

export default DashboardUI;