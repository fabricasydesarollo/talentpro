import { MdCheck, MdClose } from "react-icons/md";
import { useUser } from "../context/UserContext";
import { useNavigation } from "../hooks/useNavigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { URLBASE } from "../lib/actions";
import Loading from "../pages/Loading";

const DetallesEvaluación = ({ setOpenModal, idEvaluacion, idUsuario, colaborador }) => {
    const { evaluarColaborador } = useNavigation()
    const [usuario, setUsuario] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    
    const user = useUser();

    useEffect(() => {
        if (colaborador) {
            const usuarioEncontrado = user?.colaboradores?.colaboradores?.find(c => c.idUsuario === idUsuario);

            if (usuarioEncontrado) {
            const evaluacionesFiltradas = usuarioEncontrado.Evaluaciones?.filter(
                e => e.idEvaluacion === idEvaluacion &&
                    e.UsuariosEvaluaciones.idTipoEvaluacion === 2
            ) || [];

            const usuarioConEvaluaciones = {
                ...usuarioEncontrado,
                Evaluaciones: evaluacionesFiltradas
            };

            setUsuario(usuarioConEvaluaciones);
            } else {
            setUsuario(null);
            }
        } else {
            setIsLoading(true)
            axios.get(`${URLBASE}/usuarios/misEvaluaciones`, {params: { idUsuario: idUsuario}})
                .then(res => {
                    setUsuario({
                        ...user?.user,
                        Evaluaciones: res.data.evaluaciones?.Evaluaciones
                    });
                })
                .catch(error => console.log(error))
                .finally(() => setIsLoading(false))
        }
    }, [colaborador, idUsuario, idEvaluacion, user]);
    
    if (isLoading) {
    return <Loading />
}

    return (
        <div className="col-span-3 border border-white/20 rounded-2xl p-6 bg-white/5 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-zvioleta">
                {colaborador ? (
                    <>
                        Evaluaciones asignadas a{" "}
                        <span className="text-znaranja">{usuario?.nombre}</span>
                    </>
                ) : (
                    "Mis Evaluaciones"
                )}
            </h2>
            <hr className="border-gray-200 mb-4" />

            <div className="space-y-4">
                {
                    usuario === null ? (
                        <p className="text-gray-400">No se encontró el usuario.</p>
                    ) : usuario.Evaluaciones.length === 0 ? (
                        <p className="text-gray-400">No hay evaluaciones asignadas.</p>
                    ) : null
                }

                {usuario?.Empresas?.length === 0 && (
                    <p className="text-sm text-red-500 mb-1">El usuario no está asignado a ninguna empresa, contacte con el Administrador</p>
                )}

                {usuario?.Evaluaciones?.map((evaluacion) => (
                    <div key={evaluacion.idEvaluacion} className="flex justify-between items-center border-b border-gray-200 py-2 transition ">
                        <div>
                            <h3 className="font-medium">{evaluacion.nombre} {evaluacion.year}</h3>
                            <p className="text-sm text-gray-400">Tipo: <span className="text-zvioleta">{colaborador ? 'Evaluación' : 'Autoevaluación'}</span></p>
                            <p className="text-sm text-gray-400">Estado:
                                <span className={["ml-1", evaluacion.activa ? 'text-zverde' : 'text-znaranja'].join(' ')}>
                                    {evaluacion.activa ? 'Activa' : 'Inactiva'}
                                </span>
                            </p>
                            <p className="text-sm text-gray-400 flex items-center">Completado:
                                    {(!colaborador ? evaluacion.UsuariosEvaluaciones.attempt >= evaluacion.UsuariosEvaluaciones.maxAttempts : usuario.usuariosEvaluadores.completado) ? <MdCheck size={20} color="green" /> : <MdClose size={20} color="red" /> }
                            </p>
                        </div>
                        <div className="flex md:flex-row flex-col gap-2">
                            <button
                                onClick={() => { evaluarColaborador('evaluacion', idUsuario, evaluacion.idEvaluacion); setOpenModal(false); }}
                                className='bg-zverde text-white py-1 disabled:cursor-not-allowed disabled:bg-zverde/60 px-3 rounded-md shadow-md hover:bg-zverde/70 focus:outline-none transition'
                                disabled={!evaluacion.activa || usuario.Empresas.length === 0 || (!colaborador ? evaluacion.UsuariosEvaluaciones.attempt >= evaluacion.UsuariosEvaluaciones.maxAttempts : usuario.usuariosEvaluadores.completado)}
                            >
                                Evaluar
                            </button>
                            <button
                                onClick={() => { evaluarColaborador('resultados', Number(idUsuario), Number(evaluacion.idEvaluacion)); setOpenModal(false); }}
                                className="bg-znaranja text-white py-1 px-3 rounded-md shadow-md hover:bg-znaranja/70 focus:outline-none transition disabled:cursor-not-allowed disabled:bg-znaranja/50"
                                disabled={usuario?.Empresas.length === 0}
                            >
                                Resultados
                            </button>
                            {
                                colaborador ? (
                                    <button
                                        onClick={() => { evaluarColaborador('seguimiento', Number(idUsuario), Number(evaluacion.idEvaluacion)); setOpenModal(false); }}
                                        className="bg-zvioleta text-white py-1 px-3 rounded-md shadow-md hover:bg-zvioleta/70 focus:outline-none transition disabled:cursor-not-allowed disabled:bg-zvioleta/50"
                                        disabled={usuario?.Empresas.length === 0 || !usuario.usuariosEvaluadores.completado}
                                    >
                                        Seguimiento
                                    </button>) : null
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DetallesEvaluación;