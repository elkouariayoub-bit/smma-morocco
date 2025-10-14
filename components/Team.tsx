"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Plus, Shield, Crown, User2, UserPlus } from "lucide-react";

type Role = "owner" | "admin" | "editor";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const initialMembers: Member[] = [
  { id: "1", name: "Alice Johnson", email: "alice@company.com", role: "owner" },
  { id: "2", name: "Bob Martin", email: "bob@company.com", role: "admin" },
  { id: "3", name: "Carol Chen", email: "carol@company.com", role: "editor" },
];

const initialSeatLimit = 5; // pretend this comes from subscription

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const label = role.charAt(0).toUpperCase() + role.slice(1);
  if (role === "owner") {
    return (
      <Badge className="gap-1">
        <Crown className="h-3.5 w-3.5" /> {label}
      </Badge>
    );
  }
  if (role === "admin") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Shield className="h-3.5 w-3.5" /> {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <User2 className="h-3.5 w-3.5" /> {label}
    </Badge>
  );
};

function initials(name?: string, email?: string) {
  const base = name || email || "?";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default function UsersPagePreview() {
  const [viewerRole, setViewerRole] = useState<Role>("owner");

  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [seatLimit, setSeatLimit] = useState<number>(initialSeatLimit);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newRole, setNewRole] = useState<Role>("editor");

  const seatsUsed = members.length;
  const seatsFull = seatsUsed >= seatLimit;

  const canManageUsers = viewerRole === "owner" || viewerRole === "admin";

  const handleAdd = () => {
    if (!canManageUsers) return toast.error("You don't have permission to add users.");
    if (seatsFull) return toast.error("Seat limit reached. Upgrade your plan to add more.");
    if (!email) return toast.error("Please enter an email.");

    const id = Math.random().toString(36).slice(2);
    const member: Member = {
      id,
      name: name || email.split("@")[0],
      email,
      role: newRole,
    };
    setMembers((m) => [...m, member]);
    setEmail("");
    setName("");
    setNewRole("editor");
    toast.success("User added (mock)");
  };

  const handleRemove = (id: string) => {
    if (!canManageUsers) return toast.error("You don't have permission to remove users.");
    setMembers((m) => m.filter((x) => x.id !== id));
    toast.success("User removed (mock)");
  };

  const usedOverLimit = useMemo(() => `${seatsUsed} / ${seatLimit} seats`, [seatsUsed, seatLimit]);

  const allowSeatIncrease = seatLimit < 10;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">Manage members of your workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={seatsFull ? "destructive" : "secondary"}>{usedOverLimit}</Badge>
          {seatsFull ? (
            <Button variant="outline" onClick={() => toast.info("Navigate to billing (mock)")}>
              Upgrade plan
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setSeatLimit((limit) => Math.min(limit + 1, 10))}
              disabled={!allowSeatIncrease}
            >
              <Plus className="mr-2 h-4 w-4" /> Add seat
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Preview as</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Select value={viewerRole} onValueChange={(value: string) => setViewerRole(value as Role)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
          {!canManageUsers && (
            <p className="text-sm text-muted-foreground">
              Editors cannot manage users; controls are hidden or disabled.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Add user</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
          <Input placeholder="Full name (optional)" value={name} onChange={(event) => setName(event.target.value)} />
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Select value={newRole} onValueChange={(value: string) => setNewRole(value as Role)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!canManageUsers || seatsFull || !email}>
            <UserPlus className="mr-2 h-4 w-4" /> Add user
          </Button>
          {!canManageUsers && (
            <p className="-mt-1 text-sm text-muted-foreground md:col-span-4">
              You do not have permission to add users.
            </p>
          )}
          {seatsFull && (
            <p className="-mt-1 text-sm text-muted-foreground md:col-span-4">
              Seat limit reached. Upgrade your plan to add more seats.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Team members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials(member.name, member.email)}</AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <div className="font-medium">{member.name || member.email}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RoleBadge role={member.role} />
                  {canManageUsers ? (
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(member.id)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground">No members yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        This is a frontend-only preview. Hook up your API to persist changes and enforce seat limits server-side.
      </div>
    </div>
  );
}
