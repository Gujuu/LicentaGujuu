import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { menuService, type ApiMenuCategory } from "@/lib/menuService";
import { resolveBackendUrl } from "@/lib/api";
import MenuItemModal from "@/components/MenuItemModal";
import type { MenuItem } from "@/data/menuData";

const FeaturedDishes = () => {
  const placeholderImage = `${import.meta.env.BASE_URL}placeholder.svg`;
  const [menuData, setMenuData] = useState<ApiMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMenu = async () => {
      try {
        const response = await menuService.getMenu();
        if (mounted) {
          setMenuData(Array.isArray(response.categories) ? response.categories : []);
        }
      } catch (error) {
        console.warn("Failed to fetch menu for signature dishes:", error);
        if (mounted) setMenuData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMenu();
    return () => {
      mounted = false;
    };
  }, []);

  const signatureNames = useMemo(
    () => [
      "Paccheri Tricolore con Pomodoro, Mozzarella e Pistacchio",
      "Polpo alla Griglia",
      "Tiramisu",
    ],
    []
  );

  const dishes = useMemo(() => {
    const byName = new Map<string, MenuItem>();
    const allItems: Array<{ normalizedName: string; item: MenuItem }> = [];
    const normalize = (value: string) =>
      value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    for (const category of menuData) {
      for (const item of category.items || []) {
        const fullDescription = item.full_description || item.description || "";
        const mapped: MenuItem = {
          name: item.name,
          description: item.short_description || item.description || "",
          fullDescription,
          price: item.price != null ? `${Number(item.price).toFixed(0)} RON` : "",
          image: resolveBackendUrl(item.image_url) || placeholderImage,
          allergens: item.allergens || [],
          ingredients: item.ingredients || [],
        };
        const normalizedName = normalize(item.name);
        byName.set(normalizedName, mapped);
        allItems.push({ normalizedName, item: mapped });
      }
    }

    return signatureNames
      .map((name) => {
        const normalizedSignature = normalize(name);
        const exact = byName.get(normalizedSignature);
        if (exact) return exact;
        const contains = allItems.find((x) => x.normalizedName.includes(normalizedSignature));
        return contains?.item;
      })
      .filter((x): x is MenuItem => Boolean(x));
  }, [menuData, placeholderImage, signatureNames]);

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
          {loading ? (
            <div className="col-span-full text-center text-muted-foreground font-body">
              Loading signature dishes...
            </div>
          ) : dishes.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground font-body">
              Signature dishes will appear once they are added to the menu.
            </div>
          ) : (
            dishes.map((dish) => (
              <button
                key={dish.name}
                type="button"
                onClick={() => setSelectedItem(dish)}
                className="group bg-[hsl(var(--menu-card))] rounded-lg overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500 text-left cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={dish.image} 
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md font-display text-xl">
                  {dish.price}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3
                  className="font-display text-2xl text-foreground mb-2 group-hover:text-primary transition-colors duration-300 min-h-[4.25rem]"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                  }}
                >
                  {dish.name}
                </h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed line-clamp-2 min-h-[2.75rem]">
                  {dish.description}
                </p>
              </div>
              </button>
            ))
          )}
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

      <MenuItemModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
};

export default FeaturedDishes;
