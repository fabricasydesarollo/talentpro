import axios from "axios";
import { useEffect, useState } from "react";
import { URLBASE } from "../lib/actions";
import { toast } from "sonner";
import Loading from "../pages/Loading";

const ModalDescriptores = ({setOpenModal, competencia}) => {
    const [descriptores, setDescriptores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDescriptores = async () => {
            try {
                const response = await axios.get(`${URLBASE}/competencias/descriptores/${competencia.idCompetencia}`, {
                    withCredentials: true
                });
                setDescriptores(response.data?.descriptores || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching descriptores:', error.message);
                toast.error('Error al cargar descriptores', {
                    description: 'No se pudieron obtener los descriptores asignados a la competencia'
                });
                setLoading(false);
            }
        };

        fetchDescriptores();
    }, [competencia.idCompetencia]);

    if (loading) {
        return <Loading message="Cargando descriptores..." />;
    }

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl w-9/12 max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-zvioleta to-zvioletaopaco text-white p-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Descriptores Asignados</h2>
                    <p className="text-white/80">Lista de descriptores asignados a la competencia</p>
                </div>
                <button
                    onClick={() => setOpenModal(false)}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                Cerrar
                </button>
            </div>
                <div className="overflow-y-auto max-h-96 p-6">
                    {descriptores?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2">
                            {descriptores.map((descriptor) => (
                                <li key={descriptor.idDescriptor} className="text-gray-700">
                                    {descriptor.descripcion}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No hay descriptores asignados.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ModalDescriptores;