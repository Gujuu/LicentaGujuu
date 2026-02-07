import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Grape, Wine } from "lucide-react";
import { resolveBackendUrl } from "@/lib/api";

export interface WineModalWine {
  name: string;
  region?: string;
  description?: string;
  fullDescription?: string;
  priceGlass?: string;
  priceBottle?: string;
  image?: string;
  grape?: string;
  pairing?: string[];
}

interface WineModalProps {
  wine: WineModalWine | null;
  isOpen: boolean;
  onClose: () => void;
}

const WineModal = ({ wine, isOpen, onClose }: WineModalProps) => {
  if (!wine) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-card">
        <div className="relative h-[40vh] md:h-[50vh] max-h-[560px] overflow-hidden bg-charcoal flex items-center justify-center">
          <a
            href={resolveBackendUrl(wine.image)}
            target="_blank"
            rel="noreferrer"
            className="block w-full h-full"
            aria-label={`Open full-size image for ${wine.name}`}
          >
            <img
              src={resolveBackendUrl(wine.image)}
              alt={wine.name}
              className="w-full h-full object-contain"
            />
          </a>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl md:text-4xl text-cream mb-1">
                {wine.name}
              </DialogTitle>
              <p className="font-body text-cream/80 italic">{wine.region}</p>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Prices */}
          <div className="flex gap-8 justify-center bg-cream-dark rounded-lg p-4">
            <div className="text-center">
              <p className="font-body text-sm text-muted-foreground uppercase tracking-wider mb-1">Glass</p>
              <p className="font-display text-2xl text-primary">{wine.priceGlass}</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-body text-sm text-muted-foreground uppercase tracking-wider mb-1">Bottle</p>
              <p className="font-display text-2xl text-primary">{wine.priceBottle}</p>
            </div>
          </div>

          {/* Full Description */}
          <div>
            <p className="font-body text-foreground leading-relaxed">
              {wine.fullDescription}
            </p>
          </div>

          {/* Grape Variety */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Grape className="text-primary" size={18} />
              <h3 className="font-display text-lg text-foreground">Grape Variety</h3>
            </div>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary font-body text-sm"
            >
              {wine.grape}
            </Badge>
          </div>

          {/* Food Pairings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wine className="text-primary" size={18} />
              <h3 className="font-display text-lg text-foreground">Pairs Well With</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(wine.pairing || []).map((dish) => (
                <Badge
                  key={dish}
                  variant="secondary"
                  className="bg-cream-dark text-foreground font-body text-sm"
                >
                  {dish}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WineModal;