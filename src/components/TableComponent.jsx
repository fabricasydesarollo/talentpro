import { useState } from "react";
import PropTypes from 'prop-types';

const TableComponent = ({ usuario, empresas }) => {

  const [rows, setRows] = useState([]);
  const [newRowName, setNewRowName] = useState("");
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);

  const handleAddRow = () => {
    if (newRowName.trim() === "") {
      alert("Por favor selecciona una sede.");
      return;
    }
    if (rows.some((row) => row.sede.toLowerCase() === newRowName.toLowerCase())) {
      alert("El nombre ya existe en la lista.");
      return;
    }
    setRows([...rows, { empresa: selectedEmpresa.nombre, sede: newRowName, principal: false, report: false }]);
    setNewRowName("");
  };

  const handleCheckboxChange = (index, key) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [key]: !row[key] } : row
    );
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const handleEmpresaChange = (event) => {
    const empresaId = parseInt(event.target.value, 10);
    const empresa = empresas?.find(e => e.idEmpresa === empresaId);
    setSelectedEmpresa(empresa);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-4">
        <select onChange={handleEmpresaChange}>
          <option value="">Seleccione una empresa</option>
          {empresas?.map(empresa => (
            <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
              {empresa.nombre}
            </option>
          ))}
        </select>

        <select
          name="locations"
          id="locations"
          className="border rounded px-4 py-2 w-80"
          onChange={(e) => setNewRowName(e.target.options[e.target.selectedIndex].innerText)}
        >
          <option value="">Seleccione una sede</option>
          {selectedEmpresa?.Sedes?.map((sede) => (
            <option key={sede.idSede} value={sede.idSede}>{sede.nombre}</option>
          ))}
        </select>
        <label htmlFor="principal">¿principal?</label>
        <input
          id="principal"
          type="checkbox"
          onChange={(e) => setRows(rows.map(row => ({ ...row, principal: e.target.value })))}
          className="form-checkbox rounded-md text-zvioleta"
        />
        <label htmlFor="reporte">reporte?</label>
        <input
          id="reporte"
          type="checkbox"
          onChange={(e) => setRows(rows.map(row => ({ ...row, report: e.target.value })))}
          className="form-checkbox rounded-md text-zvioleta"
        />
        <button
          onClick={handleAddRow}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar
        </button>
      </div>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Empresa</th>
            <th className="border border-gray-300 px-4 py-2">Sede</th>
            <th className="border border-gray-300 px-4 py-2">Principal</th>
            <th className="border border-gray-300 px-4 py-2">Reporte</th>
            <th className="border border-gray-300 px-4 py-2">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{row.empresa}</td>
              <td className="border border-gray-300 px-4 py-2">{row.sede}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={row.principal}
                  onChange={() => handleCheckboxChange(index, "principal")}
                  className="form-checkbox rounded-md text-zvioleta"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={row.report}
                  onChange={() => handleCheckboxChange(index, "report")}
                  className="form-checkbox rounded-md text-zvioleta"
                />
              </td>
              <td className="border  border-gray-300 px-4 py-2 text-center">
                <button
                  onClick={() => handleDeleteRow(index)}
                  className="text-black font-bold px-2 py-1 rounded hover:bg-gray-200"
                >
                  x
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableComponent.propTypes = {
  usuario: PropTypes.object.isRequired,
  empresas: PropTypes.array.isRequired,
};

export default TableComponent;