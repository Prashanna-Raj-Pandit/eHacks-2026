import { useState, useEffect } from "react";
import { getProfile } from "../../services/user";
import { getExperiences } from "../../services/workExperience";
import { getEducation } from "../../services/education";
import { getProjects } from "../../services/project";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  githubUsername: string;
  skills: string[];
}

interface WorkExperience {
  _id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  _id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
  stars: number;
}

type Theme = 'dark' | 'light'

const themes = {
  dark: {
    bg: 'bg-gray-950',
    surface: 'bg-gray-900',
    surfaceHover: 'hover:bg-gray-800',
    border: 'border-gray-800',
    text: 'text-white',
    textMuted: 'text-gray-400',
    textSubtle: 'text-gray-500',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-400',
    tag: 'bg-gray-800 border-gray-700 text-gray-300',
    timeline: 'bg-gray-800',
    card: 'bg-gray-900 border-gray-800',
    footer: 'border-gray-800',
    accentBlock: 'bg-emerald-400',
  },
  light: {
    bg: 'bg-gray-50',
    surface: 'bg-white',
    surfaceHover: 'hover:shadow-md',
    border: 'border-gray-100',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    textSubtle: 'text-gray-400',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-600',
    tag: 'bg-gray-50 border-gray-200 text-gray-500',
    timeline: 'bg-gray-200',
    card: 'bg-white border-gray-100',
    footer: 'border-gray-200',
    accentBlock: 'bg-emerald-500',
  }
}

export default function Portfolio() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');

  const t = themes[theme]

  const displayed = showAll
    ? projects
    : [...projects].sort((a, b) => b.stars - a.stars).slice(0, 6);

  useEffect(() => {
    Promise.all([
      getProfile(),
      getExperiences(),
      getEducation(),
      getProjects(),
    ]).then(([profileRes, expRes, eduRes, projRes]) => {
      setProfile(profileRes.data.data);
      setExperiences(expRes.data.data);
      setEducation(eduRes.data.data);
      setProjects(projRes.data.data);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading portfolio...</p>
      </div>
    );

  if (!profile) return null;

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} font-sans transition-colors duration-300`}>

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-1 ${t.surface} border ${t.border} rounded-full p-1 shadow-lg`}>
          <button
            onClick={() => setTheme('dark')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              theme === 'dark' ? 'bg-gray-700 text-white' : t.textMuted
            }`}
          >
            🌙 Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              theme === 'light' ? 'bg-gray-100 text-gray-900' : t.textMuted
            }`}
          >
            ☀️ Light
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className={`${t.surface} border-b ${t.border}`}>
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="flex items-start justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${t.text} mb-2`}>
                {profile.firstName} {profile.lastName}
              </h1>
              {experiences[0] && (
                <p className={`text-lg ${t.accent} font-medium mb-3`}>
                  {experiences[0].role} at {experiences[0].company}
                </p>
              )}
              <p className={`${t.textMuted} text-sm mb-4`}>{profile.location}</p>
              {profile.bio && (
                <p className={`${t.textMuted} max-w-xl leading-relaxed`}>
                  {profile.bio}
                </p>
              )}
              <div className="flex gap-4 mt-6">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className={`text-sm ${t.textSubtle} ${t.accent} hover:opacity-80 transition`}
                  >
                    ✉ {profile.email}
                  </a>
                )}
                {profile.githubUsername && (
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-sm ${t.textSubtle} hover:${t.accent} transition`}
                  >
                    ⌥ github.com/{profile.githubUsername}
                  </a>
                )}
              </div>
            </div>
            <div className={`hidden md:block w-24 h-24 rounded-2xl ${t.accentBlock} opacity-20`} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-16">

        {/* Skills */}
        {profile.skills.length > 0 && (
          <section id="skills">
            <SectionTitle theme={t}> Skills</SectionTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className={`border ${t.tag} text-sm px-4 py-1.5 rounded-full`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Work Experience */}
        {experiences.length > 0 && (
          <section id="experience">
            <SectionTitle theme={t}>Work Experience</SectionTitle>
            <div className="flex flex-col gap-8 mt-4">
              {experiences.map((exp) => (
                <div key={exp._id} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${t.accentBg} mt-1.5 flex-shrink-0`} />
                    <div className={`w-px flex-1 ${t.timeline} mt-2`} />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${t.text}`}>{exp.role}</h3>
                        <p className={`${t.accent} text-sm mt-0.5`}>{exp.company}</p>
                      </div>
                      <p className={`text-xs ${t.textSubtle} flex-shrink-0 mt-1`}>
                        {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                      </p>
                    </div>
                    {exp.description && (
                      <p className={`${t.textMuted} text-sm mt-2 leading-relaxed`}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section id="education">
            <SectionTitle theme={t}>Education</SectionTitle>
            <div className="flex flex-col gap-6 mt-4">
              {education.map((edu) => (
                <div key={edu._id} className={`rounded-2xl p-6 border ${t.card} shadow-sm`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${t.text}`}>{edu.institution}</h3>
                      <p className={`text-sm ${t.accent} mt-0.5`}>
                        {edu.degree} {edu.field && `· ${edu.field}`}
                      </p>
                    </div>
                    <p className={`text-xs ${t.textSubtle} flex-shrink-0 mt-1`}>
                      {edu.startDate} — {edu.current ? "Present" : edu.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section id="projects">
            <SectionTitle theme={t}>Projects</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {displayed.map((project) => (
                <div
                  key={project._id}
                  className={`rounded-2xl p-6 border ${t.card} shadow-sm ${t.surfaceHover} transition`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${t.text}`}>{project.title}</h3>
                    {project.stars > 0 && (
                      <span className="text-xs text-yellow-500 flex-shrink-0">
                        ★ {project.stars}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className={`text-sm ${t.textMuted} leading-relaxed line-clamp-3`}>
                      {project.description}
                    </p>
                  )}
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.techStack.map((tech) => (
                        <span key={tech} className={`text-xs border ${t.tag} px-2 py-0.5 rounded-full`}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 mt-4">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className={`text-xs ${t.accent} hover:opacity-80 transition`}>
                        Live ↗
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className={`text-xs ${t.textSubtle} hover:${t.text} transition`}>
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {projects.length > 6 && (
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className={`text-sm ${t.accent} hover:opacity-80 transition mx-auto block mt-4`}
              >
                {showAll ? "Show less" : `Show all ${projects.length} projects`}
              </button>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className={`border-t ${t.footer} pt-8 text-center`}>
          <p className={`text-xs ${t.textSubtle}`}>
            Built with <span className="text-emerald-500">eHacks</span> ·{" "}
            {profile.firstName} {profile.lastName}
          </p>
        </footer>
      </div>
    </div>
  );
}

function SectionTitle({ children, theme }: { children: React.ReactNode, theme: typeof themes.dark }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className={`text-lg font-bold ${theme.text}`}>{children}</h2>
      <div className={`flex-1 h-px ${theme.timeline}`} />
    </div>
  );
}