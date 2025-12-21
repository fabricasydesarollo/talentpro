import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { toast } from 'sonner';
import Modal from 'react-modal'
import FormUpdatePassword from '../components/FormUpdatePassword'
import DesarrollandoTalentosBanner from '/Desarrollando_talentos_Banner.webp'
import { FaUserCheck, FaUsers, FaInfoCircle } from 'react-icons/fa';

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
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-zvioleta to-zvioletaopaco p-6 text-white">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                            {evaluacion ? `${evaluacion?.nombre} ${evaluacion.year}` : `EVALUACIONES TALENT PRO ${new Date().getFullYear()}`}
                        </h1>
                        <p className="text-white/90">Desarrollando el talento de nuestra organización</p>
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
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-zvioleta/10 rounded-lg">
                            <FaInfoCircle className="text-zvioleta text-xl" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">¡Bienvenido(a) a tu Evaluación!</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                El propósito de esta evaluación es valorar tus <span className="font-semibold text-zvioleta">fortalezas</span> y <span className="font-semibold text-znaranja">áreas de mejora</span>, promoviendo el desarrollo continuo y el crecimiento profesional en nuestra organización.
                            </p>
                            
                            <div className="bg-gray-50 border-l-4 border-zvioleta rounded-r-lg p-4">
                                <p className="text-gray-700 font-medium">
                                    Objetivo: Identificar oportunidades de crecimiento y reconocer tus contribuciones al éxito del equipo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evaluation Types */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-znaranja/10 rounded-lg">
                            <FaUsers className="text-znaranja text-lg" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Tipos de Evaluación</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Autoevaluación */}
                        <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-znaranja/10 rounded-lg">
                                    <FaUserCheck className="text-znaranja" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Autoevaluación</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                Reflexiona sobre tu desempeño, logros y áreas de mejora. Una oportunidad para el autoconocimiento y la autorreflexión.
                            </p>
                        </div>

                        {/* Evaluación por Jefe */}
                        <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-zvioleta/10 rounded-lg">
                                    <FaUsers className="text-zvioleta" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Evaluación del Jefe Inmediato</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                Retroalimentación objetiva sobre tu rendimiento, contribuciones al equipo y oportunidades de crecimiento.
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">¿Tienes personal a cargo?</h4>
                        <p className="text-blue-800">
                            Asegúrate de completar tu <span className="font-semibold">Autoevaluación</span> y organizar sesiones con tu equipo para realizar la evaluación y brindar retroalimentación constructiva.
                        </p>
                    </div>
                </div>

                {/* Rating Scale */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Escala de Calificación</h2>
                    <p className="text-gray-600 mb-4">Lee con detenimiento cada criterio antes de iniciar</p>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4 mb-4">
                        <p className="text-gray-800">
                            Al iniciar, encontrarás los criterios que forman parte de esta evaluación. Cada criterio debe ser evaluado usando la siguiente escala de calificación:
                        </p>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-zvioleta text-white">
                                    <th className="p-3 text-left font-semibold">Calificación</th>
                                    <th className="p-3 text-left font-semibold">Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <td className="p-3">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zvioleta text-white font-bold text-sm">
                                            5
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="font-medium text-gray-900">Supera las expectativas</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <td className="p-3">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zvioleta text-white font-bold text-sm">
                                            4
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="font-medium text-gray-900">Cumple todas las expectativas</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <td className="p-3">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zvioleta text-white font-bold text-sm">
                                            3
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="font-medium text-gray-900">Cumple la mayoría de las expectativas</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <td className="p-3">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zvioleta text-white font-bold text-sm">
                                            2
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="font-medium text-gray-900">Cumple parcialmente las expectativas</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zvioleta text-white font-bold text-sm">
                                            1
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="font-medium text-gray-900">No cumple las expectativas</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-700 text-sm">
                            <span className="font-semibold">Consejo:</span> Sé honesto y reflexivo en tus respuestas. Esta evaluación es una herramienta de crecimiento personal y profesional.
                        </p>
                    </div>
                </div>

                {/* Modal */}
                <Modal 
                    isOpen={showModal} 
                    ariaHideApp={false} 
                    onRequestClose={closeModal}
                    className="fixed inset-0 flex items-center justify-center p-4 z-50"
                    overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
