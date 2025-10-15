'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Trash, Edit3, Eye, EyeOff, Video, Image } from 'lucide-react';

type Giveaway = {
  id: string;
  title: string;
  description: string;
  prize: string;
  image_url: string | null;
  video_url: string | null;
  visibility: 'public' | 'private';
  created_at: string;
};

export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prize, setPrize] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch giveaways in real time
  useEffect(() => {
    const fetchGiveaways = async () => {
      const { data, error } = await supabase
        .from('giveaways')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setGiveaways(data as Giveaway[]);
    };
    fetchGiveaways();

    const channel = supabase
      .channel('realtime:giveaways')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'giveaways' },
        () => fetchGiveaways()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Upload media file to Supabase storage
  const uploadMedia = async (file: File, folder: string) => {
    const ext = file.name.split('.').pop();
    const filePath = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('giveaway-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from('giveaway-media')
      .getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  // Create new giveaway
  const handleCreate = async () => {
    try {
      setLoading(true);

      let image_url = null;
      let video_url = null;

      if (imageFile) image_url = await uploadMedia(imageFile, 'images');
      if (videoFile) {
        if (videoFile.size > 50 * 1024 * 1024)
          throw new Error('Video exceeds 50 MB limit.');
        video_url = await uploadMedia(videoFile, 'videos');
      }

      const { error } = await supabase.from('giveaways').insert([
        {
          title,
          description,
          prize,
          image_url,
          video_url,
          visibility,
        },
      ]);
      if (error) throw error;

      setTitle('');
      setDescription('');
      setPrize('');
      setImageFile(null);
      setVideoFile(null);
      setVisibility('public');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete giveaway
  const handleDelete = async (id: string) => {
    await supabase.from('giveaways').delete().eq('id', id);
  };

  // Toggle visibility
  const toggleVisibility = async (id: string, current: 'public' | 'private') => {
    const newVisibility = current === 'public' ? 'private' : 'public';
    await supabase
      .from('giveaways')
      .update({ visibility: newVisibility })
      .eq('id', id);
  };

  return (
    <div className="p-6 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Create New Giveaway</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input placeholder="Prize" value={prize} onChange={e => setPrize(e.target.value)} />

          <div className="flex flex-col gap-2">
            <label>Image Upload (optional)</label>
            <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
            <label>Video Upload (≤ 50 MB, optional)</label>
            <Input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
          </div>

          <div className="flex gap-4 items-center">
            <Button
              onClick={() => setVisibility('public')}
              variant={visibility === 'public' ? 'default' : 'outline'}
            >
              <Eye className="mr-2 w-4 h-4" /> Public
            </Button>
            <Button
              onClick={() => setVisibility('private')}
              variant={visibility === 'private' ? 'default' : 'outline'}
            >
              <EyeOff className="mr-2 w-4 h-4" /> Private
            </Button>
          </div>

          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating…' : 'Create Giveaway'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {giveaways.map(g => (
          <Card key={g.id} className="shadow-md hover:shadow-xl transition">
            <CardHeader className="flex justify-between">
              <CardTitle>{g.title}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => toggleVisibility(g.id, g.visibility)}>
                  {g.visibility === 'public' ? <Eye /> : <EyeOff />}
                </Button>
                <Button variant="ghost" onClick={() => handleDelete(g.id)}>
                  <Trash className="text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {g.image_url && <img src={g.image_url} alt={g.title} className="rounded-lg" />}
              {g.video_url && (
                <video
                  src={g.video_url}
                  controls
                  className="rounded-lg w-full h-48 object-cover"
                />
              )}
              <p className="text-sm text-gray-600">{g.description}</p>
              <p className="text-sm font-semibold">Prize: {g.prize}</p>
              <p className="text-xs text-gray-400">
                Created: {new Date(g.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
