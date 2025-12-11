function EvaluacionForm() {
  return (
          <div className="fixed bg-black inset-0 bg-opacity-50 flex justify-center items-center overflow-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto relative">
              <h2 className="text-2xl font-semibold text-zvioleta mb-4">Crear nueva evaluación</h2>
              <button onClick={() => setOpenEval(false)} className="absolute top-2 right-2 text-zvioleta text-2xl font-bold">&times;</button>
              <form className="grid gap-5 w-full justify-between grid-cols-3" onSubmit={handleSubmit(createEvaluacion)}>
                <div className="w-full col-span-2">
                  <label htmlFor="nombre" className="text-gray-700">Nombre</label>
                  <input className="input-custom" type="text" id="nombre" {...register("nombre")} />
                </div>
                <div className="w-full">
                  <label htmlFor="year" className="text-gray-700">Año</label>
                  <input className="input-custom" type="number" id="year" {...register("year")} />
                </div>
                <div className="w-full">
                  <label htmlFor="fechaInicio" className="text-gray-700">Fecha Inicio</label>
                  <input className="input-custom" type="date" id="fechaInicio" {...register("fechaInicio")} />
                </div>
                <div className="w-full">
                  <label htmlFor="fechaFin" className="text-gray-700">Fecha Fin</label>
                  <input className="input-custom" type="date" id="fechaFin" {...register("fechaFin")} />
                </div>
                <div className="flex justify-center flex-col items-center">
                  <label htmlFor="activo" className="text-gray-700">¿Activo?</label>
                  <input className="border p-2 rounded-lg" type="checkbox" defaultChecked={true} {...register("estado")} />
                </div>
                <div className="w-full col-span-3">
                  <label htmlFor="objetivo" className="text-gray-700">Objetivo</label>
                  <input className="input-custom" type="text" id="objetivo" {...register("objetivo")} />
                </div>
                <div className="flex justify-center flex-col items-center pl-10 col-span-3">
                  <button className="bg-zvioleta text-white hover:bg-zvioleta/90 hover:scale-105 px-4 py-2 rounded-md">Guardar</button>
                </div>
              </form>
            </div>
          </div>
  )
}

export default EvaluacionForm