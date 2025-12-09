export const ReportCenter = () => {
  return (
    <div className="w-full px-5">
        <h1 className="text-4xl font-bold my-4 text-zvioleta text-center">Centro de Reportes</h1>
        <div>
          <label htmlFor="reportes" className="block text-lg font-medium text-gray-700">Selecciona un reporte</label>
          <select name="reportes" id="reportes" className="border border-zvioleta rounded-md p-2 w-full">
            <option value="">Tipo de reporte</option>
            <option value="1">Reporte resultados</option>
            <option value="2">Reporte resultados detallados</option>
            <option value="3">Reporte acciones de mejora</option>
          </select>
          {/* Parametros del reporte */}
          <select name="evaluacion" id="evaluacion" className="border border-zvioleta rounded-md p-2 w-full mt-2">
            <option value="">Selecciona una evaluación</option>
            <option value="1">Evaluación 1</option>
            <option value="2">Evaluación 2</option>
            <option value="3">Evaluación 3</option>
          </select>
          {/* Filtros adicionales */}
          <select name="empresas" id="empresas">
            <option value="">Selecciona una empresa</option>
            <option value="1">Empresa 1</option>
            <option value="2">Empresa 2</option>
          </select>
          {/* Filtros adicionales */}
          <select name="sede" id="sede" className="border border-zvioleta rounded-md p-2 w-full mt-2">
            <option value="">Selecciona una sede</option>
            <option value="1">Sede 1</option>
            <option value="2">Sede 2</option>
          </select>
          <div className="mt-4">
            <button className="bg-zvioleta text-white font-semibold py-2 px-4 rounded-md">Generar Reporte</button>
          </div>
        </div>
    </div>
  )
}
