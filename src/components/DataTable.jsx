// 📁 components/DataTable.jsx
import axios from "axios";
import { useState } from "react";
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import { URLBASE } from "../lib/actions";

const DataTable = ({
  columns = [],
  data = [],
  enableExcelExport = false,
  title = "Reporte"
}) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  // 🔍 Filtrar datos en toda la tabla
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );


  // 📄 Paginación
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 💾 Exportar a Excel sin usar xlsx
  const handleExportExcel = () => {

    axios.post(`${URLBASE}/informes/exportExcel`, { reporteNombre: title, columns, datos: filteredData }, {
      responseType: "blob",
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title.replace(/\s+/g, '_').toLowerCase()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    });
  };

  return (
    <div className="rounded-lg shadow-md">
      {/* 🔎 Header con buscador y exportar */}
      <div className="flex justify-end items-center border-b border-gray-200 gap-4 flex-wrap p-2">
          <input
            type="text"
            placeholder="Buscar en toda la tabla..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-3/12 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zcinza focus:border-zcinza"
          />

        {enableExcelExport && (
          <button
            onClick={handleExportExcel}
            className="border border-zvioleta  hover:bg-zvioletaopaco/20 text-zvioleta px-4 py-2 rounded-md flex items-center gap-2 transition-transform hover:scale-105"
          >
            Exportar Excel
          </button>
        )}
      </div>

      {/* 🧾 Contenedor con scroll horizontal */}
      <div className="w-full overflow-x-auto p-2">
        <table className="border-collapse border border-gray-200 w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="py-2 px-4 text-left border-b border-gray-300 whitespace-nowrap"
                >
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="font-light text-slate-700 text-sm">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b hover:bg-gray-200 transition-colors duration-300"
              >
                {columns.map((col) => (
                  <td
                    key={col.field}
                    className="py-2 px-4 border-b border-gray-100 whitespace-nowrap"
                  >
                    {row[col.field] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📄 Sin datos */}
      {paginatedData.length === 0 && (
        <p className="text-center py-6 text-gray-500">No hay datos</p>
      )}

      {/* 📄 Paginación */}
      {totalPages >= 1 && (
        <div className="flex justify-end items-center p-4 gap-4 border-t border-gray-200 flex-wrap">
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 text-gray-600 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <IoChevronBackSharp />
          </button>
          <span className="text-sm text-gray-600">
            {currentPage} de {totalPages}
          </span>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 text-gray-600 disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <IoChevronForwardSharp />
          </button>
            <select id="pageSize" className="border border-gray-300 rounded-lg cursor-pointer shadow-md text-sm pr-6  text-gray-600 focus:outline-none focus:ring-2 focus:ring-zcinza focus:border-zcinza px-3 py-2" 
              onChange={(e) => {
              setCurrentPage(1);
              setPageSize(Number(e.target.value));
            }} value={pageSize}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
        </div>
      )}
    </div>
  );
};

export default DataTable;
