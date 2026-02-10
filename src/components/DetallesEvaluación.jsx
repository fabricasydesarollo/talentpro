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
        <div className="p-4">
            {/* Título mejorado */}
            <div className="flex items-center mb-4 ">
                <svg className="w-5 h-5 mr-2 text-zvioleta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-lg font-semibold text-zvioleta">
                    {colaborador ? (
                        <>
                            Evaluaciones de{" "}
                            <span className="text-znaranja">{usuario?.nombre}</span>
                        </>
                    ) : (
                        "Mis Evaluaciones"
                    )}
                </h2>
            </div>

            {/* Alertas */}
            {usuario?.Empresas?.length === 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded">
                    <div className="flex items-start">
                        <svg className="w-4 h-4 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-red-700">
                            El usuario no está asignado a ninguna empresa, contacte con el Administrador
                        </p>
                    </div>
                </div>
            )}

            {/* Lista de evaluaciones */}
            <div className="space-y-3">
                {usuario === null ? (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-gray-500 text-sm">No se encontró el usuario</p>
                    </div>
                ) : usuario.Evaluaciones.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-sm">No hay evaluaciones asignadas</p>
                    </div>
                ) : (
                    usuario.Evaluaciones.map((evaluacion) => (
                        <div key={evaluacion.idEvaluacion} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start sm:flex-row flex-col">
                                {/* Información de la evaluación */}
                                <div className="flex-1 min-w-0 w-full flex flex-col gap-2">
                                    <div className="flex items-center mb-2 w-full sm:flex-row flex-col text-center sm:text-start">
                                        <h3 className="font-semibold text-gray-900 mr-3">
                                            {evaluacion.nombre} {evaluacion.year}
                                        </h3>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zvioleta/10 text-zvioleta">
                                            {colaborador ? 'Evaluación' : 'Autoevaluación'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-4 text-xs">
                                        {/* Estado */}
                                        <div className="flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-600 mr-1">Estado:</span>
                                            <span className={`font-medium ${evaluacion.activa ? 'text-green-600' : 'text-orange-600'}`}>
                                                {evaluacion.activa ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                        
                                        {/* Completado */}
                                        <div className="flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-600 mr-1">Completado:</span>
                                            {(!colaborador ? evaluacion.UsuariosEvaluaciones.attempt >= evaluacion.UsuariosEvaluaciones.maxAttempts : usuario.usuariosEvaluadores.completado) ? (
                                                <MdCheck size={16} color="green" />
                                            ) : (
                                                <MdClose size={16} color="red" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Botones de acción */}
                                <div className="flex gap-2 ml-4 mt-3">
                                    <button
                                        onClick={() => { evaluarColaborador('evaluacion', idUsuario, evaluacion.idEvaluacion); setOpenModal(false); }}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-zverde hover:bg-zverde/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zverde disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        disabled={!evaluacion.activa || usuario.Empresas.length === 0 || (!colaborador ? evaluacion.UsuariosEvaluaciones.attempt >= evaluacion.UsuariosEvaluaciones.maxAttempts : usuario.usuariosEvaluadores.completado)}
                                    >
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Evaluar
                                    </button>
                                    
                                    <button
                                        onClick={() => { evaluarColaborador('resultados', Number(idUsuario), Number(evaluacion.idEvaluacion)); setOpenModal(false); }}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-znaranja hover:bg-znaranja/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-znaranja disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        disabled={usuario?.Empresas.length === 0}
                                    >
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Resultados
                                    </button>
                                    
                                    {colaborador && (
                                        <button
                                            onClick={() => { evaluarColaborador('seguimiento', Number(idUsuario), Number(evaluacion.idEvaluacion)); setOpenModal(false); }}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-zvioleta hover:bg-zvioleta/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zvioleta disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            disabled={usuario?.Empresas.length === 0 || !usuario.usuariosEvaluadores.completado}
                                        >
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            Seguimiento
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default DetallesEvaluación;