import { useEffect, useState } from 'react';
import axios from 'axios';
import { URLBASE } from '../lib/actions';
import { BarChartAdvance, PieChartCumplimiento } from './GraficaAvances';
import Loading from './Loading';
import { Select } from 'antd';
import { useUser } from '../context/UserContext';


const InformesGraficas = () => {
  const [cubrimiento, setCubrimiento] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para cargar datos
  const [selectedSede, setSelectedSede] = useState(null);
  const [empresas, setEmpresas] = useState({})


  const user = useUser()
  useEffect(() => {

    const fetchData = async () => {

      try {

        const [cubrimientoRes, empresasRes] = await Promise.all([
          axios.get(`${URLBASE}/informes/grafica/all`),
          axios.get(`${URLBASE}/usuarios/empresassedes`, { params: { idUsuario: user?.user.idUsuario } })
        ])
        setCubrimiento(cubrimientoRes.data?.data || [])
        setEmpresas(empresasRes.data?.data || [])

      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()



  }, [user?.user?.idUsuario]);

  if (isLoading) {
    return (
      <Loading />
    );
  }

  const handleChangeSede = async (value) => {
    try {
      setSelectedSede(value); // Actualiza la sede seleccionada
      setIsLoading(true)
      const [cubrimientoRes] = await Promise.all([
        axios.get(`${URLBASE}/informes/grafica/all`, { params: { idSede: value } }),
      ])
      setCubrimiento(cubrimientoRes.data?.data || [])
    } catch (error) {
      console.error("Error al cargar las competencias:", error);
    } finally {
      setIsLoading(false)
    }
  }

  const optionSedes = empresas?.Sedes?.map(sede => {
    return { value: sede.idSede, label: sede.nombre }
  })

  const dataPieEvaluacion = cubrimiento?.avanceGlobal?.flatMap(item => {
    const rename = {
      ...item,
      Respuestas: item.Evaluacion,
    }
    return [
      { value: rename.Respuestas, name: "Respuestas" },
      { value: rename.Usuarios, name: "Usuarios" },
      { ...rename }
    ]
  })
  const dataPieAutoevaluacion = cubrimiento?.avanceGlobal?.flatMap(item => {
    const rename = {
      ...item,
      Respuestas: item.Autoevaluacion,
    }
     return [
    { value: rename.Respuestas, name: "Respuestas" },
    { value: rename.Usuarios, name: "Usuarios" },
    { ...rename }
  ]})

  const sharedProps = {
    mode: 'multiple',
    style: {
        width: '50%',
    },
    options: optionSedes,
    placeholder: 'Seleccione una empresa...',
};

  return (
    <div className="p-4 mx-24 mt-5">
      <h1 className="text-3xl font-bold mb-4 text-zvioleta">Informes Gráficas</h1>
      <div className="flex flex-col md:flex-row md:gap-4">
        <Select
          showSearch
          className="mb-5"
          placeholder="Selecciona una sede"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          onChange={handleChangeSede}
          value={selectedSede}
          {...sharedProps}
        />
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1">
        <PieChartCumplimiento data={dataPieEvaluacion} nombre='Avance Zentria Evaluación' />
        <PieChartCumplimiento data={dataPieAutoevaluacion} nombre='Avance Zentria Autoevaluación' />
        <BarChartAdvance data={selectedSede ? cubrimiento?.totalUsuariosSede : []} nombre={'Sedes'} />
        <BarChartAdvance data={cubrimiento?.totalUsuariosEmpresa} nombre={'Empresas'} />
      </div>
    </div>
  );
};

export default InformesGraficas;
