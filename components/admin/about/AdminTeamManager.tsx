"use client";

import { useEffect, useState } from "react";
import {
  getTeam,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "@/lib/adminAboutActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Team {
  id?: number;
  name: string;
  role: string;
  bio: string;
  photo_url?: string;
}

export default function AdminTeamManager() {
  const [team, setTeam] = useState<Team[]>([]);
  const [newMember, setNewMember] = useState<Team>({
    name: "",
    role: "",
    bio: "",
  });

  useEffect(() => {
    getTeam().then(setTeam);
  }, []);

  async function handleAdd() {
    if (!newMember.name) return;
    await addTeamMember(newMember);
    setNewMember({ name: "", role: "", bio: "" });
    setTeam(await getTeam());
  }

  async function handleUpdate(id: number, field: keyof Team, value: string) {
    await updateTeamMember(id, { [field]: value });
    setTeam(await getTeam());
  }

  async function handleDelete(id: number) {
    await deleteTeamMember(id);
    setTeam(await getTeam());
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow mb-10">
      <h2 className="text-xl font-semibold text-amber-400 mb-4">
        Team Members
      </h2>

      {/* Add new */}
      <div className="flex flex-col gap-2 mb-4">
        <Input
          placeholder="Name"
          value={newMember.name}
          onChange={(e) =>
            setNewMember({ ...newMember, name: e.target.value })
          }
        />
        <Input
          placeholder="Role"
          value={newMember.role}
          onChange={(e) =>
            setNewMember({ ...newMember, role: e.target.value })
          }
        />
        <Textarea
          placeholder="Bio"
          value={newMember.bio}
          onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
        />
        <Button onClick={handleAdd} className="bg-amber-500 text-white">
          Add Member
        </Button>
      </div>

      {/* Existing */}
      <div className="space-y-4">
        {team.map((m) => (
          <div key={m.id} className="border border-zinc-700 p-4 rounded-lg">
            <Input
              defaultValue={m.name}
              onBlur={(e) => handleUpdate(m.id!, "name", e.target.value)}
              className="mb-2"
            />
            <Input
              defaultValue={m.role}
              onBlur={(e) => handleUpdate(m.id!, "role", e.target.value)}
              className="mb-2"
            />
            <Textarea
              defaultValue={m.bio}
              onBlur={(e) => handleUpdate(m.id!, "bio", e.target.value)}
              className="mb-2"
            />
            <Button
              variant="destructive"
              onClick={() => handleDelete(m.id!)}
              className="mt-2"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
