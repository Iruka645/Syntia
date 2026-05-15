"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, Star, Plus, ScrollText } from "lucide-react";
import ArchiveModal from "./ArchiveModal";

interface Archive {
  id: number;
  name: string;
  content: string;
  isDefault: boolean;
}

export default function ArchiveList() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);

  const fetchArchives = async () => {
    try {
      const res = await fetch("/api/user/archives");
      if (res.ok) {
        const data = await res.json();
        setArchives(data);
      }
    } catch (error) {
      console.error("Failed to fetch archives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadArchives = async () => {
      await fetchArchives();
    }
    loadArchives();
  }, []);

  const handleSetDefault = async (id: number) => {
    try {
      const res = await fetch(`/api/user/archives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        fetchArchives();
      }
    } catch (error) {
      console.error("Failed to set default archive:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this archive?")) return;
    try {
      const res = await fetch(`/api/user/archives/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchArchives();
      }
    } catch (error) {
      console.error("Failed to delete archive:", error);
    }
  };

  const handleEdit = (archive: Archive) => {
    setEditingArchive(archive);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingArchive(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-zinc-500 italic">Loading archives...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archives.map((archive) => (
          <div
            key={archive.id}
            className={`group relative bg-zinc-900/50 border ${
              archive.isDefault ? "border-blue-500/50" : "border-zinc-800"
            } rounded-xl p-5 hover:border-zinc-700 transition-all`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <ScrollText className={`w-5 h-5 ${archive.isDefault ? "text-blue-400" : "text-zinc-500"}`} />
                <h3 className="font-semibold text-zinc-100">{archive.name}</h3>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(archive)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(archive.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-zinc-400 line-clamp-3 mb-4 min-h-[3rem]">
              {archive.content}
            </p>

            <div className="flex items-center justify-between mt-auto">
              {archive.isDefault ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-current" />
                  Default
                </span>
              ) : (
                <button
                  onClick={() => handleSetDefault(archive.id)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={handleCreate}
          className="flex flex-col items-center justify-center gap-3 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-xl p-8 hover:bg-zinc-900/40 hover:border-zinc-600 transition-all group"
        >
          <div className="p-3 bg-zinc-800 rounded-full group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-zinc-400 group-hover:text-white" />
          </div>
          <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300">Create New Archive</span>
        </button>
      </div>

      {isModalOpen && (
        <ArchiveModal
          archive={editingArchive}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            fetchArchives();
          }}
        />
      )}
    </div>
  );
}
