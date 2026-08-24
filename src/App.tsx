import { useEffect, useMemo, useRef, useState } from "react";
import contentJson from "./content.json";
import type { Experience, Locale, Localized, Project, ProjectCategory, SkillGroup } from "./types";

interface Content {
  profile: Record<string, string | Localized>;
  ui: Record<string, Localized>;
  stats: { value: string; label: Localized }[];
  featured: Project[];
  laboratory: Project[];
  experiences: Experience[];
  skillGroups: SkillGroup[];
  education: { period: string; school: string; degree: Localized }[];
  beyond: { title: Localized; text: Localized }[];
}

const content = contentJson as unknown as Content;
const categories: (ProjectCategory | "all")[] = ["all", "ai", "data", "automation", "maker"];

const text = (value: Localized | string, locale: Locale) => typeof value === "string" ? value : value[locale];

function VisibilityBadge({ project, locale }: { project: Project; locale: Locale }) {
  const label = project.visibility === "private" ? content.ui.confidential : project.visibility === "fork" ? content.ui.fork : content.ui.public;
  return <span className={`visibility visibility--${project.visibility}`}><i />{text(label, locale)}</span>;
}

function ProjectDialog({ project, locale, onClose }: { project: Project | null; locale: Locale; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (project && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [project]);

  return (
    <dialog ref={dialogRef} className="project-dialog" onClose={onClose} aria-labelledby="dialog-title">
      {project && (
        <div className="dialog-shell">
          <div className="dialog-topline">
            <VisibilityBadge project={project} locale={locale} />
            <button className="close-button" type="button" onClick={() => dialogRef.current?.close()} aria-label={text(content.ui.close, locale)}>×</button>
          </div>
          <header className="dialog-header">
            <p className="mono">{project.index ?? "LAB"} · {text(project.subtitle, locale)}</p>
            <h2 id="dialog-title">{project.title}</h2>
            <p className="dialog-overview">{text(project.overview, locale)}</p>
            <div className="tag-list">{project.tech.map((item) => <span key={item}>{item}</span>)}</div>
          </header>
          <div className="dialog-content">
            <section><span className="case-number">01</span><h3>{text(content.ui.problem, locale)}</h3><p>{text(project.challenge, locale)}</p></section>
            <section><span className="case-number">02</span><h3>{text(content.ui.approach, locale)}</h3><p>{text(project.solution, locale)}</p></section>
            <section><span className="case-number">03</span><h3>{text(content.ui.outcome, locale)}</h3><p>{text(project.impact, locale)}</p></section>
            <aside><span className="case-number">STATUS</span><h3>{text(content.ui.currentStatus, locale)}</h3><p>{text(project.status, locale)}</p></aside>
          </div>
          {project.url && <a className="dialog-link" href={project.url} target="_blank" rel="noreferrer">{text(content.ui.source, locale)} <span>↗</span></a>}
        </div>
      )}
    </dialog>
  );
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem("portfolio-locale") as Locale) || "fr");
  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("portfolio-theme") as "dark" | "light") || "dark");
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const allProjects = useMemo(() => [...content.featured, ...content.laboratory], []);
  const labProjects = useMemo(() => filter === "all" ? content.laboratory : content.laboratory.filter((project) => project.categories.includes(filter)), [filter]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-locale", locale);
    localStorage.setItem("portfolio-theme", theme);
    document.title = locale === "fr" ? "Guillaume de Cadoudal — AI & Python Engineer" : "Guillaume de Cadoudal — AI & Python Engineer portfolio";
    const description = locale === "fr" ? "AI & Python Engineer — agents IA, RAG, MCP, Data Engineering et automatisation." : "AI & Python Engineer — AI agents, RAG, MCP, Data Engineering and automation.";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [locale, theme]);

  useEffect(() => {
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  useEffect(() => {
    const openFromHash = () => {
      const match = window.location.hash.match(/^#project=(.+)$/);
      if (match) setSelectedProject(allProjects.find((project) => project.id === match[1]) ?? null);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [allProjects]);

  const openProject = (project: Project) => {
    setSelectedProject(project);
    history.replaceState(null, "", `#project=${project.id}`);
  };

  const closeProject = () => {
    setSelectedProject(null);
    if (window.location.hash.startsWith("#project=")) history.replaceState(null, "", "#projects");
  };

  const navItems = [
    [content.ui.navProjects, "#projects"],
    [content.ui.navExperience, "#experience"],
    [content.ui.navSkills, "#skills"],
    [content.ui.navContact, "#contact"],
  ] as const;

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="reading-progress" style={{ transform: `scaleX(${progress / 100})` }} />
      <header className="site-header">
        <nav className="nav container" aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"}>
          <a className="mark" href="#top" title="Guillaume de Cadoudal — accueil">G·C</a>
          <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            {navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{text(label, locale)}</a>)}
          </div>
          <div className="nav-actions">
            <button type="button" className="utility language-button" onClick={() => setLocale(locale === "fr" ? "en" : "fr")} aria-label={locale === "fr" ? "FR — Switch to English" : "EN — Passer en français"}>{locale.toUpperCase()}</button>
            <button type="button" className="utility theme-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={locale === "fr" ? "Changer de thème" : "Toggle theme"}><span aria-hidden="true">{theme === "dark" ? "☼" : "◐"}</span></button>
            <button type="button" className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={locale === "fr" ? "Ouvrir le menu" : "Open menu"}><span /><span /></button>
          </div>
        </nav>
      </header>

      <main id="main">
        <section className="hero container" id="top">
          <div className="hero-copy">
            <p className="eyebrow reveal"><span />{text(content.profile.availability as Localized, locale)}</p>
            <h1 className="reveal reveal-delay-1">{text(content.profile.headlineA as Localized, locale)}<br /><em>{text(content.profile.headlineB as Localized, locale)}</em></h1>
            <p className="lede reveal reveal-delay-2">{text(content.profile.intro as Localized, locale)}</p>
            <div className="hero-actions reveal reveal-delay-3">
              <a className="primary" href="#projects">{text(content.ui.explore, locale)} <span>↘</span></a>
              <a className="secondary" href="mailto:guillaumedecadoudal@gmail.com">{text(content.ui.contact, locale)}</a>
            </div>
          </div>
          <div className="hero-system" aria-hidden="true">
            <div className="system-orbit orbit-a"><span>RAG</span></div>
            <div className="system-orbit orbit-b"><span>MCP</span></div>
            <div className="system-orbit orbit-c"><span>DATA</span></div>
            <div className="system-core"><strong>AI</strong><small>PYTHON</small></div>
          </div>
          <div className="signals" aria-label={locale === "fr" ? "Compétences principales" : "Core skills"}>
            {["Agents IA", "RAG", "MCP", "Python", "Data", "Docker"].map((signal) => <span key={signal}>{signal}</span>)}
          </div>
        </section>

        <section className="about-section section-pad">
          <div className="container about-grid">
            <h2 className="section-label"><span>00</span>{text(content.profile.role as Localized, locale)}</h2>
            <p className="about-copy">{text(content.profile.about as Localized, locale)}</p>
            <div className="stats">
              {content.stats.map((stat) => <div key={stat.value}><strong>{stat.value}</strong><span>{text(stat.label, locale)}</span></div>)}
            </div>
          </div>
        </section>

        <section className="section-pad projects-section" id="projects">
          <div className="container">
            <div className="section-heading">
              <h2 className="section-label"><span>01</span>{text(content.ui.selected, locale)}</h2>
              <p>{text(content.ui.selectedIntro, locale)}</p>
            </div>
            <div className="featured-grid">
              {content.featured.map((project) => (
                <button className={`featured-card ${project.media ? "has-media" : ""}`} key={project.id} onClick={() => openProject(project)}>
                  {project.media && <img src={`${import.meta.env.BASE_URL}${project.media}`} alt="" loading="lazy" />}
                  <div className="card-wash" />
                  {!project.media && <div className="card-diagram" aria-hidden="true"><i /><i /><i /></div>}
                  <div className="card-top"><span className="project-index">{project.index}</span><VisibilityBadge project={project} locale={locale} /></div>
                  <div className="card-copy"><p className="mono">{text(project.subtitle, locale)}</p><h3>{project.title}</h3><p>{text(project.overview, locale)}</p><div className="card-footer"><div className="tag-list">{project.tech.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><span className="card-arrow">↗</span></div></div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad lab-section" id="laboratory">
          <div className="container">
            <div className="section-heading lab-heading">
              <div><h2 className="section-label"><span>02</span>{text(content.ui.laboratory, locale)}</h2><p>{text(content.ui.laboratoryIntro, locale)}</p></div>
              <div className="filters" role="group" aria-label={locale === "fr" ? "Filtrer les projets" : "Filter projects"}>
                {categories.map((category) => <button key={category} className={filter === category ? "is-active" : ""} onClick={() => setFilter(category)}>{text(content.ui[category], locale)}</button>)}
              </div>
            </div>
            <div className="lab-grid" aria-live="polite">
              {labProjects.map((project) => (
                <button className="lab-card" key={project.id} onClick={() => openProject(project)}>
                  <div className="lab-card-top"><VisibilityBadge project={project} locale={locale} /><span>↗</span></div>
                  <div><p className="mono">{project.categories.join(" · ")}</p><h3>{project.title}</h3><p>{text(project.overview, locale)}</p></div>
                  <div className="tag-list">{project.tech.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad experience-section" id="experience">
          <div className="container">
            <div className="section-heading">
              <h2 className="section-label"><span>03</span>{text(content.ui.career, locale)}</h2>
              <p>{text(content.ui.careerIntro, locale)}</p>
            </div>
            <div className="timeline">
              {content.experiences.map((experience, index) => (
                <article className="timeline-item" key={`${experience.company}-${experience.period}`}>
                  <div className="timeline-meta"><span>{String(index + 1).padStart(2, "0")}</span><time>{experience.period}</time></div>
                  <div className="timeline-title"><h3>{text(experience.role, locale)}</h3><p>{experience.company} · {experience.location}</p></div>
                  <div className="timeline-body"><p>{text(experience.summary, locale)}</p><ul>{experience.highlights.map((item, itemIndex) => <li key={itemIndex}>{text(item, locale)}</li>)}</ul><div className="tag-list">{experience.tech.map((item) => <span key={item}>{item}</span>)}</div></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad skills-section" id="skills">
          <div className="container">
            <div className="section-heading"><h2 className="section-label"><span>04</span>{text(content.ui.skills, locale)}</h2><p>{text(content.ui.skillsIntro, locale)}</p></div>
            <div className="skill-grid">
              {content.skillGroups.map((group, index) => <article className="skill-card" key={group.title.fr}><span className="skill-index">0{index + 1}</span><h3>{text(group.title, locale)}</h3><p>{text(group.intro, locale)}</p><div className="skill-list">{group.items.map((item) => <span key={item}>{item}</span>)}</div></article>)}
            </div>
          </div>
        </section>

        <section className="section-pad education-section">
          <div className="container">
            <div className="section-heading"><h2 className="section-label"><span>05</span>{text(content.ui.education, locale)}</h2><p>{text(content.ui.educationIntro, locale)}</p></div>
            <div className="education-grid">
              <div className="education-list">{content.education.map((item) => <article key={item.school}><time>{item.period}</time><div><h3>{item.school}</h3><p>{text(item.degree, locale)}</p></div></article>)}</div>
              <div className="beyond-grid">{content.beyond.map((item) => <article key={item.title.fr}><span>↳</span><h3>{text(item.title, locale)}</h3><p>{text(item.text, locale)}</p></article>)}</div>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="container contact-inner">
            <p className="eyebrow"><span />{text(content.profile.availability as Localized, locale)}</p>
            <h2>{text(content.ui.contactTitle, locale)}</h2>
            <p>{text(content.ui.contactIntro, locale)}</p>
            <div className="contact-actions"><a className="primary" href="mailto:guillaumedecadoudal@gmail.com">{text(content.ui.emailMe, locale)} <span>↗</span></a><a className="secondary" href={`${import.meta.env.BASE_URL}Guillaume_de_Cadoudal_CV_AI_Python_Engineer.pdf`} download>{text(content.ui.downloadCv, locale)} <span>↓</span></a></div>
            <div className="social-links"><a href="https://github.com/kaa-serpent/" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/guillaume2cadoudal/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="mailto:guillaumedecadoudal@gmail.com">Email ↗</a></div>
          </div>
        </section>
      </main>

      <footer><div className="container"><a className="mark" href="#top">G·C</a><p>{text(content.ui.footer, locale)}</p><span>© {new Date().getFullYear()}</span></div></footer>
      <ProjectDialog project={selectedProject} locale={locale} onClose={closeProject} />
    </>
  );
}
