import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const LOGO_URL =
  "https://deifrati-bucket-s3.s3.eu-central-1.amazonaws.com/media/site/logo/logo.png";
const HERO_BG_URL =
  "https://deifrati-bucket-s3.s3.eu-central-1.amazonaws.com/media/site/hero/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_BG_URL})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
        {/* Logo */}
        {/*
        <div className="mb-8 flex justify-center">
          <img 
            src={LOGO_URL} 
            alt="Dei Frati Logo" 
            className="h-32 md:h-40 w-auto opacity-95"
          />
        </div>
        */}
        {/* Tagline */}
        <p className="text-cream/90 font-body text-lg md:text-xl tracking-[0.3em] uppercase mb-4">
          Authentic Italian Cuisine
        </p>
        
        <h1 className="font-display text-cream text-5xl md:text-7xl lg:text-8xl font-semibold mb-6 leading-tight">
          A Taste of Italy<br />
          <span className="text-gold italic font-normal">in Timișoara</span>
        </h1>
        
        <p className="text-cream/80 font-body text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Experience the warmth of traditional Italian hospitality and the rich flavors 
          of handcrafted dishes, passed down through generations.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="hero" size="xl" asChild>
            <a href="#contact">
              Reserve a Table
            </a>
          </Button>
          <Button variant="heroOutline" size="xl" asChild>
            <a href="/menu">
              View Menu
            </a>
          </Button>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;
