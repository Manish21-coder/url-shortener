"use client";

import { useEffect, useState } from "react";

interface AnalyticsPageProps {
  params: { shortCode: string } | Promise<{ shortCode: string }>;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const [shortCode, setShortCode] = useState<string>("");
  const [data, setData] = useState<any>(null);

  // Unwrap params if it's a Promise
  useEffect(() => {
    async function getParams() {
      const resolved = await params;
      setShortCode(resolved.shortCode);
    }
    getParams();
  }, [params]);

  // Fetch link data once shortCode is ready
  useEffect(() => {
    if (!shortCode) return;

    async function fetchData() {
      const res = await fetch(`/api/links/${shortCode}`);
      const json = await res.json();
      setData(json.data);
    }

    fetchData();
  }, [shortCode]);

  if (!data) {
    return <p className="text-white text-center mt-20">Loading...</p>;
  }

  return (
    <main className="min-h-screen text-white px-6 pt-10">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      {/* Link Info */}
      <div className="mb-6">
        <p className="text-gray-400">{data.originalUrl}</p>
        <a
          href={`/${data.shortCode}`}
          target="_blank"
          className="text-blue-400"
        >
          {window.location.origin}/{data.shortCode}
        </a>
      </div>

      {/* Total Clicks */}
      <div className="mb-8 text-xl">
        Total Clicks: <b>{data.clicks}</b>
      </div>

      {/* Chart */}
      <div className="bg-white/10 p-6 rounded-xl">
        <h2 className="mb-4">Clicks by Day</h2>

        {data.clickHistory.length === 0 && (
          <p className="text-gray-400">No data yet</p>
        )}

        <div className="flex flex-col gap-2">
          {data.clickHistory.map((item: any, i: number) => (
            <div
              key={i}
              className="flex justify-between bg-white/5 px-4 py-2 rounded"
            >
              <span>{item.date}</span>
              <span>{item.clicks}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}