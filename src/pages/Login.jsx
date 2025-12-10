import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { URLBASE } from '../lib/actions.js';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import DesarrollandoTalentosLogo from '/Desarrollando_talentos_Logo.png'
import DesarrollandoTalentosHome from '/Desarrollando_talentos_Home.webp'

const Login = () => {
  const [documento, setDocumento] = useState('');
  const [password, setPassword] = useState('');
  const user = useUser()
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const result = await axios.post(`${URLBASE}/usuarios/login`, { documento: documento, contrasena: password }, { withCredentials: true })
      if (result.data?.data) {
        user?.setUser(result.data?.data)
        localStorage.setItem('token', result.data?.token);
        toast.success("Credenciales correctas!")

        if (result.data?.data.Empresas.length < 1) {
          toast.warning("No cuenta con empresa asignada, por favor contacta con el Administrador")
          navigate('/');
          return;
        }
        // Redirigir al Home después de iniciar sesión
        navigate('/home');

      }
    } catch (error) {
      toast.error(`Ups!. ${error?.response?.data.message}`)
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <div className="w-full md:w-1/2 h-full md:h-auto grid grid-cols-1 justify-items-center items-end sm:p-8 p-4 bg-gray-50">
        <div className="w-full max-w-md space-y-6 pb-20">
          <div className="space-y-2 text-center flex justify-center flex-col items-center">
            <img src={DesarrollandoTalentosLogo} alt="DesarrollandoTalentosLogo" className='md:w-full w-80 mb-6' />
            <p className="text-sm text-gray-600">Ingresa tus credenciales para acceder</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label htmlFor="documento" className="block text-sm font-medium text-gray-700">Número de documento</label>
              <input
                id="documento"
                name="documento"
                type="number"
                placeholder="Ingresa tu número de documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zcinza focus:border-zcinza [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                aria-autocomplete='current-password'
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zcinza focus:border-zcinza"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-xl font-medium text-white bg-zvioleta rounded-md hover:bg-zvioleta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zvioleta/90"
            >
              Ingresar
            </button>
          </form>
        </div>
        <p className="text-sm text-zvioleta">Copyright &copy;  2024 Zentria. Desarrollo por Fábricas y Desarrollo TI.</p>
      </div>
      <div
        className="w-full md:w-1/2 md:block hidden h-auto"
      >
        <img
          src={DesarrollandoTalentosHome}
          alt="DesarrollandoTalentosHome"
          className="w-full h-full object-cover md:object-left-top"
        />
      </div>
    </main>
  );
};

export default Login;
