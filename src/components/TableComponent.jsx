import { useState } from "react";
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs';
import { FaPlus, FaTrash, FaFileExcel, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'sonner';

const TableComponent = ({ empresas }) => {

  const [rows, setRows] = useState([]);
  const [newRowName, setNewRowName] = useState("");
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [newRowPrincipal, setNewRowPrincipal] = useState(false);
  const [newRowReport, setNewRowReport] = useState(false);

  const handleAddRow = () => {
    if (!selectedEmpresa) {
      toast.error('Error de validación', {
        description: 'Por favor selecciona una empresa'
      });
      return;
    }
    if (newRowName.trim() === "") {
      toast.error('Error de validación', {
        description: 'Por favor selecciona una sede'
      });
      return;
    }
    if (rows.some((row) => row.sede.toLowerCase() === newRowName.toLowerCase() && row.empresa === selectedEmpresa.nombre)) {
      toast.error('Error de validación', {
        description: 'Esta sede ya existe para la empresa seleccionada'
      });
      return;
    }
    
    const newRow = { 
      empresa: selectedEmpresa.nombre, 
      sede: newRowName, 
      principal: newRowPrincipal, 
      report: newRowReport 
    };
    
    setRows([...rows, newRow]);
    setNewRowName("");
    setNewRowPrincipal(false);
    setNewRowReport(false);
    
    toast.success('Sede agregada', {
      description: `${newRowName} se agregó correctamente`
    });
  };

  const handleCheckboxChange = (index, key) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [key]: !row[key] } : row
    );
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    const deletedRow = rows[index];
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
    
    toast.success('Sede eliminada', {
      description: `${deletedRow.sede} se eliminó correctamente`
    });
  };

  const handleEmpresaChange = (event) => {
    const empresaId = parseInt(event.target.value, 10);
    const empresa = empresas?.find(e => e.idEmpresa === empresaId);
    setSelectedEmpresa(empresa);
    setNewRowName(""); // Reset sede selection when empresa changes
  };

  const exportToExcel = async () => {
    if (rows.length === 0) {
      toast.error('No hay datos', {
        description: 'No hay datos para exportar'
      });
      return;
    }

    try {
      // Crear workbook y worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sedes');

      // Configurar encabezados
      const headers = ['N°', 'Empresa', 'Sede', 'Principal', 'Reporte'];
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
      rows.forEach((row, index) => {
        const rowData = [
          index + 1,
          row.empresa,
          row.sede,
          row.principal ? 'Sí' : 'No',
          row.report ? 'Sí' : 'No'
        ];
        worksheet.addRow(rowData);
      });

      // Configurar anchos de columna
      const colWidths = [5, 25, 25, 12, 12];
      worksheet.columns.forEach((column, index) => {
        column.width = colWidths[index];
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
      const filename = `sedes_${dateStr}_${timeStr}.xlsx`;

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
        description: `Archivo ${filename} descargado correctamente`
      });
    } catch (error) {
      toast.error('Error de exportación', {
        description: 'No se pudo generar el archivo Excel'
      });
    }
  };

  const clearAllRows = () => {
    if (rows.length === 0) return;
    
    setRows([]);
    toast.success('Tabla limpiada', {
      description: 'Todos los registros han sido eliminados'
    });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-zvioleta to-zvioletaopaco text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaBuilding className="text-2xl" />
            <div>
              <h2 className="text-xl font-bold">Gestión de Sedes</h2>
              <p className="text-white/90 text-sm">Administra las sedes por empresa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {rows.length > 0 && (
              <>
                <div className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                  {rows.length} {rows.length === 1 ? 'sede' : 'sedes'}
                </div>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaFileExcel className="text-sm" />
                  Exportar Excel
                </button>
                <button
                  onClick={clearAllRows}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaTrash className="text-sm" />
                  Limpiar Todo
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaPlus className="text-zvioleta" />
          Agregar Nueva Sede
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <label htmlFor="empresa-select" className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <div className="relative">
              <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <select
                id="empresa-select"
                onChange={handleEmpresaChange}
                value={selectedEmpresa?.idEmpresa || ''}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all"
              >
                <option value="">Seleccione una empresa</option>
                {empresas?.map(empresa => (
                  <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="sede-select" className="block text-sm font-medium text-gray-700 mb-1">
              Sede
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <select
                id="sede-select"
                value={newRowName}
                onChange={(e) => setNewRowName(e.target.options[e.target.selectedIndex].text)}
                disabled={!selectedEmpresa}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccione una sede</option>
                {selectedEmpresa?.Sedes?.map((sede) => (
                  <option key={sede.idSede} value={sede.nombre}>{sede.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Principal</label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                checked={newRowPrincipal}
                onChange={(e) => setNewRowPrincipal(e.target.checked)}
                className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
              />
              <span className="ml-2 text-sm text-gray-600">¿Es principal?</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reporte</label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                checked={newRowReport}
                onChange={(e) => setNewRowReport(e.target.checked)}
                className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
              />
              <span className="ml-2 text-sm text-gray-600">¿Incluir en reporte?</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleAddRow}
              disabled={!selectedEmpresa || !newRowName}
              className="w-full flex items-center justify-center gap-2 bg-zvioleta hover:bg-zvioletaopaco text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus className="text-sm" />
              Agregar Sede
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        {rows.length === 0 ? (
          <div className="text-center py-12">
            <FaBuilding className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sedes registradas</h3>
            <p className="text-gray-500">Comienza agregando una sede usando el formulario de arriba</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-900">N°</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-900">Empresa</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-900">Sede</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-900">Principal</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-900">Reporte</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-700">{row.empresa}</td>
                      <td className="px-6 py-4 text-gray-700">{row.sede}</td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={row.principal}
                          onChange={() => handleCheckboxChange(index, "principal")}
                          className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={row.report}
                          onChange={() => handleCheckboxChange(index, "report")}
                          className="w-4 h-4 text-zvioleta bg-gray-100 border-gray-300 rounded focus:ring-zvioleta/50"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteRow(index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Eliminar sede"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TableComponent.propTypes = {
  empresas: PropTypes.array.isRequired,
};

export default TableComponent;