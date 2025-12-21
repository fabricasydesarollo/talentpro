import { useState } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types'
import { toast } from 'sonner';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { FaTimes, FaTrash, FaCalendarAlt, FaUser, FaClipboardList } from 'react-icons/fa';

// Estilo básico para el modal (puedes personalizarlo)
Modal.setAppElement('#root'); // Esto es necesario para accesibilidad

const EvaluacionesModal = ({ evaluaciones, idColaborador, buscarUsuario }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = async (idEvaluacion, idEvaluador, idTipoEvaluacion) => {
    setIsDeleting(`${idEvaluacion}-${idEvaluador}-${idTipoEvaluacion}`);
    
    try {
      await axios.delete(`${URLBASE}/evaluaciones/disponible`, {
        params: { idEvaluacion, idEvaluador, idColaborador, idTipoEvaluacion }
      });
      
      toast.success('Evaluación eliminada', {
        description: 'La evaluación se eliminó correctamente'
      });
      
      if (buscarUsuario) buscarUsuario();
    } catch (error) {
      toast.error('Error al eliminar', {
        description: 'No se pudo eliminar la evaluación'
      });
    } finally {
      setIsDeleting(null);
      setIsModalOpen(false);
    }
  };

  const isDisabledAfterDays = (dateString, days) => {
    const fecha = new Date(dateString.split('T')[0]);
    const diferenciaEnDias = (new Date() - fecha) / (1000 * 60 * 60 * 24);
    return diferenciaEnDias >= days;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* Botón para abrir el modal */}
      <button
        onClick={toggleModal}
        className="flex items-center gap-2 bg-zvioleta hover:bg-zvioleta/90 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        type='button'
      >
        <FaClipboardList className="text-sm" />
        Mostrar Evaluaciones
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={toggleModal}
        style={{
          content: {
            width: '90%',
            maxWidth: '800px',
            height: '80%',
            maxHeight: '600px',
            margin: 'auto',
            borderRadius: '16px',
            padding: '0',
            border: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
          },
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-zvioleta to-zvioletaopaco text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <FaClipboardList className="text-xl" />
              <div>
                <h2 className="text-xl font-bold">Evaluaciones Realizadas</h2>
                <p className="text-sm opacity-90">Gestiona las evaluaciones registradas</p>
              </div>
            </div>
            <button
              onClick={toggleModal}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <FaCalendarAlt className="text-xs" />
                Las evaluaciones pueden eliminarse dentro de los 6 días posteriores a su registro.
              </p>
            </div>

            {evaluaciones?.length === 0 ? (
              <div className="text-center py-12">
                <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No hay evaluaciones registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluaciones?.map((evaluacion, index) => {
                  const isDisabled = isDisabledAfterDays(evaluacion.createdAt, 6);
                  const deleteKey = `${evaluacion.idEvaluacion}-${evaluacion.idEvaluador}-${evaluacion.idTipoEvaluacion}`;
                  const isCurrentlyDeleting = isDeleting === deleteKey;

                  return (
                    <div
                      key={`lista-${index}`}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <FaClipboardList className="text-zvioleta text-sm" />
                            <h3 className="font-semibold text-gray-900">
                              {`${evaluacion?.evaluacionNombre} - ${evaluacion?.year}`}
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Tipo:</span>
                              <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                                {evaluacion?.tipoEvaluacion}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <FaUser className="text-xs" />
                              <span className="font-medium">Evaluador:</span>
                              <span>{evaluacion?.evaluadorNombre}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 md:col-span-2">
                              <FaCalendarAlt className="text-xs" />
                              <span className="font-medium">Fecha:</span>
                              <span>{formatDate(evaluacion.createdAt)}</span>
                              {isDisabled && (
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md">
                                  No eliminable
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(evaluacion.idEvaluacion, evaluacion.idEvaluador, evaluacion.idTipoEvaluacion)}
                          disabled={isDisabled || isCurrentlyDeleting}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ml-4"
                        >
                          {isCurrentlyDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <FaTrash className="text-sm" />
                          )}
                          {isCurrentlyDeleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-end">
              <button
                onClick={toggleModal}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

EvaluacionesModal.propTypes = {
  evaluaciones: PropTypes.array,
  idColaborador: PropTypes.number,
  buscarUsuario: PropTypes.func
};

export default EvaluacionesModal;
