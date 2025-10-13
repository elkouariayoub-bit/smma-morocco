"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type Member = {
  id: string;
  role: Role;
  user_id: string;
  users: { id: string; email: string | null } | null;
};

type UsersResponse = {
  members?: Member[];
  seatLimit?: number;
  seatsUsed?: number;
  error?: string;
};

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export default function UsersPage({
  params,
}: {
  params: { orgId: string };
}) {
  const endpoint = `/api/orgs/${params.orgId}/users`;

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [members, setMembers] = useState<Member[]>([]);
  const [seatLimit, setSeatLimit] = useState(0);
  const [seatsUsed, setSeatsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invitePending, setInvitePending] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        let description = "Failed to load members.";
        try {
          const body = (await response.json()) as UsersResponse;
          if (body?.error) description = body.error;
        } catch (parseError) {
          console.error("Failed to parse members response", parseError);
        }
        throw new Error(description);
      }

      const body = (await response.json()) as UsersResponse;
      setMembers(body.members ?? []);
      setSeatsUsed(body.seatsUsed ?? 0);
      setSeatLimit(body.seatLimit ?? 0);
    } catch (err) {
      const description = err instanceof Error ? err.message : "Unknown error";
      setLoadError(description);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const hasSeatLimit = seatLimit > 0;
  const seatsRemaining = hasSeatLimit ? Math.max(seatLimit - seatsUsed, 0) : null;
  const canInvite = hasSeatLimit ? (seatsRemaining ?? 0) > 0 : true;

  const inviteDisabled =
    invitePending ||
    !email.trim() ||
    !canInvite ||
    loadError !== null ||
    (hasSeatLimit && (seatsRemaining ?? 0) <= 0);

  const seatBadgeLabel = useMemo(() => {
    if (!hasSeatLimit) {
      return `${seatsUsed} seat${seatsUsed === 1 ? "" : "s"}`;
    }
    return `${seatsUsed} / ${seatLimit} seats`;
  }, [hasSeatLimit, seatLimit, seatsUsed]);

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("Enter an email address to invite a teammate.");
      return;
    }

    setInvitePending(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, role }),
      });

      if (!response.ok) {
        let description = "Failed to invite teammate.";
        try {
          const body = (await response.json()) as UsersResponse;
          if (body?.error) description = body.error;
        } catch (parseError) {
          console.error("Failed to parse invite error", parseError);
        }
        throw new Error(description);
      }

      setEmail("");
      setMessage("Invitation sent successfully.");
      await loadMembers();
      emailRef.current?.focus();
    } catch (err) {
      const description = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(description);
    } finally {
      setInvitePending(false);
    }
  }

  async function handleRemove(member: Member) {
    setErrorMessage(null);
    setMessage(null);
    setRemovingId(member.user_id);

    try {
      const response = await fetch(`${endpoint}/${member.user_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let description = "Failed to remove teammate.";
        try {
          const body = (await response.json()) as UsersResponse;
          if (body?.error) description = body.error;
        } catch (parseError) {
          console.error("Failed to parse removal error", parseError);
        }
        throw new Error(description);
      }

      setMessage(`Removed ${member.users?.email ?? "member"}.`);
      await loadMembers();
    } catch (err) {
      const description = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(description);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Team members</h1>
          <p className="text-sm text-muted-foreground">
            Invite collaborators and manage their roles for this organization.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={hasSeatLimit ? "secondary" : "outline"}
            className={cn(
              hasSeatLimit && canInvite
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : hasSeatLimit
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-slate-100 text-slate-700"
            )}
          >
            {seatBadgeLabel}
            {hasSeatLimit && seatsRemaining !== null && (
              <span className="ml-2 font-normal text-muted-foreground">
                {seatsRemaining} open
              </span>
            )}
          </Badge>
          {hasSeatLimit && !canInvite ? (
            <Button asChild variant="outline">
              <Link href="/settings">Upgrade plan</Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => emailRef.current?.focus()}
              disabled={loadError !== null}
            >
              Invite teammate
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage access</CardTitle>
          <CardDescription>
            Send new invitations, view existing members, and revoke seats when teammates leave.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            onSubmit={handleInvite}
            className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center"
          >
            <div className="flex w-full flex-col gap-2 sm:flex-1">
              <label htmlFor="invite-email" className="text-xs font-medium uppercase text-muted-foreground">
                Email address
              </label>
              <Input
                ref={emailRef}
                id="invite-email"
                type="email"
                placeholder="teammate@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 sm:h-10"
                aria-describedby="invite-helper"
              />
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-52">
              <label htmlFor="invite-role" className="text-xs font-medium uppercase text-muted-foreground">
                Role
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition focus-visible:border-[#3b82f6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:h-10"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex w-full items-end sm:w-auto">
              <Button type="submit" disabled={inviteDisabled} className="w-full sm:w-auto">
                {invitePending ? "Sending…" : "Send invite"}
              </Button>
            </div>
          </form>

          {(errorMessage || message) && (
            <div
              className={cn(
                "rounded-md border p-3 text-sm",
                errorMessage
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              )}
            >
              {errorMessage ?? message}
            </div>
          )}

          {loadError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {loadError}
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => loadMembers()}>
                  Try again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {isLoading && (
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              )}

              {!isLoading && members.length === 0 && (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No teammates yet. Invite someone to collaborate on campaigns.
                </div>
              )}

              <ul className="divide-y rounded-md border">
                {members.map((member) => {
                  const isOwner = member.role === "OWNER";
                  const removalDisabled = isOwner || removingId === member.user_id;

                  return (
                    <li
                      key={member.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {member.users?.email ?? "Unknown member"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-slate-200 bg-transparent text-slate-600",
                              isOwner ? "border-emerald-200 bg-emerald-50 text-emerald-700" : undefined
                            )}
                          >
                            {ROLE_LABEL[member.role]}
                          </Badge>
                          <span>ID: {member.user_id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isOwner && (
                          <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-600"
                            disabled={removalDisabled}
                            onClick={() => handleRemove(member)}
                          >
                            {removingId === member.user_id ? "Removing…" : "Remove"}
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
