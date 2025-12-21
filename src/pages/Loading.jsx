import PropTypes from 'prop-types';

const Loading = ({ loading = true, message = "Cargando datos..." }) => {
  return (
    <div
      className={`fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300 ${
        loading ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner con doble anillo */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-znaranja rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-znaranja rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Mensaje con puntos animados */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 animate-pulse">
            {message}
          </p>
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-znaranja rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-znaranja rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-znaranja rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

Loading.propTypes = {
  loading: PropTypes.bool,
  message: PropTypes.string,
};

export default Loading;
  