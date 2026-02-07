import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { reservationService, ApiReservation } from "@/lib/reservationService";

type StatusFilter = "all" | ApiReservation["status"];
const statuses: StatusFilter[] = ["all", "pending", "confirmed", "cancelled"];

export default function Reservations() {
  const { toast } = useToast();
  const [items, setItems] = useState<ApiReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const load = async () => {
    setLoading(true);
    try {
      const res = await reservationService.getAllReservations({
        limit,
        offset,
        status: status === "all" ? undefined : status,
      });
      setItems(res.reservations);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Failed to load reservations",
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
  }, [status, offset]);

  const updateStatus = async (id: number, next: ApiReservation["status"]) => {
    try {
      await reservationService.updateReservationStatus(id, next);
      toast({ title: "Updated", description: "Reservation status updated." });
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-display">Reservations</h1>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={(v) => { setOffset(0); setStatus(v as StatusFilter); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground">No reservations found.</div>
          ) : (
            <div className="space-y-3">
              {items.map((r) => (
                <div key={r.id} className="rounded-md border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="font-medium">{r.customer_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.email} • {r.phone}
                      </div>
                      <div className="text-sm">
                        {String(r.date).slice(0, 10)} • {String(r.time)} • {r.guests} guests
                      </div>
                      {r.special_requests ? (
                        <div className="text-sm text-muted-foreground">{r.special_requests}</div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === "pending" ? "secondary" : r.status === "confirmed" ? "default" : "destructive"}>
                        {r.status}
                      </Badge>
                      <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v as ApiReservation["status"])}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="confirmed">confirmed</SelectItem>
                          <SelectItem value="cancelled">cancelled</SelectItem>
                        </SelectContent>
                      </Select>
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
