import { useState } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types'
import { toast } from 'react-toastify';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';

// Estilo básico para el modal (puedes personalizarlo)
Modal.setAppElement('#root'); // Esto es necesario para accesibilidad

const EvaluacionesModal = ({ evaluaciones, idColaborador, buscarUsuario }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };


  const handleDelete = async (idEvaluacion, idEvaluador) => {
    try {
      await axios.delete(`${URLBASE}/evaluaciones/disponible`, {params: {idEvaluacion, idEvaluador, idColaborador}})
      toast.success('Información actualizada con existo!')
      if (buscarUsuario) buscarUsuario();
    } catch (error) {
      toast.error(error)
    } finally {
      setIsModalOpen(false)
    }
  };

  const isDisabledAfterDays = (dateString, days) => {
    const fecha = new Date(dateString.split('T')[0]);
    const diferenciaEnDias = (new Date() - fecha) / (1000 * 60 * 60 * 24);
    return diferenciaEnDias >= days;
  };

  return (
    <div>
      {/* Botón para abrir el modal */}
      <button
        onClick={toggleModal}
        className="bg-zvioleta text-white px-4 py-2 rounded-lg"
        type='button'
      >
        Mostrar Evaluaciones
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={toggleModal}
        style={{
          content: {
            width: '760px',
            height: '500px',
            margin: 'auto',
            borderRadius: '10px',
            padding: '20px',
            border: '1px solid #ccc',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <h2 className="text-xl font-bold mb-2 text-zvioleta">Evaluaciones realizadas</h2>
        <p className='text-sm pb-4 font-light italic'>Las evaluaciones pueden eliminarse dentro de los 6 días posteriores a su registro.</p>
        <ul className="space-y-4">
          {evaluaciones?.map((evaluacion, index) => (
            <li
              key={`lista-${index}`}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Evaluación:</strong> {`${evaluacion?.evaluacion.nombre} - ${evaluacion?.evaluacion.year}`}
                </p>
                <p>
                  <strong>Tipo:</strong> {evaluacion?.TipoEvaluacione?.nombre}
                </p>
                <p>
                  <strong>Evaluador:</strong> {`${evaluacion?.evaluador.nombre} - ${evaluacion?.idEvaluador}`}
                </p>
                <p>
                  <strong>Fecha de registro:</strong> {`${evaluacion.createdAt.split('T')[0]}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(evaluacion.idEvaluacion, evaluacion.idEvaluador)}
                className="bg-znaranja text-white px-3 py-1 rounded-lg hover:scale-105 hover:bg-znaranja/80 disabled:bg-znaranja/70 disabled:cursor-not-allowed"
                disabled={isDisabledAfterDays(evaluacion.createdAt, 6)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={toggleModal}
          className="bg-zvioleta text-white py-2 px-5 rounded-lg mt-5 hover:scale-105"
        >
          Cerrar
        </button>
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
