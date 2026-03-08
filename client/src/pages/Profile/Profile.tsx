import { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import WorkExperienceSection from "./WorkExperience";
import EducationSection from "./Education";
import ProjectsSection from "./Project";

const SECTIONS = [
  { key: "personal", label: "Personal Info", icon: "👤" },
  { key: "experience", label: "Work Experience", icon: "💼" },
  { key: "education", label: "Education", icon: "🎓" },
  { key: "projects", label: "Projects", icon: "🚀" },
];

export default function Profile() {
  const [active, setActive] = useState("personal");

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-52 bg-gray-900 border-r border-gray-800 flex flex-col p-4 gap-1 flex-shrink-0">
        <div className="mb-6 px-3">
          <h2 className="text-sm font-semibold text-white">My Profile</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage your details</p>
        </div>
        {SECTIONS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition text-left ${
              active === key
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {active === "personal" && <PersonalInfo />}
          {active === "experience" && <WorkExperienceSection />}
          {active === "education" && <EducationSection />}
          {active === "projects" && <ProjectsSection />}
        </div>
      </main>
    </div>
  );
}
