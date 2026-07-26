"use client";

import { useState } from "react";
import type { Data } from "@/lib/types";
import Header, { type Tab } from "./Header";
import DiaryTab from "./DiaryTab";
import ZitateTab from "./ZitateTab";
import SnippetsTab from "./SnippetsTab";
import NpcsTab from "./NpcsTab";
import PcsTab from "./PcsTab";
import MoodboardTab from "./MoodboardTab";

export default function App({ initialData }: { initialData: Data }) {
  const [tab, setTab] = useState<Tab>("diary");
  const [data, setData] = useState<Data>(initialData);

  return (
    <div className="app-root">
      <Header tab={tab} onTab={setTab} />
      {tab === "diary" && <DiaryTab data={data} onData={setData} />}
      {tab === "zitate" && <ZitateTab data={data} onData={setData} />}
      {tab === "snippets" && <SnippetsTab data={data} onData={setData} />}
      {tab === "npcs" && <NpcsTab data={data} onData={setData} />}
      {tab === "pcs" && <PcsTab data={data} onData={setData} />}
      {tab === "mood" && <MoodboardTab data={data} onData={setData} />}
    </div>
  );
}
