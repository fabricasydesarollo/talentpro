import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <button onClick={() => navigate("/")}>Go to Home</button>
    </div>
  );
};

export default NotFound;
