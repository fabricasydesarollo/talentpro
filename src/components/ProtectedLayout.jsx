import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { URLBASE } from '../lib/actions';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const ProtectedLayout = ({ allowedProfiles }) => {
  const navigate = useNavigate();
  const user = useUser();
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const toastId = toast.loading("Verificando sesión...", {toastId: "loading-id"});

      try {
        const res = await axios.get(`${URLBASE}/usuarios/sesion`, { withCredentials: true });
        
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
    <div className="flex h-screen overflow-auto bg-gray-50 print:overflow-visible print:h-auto">
      <Layout />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

ProtectedLayout.propTypes = {
  allowedProfiles: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default ProtectedLayout;
