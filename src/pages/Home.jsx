import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { toast } from 'sonner';
import Modal from 'react-modal'
import FormUpdatePassword from '../components/FormUpdatePassword'
import DesarrollandoTalentosBanner from '/Desarrollando_talentos_Banner.webp'

const Home = () => {
    const user = useUser();
    const [showModal, setShowModal] = useState()

    const evaluacion = user.user.Evaluaciones.find(ev => ev.activa == 1)

    const closeModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        const getDisponible = async () => {
            if (!user || !user.user) {
                toast.error("Usuario no encontrado.", { toastId: "user-not-found" });
                return;
            }
            setShowModal(user.user.defaultContrasena)

            try {
                const respuesta = await axios.get(`${URLBASE}/evaluaciones/disponible`, {
                    params: { idColaborador: user?.user.idUsuario, idEvaluador: user?.user.idUsuario, idEvaluacion: evaluacion ? evaluacion?.idEvaluacion : 0 }
                });

                if (respuesta.status === 200) {
                    if (respuesta.data?.disponible) {
            
                        const {total, completados} = respuesta.data.disponible[0];
                        const attempt = evaluacion ? evaluacion.UsuariosEvaluaciones.attempt : 0;
                        const sumaCompletados = Number(completados) + Number(attempt);
                        const sumaTotal = Number(total) + 1;
                        const porcentage = (sumaCompletados / sumaTotal) * 100;
                        if (porcentage < 100) {
                            toast.info(`Llevas el ${porcentage.toFixed()}% de evaluaciones completadas.`, { position: "top-right", toastId: "percentage-id", autoClose: 10000 })
                        }else{
                            toast.success(`Evaluaciones completadas al ${porcentage.toFixed()}%`, {toastId: 'total_id'})
                        }
                    } 
                } else {
                    toast.error("Error al obtener la disponibilidad.");
                }
            } catch {
                toast.error("Ocurrió un error al verificar la disponibilidad.");
            }
        };

        getDisponible();
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-zvioleta p-6 text-white">
                        <h1 className="text-2xl sm:text-3xl font-semibold">
                            {evaluacion ? `${evaluacion?.nombre} ${evaluacion.year}` : `EVALUACIONES TALENT PRO ${new Date().getFullYear()}`}
                        </h1>
                    </div>
                    
                    <div className="p-0">
                        <img 
                            src={DesarrollandoTalentosBanner} 
                            alt="DesarrollandoTalentosBanner" 
                            className="w-full h-auto object-cover"
                        />
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-700 text-base leading-relaxed">
                        Bienvenido(a).<br />
                        El propósito de esta evaluación es valorar tus fortalezas y áreas de mejora, promoviendo el desarrollo continuo.
                    </p>
                </div>

                {/* Evaluation Types */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-800 text-base font-medium mb-3">Se realizará:</p>
                    <ul className="space-y-2 ml-5">
                        <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-znaranja rounded-full"></div>
                            <span className="text-znaranja font-bold text-base">Autoevaluación</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-znaranja rounded-full"></div>
                            <span className="text-znaranja font-bold text-base">Evaluación por parte del Jefe Inmediato.</span>
                        </li>
                    </ul>
                    
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                        <p className="text-gray-700 leading-relaxed">
                            Si tienes personal a cargo, asegúrate de completar tu Autoevaluación y organizar sesiones con tu equipo para realizar la evaluación y brindar retroalimentación.
                        </p>
                    </div>
                </div>

                {/* Rating Scale */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-800 text-sm md:text-base mb-4">
                        Al iniciar, encontrarás los criterios que forman parte de esta evaluación, junto con la siguiente escala de calificación. por favor lee con detenimiento:
                    </p>
                    
                    <div className="overflow-x-auto">
                        <table className="border-collapse border border-gray-300 shadow-md rounded-lg overflow-hidden max-w-screen-sm w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-zvioleta to-znaranja text-white">
                                    <th className="border border-gray-300 p-3 text-left">Calificación</th>
                                    <th className="border border-gray-300 p-3 text-left">Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-3 text-center font-semibold text-zvioleta">5</td>
                                    <td className="border border-gray-300 p-3 text-gray-700">Supera las expectativas</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-3 text-center font-semibold text-zvioleta">4</td>
                                    <td className="border border-gray-300 p-3 text-gray-700">Cumple todas las expectativas</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-3 text-center font-semibold text-zvioleta">3</td>
                                    <td className="border border-gray-300 p-3 text-gray-700">Cumple la mayoría de las expectativas</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-3 text-center font-semibold text-zvioleta">2</td>
                                    <td className="border border-gray-300 p-3 text-gray-700">Cumple parcialmente las expectativas</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-3 text-center font-semibold text-zvioleta">1</td>
                                    <td className="border border-gray-300 p-3 text-gray-700">No cumple las expectativas</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                <Modal 
                    isOpen={showModal} 
                    ariaHideApp={false} 
                    onRequestClose={closeModal}
                    className="fixed inset-0 flex items-center justify-center p-4 z-50"
                    overlayClassName="fixed inset-0 bg-black/50 z-40"
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <FormUpdatePassword />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Home;
