import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { contactService, ApiContactMessage } from "@/lib/contactService";

type Filter = "all" | "unread" | "read";

export default function Messages() {
  const { toast } = useToast();
  const [items, setItems] = useState<ApiContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const load = async () => {
    setLoading(true);
    try {
      const is_read = filter === "all" ? undefined : filter === "read";
      const res = await contactService.getMessages({ limit, offset, is_read });
      setItems(res.messages);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Failed to load messages",
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
  }, [filter, offset]);

  const markRead = async (id: number) => {
    try {
      await contactService.markAsRead(id);
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Failed to update",
        description: message,
        variant: "destructive",
      });
    }
  };

  const remove = async (id: number) => {
    try {
      await contactService.deleteMessage(id);
      toast({ title: "Deleted", description: "Message deleted." });
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-display">Messages</h1>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(v) => { setOffset(0); setFilter(v as Filter); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="unread">unread</SelectItem>
              <SelectItem value="read">read</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground">No messages found.</div>
          ) : (
            <div className="space-y-3">
              {items.map((m) => (
                <div key={m.id} className="rounded-md border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-medium">{m.subject}</div>
                        <Badge variant={m.is_read ? "secondary" : "default"}>{m.is_read ? "read" : "unread"}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{m.name} • {m.email}</div>
                      <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                      <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!m.is_read ? (
                        <Button variant="olive" size="sm" onClick={() => markRead(m.id)}>
                          Mark read
                        </Button>
                      ) : null}
                      <Button variant="destructive" size="sm" onClick={() => remove(m.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" disabled={offset === 0 || loading} onClick={() => setOffset((o) => Math.max(0, o - limit))}>
              Prev
            </Button>
            <div className="text-sm text-muted-foreground">Offset: {offset}</div>
            <Button variant="outline" disabled={loading || items.length < limit} onClick={() => setOffset((o) => o + limit)}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
