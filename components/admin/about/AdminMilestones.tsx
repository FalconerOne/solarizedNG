"use client";

import { useEffect, useState } from "react";
import {
  getMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
} from "@/lib/adminAboutActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Milestone {
  id?: number;
  year: number;
  title: string;
  description: string;
}

export default function AdminMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMs, setNewMs] = useState<Milestone>({
    year: new Date().getFullYear(),
    title: "",
    description: "",
  });

  useEffect(() => {
    getMilestones().then(setMilestones);
  }, []);

  async function handleAdd() {
    await addMilestone(newMs);
    setMilestones(await getMilestones());
    setNewMs({ year: new Date().getFullYear(), title: "", description: "" });
  }

  async function handleUpdate(id: number, field: keyof Milestone, value: any) {
    await updateMilestone(id, { [field]: value });
    setMilestones(await getMilestones());
  }

  async function handleDelete(id: number) {
    await deleteMilestone(id);
    setMilestones(await getMilestones());
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold text-amber-400 mb-4">
        Company Milestones
      </h2>

      {/* Add new */}
      <div className="flex flex-col gap-2 mb-4">
        <Input
          type="number"
          placeholder="Year"
          value={newMs.year}
          onChange={(e) => setNewMs({ ...newMs, year: +e.target.value })}
        />
        <Input
          placeholder="Title"
          value={newMs.title}
          onChange={(e) => setNewMs({ ...newMs, title: e.target.value })}
        />
        <Textarea
          placeholder="Description"
          value={newMs.description}
          onChange={(e) =>
            setNewMs({ ...newMs, description: e.target.value })
          }
        />
        <Button onClick={handleAdd} className="bg-amber-500 text-white">
          Add Milestone
        </Button>
      </div>

      {/* Existing */}
      <div className="space-y-4">
        {milestones.map((m) => (
          <div key={m.id} className="border border-zinc-700 p-4 rounded-lg">
            <Input
              type="number"
              defaultValue={m.year}
              onBlur={(e) => handleUpdate(m.id!, "year", +e.target.value)}
              className="mb-2"
            />
            <Input
              defaultValue={m.title}
              onBlur={(e) => handleUpdate(m.id!, "title", e.target.value)}
              className="mb-2"
            />
            <Textarea
              defaultValue={m.description}
              onBlur={(e) =>
                handleUpdate(m.id!, "description", e.target.value)
              }
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
