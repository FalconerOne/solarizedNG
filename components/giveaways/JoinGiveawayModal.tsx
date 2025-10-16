"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { notifyAdminOnJoin } from "@/lib/notifyAdminOnJoin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { notifyAdminOnJoin } from "@/lib/notifyAdminOnJoin"; // ✅ NEW IMPORT

export default function JoinGiveawayModal({ open, onClose, giveaway, userId }: any) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    if (!userId || !giveaway) return;
    setLoading(true);

    try {
      // Check if already joined
      const { data: existing } = await supabase
        .from("giveaway_participants")
        .select("id")
        .eq("giveaway_id", giveaway.id)
        .eq("user_id", userId)
        .single();

      if (existing) {
        alert("You’ve already joined this giveaway!");
        setLoading(false);
        onClose();
        return;
      }

      // Simulate payment or activation fee confirmation
      if (giveaway.activation_fee > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate delay
      }

      // Record participation
const { error: insertError } = await supabase.from("giveaway_participants").insert([
  {
    giveaway_id: giveaway.id,
    user_id: userId,
    joined_at: new Date().toISOString(),
  },
]);

      // Send real-time notification to admin(s)
import { sendNotification } from "@/lib/sendNotification";

if (!insertError) {
  await sendNotification({
    type: "giveaway_join",
    title: "New Giveaway Join",
    message: `${user?.full_name || "A user"} just joined the giveaway "${giveaway.title}"`,
    target_user: "admin",
    reference_id: giveaway.id,
  });
}

if (insertError) throw insertError;

// ✅ Notify admins in real time
await notifyAdminOnJoin(giveaway.id, userId);

      // ✅ Notify admins in real time
await notifyAdminOnJoin(giveaway.id, userId);


      if (insertError) throw insertError;

      // Log activity
await supabase.from("activity_log").insert([
  {
    user_id: userId,
    activity_type: "join_giveaway",
    details: `Joined giveaway: ${giveaway.title}`,
    created_at: new Date().toISOString(),
  },
]);

      // Send notification to admin
import { sendNotification } from "@/lib/sendNotification";

await sendNotification({
  type: "new_join",
  title: "New Giveaway Join",
  message: `${giveaway.title} has a new participant.`,
  target_user: "admin",
  reference_id: giveaway.id,
});

      // ✅ Trigger admin notification
      await notifyAdminOnJoin(giveaway.id, userId);

      setJoined(true);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      alert("An error occurred while joining. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-indigo-700">
            Join Giveaway
          </DialogTitle>
        </DialogHeader>

        {!joined ? (
          <div className="p-3 text-center">
            <p className="text-gray-700 mb-4">
              Are you sure you want to join <strong>{giveaway.title}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Activation Fee:{" "}
              <span className="text-indigo-600 font-medium">
                {giveaway.activation_fee > 0 ? `$${giveaway.activation_fee}` : "Free"}
              </span>
            </p>

            <DialogFooter className="flex justify-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                disabled={loading}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" /> Joining...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="text-green-500 w-10 h-10 mb-3" />
            <h2 className="text-lg font-semibold text-gray-800">Successfully Joined!</h2>
            <p className="text-sm text-gray-500 mb-5">
              You’ve been added to the participants list.
            </p>
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
