import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", anchor: "#home", route: "/" },
    { label: "About", anchor: "#about", route: "/#about" },
    { label: "Menu", anchor: null, route: "/menu" },
    { label: "Contact", anchor: "#contact", route: "/#contact" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-md shadow-soft py-3" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        {location.pathname === "/" ? (
          <a href="#home" className="flex items-center">
            <img 
              src={logo} 
              alt="Dei Frati" 
              className={`h-10 w-auto transition-all duration-300 ${
                isScrolled ? "" : "brightness-0 invert"
              }`}
            />
          </a>
        ) : (
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Dei Frati" 
              className={`h-10 w-auto transition-all duration-300 ${
                isScrolled ? "" : "brightness-0 invert"
              }`}
            />
          </Link>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isOnIndex = location.pathname === "/";
            const href = isOnIndex && link.anchor ? link.anchor : link.route;
            const isAnchor = isOnIndex && link.anchor;

            return isAnchor ? (
              <a
                key={link.label}
                href={href}
                className={`font-body text-sm uppercase tracking-widest transition-colors duration-300 hover:text-primary ${
                  isScrolled ? "text-foreground" : "text-cream"
                }`}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={href}
                className={`font-body text-sm uppercase tracking-widest transition-colors duration-300 hover:text-primary ${
                  isScrolled ? "text-foreground" : "text-cream"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Button variant={isScrolled ? "olive" : "heroOutline"} size="sm" asChild>
            <a href="https://smart-menu.ro/dei-frati-tm?m=book-a-table&r=&d=&t=" target="_blank" rel="noopener noreferrer">
              Reservations
            </a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 ${isScrolled ? "text-foreground" : "text-cream"}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg shadow-medium animate-slide-up">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => {
              const isOnIndex = location.pathname === "/";
              const href = isOnIndex && link.anchor ? link.anchor : link.route;
              const isAnchor = isOnIndex && link.anchor;

              return isAnchor ? (
                <a
                  key={link.label}
                  href={href}
                  className="font-body text-foreground text-sm uppercase tracking-widest py-2 border-b border-border"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={href}
                  className="font-body text-foreground text-sm uppercase tracking-widest py-2 border-b border-border"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Button variant="olive" className="mt-2">
              Reservations
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
