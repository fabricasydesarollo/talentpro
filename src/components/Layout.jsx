import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Asegúrate de importar PropTypes
import {
  FaBars, FaTimes, FaChevronLeft, FaChevronRight, FaCheckCircle, FaHome, FaCog, FaSignOutAlt,
  FaClipboardCheck, FaUser, FaList, FaEdit, FaCaretDown, FaCaretUp, FaEye
} from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { URLBASE } from '../lib/actions';
import { FaChartPie, FaTableCells } from 'react-icons/fa6';
import { RiDashboard3Fill, RiFileChartFill } from '@remixicon/react';
import { HiMiniClipboardDocumentCheck } from 'react-icons/hi2';
import style from './layout.module.css';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminSubMenuOpen, setIsAdminSubMenuOpen] = useState(false);
  const [isOpenInforme, setIsOpenInforme] = useState(false)
  const [idPerfil, setIdPerfil] = useState(null);
  const navigate = useNavigate();


  const user = useUser();

  const handleLogout = () => {
    axios.post(`${URLBASE}/usuarios/logout`, {}, { withCredentials: true })
      .then(() => {
        user.setColaboradores(null);
        user.setUser(null);
        navigate('/');
      })
      .catch((err) => console.log(err));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAdminSubMenu = () => {
    setIsAdminSubMenuOpen(!isAdminSubMenuOpen);
  };

  useEffect(() => {
    const perfil = user?.user?.idPerfil;
    setIdPerfil(Number(perfil));
  }, [user]);

  return (
    <div className="flex z-10 min-h-screen bg-gray-50 text-gray-900 overflow-y-auto">
      <nav className={`fixed h-full bg-zvioleta rounded-tr-3xl backdrop-blur-sm text-white transition-all duration-300 ease-in-out flex flex-col justify-between ${isMenuOpen ? 'w-72' : 'w-16'}`}>
        <div className="relative p-4 flex items-center justify-between">
          <div className={`transition-opacity duration-300 p-4 rounded-md ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
            <img className='invert brightness-0' src={user?.user?.Empresas[0]?.urlLogo} alt={`logo-empresa${user?.user?.Empresas[0]?.nombre}`} />
          </div>
          <button onClick={toggleMenu} className={`absolute top-1/2 transform -translate-y-1/2 text-white focus:outline-none hover:bg-zvioletaopaco p-2 rounded-full transition-all duration-300 ${isMenuOpen ? '-right-3' : 'right-0'}`}>
            {isMenuOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
          </button>
        </div>
        <span className={`ml-4 font-bold text-xl transition-opacity duration-300 capitalize ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
          {user?.user?.nombre.toLowerCase()}
        </span>
        <span className={`ml-4 text-sm transition-opacity capitalize duration-300 ${isMenuOpen ? 'opacity-70' : 'opacity-0'}`}>{user?.user?.cargo}</span>
        {/* Opciones del menú */}
        <ul className={`flex-1 space-y-4 mt-8 overflow-auto ${style.scrollable}`} >
          <li>
            <Link to="/home" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
              <FaHome size={20} />
              <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Home</span>
            </Link>
          </li>
          {(idPerfil === 2 || idPerfil === 3) && (
            <>
              <li>
                <Link to="/evaluar" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                  <FaCheckCircle size={20} />
                  <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Evaluar</span>
                </Link>
              </li>
              <li>
                <Link to="/informes/resultado/usuario" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                  <FaTableCells size={20} />
                  <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Informe</span>
                </Link>
              </li>
              <li>
                <Link to="/DashboardUser" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                  <FaChartPie size={20} />
                  <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Dashboard</span>
                </Link>
              </li>
            </>
          )}

          {idPerfil === 3 && (
            <>
              <li>
                <div className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors cursor-pointer" onClick={() => setIsOpenInforme(!isOpenInforme)}>
                  <FaClipboardCheck size={20} />
                  <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Informes</span>
                  {isOpenInforme ? <FaCaretUp size={16} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`} /> : <FaCaretDown size={16} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`} />}
                </div>

                {isOpenInforme && (
                  <ul className="pl-6 space-y-2">
                    <li>
                      <Link to="/informes/graficas" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <FaChartPie size={20} />
                        <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Gráficas</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/informes/evaluadores" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <RiFileChartFill size={20} />
                        <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Evaluadores</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/informes/dashboard" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <RiDashboard3Fill size={20} />
                        <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/informes/resultados" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <HiMiniClipboardDocumentCheck size={20} />
                        <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Resultados</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/informes/acciones" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <HiMiniClipboardDocumentCheck size={20} />
                        <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Acciones de mejora</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <div className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors cursor-pointer" onClick={toggleAdminSubMenu}>
                  <FaCog size={20} />
                  <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Administración</span>
                  {isAdminSubMenuOpen ? <FaCaretUp size={16} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`} /> : <FaCaretDown size={16} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`} />}
                </div>

                {isAdminSubMenuOpen && (
                  <ul className="pl-6 space-y-2">
                    <li>
                      <Link to="/administrar/usuarios" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <FaUser size={20} />
                        <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Usuarios</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/administrar/descriptores" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <FaList size={20} />
                        <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Descriptores</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/administrar/evaluaciones" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <FaEdit size={20} />
                        <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Evaluaciones</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/administrar/seguimiento" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <FaEye size={20} />
                        <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Seguimiento</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}

          <li onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors cursor-pointer">
            <FaSignOutAlt size={20} />
            <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Cerrar sesión</span>
          </li>
        </ul>

        <div className="p-4">
          <button onClick={toggleMenu} className="mt-4 text-white hover:bg-zvioletaopaco p-3 rounded-full focus:outline-none w-full flex justify-center transition-all duration-300">
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </nav>

      <div className={`ml-${isMenuOpen ? '72' : '16'} flex-1 overflow-auto h-full p-6 transition-all duration-300`}>
        {children}
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;