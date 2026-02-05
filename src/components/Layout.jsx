import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaCheckCircle, 
  FaHome, 
  FaCog, 
  FaSignOutAlt,
  FaClipboardCheck, 
  FaUser, 
  FaList, 
  FaEdit, 
  FaChevronDown,
  FaChartPie,
  FaTable
} from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { IoIosBusiness } from 'react-icons/io';
import style from './layout.module.css';

const Layout = ({ isMenuOpen, setIsMenuOpen }) => {
  const [isAdminSubMenuOpen, setIsAdminSubMenuOpen] = useState(false);
  const [isInformesSubMenuOpen, setIsInformesSubMenuOpen] = useState(false);
  const [idPerfil, setIdPerfil] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();

  const [empresa] = Object.values(user?.user?.Empresas || {});

  const handleLogout = () => {
    axios.post(`${URLBASE}/usuarios/logout`, {}, { withCredentials: true })
      .then(() => {
        user.setColaboradores(null);
        user.setUser(null);
        localStorage.removeItem('token');
        navigate('/');
      })
      .catch((err) => {
        console.error('Error during logout:', err);
        navigate('/');
      });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSubMenuClick = (submenuSetter, currentState) => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      setTimeout(() => submenuSetter(!currentState), 150);
    } else {
      submenuSetter(!currentState);
    }
  };

  useEffect(() => {
    const perfil = user?.user?.idPerfil;
    setIdPerfil(Number(perfil));
  }, [user]);

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className={`fixed h-full bg-zvioleta text-white flex flex-col transition-all duration-300 ease-in-out z-20 print:hidden ${
      isMenuOpen ? 'w-64 translate-x-0' : 'w-16'
    } sm:translate-x-0 -translate-x-full shadow-xl`}>
      
      {/* Header */}
      <div className="relative p-4 flex items-center justify-between border-b border-white/20">
        <div className={`transition-all duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
          {empresa?.urlLogo ? (
            <img 
              className="h-16 w-auto filter invert brightness-0" 
              src={empresa.urlLogo} 
              alt={`Logo ${empresa.nombre}`} 
            />
          ) : (
            <div className="h-16 flex items-center">
              <span className="text-2xl font-bold">Sistema</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleMenu} 
          className={`absolute ${isMenuOpen ? '-right-3' : '-right-10 sm:-right-3'} top-1/2 -translate-y-1/2 bg-zvioleta border-2 border-white/30 rounded-full p-2 hover:bg-zvioleta hover:border-white/50 transition-all duration-200 shadow-lg ${
            isMenuOpen ? '' : 'sm:block'
          }`}
        >
          {isMenuOpen ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
        </button>
      </div>

      {/* Menu Items */}
      <div className={`flex-1 overflow-y-auto ${style.scrollable}`}>
        <ul className="space-y-1 p-3">
          
          {/* Inicio */}
          <li>
            <Link 
              to="/home" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActiveRoute('/home') 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'hover:bg-white/10 text-white/90 hover:text-white'
              }`}
            >
              <FaHome size={18} className="flex-shrink-0" />
              <span className={`${!isMenuOpen && 'hidden'} font-medium`}>Inicio</span>
            </Link>
          </li>

          {/* Mi Perfil */}
          <li>
            <Link 
              to="/myprofile" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActiveRoute('/myprofile') 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'hover:bg-white/10 text-white/90 hover:text-white'
              }`}
            >
              <FaUser size={18} className="flex-shrink-0" />
              <span className={`${!isMenuOpen && 'hidden'} font-medium`}>Mi Perfil</span>
            </Link>
          </li>

          {/* Evaluadores y Administradores */}
          {(idPerfil === 2 || idPerfil === 3) && (
            <>
              <li>
                <Link 
                  to="/evaluar" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActiveRoute('/evaluar') 
                      ? 'bg-white/20 text-white shadow-sm' 
                      : 'hover:bg-white/10 text-white/90 hover:text-white'
                  }`}
                >
                  <FaCheckCircle size={18} className="flex-shrink-0" />
                  <span className={`${!isMenuOpen && 'hidden'} font-medium`}>Evaluar</span>
                </Link>
              </li>
              
              <li>
                <Link 
                  to="/informes/resultado/usuario" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActiveRoute('/informes/resultado/usuario') 
                      ? 'bg-white/20 text-white shadow-sm' 
                      : 'hover:bg-white/10 text-white/90 hover:text-white'
                  }`}
                >
                  <FaTable size={18} className="flex-shrink-0" />
                  <span className={`${!isMenuOpen && 'hidden'} font-medium`}>Informe</span>
                </Link>
              </li>
              
              <li>
                <Link 
                  to="/DashboardUser" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActiveRoute('/DashboardUser') 
                      ? 'bg-white/20 text-white shadow-sm' 
                      : 'hover:bg-white/10 text-white/90 hover:text-white'
                  }`}
                >
                  <FaChartPie size={18} className="flex-shrink-0" />
                  <span className={`${!isMenuOpen && 'hidden'} font-medium`}>Dashboard</span>
                </Link>
              </li>
            </>
          )}

          {/* Solo Administradores */}
          {idPerfil === 3 && (
            <>
              {/* Informes */}
              <li>
                <button 
                  onClick={() => handleSubMenuClick(setIsInformesSubMenuOpen, isInformesSubMenuOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 text-white/90 hover:text-white"
                >
                  <FaClipboardCheck size={18} className="flex-shrink-0" />
                  <span className={`${!isMenuOpen && 'hidden'} font-medium flex-1 text-left`}>
                    Informes
                  </span>
                  {isMenuOpen && (
                    <FaChevronDown 
                      size={14} 
                      className={`transition-transform duration-200 ${isInformesSubMenuOpen ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                {isInformesSubMenuOpen && isMenuOpen && (
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>
                      <Link 
                        to="/informes/graficas" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActiveRoute('/informes/graficas') 
                            ? 'bg-white/15 text-white' 
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <FaChartPie size={14} />
                        <span>Gráficas</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/informes/evaluadores" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActiveRoute('/informes/evaluadores') 
                            ? 'bg-white/15 text-white' 
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <FaUser size={14} />
                        <span>Evaluadores</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/informes/dashboard" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActiveRoute('/informes/dashboard') 
                            ? 'bg-white/15 text-white' 
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <FaChartPie size={14} />
                        <span>Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/informes/resultados" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActiveRoute('/informes/resultados') 
                            ? 'bg-white/15 text-white' 
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <FaClipboardCheck size={14} />
                        <span>Resultados</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/informes/acciones" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActiveRoute('/informes/acciones') 
                            ? 'bg-white/15 text-white' 
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <FaEdit size={14} />
                        <span>Acciones de mejora</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Administración */}
              <li>
                <button 
                  onClick={() => handleSubMenuClick(setIsAdminSubMenuOpen, isAdminSubMenuOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 text-white/90 hover:text-white"
                >
                  <FaCog size={18} className="flex-shrink-0" />
                  <span className={`${!isMenuOpen && 'hidden'} font-medium flex-1 text-left`}>
                    Administración
                  </span>
                  {isMenuOpen && (
                    <FaChevronDown 
                      size={14} 
                      className={`transition-transform duration-200 ${isAdminSubMenuOpen ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                {isAdminSubMenuOpen && isMenuOpen && (
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>
                      <Link 
                        to="/administrar/usuarios" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActiveRoute('/administrar/usuarios') 
                            ? 'bg-white/15 text-white' 
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <FaUser size={14} />
                        <span>Usuarios</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/administrar/descriptores" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActiveRoute('/administrar/descriptores') 
                            ? 'bg-white/15 text-white' 
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <FaList size={14} />
                        <span>Descriptores</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/administrar/evaluaciones" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActiveRoute('/administrar/evaluaciones') 
                            ? 'bg-white/15 text-white' 
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <FaEdit size={14} />
                        <span>Evaluaciones</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/administrar/empresas" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActiveRoute('/administrar/empresas') 
                            ? 'bg-white/15 text-white' 
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <IoIosBusiness size={14} />
                        <span>Empresas</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-500/20 text-white/90 hover:text-white"
        >
          <FaSignOutAlt size={18} className="flex-shrink-0" />
          <span className={`${!isMenuOpen && 'hidden'} font-medium`}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </nav>
  );
};

Layout.propTypes = {
  isMenuOpen: PropTypes.bool.isRequired,
  setIsMenuOpen: PropTypes.func.isRequired,
}

export default Layout;