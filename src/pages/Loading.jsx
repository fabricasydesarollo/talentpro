import PropTypes from 'prop-types';
const Loading = ({ loading = true }) => {
    return (
      <div
        className={`fixed top-0 left-16 w-full h-full flex justify-center items-center z-10 bg-white bg-opacity-100 transition-opacity duration-300 ${
          loading ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <p className="text-lg font-semibold text-zvioleta">Cargando datos...</p>
      </div>
    );
  };

Loading.propTypes = {
loading: PropTypes.bool,
};
  
export default Loading;
  