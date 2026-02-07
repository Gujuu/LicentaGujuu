import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, UtensilsCrossed } from "lucide-react";
import type { MenuItem } from "@/data/menuData";

interface MenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const MenuItemModal = ({ item, isOpen, onClose }: MenuItemModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-card">
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl md:text-4xl text-cream mb-1">
                {item.name}
              </DialogTitle>
              <p className="font-display text-2xl text-primary">{item.price}</p>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Full Description */}
          <div>
            <p className="font-body text-foreground leading-relaxed">
              {item.fullDescription}
            </p>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed className="text-primary" size={18} />
              <h3 className="font-display text-lg text-foreground">Ingredients</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="bg-cream-dark text-foreground font-body text-sm"
                >
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>

          {/* Allergens */}
          {item.allergens.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-amber-600" size={18} />
                <h3 className="font-display text-lg text-amber-800 dark:text-amber-200">
                  Allergen Information
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map((allergen) => (
                  <Badge
                    key={allergen}
                    variant="outline"
                    className="border-amber-400 text-amber-700 dark:text-amber-300 font-body"
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemModal;