import React, { useEffect, useState } from "react";
import { getGiveaways, createGiveaway } from "@/lib/giveawayService";

export default function AdminGiveaways() {
  const [giveaways, setGiveaways] = useState([]);

  useEffect(() => {
    getGiveaways().then(setGiveaways);
  }, []);

  async function handleAdd() {
    const newGiveaway = {
      title: "Test Giveaway",
      description: "Demo entry",
      prize: "SolarizedNG Premium Access",
      is_active: true,
    };
    await createGiveaway(newGiveaway);
    setGiveaways(await getGiveaways());
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Giveaways</h1>
      <button
        onClick={handleAdd}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg mb-4"
      >
        Add Test Giveaway
      </button>

      <ul className="space-y-2">
        {giveaways.map((g) => (
          <li key={g.id} className="p-3 bg-white shadow rounded-lg">
            <p className="font-medium">{g.title}</p>
            <p className="text-sm text-gray-500">{g.prize}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
