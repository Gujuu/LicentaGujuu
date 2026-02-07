import dishPasta from "@/assets/dish-pasta.jpg";
import dishFish from "@/assets/dish-fish.jpg";
import dishDessert from "@/assets/dish-dessert.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FeaturedDishes = () => {
  const dishes = [
    {
      image: dishPasta,
      title: "Spaghetti alla Carbonara",
      description: "Fresh homemade pasta with black truffle shavings and aged parmesan",
      price: "€28"
    },
    {
      image: dishFish,
      title: "Dorada al Forno",
      description: "Mediterranean sea bass with lemon, capers, and cherry tomatoes",
      price: "€34"
    },
    {
      image: dishDessert,
      title: "Tiramisù Classico",
      description: "Traditional Italian tiramisu with espresso-soaked savoiardi",
      price: "€12"
    }
  ];

  return (
    <section id="menu" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-4">
            From Our Kitchen
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Signature <span className="text-primary italic">Dishes</span>
          </h2>
          <div className="section-divider mb-8" />
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Discover our chef's carefully crafted selections, each dish a celebration 
            of authentic Italian flavors and artisanal preparation.
          </p>
        </div>

        {/* Dishes Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {dishes.map((dish, index) => (
            <div 
              key={dish.title}
              className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={dish.image} 
                  alt={dish.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md font-display text-xl">
                  {dish.price}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-2xl text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {dish.title}
                </h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {dish.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="elegant" size="lg" asChild>
            <Link to="/menu">
              View Full Menu
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDishes;
