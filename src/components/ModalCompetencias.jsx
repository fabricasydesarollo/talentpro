import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { URLBASE } from '../lib/actions';
import Loading from '../pages/Loading';
import ModalDescriptores from './ModalDescriptores';


const ModalCompetencias = ({ setOpenEval, competenciasAsignadas, idEvaluacion, setCurrentEval }) => {

    const [competencias, setCompetencias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [currentCompetencia, setCurrentCompetencia] = useState(null);

    useEffect(() => {
        const fetchCompetencias = async () => {
            try {
                const response = await axios.get(`${URLBASE}/competencias`);

                const competenciasData = response.data?.data || [];
                const competenciasProcesar = competenciasData.map((competencia) => ({
                    ...competencia,
                    isAssigned: competenciasAsignadas?.some((asignada) => asignada.idCompetencia === competencia.idCompetencia),
                }));

                setCompetencias(competenciasProcesar);
            } catch (error) {
                console.error('Error fetching competencias:', error.message);
                toast.error('Error al cargar competencias', {
                    description: 'No se pudieron obtener las competencias'
                });
            }
        };

        fetchCompetencias();

    }, []);

    if (competencias.length === 0) {
        return Loading({ message: 'Cargando competencias...' });
    }


    const handleCheckboxChange = (idCompetencia, isChecked) => {
        setCompetencias((prevCompetencias) =>
            prevCompetencias.map((competencia) =>
                competencia.idCompetencia === idCompetencia
                    ? { ...competencia, isAssigned: isChecked }
                    : competencia
            )
        );
    }

    const asigarCompetencias = async () => {
        const competenciasSeleccionadas = competencias.filter((competencia) => competencia.isAssigned);
        try {
            const dataRequest = {
                idEvaluacion: idEvaluacion,
                competencias: competenciasSeleccionadas.map((competencia) => competencia.idCompetencia)
            }
            const result = await axios.post(`${URLBASE}/competencias/assignEvaluation`, dataRequest, {
                withCredentials: true
            })
            if (result.status != 200) {
                toast.error(result)
                return
            }
            toast.success('Competencias asignadas correctamente', {
                description: 'Las competencias han sido asignadas exitosamente'
            });
            setCurrentEval((prevEval) => ({
                ...prevEval,
                Competencias: competenciasSeleccionadas
            }));
            setOpenEval({ open: false, modo: 'crear' });
        } catch (error) {
            console.error('Error assigning competencias:', error.message);
            toast.error('Error al asignar competencias', {
                description: 'No se pudieron asignar las competencias'
            });
        }
    };

    const contadorAsignadas = competencias?.filter((competencia) => competencia.isAssigned).length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-zvioleta to-zvioletaopaco text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col w-full">
                            <h1 className="text-2xl font-bold">Asignar Competencias</h1>
                            <p className="text-white/90 text-sm">Selecciona usuarios para asignar evaluaciones</p>
                        </div>

                        <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-end gap-2 mt-4 sm:mt-0">
                            <span>{contadorAsignadas} seleccionadas</span>
                            <div className="w-full sm:w-auto">
                                <input type="text" id="search" placeholder="Buscar competencias..."
                                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-zvioleta focus:border-zvioleta bg-white/20 placeholder:text-white text-white border-zvioleta border-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full flex gap-2 sm:w-auto">
                                <button
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={asigarCompetencias}
                                >
                                    Guardar
                                </button>
                                <button
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                                    onClick={() => setOpenEval({ open: false, modo: 'crear' })}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Body tipo tabla para selección */}
                <div className="p-6 overflow-y-auto max-h-[75vh]">
                    <div className="overflow-x-auto">
                        {/* Filtros */}

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ¿Asignar?
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Competencia
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Empresas
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>

                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {competencias.filter((competencia) =>
                                    competencia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    competencia?.Empresas?.some((empresa) => empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                                ).map((competencia) => (
                                    <tr key={competencia.idCompetencia}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                            <input
                                                type="checkbox"
                                                id={competencia.idCompetencia}
                                                name={competencia.idCompetencia}
                                                value={competencia.idCompetencia}
                                                className="h-4 w-4 text-zvioleta focus:ring-zvioleta border-gray-300 rounded"
                                                defaultChecked={competencia.isAssigned}
                                                onChange={(e) => handleCheckboxChange(competencia.idCompetencia, e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {competencia.idCompetencia}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <label htmlFor={competencia.idCompetencia} className="ml-2 text-sm font-medium text-gray-900">
                                                    {competencia.nombre}
                                                </label>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap flex gap-2 flex-wrap">
                                            {competencia?.Empresas.map((empresa) => (
                                                <span key={empresa.idEmpresa} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zverdeclaro/30 text-zverde">
                                                    {empresa.nombre}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                className="flex items-center gap-2 bg-zvioleta/20 hover:bg-zvioleta/30 text-zvioleta px-2 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={() => {
                                                    setCurrentCompetencia(competencia);
                                                    setOpenModal(true);
                                                }}
                                            >
                                                Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {openModal && currentCompetencia && (
                <ModalDescriptores
                    competencia={currentCompetencia}
                    setOpenModal={setOpenModal}
                />
            )}
        </div>
    );
}

export default ModalCompetencias