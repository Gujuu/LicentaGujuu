import logo from "@/assets/logo.png";
import { Instagram, Facebook } from "lucide-react";


const Footer = () => {
  return (
  <footer id="contact" className="bg-charcoal text-cream py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl text-cream mb-4">Dei Frati</h3>
            <p className="text-cream/60 leading-relaxed">
              Italian restaurant with traditional cuisine and a welcoming atmosphere. 
              A corner of Italy in the heart of the city.
            </p>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display text-xl text-cream mb-4">Opening Hours</h4>
            <ul className="space-y-2 text-cream/60">
              <li className="flex justify-between">
                <span>Mon - Sun</span>
                <span>12:00 - 22:30</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-xl text-cream mb-4">Contact</h4>
            <ul className="space-y-2 text-cream/60">
              <li>Strada Vasile Alecsandri 3, Timișoara</li>
              <li>+40 728 847 910</li>
              <li>gujumarius99@yahoo.com</li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.instagram.com/deifrati.tm"
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center text-cream hover:bg-cream/20 hover:scale-110 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/deifrati.tm/"
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center text-cream hover:bg-cream/20 hover:scale-110 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-cream/10 mb-8" />

        {/* Copyright */}
        <div className="text-center text-cream/40 text-sm">
          <p>© 2026 Dei Frati Timisoara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
