"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import JoinGiveawayModal from "./JoinGiveawayModal";
import RealTimeParticipantCounter from "./RealTimeParticipantCounter";

export default function GiveawayCard({ giveaway, userId }: any) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{giveaway.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{giveaway.description}</p>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700">
            🎯 Activation Fee:{" "}
            <span className="text-indigo-600 font-medium">
              {giveaway.activation_fee > 0 ? `$${giveaway.activation_fee}` : "Free"}
            </span>
          </span>
          <RealTimeParticipantCounter giveawayId={giveaway.id} />
        </div>

        {giveaway.media_url && (
          <div className="mt-3">
            {giveaway.media_url.endsWith(".mp4") ? (
              <video
                src={giveaway.media_url}
                controls
                className="w-full rounded-xl border border-gray-200"
              />
            ) : (
              <img
                src={giveaway.media_url}
                alt={giveaway.title}
                className="w-full h-48 object-cover rounded-xl border border-gray-200"
              />
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          className="bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => setOpen(true)}
        >
          Join Giveaway
        </Button>
      </CardFooter>

      <JoinGiveawayModal
        open={open}
        onClose={() => setOpen(false)}
        giveaway={giveaway}
        userId={userId}
      />
    </Card>
  );
}
