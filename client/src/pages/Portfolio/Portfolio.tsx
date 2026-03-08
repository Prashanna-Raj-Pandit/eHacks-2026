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

export default function Portfolio() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAll, setShowAll] = useState(false);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading portfolio...</p>
      </div>
    );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              {experiences[0] && (
                <p className="text-lg text-emerald-600 font-medium mb-3">
                  {experiences[0].role} at {experiences[0].company}
                </p>
              )}
              <p className="text-gray-500 text-sm mb-4">{profile.location}</p>
              {profile.bio && (
                <p className="text-gray-600 max-w-xl leading-relaxed">
                  {profile.bio}
                </p>
              )}
              <div className="flex gap-4 mt-6">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-sm text-gray-500 hover:text-emerald-600 transition"
                  >
                    ✉ {profile.email}
                  </a>
                )}
                {profile.githubUsername && (
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-gray-500 hover:text-emerald-600 transition"
                  >
                    ⌥ github.com/{profile.githubUsername}
                  </a>
                )}
              </div>
            </div>
            {/* Accent block */}
            <div className="hidden md:block w-24 h-24 rounded-2xl bg-emerald-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-16">
        {/* Skills */}
        {profile.skills.length > 0 && (
          <section id="skills">
            <SectionTitle>Skills</SectionTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded-full shadow-sm"
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
            <SectionTitle>Work Experience</SectionTitle>
            <div className="flex flex-col gap-8 mt-4">
              {experiences.map((exp) => (
                <div key={exp._id} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div className="w-px flex-1 bg-gray-200 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {exp.role}
                        </h3>
                        <p className="text-emerald-600 text-sm mt-0.5">
                          {exp.company}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0 mt-1">
                        {exp.startDate} —{" "}
                        {exp.current ? "Present" : exp.endDate}
                      </p>
                    </div>
                    {exp.description && (
                      <p className="text-gray-500 text-sm mt-2 leading-relaxed">
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
            <SectionTitle>Education</SectionTitle>
            <div className="flex flex-col gap-6 mt-4">
              {education.map((edu) => (
                <div
                  key={edu._id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {edu.institution}
                      </h3>
                      <p className="text-sm text-emerald-600 mt-0.5">
                        {edu.degree} {edu.field && `· ${edu.field}`}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0 mt-1">
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
            <SectionTitle>Projects</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {displayed.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    {project.stars > 0 && (
                      <span className="text-xs text-yellow-500 flex-shrink-0">
                        ★ {project.stars}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-gray-50 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 mt-4">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-600 hover:text-emerald-500 transition"
                      >
                        Live ↗
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-400 hover:text-gray-600 transition"
                      >
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
                className="text-sm text-emerald-600 hover:text-emerald-500 transition mx-auto block mt-4"
              >
                {showAll ? "Show less" : `Show all ${projects.length} projects`}
              </button>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 text-center">
          <p className="text-xs text-gray-400">
            Built with <span className="text-emerald-500">eHacks</span> ·{" "}
            {profile.firstName} {profile.lastName}
          </p>
        </footer>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-lg font-bold text-gray-900">{children}</h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
