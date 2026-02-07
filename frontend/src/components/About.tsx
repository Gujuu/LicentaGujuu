import { Utensils, Wine, Heart } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Utensils,
      title: "Traditional Recipes",
      description: "Authentic dishes crafted from recipes passed down through generations of Italian families."
    },
    {
      icon: Wine,
      title: "Fine Italian Wines",
      description: "A carefully curated selection of wines from renowned Italian vineyards and regions."
    },
    {
      icon: Heart,
      title: "Made with Passion",
      description: "Every dish prepared with love, using only the freshest, finest ingredients."
    }
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-cream-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-4">
            Our Story
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Welcome to <span className="text-primary italic">Dei Frati</span>
          </h2>
          <div className="section-divider mb-8" />
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Nestled in the heart of Timișoara, Dei Frati brings the soul of Italy to Romania. 
            Since 2023, we've been serving authentic Italian cuisine, creating memorable 
            dining experiences where every meal tells a story of tradition, passion, and 
            the finest Mediterranean flavors.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center p-8 bg-background rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
