"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";

export function UploadLogs() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    try {
      const text = await file.text();
      const logs = JSON.parse(text); // Assume an array of objects
      
      await axios.post("/api/ingest/logs", { logs });
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="p-6 border border-pantheon-emerald-900 bg-pantheon-onyx/80 rounded-xl backdrop-blur-md">
      <h3 className="font-serif text-xl text-pantheon-marble mb-4">Ingest Chat Context</h3>
      <p className="text-sm text-pantheon-marble-muted mb-6">
        Upload exported JSON chat logs. The system will chunk and embed them into the local Vector DB for agentic recall.
      </p>
      
      <div className="flex items-center space-x-4">
        <label className="flex-1 flex items-center justify-center border-2 border-dashed border-pantheon-emerald-800 rounded-lg p-6 cursor-pointer hover:bg-pantheon-emerald-900/20 transition-colors">
          <input type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          <div className="text-center">
            <UploadCloud className="w-8 h-8 text-pantheon-emerald-500 mx-auto mb-2" />
            <span className="text-sm text-pantheon-marble">
              {file ? file.name : "Select JSON file"}
            </span>
          </div>
        </label>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading"}
          className="px-6 py-2 bg-gradient-to-r from-pantheon-emerald-600 to-pantheon-emerald-800 text-pantheon-marble rounded-lg font-medium shadow-lg hover:shadow-pantheon-emerald-500/20 transition-all disabled:opacity-50"
        >
          {status === "uploading" ? "Ingesting..." : "Embed Context"}
        </button>
      </div>

      {status === "success" && (
        <div className="mt-4 p-3 bg-pantheon-emerald-900/30 border border-pantheon-emerald-500 text-pantheon-emerald-400 rounded-lg flex items-center text-sm">
          <CheckCircle className="w-4 h-4 mr-2" /> Context successfully ingested to Vector DB.
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-500 text-red-400 rounded-lg flex items-center text-sm">
          <AlertTriangle className="w-4 h-4 mr-2" /> Error ingesting context. Check format.
        </div>
      )}
    </div>
  );
}
