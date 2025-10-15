"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface JoinGiveawayModalProps {
  open: boolean;
  onClose: () => void;
  giveaway: {
    id: string;
    title: string;
    activation_fee: number;
    description?: string;
  };
  userId: string;
}

export default function JoinGiveawayModal({ open, onClose, giveaway, userId }: JoinGiveawayModalProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setLoading(true);
    setError("");

    try {
      const fee = giveaway.activation_fee || 0;

      // Check if user already joined
      const { data: existing } = await supabase
        .from("giveaway_participants")
        .select("*")
        .eq("giveaway_id", giveaway.id)
        .eq("user_id", userId)
        .single();

      if (existing) {
        setError("You already joined this giveaway.");
        setLoading(false);
        return;
      }

      // If activation fee is > 0, mark payment as pending
      const paymentStatus = fee > 0 ? "pending" : "free";

      const { error: joinError } = await supabase.from("giveaway_participants").insert([
        {
          giveaway_id: giveaway.id,
          user_id: userId,
          activation_fee: fee,
          payment_status: paymentStatus
        }
      ]);

      if (joinError) throw joinError;

      setJoined(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-md bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-indigo-700">{giveaway.title}</DialogTitle>
        </DialogHeader>

        {!joined ? (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">{giveaway.description}</p>

            <div className="border rounded-lg p-3 bg-gray-50 text-sm">
              <p>
                Activation Fee:{" "}
                <span className="font-semibold text-indigo-700">
                  {giveaway.activation_fee > 0 ? `$${giveaway.activation_fee}` : "Free"}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {giveaway.activation_fee > 0
                  ? "You’ll be redirected to payment once you confirm."
                  : "Free entry – no payment required."}
              </p>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <Button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin w-4 h-4" /> Joining...
                </span>
              ) : (
                "Join Giveaway"
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <h3 className="text-lg font-semibold text-green-600">✅ You’ve joined this giveaway!</h3>
            <p className="text-gray-600 text-sm">
              {giveaway.activation_fee > 0
                ? "Your payment status is pending. Complete payment to activate participation."
                : "You can now track your participation in your dashboard."}
            </p>
            <Button onClick={onClose} className="bg-indigo-600 text-white mt-3">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
