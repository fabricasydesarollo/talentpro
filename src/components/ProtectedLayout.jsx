import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { URLBASE } from '../lib/actions.js';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const ProtectedLayout = ({ allowedProfiles }) => {
  const navigate = useNavigate();
  const user = useUser();
  const [loadingSession, setLoadingSession] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const toastId = toast.loading("Verificando sesión...", { toastId: "loading-id" });

      try {
        const res = await axios.get(`${URLBASE}/usuarios/sesion`, { withCredentials: true });

        console.log(res)

        if (!res.data?.data) {
          toast.update(toastId, { render: "Sesión no válida. Redirigiendo...", type: "error", isLoading: false, autoClose: 3000 });
          navigate('/');
          return;
        } else {
          navigate('/home');
          toast.update(toastId, { render: "Sesión válida. Redirigiendo...", type: "success", isLoading: false, autoClose: 3000 });
        }
      } catch {
        toast.update(toastId, { render: "Error al verificar la sesión", type: "error", isLoading: false, autoClose: 3000 });
        navigate('/');
      } finally {
        setLoadingSession(false);
      }
    };

    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user]);

  useEffect(() => {
    if (!loadingSession) {
      const idPerfil = user?.user?.idPerfil;
      const idPerfilNumber = Number(idPerfil);

      if (!allowedProfiles.includes(idPerfilNumber)) {
        navigate('/home');
      }
    }
  }, [loadingSession, navigate, allowedProfiles, user]);

  if (loadingSession) {
    return null;
  }

  return (
    <div className="flex items-start">
      <Layout isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div className={`w-full mx-auto h-full flex flex-col justify-center items-center transition-all duration-200 ease-in-out ${isMenuOpen ? 'sm:ml-72' : 'sm:ml-16'} ml-0`}>
        <Outlet />
      </div>
    </div>
  );
};

ProtectedLayout.propTypes = {
  allowedProfiles: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default ProtectedLayout;
