function EmpresasSection() {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Empresas</h2>
      <button className="bg-zvioleta text-white px-4 py-2 rounded-md">Asignar Empresas</button>

      {/* Modal */}
      <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-1/2">
          <h3 className="text-lg font-bold mb-4">Empresas de la competencia</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4>Disponibles</h4>
              <div>[ ] Empresa A</div>
              <div>[ ] Empresa B</div>
            </div>
            <div>
              <h4>Asignadas</h4>
              <div>[✓] Empresa X</div>
              <div>[✓] Empresa Y</div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
            <button className="bg-zvioleta text-white px-4 py-2 rounded">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default EmpresasSection