import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Asegúrate de importar PropTypes
import { FaChevronLeft, FaChevronRight, FaCheckCircle, FaHome, FaCog, FaSignOutAlt,
  FaClipboardCheck, FaUser, FaList, FaEdit, FaCaretDown, FaCaretUp,
  FaClipboardList
} from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { FaChartPie, FaPerson, FaTableCells } from 'react-icons/fa6';
import { RiDashboard3Fill, RiFileChartFill } from '@remixicon/react';
import { HiMiniClipboardDocumentCheck } from 'react-icons/hi2';
import style from './layout.module.css';
import { IoIosBusiness } from 'react-icons/io';

const Layout = ({isMenuOpen, setIsMenuOpen}) => {

  const [isAdminSubMenuOpen, setIsAdminSubMenuOpen] = useState(false);
  const [isOpenInforme, setIsOpenInforme] = useState(false)
  const [idPerfil, setIdPerfil] = useState(null);
  const navigate = useNavigate();


  const user = useUser();

  const [empresa] = Object.values(user?.user?.Empresas)

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

  const toggleAdminSubMenu = () => {
    setIsAdminSubMenuOpen(!isAdminSubMenuOpen);
  };

  useEffect(() => {
    const perfil = user?.user?.idPerfil;
    setIdPerfil(Number(perfil));
  }, [user]);

  return (
      <nav className={`fixed h-full bg-zvioleta text-white flex flex-col justify-between transition-all duration-300 ease-in-out z-20 sm:translate-x-0 -translate-x-full ${isMenuOpen ? 'w-72 translate-x-0' : 'w-16'}`}>
        <div className="relative p-4 flex items-center justify-between">
          <div className={`transition-opacity duration-300 p-4 rounded-md m-0 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
            <img className='invert brightness-0' src={empresa?.urlLogo} alt={`logo-${empresa?.nombre}`} />
          </div>
          <button onClick={toggleMenu} className={`absolute translate-x-full sm:translate-x-0 sm:bg-transparent bg-zvioleta top-5 -right-3 rounded-full p-2 hover:bg-zvioletaopaco transition duration-300 ${isMenuOpen && '-right-3 translate-x-0'}`}>
            {isMenuOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
          </button>
        </div>
        {/* Opciones del menú */}
        <ul className={`flex-1 space-y-4 overflow-auto ${style.scrollable}`} >
          <li>
            <Link to="/home" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
              <FaHome size={20} />
              <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Inicio</span>
            </Link>
          </li>
          <li>
            <Link to="/myprofile" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
              <FaUser size={20} />
              <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Perfil</span>
            </Link>
          </li>
          {/* <li>
            <Link to="/reportCenter" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
              <FaClipboardList size={20} />
              <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Centro de Reportes</span>
            </Link>
          </li> */}
          {(idPerfil === 2 || idPerfil === 3) && (
            <>
              <li>
                <Link to="/evaluar" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                  <FaCheckCircle size={20} />
                  <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Evaluar</span>
                </Link>
              </li>
              <li>
                <Link to="/informes/resultado/usuario" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                  <FaTableCells size={20} />
                  <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Informe</span>
                </Link>
              </li>
              <li>
                <Link to="/DashboardUser" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                  <FaChartPie size={20} />
                  <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Dashboard</span>
                </Link>
              </li>
            </>
          )}

          {idPerfil === 3 && (
            <>
              <li>
                <div className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors cursor-pointer" onClick={() => setIsOpenInforme(!isOpenInforme)}>
                  <FaClipboardCheck size={20} />
                  <span className={`${!isMenuOpen && 'hidden'} transition-all duration-300 overflow-y-auto`}>Informes</span>
                  {isOpenInforme ? <FaCaretUp size={16} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`} /> : <FaCaretDown size={16} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`} />}
                </div>

                {isOpenInforme && (
                  <ul className="pl-6 space-y-2">
                    <li>
                      <Link to="/informes/graficas" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <FaChartPie size={20} />
                        <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Gráficas</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/informes/evaluadores" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <RiFileChartFill size={20} />
                        <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Evaluadores</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/informes/dashboard" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <RiDashboard3Fill size={20} />
                        <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/informes/resultados" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <HiMiniClipboardDocumentCheck size={20} />
                        <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Resultados</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/informes/acciones" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <HiMiniClipboardDocumentCheck size={20} />
                        <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Acciones de mejora</span>
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
                        <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Usuarios</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/administrar/descriptores" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <FaList size={20} />
                        <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Descriptores</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/administrar/evaluaciones" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <FaEdit size={20} />
                        <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Evaluaciones</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/administrar/empresas" className="flex items-center gap-4 px-4 py-3 hover:bg-zvioletaopaco rounded-lg transition-colors">
                        <IoIosBusiness size={20} />
                        <span onClick={toggleMenu} className={`${!isMenuOpen && 'hidden'} transition-all duration-300`}>Empresas</span>
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
          <div className="w-full h-8 border-t border-t-zvioletaopaco text-center">
            <span className='text-zvioletaopaco'>Zentria</span>
          </div>
      </nav>
  );
};

Layout.propTypes = {
  isMenuOpen: PropTypes.bool.isRequired,
  setIsMenuOpen: PropTypes.func.isRequired,
}

export default Layout;