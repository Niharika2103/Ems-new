const Footer = () => {
  return (
    <footer className="bg-white shadow-md  w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-gray-600 text-sm">
        <p className="mb-2 md:mb-0">
          © {new Date().getFullYear()}  Zentrix Workforce Pvt Ltd. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-blue-600">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-blue-600">
            Terms of Service
          </a>
          <a href="/contact" className="hover:text-blue-600">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
