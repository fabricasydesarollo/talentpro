const LoadingGenerate = () => {
    return (
        <div className="flex justify-center items-center h-screen text-zvioleta font-bold">
        {"Generando...".split("").map((char, index) => (
          <span
            key={index}
            className={`inline-block animate-bounce`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {char}
          </span>
        ))}
      </div>
    );
  };
  
  export default LoadingGenerate;
  