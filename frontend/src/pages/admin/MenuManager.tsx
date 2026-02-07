import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { menuService, ApiMenuCategory } from "@/lib/menuService";
import { Link } from "react-router-dom";

export default function MenuManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ApiMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  // Category form
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catImageUrl, setCatImageUrl] = useState<string | undefined>(undefined);
  const [catUploading, setCatUploading] = useState(false);

  // Item form
  const [itemCategoryId, setItemCategoryId] = useState<string>("");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemFullDescription, setItemFullDescription] = useState("");
  const [itemAllergens, setItemAllergens] = useState("");
  const [itemIngredients, setItemIngredients] = useState("");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [itemImageUrl, setItemImageUrl] = useState<string | undefined>(undefined);
  const [itemUploading, setItemUploading] = useState(false);

  // Edit item fields
  const [editItemCategoryId, setEditItemCategoryId] = useState<string>("");
  const [editItemName, setEditItemName] = useState("");
  const [editItemDescription, setEditItemDescription] = useState("");
  const [editItemFullDescription, setEditItemFullDescription] = useState("");
  const [editItemAllergens, setEditItemAllergens] = useState("");
  const [editItemIngredients, setEditItemIngredients] = useState("");
  const [editItemPrice, setEditItemPrice] = useState<string>("");
  const [editItemImageUrl, setEditItemImageUrl] = useState<string | undefined>(undefined);
  const [editItemUploading, setEditItemUploading] = useState(false);

  // Edit category fields
  const [editCatName, setEditCatName] = useState("");
  const [editCatDescription, setEditCatDescription] = useState("");
  const [editCatImageUrl, setEditCatImageUrl] = useState<string | undefined>(undefined);
  const [editCatUploading, setEditCatUploading] = useState(false);

  const selectedCategory = useMemo(() => {
    const id = Number.parseInt(itemCategoryId, 10);
    if (!Number.isFinite(id)) return null;
    return categories.find((c) => c.id === id) ?? null;
  }, [categories, itemCategoryId]);

  const load = async () => {
    setLoading(true);
    try {
      // Admin screens should always show current DB state.
      menuService.clearCache();
      const res = await menuService.getMenu();
      setCategories(res.categories);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Failed to load menu",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flatItems = useMemo(() => {
    const items: Array<{ category: ApiMenuCategory; item: ApiMenuCategory["items"][number] }> = [];
    for (const c of categories) {
      for (const i of c.items) items.push({ category: c, item: i });
    }
    return items;
  }, [categories]);

  const uploadImage = async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
    folder?: string,
    baseName?: string
  ) => {
    setUploading(true);
    try {
      const res = await apiClient.uploadImage(file, {
        folder: folder ?? "menu/misc",
        baseName,
      });
      setUrl(res.imageUrl);
      toast({ title: "Uploaded", description: "Image uploaded." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

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

  const folderForCategory = (categoryName?: string) => {
    const cat = toPascal(categoryName);
    if (!cat) return "menu/misc";
    return `site/${cat}`;
  };

  const folderForCategoryImage = (categoryName?: string) => {
    const cat = toPascal(categoryName);
    if (!cat) return "menu/categories";
    return `site/${cat}`;
  };

  const createCategory = async () => {
    if (!catName.trim()) {
      toast({ title: "Missing name", description: "Category name is required.", variant: "destructive" });
      return;
    }

    try {
      await menuService.createCategory({
        name: catName.trim(),
        description: catDescription.trim() || undefined,
        image_url: catImageUrl,
      });
      menuService.clearCache();
      toast({ title: "Created", description: "Category created." });
      setCatName("");
      setCatDescription("");
      setCatImageUrl(undefined);
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Create failed", description: message, variant: "destructive" });
    }
  };

  const deleteCategory = async (id: number, name: string) => {
    const ok = window.confirm(`Delete category "${name}"? This will also delete its menu items.`);
    if (!ok) return;

    try {
      await menuService.deleteCategory(id);
      menuService.clearCache();
      toast({ title: "Deleted", description: "Category deleted." });
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    }
  };

  const createItem = async () => {
    const categoryId = Number.parseInt(itemCategoryId, 10);
    const price = Number.parseFloat(itemPrice);

    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      toast({ title: "Missing category", description: "Select a category.", variant: "destructive" });
      return;
    }
    if (!itemName.trim() || !itemDescription.trim()) {
      toast({ title: "Missing fields", description: "Name and description are required.", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast({ title: "Invalid price", description: "Enter a valid price.", variant: "destructive" });
      return;
    }

    try {
      await menuService.createMenuItem({
        category_id: categoryId,
        name: itemName.trim(),
        description: itemDescription.trim(),
        short_description: itemDescription.trim(),
        full_description: itemFullDescription.trim() || undefined,
        allergens: itemAllergens
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        ingredients: itemIngredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        price,
        image_url: itemImageUrl,
        is_available: true,
      });
      menuService.clearCache();
      toast({ title: "Created", description: "Menu item created." });
      setItemName("");
      setItemDescription("");
      setItemFullDescription("");
      setItemAllergens("");
      setItemIngredients("");
      setItemPrice("");
      setItemImageUrl(undefined);
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Create failed", description: message, variant: "destructive" });
    }
  };

  const toggleAvailability = async (id: number, current: boolean) => {
    try {
      await menuService.updateMenuItem(id, { is_available: !current });
      menuService.clearCache();
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await menuService.deleteMenuItem(id);
      menuService.clearCache();
      toast({ title: "Deleted", description: "Menu item deleted." });
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    }
  };

  const startEditItem = (category: ApiMenuCategory, item: ApiMenuCategory["items"][number]) => {
    setEditingItemId(item.id);
    setEditItemCategoryId(String(category.id));
    setEditItemName(item.name);
    setEditItemDescription(item.short_description || item.description || "");
    setEditItemFullDescription(item.full_description || "");
    setEditItemAllergens((item.allergens || []).join(", "));
    setEditItemIngredients((item.ingredients || []).join(", "));
    setEditItemPrice(String(item.price ?? ""));
    setEditItemImageUrl(item.image_url);
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
    setEditItemCategoryId("");
    setEditItemName("");
    setEditItemDescription("");
    setEditItemFullDescription("");
    setEditItemAllergens("");
    setEditItemIngredients("");
    setEditItemPrice("");
    setEditItemImageUrl(undefined);
  };

  const saveEditItem = async (id: number) => {
    const categoryId = Number.parseInt(editItemCategoryId, 10);
    const price = Number.parseFloat(editItemPrice);

    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      toast({ title: "Missing category", description: "Select a category.", variant: "destructive" });
      return;
    }
    if (!editItemName.trim() || !editItemDescription.trim()) {
      toast({ title: "Missing fields", description: "Name and description are required.", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast({ title: "Invalid price", description: "Enter a valid price.", variant: "destructive" });
      return;
    }

    try {
      await menuService.updateMenuItem(id, {
        category_id: categoryId,
        name: editItemName.trim(),
        description: editItemDescription.trim(),
        short_description: editItemDescription.trim(),
        full_description: editItemFullDescription.trim() || undefined,
        allergens: editItemAllergens
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        ingredients: editItemIngredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        price,
        image_url: editItemImageUrl,
      });
      menuService.clearCache();
      toast({ title: "Saved", description: "Menu item updated." });
      cancelEditItem();
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    }
  };

  const startEditCategory = (category: ApiMenuCategory) => {
    setEditingCategoryId(category.id);
    setEditCatName(category.name);
    setEditCatDescription(category.description || "");
    setEditCatImageUrl(category.image_url);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCatName("");
    setEditCatDescription("");
    setEditCatImageUrl(undefined);
  };

  const saveEditCategory = async (id: number) => {
    if (!editCatName.trim()) {
      toast({ title: "Missing name", description: "Category name is required.", variant: "destructive" });
      return;
    }

    try {
      await menuService.updateCategory(id, {
        name: editCatName.trim(),
        description: editCatDescription.trim() || undefined,
        image_url: editCatImageUrl,
      });
      menuService.clearCache();
      toast({ title: "Saved", description: "Category updated." });
      cancelEditCategory();
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-display">Menu</h1>
        <div className="flex items-center gap-2">
          {loading ? <Badge variant="secondary">Loading…</Badge> : <Badge variant="default">Ready</Badge>}
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Category</CardTitle>
            <CardDescription>Categories appear as sections in the menu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Antipasti" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={catDescription} onChange={(e) => setCatDescription(e.target.value)} placeholder="Optional" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3 flex-wrap">
                <Input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    uploadImage(
                      f,
                      (url) => setCatImageUrl(url),
                      setCatUploading,
                      folderForCategoryImage(catName),
                      `${toPascal(catName)}Category`
                    );
                  }
                }} />
                <div className="text-sm text-muted-foreground">{catUploading ? "Uploading…" : ""}</div>
              </div>
              {catImageUrl ? <div className="text-sm text-muted-foreground break-all">{catImageUrl}</div> : null}
            </div>
            <Button type="button" onClick={createCategory}>Create category</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Menu Item</CardTitle>
            <CardDescription>Add dishes to a category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={itemCategoryId} onValueChange={setItemCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory?.name?.toLowerCase() === "vini" ? (
              <div className="rounded-md border border-border bg-cream-dark p-3 text-sm">
                Wines are managed separately. Use the{' '}
                <Link to="/admin/wines" className="underline">
                  Wines
                </Link>{' '}
                page to add/edit wine details.
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Spaghetti Carbonara" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Classic Roman pasta…" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Full description</Label>
              <Textarea value={itemFullDescription} onChange={(e) => setItemFullDescription(e.target.value)} placeholder="Optional (used in modal)" rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Allergens (comma-separated)</Label>
              <Input value={itemAllergens} onChange={(e) => setItemAllergens(e.target.value)} placeholder="Gluten, Dairy" />
            </div>
            <div className="space-y-2">
              <Label>Ingredients (comma-separated)</Label>
              <Input value={itemIngredients} onChange={(e) => setItemIngredients(e.target.value)} placeholder="Tomatoes, Basil, Olive oil" />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="16.99" />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3 flex-wrap">
                <Input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    uploadImage(
                      f,
                      (url) => setItemImageUrl(url),
                      setItemUploading,
                      folderForCategory(selectedCategory?.name),
                      `${toPascal(selectedCategory?.name)}${toPascal(itemName)}`
                    );
                  }
                }} />
                <div className="text-sm text-muted-foreground">{itemUploading ? "Uploading…" : ""}</div>
              </div>
              {itemImageUrl ? <div className="text-sm text-muted-foreground break-all">{itemImageUrl}</div> : null}
            </div>
            <Button type="button" onClick={createItem}>Create item</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
          <CardDescription>Toggle availability or delete items.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : flatItems.length === 0 ? (
            <div className="text-muted-foreground">No items found.</div>
          ) : (
            <div className="space-y-3">
              {flatItems.map(({ category, item }) => (
                <div key={item.id} className="rounded-md border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-[280px]">
                      {editingItemId === item.id ? (
                        <div className="space-y-3">
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input value={editItemName} onChange={(e) => setEditItemName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Select value={editItemCategoryId} onValueChange={setEditItemCategoryId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={editItemDescription} onChange={(e) => setEditItemDescription(e.target.value)} rows={3} />
                          </div>
                          <div className="space-y-2">
                            <Label>Full description</Label>
                            <Textarea value={editItemFullDescription} onChange={(e) => setEditItemFullDescription(e.target.value)} rows={4} />
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Allergens</Label>
                              <Input value={editItemAllergens} onChange={(e) => setEditItemAllergens(e.target.value)} placeholder="Gluten, Dairy" />
                            </div>
                            <div className="space-y-2">
                              <Label>Ingredients</Label>
                              <Input value={editItemIngredients} onChange={(e) => setEditItemIngredients(e.target.value)} placeholder="Tomatoes, Basil" />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Price</Label>
                              <Input value={editItemPrice} onChange={(e) => setEditItemPrice(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Image</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    const categoryName = categories.find((c) => c.id === Number(editItemCategoryId))?.name;
                                    uploadImage(
                                      f,
                                      (url) => setEditItemImageUrl(url),
                                      setEditItemUploading,
                                      folderForCategory(categoryName),
                                      `${toPascal(categoryName)}${toPascal(editItemName)}`
                                    );
                                  }
                                }}
                              />
                              {editItemUploading ? <div className="text-sm text-muted-foreground">Uploading…</div> : null}
                              {editItemImageUrl ? <div className="text-xs text-muted-foreground break-all">{editItemImageUrl}</div> : null}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{category.name}</div>
                          <div className="text-sm">{item.short_description || item.description}</div>
                          <div className="text-sm">RON {Number(item.price).toFixed(0)}</div>
                          {item.image_url ? <div className="text-xs text-muted-foreground break-all">{item.image_url}</div> : null}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={item.is_available ? "default" : "secondary"}>
                        {item.is_available ? "available" : "hidden"}
                      </Badge>
                      {editingItemId === item.id ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => saveEditItem(item.id)}>
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={cancelEditItem}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => startEditItem(category, item)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => toggleAvailability(item.id, item.is_available)}>
                            Toggle
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
          <CardDescription>Delete categories (will also delete items in that category).</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : categories.length === 0 ? (
            <div className="text-muted-foreground">No categories found.</div>
          ) : (
            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.id} className="rounded-md border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-[280px]">
                      {editingCategoryId === c.id ? (
                        <div className="space-y-3">
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Image</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    uploadImage(
                                      f,
                                      (url) => setEditCatImageUrl(url),
                                      setEditCatUploading,
                                      folderForCategoryImage(editCatName),
                                      `${toPascal(editCatName)}Category`
                                    );
                                  }
                                }}
                              />
                              {editCatUploading ? <div className="text-sm text-muted-foreground">Uploading…</div> : null}
                              {editCatImageUrl ? <div className="text-xs text-muted-foreground break-all">{editCatImageUrl}</div> : null}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={editCatDescription} onChange={(e) => setEditCatDescription(e.target.value)} rows={3} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium">{c.name}</div>
                          {c.description ? <div className="text-sm text-muted-foreground">{c.description}</div> : null}
                          <div className="text-sm text-muted-foreground">Items: {c.items?.length ?? 0}</div>
                          {c.image_url ? <div className="text-xs text-muted-foreground break-all">{c.image_url}</div> : null}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingCategoryId === c.id ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => saveEditCategory(c.id)}>
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={cancelEditCategory}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => startEditCategory(c)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteCategory(c.id, c.name)}>
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
