import { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  getJDs,
  createJD,
  updateJD,
  deleteJD,
  generateCV,
} from "../services/cvGenerator";
import { useToast } from "../context/ToastContext";

interface JDEntry {
  _id: string;
  title: string;
  content: string;
  cv: string | null;
}

export default function CVGenerator() {
  const [entries, setEntries] = useState<JDEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // inside component
  const { showToast } = useToast();

  const active = entries.find((e) => e._id === activeId) ?? null;

  useEffect(() => {
    getJDs().then((res) => {
      const data = res.data.data;
      setEntries(data);
      if (data.length > 0) setActiveId(data[0]._id);
    });
  }, []);

  const handleNew = async () => {
    const res = await createJD(`Job Description ${entries.length + 1}`, "");
    const newEntry = res.data.data;
    setEntries((prev) => [...prev, newEntry]);
    setActiveId(newEntry._id);
  };

  const handleContentChange = (value: string) => {
    if (!active) return;
    setEntries((prev) =>
      prev.map((e) => (e._id === activeId ? { ...e, content: value } : e)),
    );
  };

  const handleTitleChange = (value: string) => {
    if (!active) return;
    setEntries((prev) =>
      prev.map((e) => (e._id === activeId ? { ...e, title: value } : e)),
    );
  };

  // update handleSave
  const handleSave = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await updateJD(active._id, active.title, active.content);
      showToast("JD saved successfully");
    } catch (err) {
      showToast("Failed to save JD", "error");
    } finally {
      setSaving(false);
    }
  };

  // update handleDelete
  const handleDelete = async (_id: string) => {
    try {
      await deleteJD(_id);
      const remaining = entries.filter((e) => e._id !== _id);
      setEntries(remaining);
      if (activeId === _id) setActiveId(remaining[0]?._id ?? null);
      showToast("JD deleted");
    } catch (err) {
      showToast("Failed to delete JD", "error");
    }
  };

  // update handleGenerate
  const handleGenerate = async () => {
    if (!active) return;
    setLoading(true);
    try {
      await handleSave();
      const res = await generateCV(active._id);
      setEntries((prev) =>
        prev.map((e) => (e._id === activeId ? { ...e, cv: res.data.data } : e)),
      );
      showToast("CV generated successfully");
    } catch (err) {
      showToast("Failed to generate CV", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">CV Generator</h1>
        <span className="text-xs text-gray-500">
          {entries.length} job description{entries.length !== 1 ? "s" : ""}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4">
            <button
              onClick={handleNew}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg py-2 transition"
            >
              + New JD
            </button>
          </div>
          <div className="flex flex-col gap-1 px-2 overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry._id}
                onClick={() => setActiveId(entry._id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group transition ${
                  activeId === entry._id
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.cv ? "bg-green-500" : "bg-gray-600"}`}
                  />
                  <span className="text-sm truncate">{entry.title}</span>
                </div>
                {entries.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(entry._id);
                    }}
                    className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>

        {active ? (
          <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 flex flex-col p-6 border-r border-gray-800 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <input
                  value={active.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="bg-transparent text-sm font-medium text-gray-300 focus:outline-none border-b border-transparent focus:border-gray-600 pb-0.5 transition"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="border border-gray-700 hover:border-gray-500 text-gray-300 text-sm rounded-lg px-4 py-2 transition disabled:opacity-40"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !active.content}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg px-4 py-2 transition"
                  >
                    {loading ? "Generating..." : "Generate CV →"}
                  </button>
                </div>
              </div>
              <ReactQuill
                theme="snow"
                value={active.content}
                onChange={handleContentChange}
                placeholder="Paste or type the job description here..."
                className="flex-1 bg-gray-800 rounded-xl text-white"
              />
            </div>

            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-300">
                  Generated CV
                </h2>
                {active.cv && (
                  <button
                    onClick={() => navigator.clipboard.writeText(active.cv!)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Copy
                  </button>
                )}
              </div>
              {active.cv ? (
                <pre className="bg-gray-900 rounded-xl p-6 text-xs text-gray-300 leading-relaxed overflow-auto flex-1 whitespace-pre-wrap">
                  {active.cv}
                </pre>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-600">
                  <span className="text-4xl mb-3">📄</span>
                  <p className="text-sm">Your generated CV will appear here</p>
                  <p className="text-xs mt-1">
                    Paste a job description and hit Generate
                  </p>
                </div>
              )}
            </div>
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <p className="text-sm">Click + New JD to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
