import { useNavigate } from "react-router-dom"

export const useNavigation = () => {
    const navigate = useNavigate()

    const evaluarColaborador = (path, idUsuario, evaluacionId) => {
        navigate(`/${path}/${idUsuario}/${evaluacionId || ''}`)
    }

    return { evaluarColaborador }
}
