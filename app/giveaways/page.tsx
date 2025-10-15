'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Heart, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

type Giveaway = {
  id: string;
  title: string;
  description: string;
  prize: string;
  image_url: string | null;
  video_url: string | null;
  visibility: string;
  created_at: string;
};

export default function GiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [likes, setLikes] = useState<{ [id: string]: number }>({});
  const [shared, setShared] = useState<{ [id: string]: boolean }>({});

  // Fetch all public giveaways
  useEffect(() => {
    const fetchPublicGiveaways = async () => {
      const { data, error } = await supabase
        .from('giveaways')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (!error && data) setGiveaways(data);
    };

    fetchPublicGiveaways();

    // Real-time update subscription
    const channel = supabase
      .channel('realtime:giveaways_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'giveaways' },
        fetchPublicGiveaways
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Simulated like action (later connected to analytics)
  const handleLike = (id: string) => {
    setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  // Simulated share (to be expanded to actual share link later)
  const handleShare = (giveaway: Giveaway) => {
    const shareText = `Check out this giveaway on SolarizedNG: ${giveaway.title}`;
    const shareUrl = `${window.location.origin}/giveaways/${giveaway.id}`;
    if (navigator.share) {
      navigator.share({ title: giveaway.title, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
    setShared(prev => ({ ...prev, [giveaway.id]: true }));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🎉 Active Giveaways</h1>
      {giveaways.length === 0 ? (
        <p className="text-center text-gray-500">No active giveaways right now. Check back soon!</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {giveaways.map(g => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition duration-300">
                <CardHeader>
                  <CardTitle>{g.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {g.image_url && (
                    <img
                      src={g.image_url}
                      alt={g.title}
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  )}
                  {g.video_url && (
                    <video
                      src={g.video_url}
                      controls
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  )}
                  <p className="text-sm text-gray-600">{g.description}</p>
                  <p className="font-semibold text-sm">🎁 Prize: {g.prize}</p>
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLike(g.id)}
                    >
                      <Heart className="w-4 h-4 mr-2 text-pink-500" />
                      {likes[g.id] || 0}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(g)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {shared[g.id] ? 'Shared' : 'Share'}
                    </Button>

                    <Button size="sm" variant="default">
                      <Gift className="w-4 h-4 mr-2" /> View
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Posted {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
