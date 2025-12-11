function CompetenciasSection() {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Competencias</h2>

      {/* Formulario */}
      <form className="grid grid-cols-3 gap-4 mb-6">
        <input className="input-custom" placeholder="Nombre" />
        <input className="input-custom" placeholder="Descripción" />
        <select className="input-custom">
          <option>Seleccione tipo</option>
        </select>
        <button className="bg-zvioleta text-white px-4 py-2 rounded-md col-span-3">Guardar</button>
      </form>

      {/* Tabla */}
      <table className="w-full text-sm border rounded-lg">
        <thead className="bg-zvioleta text-white">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Competencia</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr className="odd:bg-white even:bg-gray-50">
            <td className="px-4 py-2">1</td>
            <td className="px-4 py-2">Liderazgo</td>
            <td className="px-4 py-2">Soft</td>
            <td className="px-4 py-2 flex gap-2">
              <button className="text-green-600">✏️</button>
              <button className="text-blue-600">👁️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default CompetenciasSection