"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [prefix, setPrefix] = useState("");
  const [alias, setAlias] = useState(""); // ✅ NEW
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shortenUrl = async () => {
    if (!url) return;

    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        body: JSON.stringify({ 
          originalUrl: url,
          prefix,
          alias, // ✅ SEND ALIAS
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "API failed");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data?.data?.shortCode) {
        setShortUrl(`${window.location.origin}/${data.data.shortCode}`);
      }

    } catch (err) {
      console.error("Request failed:", err);
    }

    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-black to-blue-700 opacity-80"></div>

      <div className="absolute w-[600px] h-[600px] bg-purple-500 rounded-full blur-[200px] opacity-30 animate-pulse top-[-100px] left-[-100px]"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-500 rounded-full blur-[200px] opacity-30 animate-pulse bottom-[-100px] right-[-100px]"></div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl">

        <h1 className="text-6xl font-extrabold mb-6 leading-tight">
          Shorten Links  
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {" "}Instantly
          </span>
        </h1>

        <p className="text-gray-300 text-lg mb-12">
          Create powerful short links with your custom <b>Mani</b> prefix.
        </p>

        {/* 🔥 Input Section */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-6 flex flex-col gap-4">

          {/* URL */}
          <input
            type="text"
            placeholder="Paste your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-white/90 text-black p-4 rounded-xl outline-none"
          />

          {/* 🔥 ALIAS INPUT */}
          <input
            type="text"
            placeholder="Custom alias (optional)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="bg-white/90 text-black p-4 rounded-xl outline-none"
          />

          {/* PREFIX */}
          <input
            type="text"
            placeholder="Prefix (optional)"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="bg-white/90 text-black p-4 rounded-xl outline-none"
          />

          {/* BUTTON */}
          <button
            onClick={shortenUrl}
            className="py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition font-semibold"
          >
            {loading ? "..." : "Shorten"}
          </button>
        </div>

        {/* Result + QR */}
        {shortUrl && (
          <div className="mt-8 flex flex-col items-center gap-6">

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-5 flex gap-4 items-center">

              <span className="text-lg break-all">{shortUrl}</span>

              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={copyLink}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition"
              >
                {copied ? "Copied ✅" : "Copy"}
              </motion.button>

            </div>

            <QRCodeCanvas value={shortUrl} size={160} />

          </div>
        )}

      </div>

      <div className="absolute bottom-6 text-gray-400 text-sm">
        Built with ❤️ by Manish
      </div>

    </main>
  );
}