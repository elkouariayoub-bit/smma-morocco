"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Member = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | string;
  user_id: string;
  users: { email: string | null } | null;
};

type UsersResponse = {
  members?: Member[];
  seatLimit?: number;
};

export default function UsersPage({ params }: { params: { orgId: string } }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [seatLimit, setSeatLimit] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Member["role"]>("MEMBER");

  async function load() {
    const res = await fetch(`/api/orgs/${params.orgId}/users`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to load members", res.statusText);
      return;
    }
    const data = (await res.json()) as UsersResponse;
    setMembers(data.members || []);
    setSeatLimit(typeof data.seatLimit === "number" ? data.seatLimit : null);
  }

  useEffect(() => {
    void load();
  }, []); // load once on mount

  async function addUser() {
    if (!email.trim()) return;
    const res = await fetch(`/api/orgs/${params.orgId}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    if (res.ok) {
      setEmail("");
      await load();
    }
  }

  async function removeUser(uid: string) {
    const res = await fetch(`/api/orgs/${params.orgId}/users/${uid}`, { method: "DELETE" });
    if (res.ok) {
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Team</h1>
        <Badge>
          {members.length}
          {seatLimit != null ? ` / ${seatLimit}` : ""} seats
        </Badge>
      </div>

      <Card>
        <CardHeader>Add a new user</CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@email.com"
            className="w-64 min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Member["role"])}
            className="rounded-md border px-2 py-2 text-sm"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button onClick={addUser} disabled={!email.trim()}>
            Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Team members</CardHeader>
        <CardContent className="divide-y">
          {members.map((m) => (
            <div key={m.user_id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{m.users?.email ?? "Unknown"}</div>
                <div className="text-sm text-muted-foreground">{m.role}</div>
              </div>
              <Button variant="destructive" onClick={() => void removeUser(m.user_id)}>
                Remove
              </Button>
            </div>
          ))}
          {members.length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">No team members yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
