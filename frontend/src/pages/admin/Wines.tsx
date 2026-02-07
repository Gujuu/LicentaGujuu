import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { wineService, type ApiWineItem } from "@/lib/wineService";

export default function Wines() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [wines, setWines] = useState<ApiWineItem[]>([]);

  // Create form
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [grape, setGrape] = useState("");
  const [pairing, setPairing] = useState("");
  const [priceGlass, setPriceGlass] = useState("");
  const [priceBottle, setPriceBottle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [eName, setEName] = useState("");
  const [eRegion, setERegion] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eFullDescription, setEFullDescription] = useState("");
  const [eGrape, setEGrape] = useState("");
  const [ePairing, setEPairing] = useState("");
  const [ePriceGlass, setEPriceGlass] = useState("");
  const [ePriceBottle, setEPriceBottle] = useState("");
  const [eImageUrl, setEImageUrl] = useState<string | undefined>(undefined);
  const [eUploading, setEUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await wineService.getAllWines();
      setWines(res.wines);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Failed to load wines", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toPascal = (value?: string) => {
    if (!value) return "";
    return value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/[^A-Za-z0-9]+/g)
      .filter(Boolean)
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join("");
  };

  const uploadImage = async (
    file: File,
    setUrl: (url: string) => void,
    setIsUploading: (v: boolean) => void,
    baseName?: string
  ) => {
    setIsUploading(true);
    try {
      const res = await apiClient.uploadImage(file, { folder: "site/Vino", baseName });
      setUrl(res.imageUrl);
      toast({ title: "Uploaded", description: "Image uploaded." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const parsedCreate = useMemo(() => {
    const pg = priceGlass.trim() ? Number.parseFloat(priceGlass) : undefined;
    const pb = priceBottle.trim() ? Number.parseFloat(priceBottle) : undefined;
    return {
      pg,
      pb,
      pairing: pairing
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  }, [pairing, priceBottle, priceGlass]);

  const createWine = async () => {
    if (!name.trim()) {
      toast({ title: "Missing name", description: "Wine name is required.", variant: "destructive" });
      return;
    }

    if (parsedCreate.pg !== undefined && !Number.isFinite(parsedCreate.pg)) {
      toast({ title: "Invalid price", description: "Price (glass) must be a number.", variant: "destructive" });
      return;
    }
    if (parsedCreate.pb !== undefined && !Number.isFinite(parsedCreate.pb)) {
      toast({ title: "Invalid price", description: "Price (bottle) must be a number.", variant: "destructive" });
      return;
    }

    try {
      await wineService.createWine({
        name: name.trim(),
        region: region.trim() || undefined,
        description: description.trim() || undefined,
        full_description: fullDescription.trim() || undefined,
        grape: grape.trim() || undefined,
        pairing: parsedCreate.pairing,
        price_glass: parsedCreate.pg,
        price_bottle: parsedCreate.pb,
        image_url: imageUrl,
        is_available: true,
      });
      wineService.clearCache();
      toast({ title: "Created", description: "Wine created." });
      setName("");
      setRegion("");
      setDescription("");
      setFullDescription("");
      setGrape("");
      setPairing("");
      setPriceGlass("");
      setPriceBottle("");
      setImageUrl(undefined);
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Create failed", description: message, variant: "destructive" });
    }
  };

  const startEdit = (w: ApiWineItem) => {
    setEditingId(w.id);
    setEName(w.name);
    setERegion(w.region || "");
    setEDescription(w.description || "");
    setEFullDescription(w.full_description || "");
    setEGrape(w.grape || "");
    setEPairing((w.pairing || []).join(", "));
    setEPriceGlass(w.price_glass != null ? String(w.price_glass) : "");
    setEPriceBottle(w.price_bottle != null ? String(w.price_bottle) : "");
    setEImageUrl(w.image_url);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEName("");
    setERegion("");
    setEDescription("");
    setEFullDescription("");
    setEGrape("");
    setEPairing("");
    setEPriceGlass("");
    setEPriceBottle("");
    setEImageUrl(undefined);
  };

  const saveEdit = async (id: number) => {
    const pg = ePriceGlass.trim() ? Number.parseFloat(ePriceGlass) : undefined;
    const pb = ePriceBottle.trim() ? Number.parseFloat(ePriceBottle) : undefined;

    if (!eName.trim()) {
      toast({ title: "Missing name", description: "Wine name is required.", variant: "destructive" });
      return;
    }
    if (pg !== undefined && !Number.isFinite(pg)) {
      toast({ title: "Invalid price", description: "Price (glass) must be a number.", variant: "destructive" });
      return;
    }
    if (pb !== undefined && !Number.isFinite(pb)) {
      toast({ title: "Invalid price", description: "Price (bottle) must be a number.", variant: "destructive" });
      return;
    }

    try {
      await wineService.updateWine(id, {
        name: eName.trim(),
        region: eRegion.trim() || undefined,
        description: eDescription.trim() || undefined,
        full_description: eFullDescription.trim() || undefined,
        grape: eGrape.trim() || undefined,
        pairing: ePairing
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        price_glass: pg,
        price_bottle: pb,
        image_url: eImageUrl,
      });
      wineService.clearCache();
      toast({ title: "Saved", description: "Wine updated." });
      cancelEdit();
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    }
  };

  const toggleAvailability = async (w: ApiWineItem) => {
    try {
      await wineService.updateWine(w.id, { is_available: !w.is_available });
      wineService.clearCache();
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

  const deleteWine = async (w: ApiWineItem) => {
    const ok = window.confirm(`Delete wine "${w.name}"?`);
    if (!ok) return;

    try {
      await wineService.deleteWine(w.id);
      wineService.clearCache();
      toast({ title: "Deleted", description: "Wine deleted." });
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-display">Wines</h1>
        <div className="flex items-center gap-2">
          {loading ? <Badge variant="secondary">Loading…</Badge> : <Badge variant="default">Ready</Badge>}
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Wine</CardTitle>
          <CardDescription>Add wines for the public menu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chianti Classico DOCG" />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Tuscany" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Short description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Full description</Label>
            <Textarea value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} rows={4} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grape</Label>
              <Input value={grape} onChange={(e) => setGrape(e.target.value)} placeholder="Sangiovese" />
            </div>
            <div className="space-y-2">
              <Label>Pairing (comma-separated)</Label>
              <Input value={pairing} onChange={(e) => setPairing(e.target.value)} placeholder="Bruschetta Classica, Tagliatelle…" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price (glass)</Label>
              <Input value={priceGlass} onChange={(e) => setPriceGlass(e.target.value)} placeholder="28" />
            </div>
            <div className="space-y-2">
              <Label>Price (bottle)</Label>
              <Input value={priceBottle} onChange={(e) => setPriceBottle(e.target.value)} placeholder="145" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-3 flex-wrap">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f, (url) => setImageUrl(url), setUploading, `Vino${toPascal(name)}`);
                }}
              />
              <div className="text-sm text-muted-foreground">{uploading ? "Uploading…" : ""}</div>
            </div>
            {imageUrl ? <div className="text-sm text-muted-foreground break-all">{imageUrl}</div> : null}
          </div>

          <Button type="button" onClick={createWine}>Create wine</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wines</CardTitle>
          <CardDescription>Edit, toggle visibility, or delete.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : wines.length === 0 ? (
            <div className="text-muted-foreground">No wines found.</div>
          ) : (
            <div className="space-y-3">
              {wines.map((w) => (
                <div key={w.id} className="rounded-md border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-[280px]">
                      {editingId === w.id ? (
                        <div className="space-y-3">
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input value={eName} onChange={(e) => setEName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Region</Label>
                              <Input value={eRegion} onChange={(e) => setERegion(e.target.value)} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Short description</Label>
                            <Textarea value={eDescription} onChange={(e) => setEDescription(e.target.value)} rows={2} />
                          </div>

                          <div className="space-y-2">
                            <Label>Full description</Label>
                            <Textarea value={eFullDescription} onChange={(e) => setEFullDescription(e.target.value)} rows={4} />
                          </div>

                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Grape</Label>
                              <Input value={eGrape} onChange={(e) => setEGrape(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Pairing</Label>
                              <Input value={ePairing} onChange={(e) => setEPairing(e.target.value)} />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Price (glass)</Label>
                              <Input value={ePriceGlass} onChange={(e) => setEPriceGlass(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Price (bottle)</Label>
                              <Input value={ePriceBottle} onChange={(e) => setEPriceBottle(e.target.value)} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Image</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadImage(f, (url) => setEImageUrl(url), setEUploading, `Vino${toPascal(eName)}`);
                              }}
                            />
                            {eUploading ? <div className="text-sm text-muted-foreground">Uploading…</div> : null}
                            {eImageUrl ? <div className="text-xs text-muted-foreground break-all">{eImageUrl}</div> : null}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium">{w.name}</div>
                          <div className="text-sm text-muted-foreground">{w.region}</div>
                          {w.description ? <div className="text-sm">{w.description}</div> : null}
                          <div className="text-sm">
                            Glass: {w.price_glass != null ? `RON ${Number(w.price_glass).toFixed(0)}` : "-"} · Bottle: {w.price_bottle != null ? `RON ${Number(w.price_bottle).toFixed(0)}` : "-"}
                          </div>
                          {w.image_url ? <div className="text-xs text-muted-foreground break-all">{w.image_url}</div> : null}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={w.is_available ? "default" : "secondary"}>
                        {w.is_available ? "available" : "hidden"}
                      </Badge>

                      {editingId === w.id ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => saveEdit(w.id)}>
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => startEdit(w)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => toggleAvailability(w)}>
                            Toggle
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteWine(w)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
