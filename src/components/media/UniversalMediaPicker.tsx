/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { UploadCloud, Link as LinkIcon, HardDrive, Images, Trash2, Check, Loader2, AlertCircle } from "lucide-react";
import { canonicalizeImageUrl, resolveImage } from "@/lib/image-resolver";

export interface MediaSelectResult {
  url: string;
  source: "b2" | "gdrive" | "external" | "local";
  fileName?: string;
  id?: string;
}

interface UniversalMediaPickerProps {
  onSelect: (result: MediaSelectResult) => void;
  folder?: "products" | "brand" | "avatars";
  buttonLabel?: string;
  className?: string;
}

interface MediaAssetItem {
  id: string;
  fileId: string | null;
  fileName: string;
  servableUrl: string;
  sizeBytes: number;
  mimeType: string;
  source: string;
  folder: string;
  createdAt: string;
}

export default function UniversalMediaPicker({
  onSelect,
  folder = "products",
  buttonLabel = "Add Media / Image",
  className = "",
}: UniversalMediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"b2" | "gdrive" | "url" | "library">("b2");

  // Tab 1: Direct File Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 2: Google Drive
  const [gdriveInput, setGdriveInput] = useState("");
  const [isSavingGdrive, setIsSavingGdrive] = useState(false);
  const gdrivePreview = gdriveInput.trim() ? canonicalizeImageUrl(gdriveInput.trim()) || null : null;

  // Tab 3: External URL
  const [urlInput, setUrlInput] = useState("");
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const urlPreview = urlInput.trim() ? canonicalizeImageUrl(urlInput.trim()) || urlInput.trim() : null;

  // Tab 4: Media Library
  const [libraryAssets, setLibraryAssets] = useState<MediaAssetItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load Library Assets
  const fetchLibrary = useCallback(async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch(`/api/media?folder=${folder}&limit=30`);
      const data = await res.json();
      if (data.success && Array.isArray(data.assets)) {
        setLibraryAssets(data.assets);
      }
    } catch (err) {
      console.error("Failed to load media library:", err);
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [folder]);

  // Action: Upload Direct File to B2 via /api/media/upload
  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("folder", folder);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      onSelect({
        url: data.asset.servableUrl,
        source: data.asset.source || "b2",
        fileName: data.asset.fileName,
        id: data.asset.id,
      });

      setIsOpen(false);
      setUploadFile(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Action: Save Google Drive Link
  const handleGdriveSubmit = async () => {
    if (!gdrivePreview) return;
    setIsSavingGdrive(true);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "gdrive",
          url: gdriveInput.trim(),
          folder,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register Google Drive link");
      }

      onSelect({
        url: data.asset.servableUrl,
        source: "gdrive",
        fileName: data.asset.fileName,
        id: data.asset.id,
      });
      setIsOpen(false);
      setGdriveInput("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add Google Drive link");
    } finally {
      setIsSavingGdrive(false);
    }
  };

  // Action: Save External URL
  const handleUrlSubmit = async () => {
    if (!urlPreview) return;
    setIsSavingUrl(true);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "external",
          url: urlInput.trim(),
          folder,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register URL");
      }

      onSelect({
        url: data.asset.servableUrl,
        source: "external",
        fileName: data.asset.fileName,
        id: data.asset.id,
      });
      setIsOpen(false);
      setUrlInput("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add URL");
    } finally {
      setIsSavingUrl(false);
    }
  };

  // Action: Delete from Library (Calls DELETE /api/media/[id] for permanent purge)
  const handleDeleteAsset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this media asset? This will hard-delete from B2.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setLibraryAssets((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(data.error || "Delete failed");
      }
    } catch {
      alert("Failed to delete asset");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${className}`}
      >
        <UploadCloud className="w-4 h-4" />
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Images className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Universal Media Selector</h3>
                  <p className="text-xs text-slate-400">Choose storage source: Backblaze B2, Google Drive, or Web Link</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("b2")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "b2" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload (B2)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("gdrive")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "gdrive" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <HardDrive className="w-4 h-4" />
                <span>Google Drive</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("url")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "url" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Web URL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("library");
                  void fetchLibrary();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "library" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Images className="w-4 h-4" />
                <span>Media Library</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto py-4">
              {/* TAB 1: B2 Upload */}
              {activeTab === "b2" && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/50 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
                  >
                    <UploadCloud className="w-10 h-10 text-indigo-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {uploadFile ? uploadFile.name : "Click or drag image file here"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP, AVIF, GIF up to 5MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadFile(file);
                      }}
                    />
                  </div>

                  {uploadError && (
                    <div className="flex items-center gap-2 p-3 text-xs bg-red-950/50 border border-red-800/50 text-red-300 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {uploadFile && (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setUploadFile(null)}
                        className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUploadSubmit}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>{isUploading ? "Uploading to B2..." : "Upload & Select"}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Google Drive */}
              {activeTab === "gdrive" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Paste Google Drive Sharing Link or File ID
                    </label>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                      value={gdriveInput}
                      onChange={(e) => setGdriveInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ensure the Drive link is shared as <em>&quot;Anyone with the link can view&quot;</em>.
                    </p>
                  </div>

                  {gdrivePreview && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-400">Live Preview:</p>
                      <div className="w-40 h-40 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                        <img
                          src={gdrivePreview}
                          alt="Drive Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleGdriveSubmit}
                          disabled={isSavingGdrive}
                          className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50"
                        >
                          {isSavingGdrive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          <span>Attach Google Drive Asset</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Direct Web URL */}
              {activeTab === "url" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Paste Direct Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {urlPreview && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-400">Live Preview:</p>
                      <div className="w-40 h-40 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                        <img
                          src={urlPreview}
                          alt="URL Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleUrlSubmit}
                          disabled={isSavingUrl}
                          className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50"
                        >
                          {isSavingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          <span>Attach Image URL</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Media Library */}
              {activeTab === "library" && (
                <div>
                  {isLoadingLibrary ? (
                    <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                      <p className="text-xs">Loading media assets from database (0 B2 calls)...</p>
                    </div>
                  ) : libraryAssets.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs">
                      No media assets found in folder &quot;{folder}&quot;. Upload your first file!
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
                      {libraryAssets.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => {
                            onSelect({
                              url: asset.servableUrl,
                              source: asset.source as "b2" | "gdrive" | "external" | "local",
                              fileName: asset.fileName,
                              id: asset.id,
                            });
                            setIsOpen(false);
                          }}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 bg-slate-950 cursor-pointer transition-all"
                        >
                          <img
                            src={resolveImage(asset.servableUrl)}
                            alt={asset.fileName}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          {/* Badge */}
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded uppercase bg-black/60 backdrop-blur-sm text-slate-300">
                            {asset.source}
                          </span>
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAsset(asset.id, e)}
                            disabled={deletingId === asset.id}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hard delete from B2 and database"
                          >
                            {deletingId === asset.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
