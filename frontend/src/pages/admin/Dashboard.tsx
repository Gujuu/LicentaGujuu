import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reservationService, ApiReservation } from "@/lib/reservationService";
import { contactService, ApiContactMessage } from "@/lib/contactService";

export default function Dashboard() {
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [messages, setMessages] = useState<ApiContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r, m] = await Promise.all([
          reservationService.getAllReservations({ limit: 200, offset: 0 }),
          contactService.getMessages({ limit: 200, offset: 0 }),
        ]);
        setReservations(r.reservations);
        setMessages(m.messages);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const pendingReservations = reservations.filter((r) => r.status === "pending").length;
    const unreadMessages = messages.filter((m) => !m.is_read).length;

    return {
      reservationsTotal: reservations.length,
      reservationsPending: pendingReservations,
      messagesTotal: messages.length,
      messagesUnread: unreadMessages,
    };
  }, [reservations, messages]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display">Dashboard</h1>
        {loading ? <Badge variant="secondary">Loading…</Badge> : <Badge variant="default">Live</Badge>}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display">{stats.reservationsTotal}</div>
            <div className="text-sm text-muted-foreground">Total (last 200 fetched)</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display">{stats.reservationsPending}</div>
            <div className="text-sm text-muted-foreground">Need review</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display">{stats.messagesTotal}</div>
            <div className="text-sm text-muted-foreground">Total (last 200 fetched)</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display">{stats.messagesUnread}</div>
            <div className="text-sm text-muted-foreground">Need reply</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
