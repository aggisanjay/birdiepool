"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/useToast";
import {
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Clock,
  Trophy,
} from "lucide-react";

interface WinnerProfile {
  full_name: string;
  email: string;
}

interface WinnerDraw {
  draw_month: string;
  numbers: number[];
}

interface Winner {
  id: string;
  user_id: string;
  draw_id: string;
  match_type: string;
  matched_numbers: number[];
  prize_amount_cents: number;
  verification_status: string;
  payment_status: string;
  proof_image_url: string | null;
  proof_uploaded_at: string | null;
  rejection_reason: string | null;
  profiles: WinnerProfile;
  draws: WinnerDraw;
}

const matchLabels: Record<string, string> = {
  match_5: "5-Match 🏆",
  match_4: "4-Match 🎯",
  match_3: "3-Match ⭐",
};

const matchBadgeVariant: Record<string, "accent" | "success" | "info"> = {
  match_5: "accent",
  match_4: "success",
  match_3: "info",
};

type FilterType = "all" | "pending" | "approved" | "rejected";
const FILTER_OPTIONS: FilterType[] = ["all", "pending", "approved", "rejected"];

export function WinnerVerification({
  winners: initialWinners,
}: {
  winners: Winner[];
}) {
  const [winners, setWinners] = useState<Winner[]>(initialWinners);
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FilterType>("all");
  const { toast } = useToast();

  const filtered = winners.filter((w) => {
    if (filter === "all") return true;
    return w.verification_status === filter;
  });

  function getFilterCount(f: FilterType) {
    if (f === "all") return winners.length;
    return winners.filter((w) => w.verification_status === f).length;
  }

  async function handleVerify(
    winnerId: string,
    status: "approved" | "rejected",
    reason?: string
  ) {
    setLoading((prev) => ({ ...prev, [winnerId]: true }));

    try {
      const res = await fetch(`/api/winners/${winnerId}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify");

      setWinners((prev) =>
        prev.map((w) =>
          w.id === winnerId ? { ...w, verification_status: status } : w
        )
      );

      toast({
        title: status === "approved" ? "Winner approved ✅" : "Winner rejected",
        variant: status === "approved" ? "success" : "warning",
      });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [winnerId]: false }));
    }
  }

  async function handlePayout(winnerId: string) {
    const reference =
      prompt("Enter payment reference (e.g. BACS-2024-001):") ?? "";

    setLoading((prev) => ({ ...prev, [`pay-${winnerId}`]: true }));

    try {
      const res = await fetch(`/api/winners/${winnerId}/payout`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_reference: reference }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to mark as paid");

      setWinners((prev) =>
        prev.map((w) =>
          w.id === winnerId ? { ...w, payment_status: "paid" } : w
        )
      );

      toast({ title: "Payout recorded ✅", variant: "success" });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [`pay-${winnerId}`]: false }));
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
              filter === f
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {f} <span className="opacity-60">({getFilterCount(f)})</span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
          <Trophy className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No winners in this category</p>
        </div>
      )}

      {/* Winner cards */}
      {filtered.map((winner) => {
        const drawMonth = winner.draws.draw_month
          ? new Date(winner.draws.draw_month).toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })
          : "Unknown";

        const drawNumbers = winner.draws.numbers ?? [];
        const matched = winner.matched_numbers ?? [];

        return (
          <Card key={winner.id}>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: user info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 className="font-bold text-white text-lg">
                      {winner.profiles.full_name}
                    </h4>
                    <Badge
                      variant={
                        matchBadgeVariant[winner.match_type] ?? "default"
                      }
                    >
                      {matchLabels[winner.match_type] ?? winner.match_type}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-400 mb-1">
                    {winner.profiles.email}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">{drawMonth} Draw</p>

                  {/* Number balls */}
                  {drawNumbers.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-1.5">
                        Draw numbers (green = matched):
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {drawNumbers.map((n) => (
                          <span
                            key={n}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              matched.includes(n)
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {winner.proof_uploaded_at && (
                    <p className="text-xs text-slate-500">
                      Proof uploaded:{" "}
                      {new Date(winner.proof_uploaded_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  )}

                  {winner.verification_status === "rejected" &&
                    winner.rejection_reason && (
                      <p className="text-xs text-red-400 mt-1">
                        Reason: {winner.rejection_reason}
                      </p>
                    )}
                </div>

                {/* Right: prize + status */}
                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-emerald-400 mb-2">
                    ₹{(winner.prize_amount_cents / 100).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 justify-end flex-wrap">
                    {winner.verification_status === "pending" && (
                      <Badge variant="warning">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}

                    {winner.verification_status === "approved" && (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </Badge>
                    )}

                    {winner.verification_status === "rejected" && (
                      <Badge variant="error">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                      </Badge>
                    )}

                    {winner.verification_status === "approved" && (
                      <Badge
                        variant={
                          winner.payment_status === "paid"
                            ? "success"
                            : "warning"
                        }
                      >
                        {winner.payment_status === "paid" ? "Paid" : "Unpaid"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2 items-center">
                {winner.proof_image_url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setViewingProof(winner.proof_image_url)}
                  >
                    View Proof
                  </Button>
                ) : (
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                    No proof uploaded yet
                  </span>
                )}

                {winner.verification_status === "pending" && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle className="w-3.5 h-3.5" />}
                      loading={loading[winner.id]}
                      onClick={() => handleVerify(winner.id, "approved")}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      icon={<XCircle className="w-3.5 h-3.5" />}
                      loading={loading[winner.id]}
                      onClick={() => {
                        const reason = prompt("Rejection reason:");
                        if (reason && reason.trim()) {
                          handleVerify(
                            winner.id,
                            "rejected",
                            reason.trim()
                          );
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {winner.verification_status === "approved" &&
                  winner.payment_status === "pending" && (
                    <Button
                      variant="accent"
                      size="sm"
                      icon={<DollarSign className="w-3.5 h-3.5" />}
                      loading={loading[`pay-${winner.id}`]}
                      onClick={() => handlePayout(winner.id)}
                    >
                      Mark as Paid
                    </Button>
                  )}

                {winner.payment_status === "paid" && (
                  <span className="text-xs text-emerald-400 font-semibold">
                    Payment complete ✅
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Proof image modal */}
      {viewingProof && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewingProof(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="font-bold text-white">Score Proof</h3>
                <button
                  onClick={() => setViewingProof(null)}
                  className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="p-4">
                <img
                  src={viewingProof}
                  alt="Winner proof"
                  className="w-full rounded-xl object-contain max-h-[60vh]"
                />
              </div>

              <div className="p-4 border-t border-slate-800 flex justify-end">
                <a
                  href={viewingProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Open full size &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
