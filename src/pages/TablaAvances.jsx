import axios from "axios";
import { useState, useEffect } from "react";
import { URLBASE } from "../lib/actions";
import * as XLSX from "xlsx";



const TablaAvances = () => {
  const [informes, setInformes] = useState([]);
  const [filteredInformes, setFilteredInformes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${URLBASE}/informes`);
        setInformes(res.data?.resp);
        setFilteredInformes(res.data?.resp); // Inicialmente, sin filtro
      } catch (error) {
        console.error("Error al obtener los informes:", error);
      }
    };
    fetchData();
  }, []);

  // Handle search input change
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    const term = event.target.value.toLowerCase();
    setFilteredInformes(
      informes.filter((item) =>
        item["Empresas.nombre"].toLowerCase().includes(term) ||
        item["Sedes.nombre"]?.toLowerCase().includes(term) ||
        item["evaluadores.nombre"]?.toLowerCase().includes(term)
      )
    );
  };

  // Export visible data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredInformes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Informe Avances");
    XLSX.writeFile(workbook, "Informe_Avances.xlsx");
  };

  return (
    <div className="m-16">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar por empresa, sede o evaluador..."
          className="border p-2 rounded"
        />
        <button onClick={exportToExcel} className="bg-blue-500 text-white p-2 rounded">
          Exportar a Excel
        </button>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Evaluador</th>
            <th className="border p-2">Empresa</th>
            <th className="border p-2">Sede</th>
            <th className="border p-2">Asignados</th>
            <th className="border p-2">Finalizados</th>
          </tr>
        </thead>
        <tbody>
          {filteredInformes.length > 0 ? (
            filteredInformes.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item["evaluadores.nombre"] || "No Asignado"}</td>
                <td className="border p-2">{item["Empresas.nombre"]}</td>
                <td className="border p-2">{item["Sedes.nombre"] || "No Asignado"}</td>
                <td className="border p-2">{item.Usuarios}</td>
                <td className="border p-2">{item.Respuestas}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4">No se encontraron resultados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAvances;
