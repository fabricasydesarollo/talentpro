import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { URLBASE } from '../lib/actions.js';

const ProtectedLayout = ({ allowedProfiles }) => {
  const navigate = useNavigate();
  const user = useUser();
  const [loadingSession, setLoadingSession] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const loadingToast = toast.loading("Verificando sesión...");

      try {
        let res;
        try {
          res = await axios.get(`${URLBASE}/usuarios/sesion`, { withCredentials: true });
        } catch (error) {
          const token = localStorage.getItem("token")
          if (token) {
            res = await axios.get(`${URLBASE}/usuarios/sesion`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          } else {
            toast.dismiss(loadingToast);
            toast.error("Sesión no válida", {
              description: "Redirigiendo al login...",
            });
            navigate("/");
            return;
          }
        }        
        
        if (!res?.data?.data || (res.data?.data?.idUsuario !== user?.user?.idUsuario)) {
          toast.dismiss(loadingToast);
          toast.error("Sesión no válida", {
            description: "Redirigiendo al login...",
          });
          navigate("/");
          return;
        } else {
          toast.dismiss(loadingToast);
          toast.success("Sesión válida", {
            description: "Acceso autorizado",
            duration: 1500,
          });
        }
      } catch {
        toast.dismiss(loadingToast);
        toast.error("Error al verificar la sesión", {
          description: "Problema de conexión",
        });
        navigate("/");
      } finally {
        setLoadingSession(false);
      }
    };

    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user, navigate]);

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
