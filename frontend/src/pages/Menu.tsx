import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Wine } from "lucide-react";
import { menuService, ApiMenuCategory } from "@/lib/menuService";
import { menuCategories as fallbackCategories, wineList, type MenuCategory, type MenuItem, type WineItem } from "@/data/menuData";
import { resolveBackendUrl } from "@/lib/api";
import { wineService } from "@/lib/wineService";
import logo from "@/assets/logo.png";
import menuHeroImage from "@/assets/menu/primi-risotto.jpg";
import MenuItemModal from "@/components/MenuItemModal";
import WineModal from "@/components/WineModal";
import type { WineModalWine } from "@/components/WineModal";

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<string>("antipasti");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedWine, setSelectedWine] = useState<WineModalWine | null>(null);
  const [menuData, setMenuData] = useState<ApiMenuCategory[]>([]);
  const [wines, setWines] = useState<WineModalWine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await menuService.getMenu();
        if (response.categories && response.categories.length > 0) {
          setMenuData(response.categories);
        } else {
          // Fallback to static data if API returns empty
          setMenuData(fallbackCategories.map(cat => ({
            id: parseInt(cat.id) || 0,
            name: cat.title,
            description: cat.subtitle,
            items: cat.items.map(item => ({
              id: Math.random(), // Temporary ID for static data
              name: item.name,
              description: item.description,
              price: parseFloat(item.price.replace('$', '')),
              image_url: item.image,
              is_available: true
            }))
          })));
        }
      } catch (error) {
        console.warn('Using fallback menu data:', error);
        // Use fallback data
        setMenuData(fallbackCategories.map(cat => ({
          id: parseInt(cat.id) || 0,
          name: cat.title,
          description: cat.subtitle,
          items: cat.items.map(item => ({
            id: Math.random(),
            name: item.name,
            description: item.description,
            price: parseFloat(item.price.replace('$', '')),
            image_url: item.image,
            is_available: true
          }))
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const res = await wineService.getWines();
        if (res.wines && res.wines.length > 0) {
          setWines(
            res.wines
              .filter((w) => w.is_available)
              .map((w) => ({
                name: w.name,
                region: w.region || "",
                description: w.description || "",
                fullDescription: w.full_description || w.description || "",
                priceGlass: w.price_glass != null ? `${Number(w.price_glass).toFixed(0)} RON` : "",
                priceBottle: w.price_bottle != null ? `${Number(w.price_bottle).toFixed(0)} RON` : "",
                image: resolveBackendUrl(w.image_url) || "",
                grape: w.grape || "",
                pairing: w.pairing || [],
              }))
          );
        } else {
          setWines(
            wineList.map((w) => ({
              name: w.name,
              region: w.region,
              description: w.description,
              fullDescription: w.fullDescription,
              priceGlass: w.priceGlass,
              priceBottle: w.priceBottle,
              image: w.image,
              grape: w.grape,
              pairing: w.pairing,
            }))
          );
        }
      } catch (error) {
        console.warn('Using fallback wine data:', error);
        setWines(
          wineList.map((w) => ({
            name: w.name,
            region: w.region,
            description: w.description,
            fullDescription: w.fullDescription,
            priceGlass: w.priceGlass,
            priceBottle: w.priceBottle,
            image: w.image,
            grape: w.grape,
            pairing: w.pairing,
          }))
        );
      }
    };

    fetchWines();
  }, []);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-cream-dark/95 backdrop-blur-sm border-b border-border py-6 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-body text-sm uppercase tracking-widest">
                Back to Home
              </span>
            </Link>
            <img src={logo} alt="Dei Frati" className="h-12 w-auto" />
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative py-20 text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${menuHeroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/55 to-olive-dark/80" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="font-display text-5xl md:text-7xl text-cream mb-4 animate-fade-in">
            Il Nostro Menu
          </h1>
          <p className="font-body text-cream/80 text-lg max-w-2xl mx-auto">
            Authentic Italian cuisine crafted with passion, tradition, and the
            finest ingredients from Italy and local farms
          </p>
          <div className="section-divider mt-8" />
        </div>
      </section>

      {/* Category Navigation */}
      <nav className="sticky top-24 bg-cream-dark/95 backdrop-blur-sm border-b border-border py-4 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 md:gap-6 flex-wrap">
            {loading ? (
              <div className="text-foreground">Loading menu...</div>
            ) : (
              <>
                {menuData.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => scrollToCategory(category.name.toLowerCase())}
                    className={`font-body text-sm uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 ${
                      activeCategory === category.name.toLowerCase()
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-primary/10"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
                <button
                  onClick={() => scrollToCategory("wines")}
                  className={`font-body text-sm uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                    activeCategory === "wines"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-primary/10"
                  }`}
                >
                  <Wine size={16} />
                  Vini
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Menu Categories */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-foreground">Loading menu...</div>
          </div>
        ) : (
          menuData.map((category) => (
            <MenuSection
              key={category.id}
              category={{
                id: category.name.toLowerCase(),
                title: category.name,
                subtitle: category.description || '',
                items: category.items.map(item => {
                  return {
                    name: item.name,
                    description: item.short_description || item.description,
                    fullDescription: item.full_description || item.description,
                    price: `${Number(item.price).toFixed(0)} RON`,
                    image: resolveBackendUrl(item.image_url) || '',
                    allergens: item.allergens || [],
                    ingredients: item.ingredients || []
                  };
                })
              }}
              onItemClick={setSelectedItem}
            />
          ))
        )}

        {/* Wine Section */}
        <section id="wines" className="py-12 scroll-mt-40">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Wine className="text-primary" size={28} />
              <h2 className="font-display text-4xl md:text-5xl text-foreground">
                Carta dei Vini
              </h2>
              <Wine className="text-primary" size={28} />
            </div>
            <p className="font-body text-muted-foreground text-sm uppercase tracking-widest">
              Wine Selection
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {wines.map((wine) => (
              <button
                key={wine.name}
                onClick={() => setSelectedWine(wine)}
                className="bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 flex flex-col md:flex-row text-left cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="md:w-2/5 h-48 md:h-auto">
                  <img
                    src={resolveBackendUrl(wine.image)}
                    alt={wine.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display text-xl text-foreground">
                          {wine.name}
                        </h3>
                        <p className="font-body text-sm text-primary italic">
                          {wine.region}
                        </p>
                      </div>
                    </div>
                    {wine.description ? (
                      <p className="font-body text-muted-foreground text-sm mb-4 line-clamp-2">{wine.description}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="font-body text-muted-foreground">
                        Glass:{" "}
                      </span>
                      <span className="font-display text-lg text-foreground">
                        {wine.priceGlass}
                      </span>
                    </div>
                    <div>
                      <span className="font-body text-muted-foreground">
                        Bottle:{" "}
                      </span>
                      <span className="font-display text-lg text-foreground">
                        {wine.priceBottle}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Footer CTA */}
      <section className="bg-charcoal text-cream py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Ready to Experience Dei Frati?
          </h2>
          <p className="font-body text-cream/70 mb-8 max-w-xl mx-auto">
            Reserve your table and let us take you on a culinary journey through
            Italy
          </p>
          <Link
            to="/#contact"
            className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-widest px-8 py-4 rounded transition-colors"
          >
            Make a Reservation
          </Link>
        </div>
      </section>

      {/* Modals */}
      <MenuItemModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
      <WineModal
        wine={selectedWine}
        isOpen={!!selectedWine}
        onClose={() => setSelectedWine(null)}
      />
    </main>
  );
};

interface MenuSectionProps {
  category: MenuCategory;
  onItemClick: (item: MenuItem) => void;
}

const MenuSection = ({ category, onItemClick }: MenuSectionProps) => {
  return (
    <section id={category.id} className="py-12 scroll-mt-40">
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
          {category.title}
        </h2>
        <p className="font-body text-muted-foreground text-sm uppercase tracking-widest">
          {category.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {category.items.map((item) => (
          <button
            key={item.name}
            onClick={() => onItemClick(item)}
            className="bg-[hsl(var(--menu-card))] rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 group text-left cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex flex-col h-full"
          >
            <div className="relative h-56 overflow-hidden shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <span className="font-body text-cream text-sm uppercase tracking-widest">
                  Click to view details
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="font-display text-xl text-foreground min-h-[3.75rem]"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                  }}
                >
                  {item.name}
                </h3>
                <span className="font-display text-lg text-primary whitespace-nowrap ml-4">
                  {item.price}
                </span>
              </div>
              <p className="font-body text-muted-foreground text-sm leading-relaxed line-clamp-2 min-h-[2.75rem]">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Menu;
