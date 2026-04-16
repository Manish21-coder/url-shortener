"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useUser();

  const [url, setUrl] = useState("");
  const [prefix, setPrefix] = useState("");
  const [alias, setAlias] = useState("");
  const [folder, setFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/folders")
        .then((r) => r.json())
        .then((d) => setFolders(d.data || []));
    }
  }, [isSignedIn]);

  const shortenUrl = async () => {
    if (!url) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        body: JSON.stringify({
          originalUrl: url,
          prefix,
          alias,
          folder: showNewFolder ? newFolderName.trim() : folder,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to shorten URL");
        setLoading(false);
        return;
      }

      if (data?.data?.shortCode) {
        setShortUrl(`${window.location.origin}/${data.data.shortCode}`);
        // Refresh folder list in case a new one was created
        if (isSignedIn) {
          fetch("/api/folders")
            .then((r) => r.json())
            .then((d) => setFolders(d.data || []));
        }
      }
    } catch {
      setError("Request failed");
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-black to-blue-700 opacity-80"></div>
      <div className="absolute w-[600px] h-[600px] bg-purple-500 rounded-full blur-[200px] opacity-30 animate-pulse top-[-100px] left-[-100px]"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-500 rounded-full blur-[200px] opacity-30 animate-pulse bottom-[-100px] right-[-100px]"></div>

      <div className="relative z-10 text-center max-w-3xl w-full">
        <h1 className="text-6xl font-extrabold mb-6 leading-tight">
          Shorten Links
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {" "}Instantly
          </span>
        </h1>

        <p className="text-gray-300 text-lg mb-12">
          Create powerful short links with your custom <b>Mani</b> prefix.
        </p>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-6 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Paste your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-white/90 text-black p-4 rounded-xl outline-none"
          />

          <input
            type="text"
            placeholder="Custom alias (optional)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="bg-white/90 text-black p-4 rounded-xl outline-none"
          />

          <input
            type="text"
            placeholder="Prefix (optional)"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="bg-white/90 text-black p-4 rounded-xl outline-none"
          />

          {isSignedIn && (
            <div className="flex gap-2">
              <select
                value={showNewFolder ? "__new__" : folder}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setShowNewFolder(true);
                    setFolder("");
                  } else {
                    setShowNewFolder(false);
                    setFolder(e.target.value);
                  }
                }}
                className="flex-1 bg-white/90 text-black p-4 rounded-xl outline-none"
              >
                <option value="">No folder</option>
                {folders.map((f) => (
                  <option key={f} value={f}>
                    📁 {f}
                  </option>
                ))}
                <option value="__new__">+ New folder...</option>
              </select>

              {showNewFolder && (
                <input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 bg-white/90 text-black p-4 rounded-xl outline-none"
                />
              )}
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-left">{error}</p>}

          <button
            onClick={shortenUrl}
            className="py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition font-semibold"
          >
            {loading ? "..." : "Shorten"}
          </button>
        </div>

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
