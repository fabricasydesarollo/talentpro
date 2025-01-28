const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-4 flex justify-center items-center mt-4">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Zentria. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
