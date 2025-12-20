import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import DesarrollandoTalentosLogo from '/Desarrollando_talentos_Logo.png'
import DesarrollandoTalentosHome from '/Desarrollando_talentos_Home.webp'

const Login = () => {
  const [documento, setDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser()
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await axios.post(`${URLBASE}/usuarios/login`, { 
        documento: documento, 
        contrasena: password 
      }, { withCredentials: true })
      
      if (result.data?.data) {
        user?.setUser(result.data?.data);
        localStorage.setItem('token', result.data?.token);
        
        toast.success('¡Bienvenido! Credenciales correctas', {
          description: `Hola ${result.data?.data.nombre}`,
        });

        if (result.data?.data.Empresas.length < 1) {
          toast.warning('No cuenta con empresa asignada', {
            description: 'Por favor contacta con el Administrador',
          });
          navigate('/');
          return;
        }
        // Redirigir al Home después de iniciar sesión
        navigate('/home');
      }
    } catch (error) {
      toast.error('Error de autenticación', {
        description: error?.response?.data.message || 'Credenciales incorrectas',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 via-white to-zcinza/20">
      <div className="w-full md:w-1/2 h-full md:h-auto grid grid-cols-1 justify-items-center items-center sm:p-8 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4 text-center flex justify-center flex-col items-center">
            <div className="relative">
              <img 
                src={DesarrollandoTalentosLogo} 
                alt="Desarrollando Talentos Logo" 
                className='md:w-full w-80 mb-4 drop-shadow-sm' 
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-zvioleta to-znaranja bg-clip-text text-transparent mb-2">
                Bienvenido
              </h1>
              <p className="text-sm text-gray-600">Ingresa tus credenciales para acceder al sistema</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label htmlFor="documento" className="block text-sm font-medium text-gray-700">
                  Número de documento
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-4 w-4 text-gray-400 group-focus-within:text-zvioleta transition-colors" />
                  </div>
                  <input
                    id="documento"
                    name="documento"
                    type="number"
                    placeholder="Ingresa tu número de documento"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all duration-200 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-zvioleta transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zvioleta/50 focus:border-zvioleta transition-all duration-200"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-zvioleta transition-colors" />
                    ) : (
                      <FaEye className="h-4 w-4 text-gray-400 hover:text-zvioleta transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 text-lg font-medium text-white bg-gradient-to-r from-zvioleta to-zvioletaopaco rounded-lg hover:from-zvioleta/90 hover:to-zvioletaopaco/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zvioleta/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Ingresando...
                  </div>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>
          </div>

          {/* Información adicional */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              ¿Problemas para acceder? Contacta al administrador del sistema
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-xs text-gray-500 text-center">
            Copyright &copy; 2024 Zentria. Desarrollo por Fábricas y Desarrollo TI.
          </p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 md:block hidden h-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zvioleta/30 via-znaranja/20 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zvioleta/40 to-transparent z-20"></div>
        <img
          src={DesarrollandoTalentosHome}
          alt="Desarrollando Talentos Home"
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
        />
        
        {/* Texto superpuesto opcional */}
        <div className="absolute bottom-8 left-8 z-30 text-white">
          <h2 className="text-2xl font-bold mb-2">Desarrollando Talentos</h2>
          <p className="text-sm opacity-90">Sistema de Evaluación de Competencias</p>
        </div>
      </div>
    </main>
  );
};

export default Login;
