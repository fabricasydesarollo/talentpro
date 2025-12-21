// 📁 components/DataTable.jsx
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs';
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import { FaFileExcel, FaSearch, FaTable } from "react-icons/fa";
import { toast } from 'sonner';

const DataTable = ({
  columns = [],
  data = [],
  enableExcelExport = false,
  enableRowSelection = false,
  onRowSelectionChange = null,
  title = "Reporte",
  customActions = null,
  clearSelection = false
}) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  // Efecto para limpiar selección cuando se solicite desde el padre
  useEffect(() => {
    if (clearSelection) {
      setRowSelection({});
      if (onRowSelectionChange) {
        onRowSelectionChange([], {});
      }
    }
  }, [clearSelection, onRowSelectionChange]);

  // 🔍 Filtrar datos en toda la tabla (mover antes de usarlo)
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  // Handle row selection changes
  const handleRowSelectionChange = (index, isSelected) => {
    const newSelection = { ...rowSelection };
    if (isSelected) {
      newSelection[index] = true;
    } else {
      delete newSelection[index];
    }
    setRowSelection(newSelection);
    
    if (onRowSelectionChange) {
      const selectedData = Object.keys(newSelection).map(idx => filteredData[parseInt(idx)]);
      onRowSelectionChange(selectedData, newSelection);
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    const newSelection = {};
    if (isSelected) {
      filteredData.forEach((_, index) => {
        newSelection[index] = true;
      });
    }
    setRowSelection(newSelection);
    
    if (onRowSelectionChange) {
      const selectedData = isSelected ? [...filteredData] : [];
      onRowSelectionChange(selectedData, newSelection);
    }
  };

  const isAllSelected = filteredData.length > 0 && Object.keys(rowSelection).length === filteredData.length;
  const isIndeterminate = Object.keys(rowSelection).length > 0 && Object.keys(rowSelection).length < filteredData.length;

  // 📄 Paginación
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 💾 Exportar a Excel usando ExcelJS (más seguro)
  const handleExportExcel = async () => {
    if (filteredData.length === 0) {
      toast.error('No hay datos', {
        description: 'No hay datos para exportar'
      });
      return;
    }

    try {
      setIsExporting(true);
      
      // Crear workbook y worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(title.substring(0, 31)); // Excel sheet name limit

      // Configurar encabezados
      const headers = ['N°', ...columns.map(col => col.headerName)];
      worksheet.addRow(headers);

      // Estilizar encabezados
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '80006A' } // Color zvioleta
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Agregar datos
      filteredData.forEach((row, index) => {
        const rowData = [
          index + 1,
          ...columns.map(col => row[col.field] ?? '-')
        ];
        worksheet.addRow(rowData);
      });

      // Configurar anchos de columna automáticamente
      worksheet.columns.forEach((column, index) => {
        if (index === 0) {
          column.width = 5; // N°
        } else {
          const maxLength = Math.max(
            headers[index].length,
            ...filteredData.map(row => 
              String(row[columns[index - 1]?.field] ?? '-').length
            )
          );
          column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        }
      });

      // Aplicar bordes a todas las celdas
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          // Alternar colores de filas (excepto encabezado)
          if (rowNumber > 1 && rowNumber % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F8F9FA' }
            };
          }
        });
      });

      // Generar nombre de archivo con fecha
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `${title.replace(/\s+/g, '_').toLowerCase()}_${dateStr}_${timeStr}.xlsx`;

      // Generar y descargar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Exportación exitosa', {
        description: `Archivo ${filename} descargado correctamente (${filteredData.length} registros)`
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error de exportación', {
        description: 'No se pudo generar el archivo Excel'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-zvioleta to-zvioletaopaco text-white p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <FaTable className="text-xl" />
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-white/90 text-sm">
                {filteredData.length} {filteredData.length === 1 ? 'registro' : 'registros'}
                {search && ` (filtrados de ${data.length})`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {enableRowSelection && Object.keys(rowSelection).length > 0 && (
              <div className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                {Object.keys(rowSelection).length} seleccionados
              </div>
            )}
            {customActions && (
              <div className="flex items-center gap-2">
                {customActions}
              </div>
            )}
            {enableExcelExport && (
              <button
                onClick={handleExportExcel}
                disabled={isExporting || filteredData.length === 0}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFileExcel className="text-sm" />
                {isExporting ? 'Exportando...' : 'Exportar Excel'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Buscar en toda la tabla..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all"
              />
            </div>
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="text-zvioleta hover:text-zvioletaopaco transition-colors text-sm"
              >
                Limpiar
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
              <select 
                id="pageSize" 
                className="appearance-none border border-gray-300 rounded-lg cursor-pointer text-sm pr-8 pl-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta bg-white" 
                onChange={(e) => {
                  setCurrentPage(1);
                  setPageSize(Number(e.target.value));
                }} 
                value={pageSize}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {enableRowSelection && (
                <th className="px-6 py-3 text-left font-medium text-gray-900">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left font-medium text-gray-900">N°</th>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left font-medium text-gray-900 whitespace-nowrap"
                >
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => {
              const actualIndex = (currentPage - 1) * pageSize + rowIndex;
              const isSelected = rowSelection[actualIndex] || false;
              
              return (
                <tr
                  key={rowIndex}
                  className={`transition-colors ${isSelected ? 'bg-zvioleta/10' : 'hover:bg-gray-50'}`}
                >
                  {enableRowSelection && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelectionChange(actualIndex, e.target.checked)}
                        className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {actualIndex + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.field}
                      className="px-6 py-4 text-gray-700 whitespace-nowrap"
                    >
                      {row[col.field] ?? "-"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <div className="text-center py-12">
          <FaTable className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {search ? 'No se encontraron resultados' : 'No hay datos disponibles'}
          </h3>
          <p className="text-gray-500">
            {search 
              ? `No hay registros que coincidan con "${search}"` 
              : 'No hay información para mostrar en este momento'
            }
          </p>
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setCurrentPage(1);
              }}
              className="mt-3 text-zvioleta hover:text-zvioletaopaco transition-colors text-sm"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length} registros
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <IoChevronBackSharp className="text-gray-600" />
                </button>
                
                <span className="text-sm text-gray-700 px-3">
                  {currentPage} de {totalPages}
                </span>
                
                <button
                  className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <IoChevronForwardSharp className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    field: PropTypes.string.isRequired,
    headerName: PropTypes.string.isRequired
  })),
  data: PropTypes.array,
  enableExcelExport: PropTypes.bool,
  enableRowSelection: PropTypes.bool,
  onRowSelectionChange: PropTypes.func,
  title: PropTypes.string,
  customActions: PropTypes.node,
  clearSelection: PropTypes.bool
};

export default DataTable;
