import { useEffect, useRef, useState } from "react"
import apiClient from "../lib/utils"

const SelectEvaluaciones = () => {
    const [evaluaciones, setEvaluaciones] = useState([])
    const idEvaluacion = useRef(null)

    useEffect(() => {
        apiClient.get(`/evaluaciones/gestionar`)
            .then(res => {
                setEvaluaciones(res.data?.data)
            })
            .catch(err => console.log(err))
    }, [])

    return (
        <div>
            <select ref={idEvaluacion} className="w-80" name="evaluacion" id="id-evaluacion" >
                <option disabled selected>Seleccione...</option>
                {evaluaciones.map((evaluacion, index) => (
                    <option key={index} value={evaluacion.idEvaluacion}>{`${evaluacion.nombre} ${evaluacion.año}`}</option>
                ))}
            </select>
        </div>
    )
}

export default SelectEvaluaciones