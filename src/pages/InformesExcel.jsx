import { Select } from "antd"
import { useState } from "react"
import InformeResultados from "./InformeResultados"
import InformeResultadosDetalle from "./InformeResultadosDetalle"

export const InformesExcel = () => {

    const [report, setReport] = useState(0)
  return (
    <div className={`mt-5 ml-20`}>
    <label className="pr-4 m-0 p-0 z-20">Seleccione el tipo de informe</label>
    <Select
      defaultValue=""
      style={{ width: 250}}
      onChange={setReport}
      allowClear
      options={[{ value: '1', label: 'Informe Resultados' },{ value: '2', label: 'Informe Resultados Detalle' }]}
      placeholder="Seleccione tipo de informe"
    />
        {
            report == 1 ? <InformeResultados /> : report == 2 ? <InformeResultadosDetalle/>: null
        }
    </div>
  )
}
