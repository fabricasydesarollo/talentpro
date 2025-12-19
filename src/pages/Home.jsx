import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { toast } from 'react-toastify';
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
        <div className="flex flex-col gap-4 bg-gray-100 p-8 shadow-2xl rounded-lg max-w-7xl my-5">
            <div className="text-center">
                <h1 className="font-extrabold text-4xl text-zvioleta mb-2">
                    {evaluacion ? `${evaluacion?.nombre} ${evaluacion.year}` : `EVALUACIONES TALENT PRO ${new Date().getFullYear()}`}
                </h1>
            </div>
            <div className=''>
                <img src={DesarrollandoTalentosBanner} alt="DesarrollandoTalentosBanner" />
            </div>

            <Modal isOpen={showModal} ariaHideApp={false} onRequestClose={closeModal}>
                <FormUpdatePassword />
            </Modal>
            <p className='text-gray-700 text-base leading-relaxed mt-2'>
                Bienvenido(a).<br></br>
                El propósito de esta evaluación es valorar tus fortalezas y áreas de mejora, promoviendo el desarrollo continuo.
            </p>
            <div className="text-gray-700">
                <p className="text-base">Se realizará:</p>
                <ul className="list-disc ml-5 mt-2 text-base space-y-1 text-znaranja font-bold">
                    <li>Autoevaluación</li>
                    <li>Evaluación por parte del Jefe Inmediato.</li>
                </ul>
            </div>

            <p className="text-gray-700 leading-relaxed">
            Si tienes personal a cargo, asegúrate de completar tu Autoevaluación y organizar sesiones con tu equipo para realizar la evaluación y brindar retroalimentación.
            </p>
            
            <div className="flex flex-col gap-6">
                <p className="text-gray-800 text-sm md:text-base">
                Al iniciar, encontrarás los criterios que forman parte de esta evaluación, junto con la siguiente escala de calificación. por favor lee con detenimiento:
                </p>
                <table className="border-collapse border border-gray-300 shadow-md rounded-lg overflow-hidden max-w-screen-sm">
                    <thead>
                        <tr className="bg-gradient-to-r from-zvioleta to-znaranja text-white">
                            <th className="border border-gray-300 p-2 text-left">Calificación</th>
                            <th className="border border-gray-300 p-2 text-left">Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr >
                            <td className="border border-gray-300 p-2 text-center font-semibold text-zvioleta">5</td>
                            <td className="border border-gray-300 p-2 text-gray-700">Supera las expectativas</td>
                        </tr>
                        <tr >
                            <td className="border border-gray-300 p-2 text-center font-semibold text-zvioleta">4</td>
                            <td className="border border-gray-300 p-2 text-gray-700">Cumple todas las expectativas</td>
                        </tr>
                        <tr >
                            <td className="border border-gray-300 p-2 text-center font-semibold text-zvioleta">3</td>
                            <td className="border border-gray-300 p-2 text-gray-700">Cumple la mayoría de las expectativas</td>
                        </tr>
                        <tr >
                            <td className="border border-gray-300 p-2 text-center font-semibold text-zvioleta">2</td>
                            <td className="border border-gray-300 p-2 text-gray-700">Cumple parcialmente las expectativas</td>
                        </tr>
                        <tr >
                            <td className="border border-gray-300 p-2 text-center font-semibold text-zvioleta">1</td>
                            <td className="border border-gray-300 p-2 text-gray-700">No cumple las expectativas</td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default Home;
