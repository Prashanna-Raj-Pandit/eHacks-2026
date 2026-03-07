import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/user";

import { useToast } from "../context/ToastContext";
interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
}

const FIELDS: (keyof Profile)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "bio",
  "location",
];

const labelMap: Record<keyof Profile, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  bio: "Bio",
  location: "Location",
};

const empty: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bio: "",
  location: "",
};

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>(empty);
  const [form, setForm] = useState<Profile>(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then((res) => {
      setProfile(res.data.data);
      setForm(res.data.data);
    });
  }, []);

  // inside component
  const { showToast } = useToast();

  // update handleSave
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(form);
      setProfile(res.data.data);
      setEditing(false);
      showToast("Profile saved successfully");
    } catch (err) {
      showToast("Failed to save profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-xl mx-auto bg-gray-900 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Profile</h2>
            <p className="text-xs text-gray-500 mt-1">
              Your personal details used for CV generation
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map((field) => (
                <div
                  key={field}
                  className={`flex flex-col gap-1 ${field === "bio" ? "col-span-2" : ""}`}
                >
                  <label className="text-xs text-gray-500">
                    {labelMap[field]}
                  </label>
                  {field === "bio" ? (
                    <textarea
                      value={form[field]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      rows={3}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  ) : (
                    <input
                      value={form[field]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg px-4 py-2 text-sm transition"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm(profile);
                }}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {FIELDS.map((field) => (
              <div key={field} className={field === "bio" ? "col-span-2" : ""}>
                <p className="text-xs text-gray-500 mb-1">{labelMap[field]}</p>
                <p className="text-sm text-white">
                  {profile[field] || <span className="text-gray-600">—</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
