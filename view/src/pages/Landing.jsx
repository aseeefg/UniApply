import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="letterhead-mark">UA</div>
          <span>UniApply</span>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn-outline">Log in</Link>
          <Link to="/register" className="btn-solid">Register</Link>
        </div>
      </nav>

      <header className="landing-hero">
        <p className="eyebrow">Centralized Admissions</p>
        <h1>One portal for every university application.</h1>
        <p className="landing-hero-sub">
          Students search, compare, and apply to admission circulars from
          multiple universities in one place. Universities post circulars,
          review applicants, and manage decisions without the paperwork.
        </p>
        <div className="landing-hero-actions">
          <Link to="/register" className="btn-solid btn-lg">Get started</Link>
          <Link to="/login" className="btn-outline btn-lg">I already have an account</Link>
        </div>
      </header>

      <section className="landing-tracks">
        <div className="landing-track">
          <p className="eyebrow">For Students</p>
          <h2>Apply without the chaos</h2>
          <ol className="landing-steps">
            <li>Build your academic profile once</li>
            <li>Search and filter open circulars by program, deadline, or location</li>
            <li>Apply directly and track every application's status in one dashboard</li>
          </ol>
        </div>
        <div className="landing-track">
          <p className="eyebrow">For Universities</p>
          <h2>Manage admissions, not spreadsheets</h2>
          <ol className="landing-steps">
            <li>Get verified and set up your institutional profile</li>
            <li>Post, edit, and close admission circulars in minutes</li>
            <li>Review applicants and update decisions from one place</li>
          </ol>
        </div>
      </section>

      <section className="landing-highlights">
        <div className="landing-highlights-inner">
          <p className="eyebrow eyebrow-light">Why UniApply</p>
          <h2 className="highlights-title">Built for admissions, not generic forms</h2>
          <div className="highlights-grid">
            {[
              {
                num: "01",
                title: "One login, every university",
                desc: "Students stop juggling separate accounts and portals for each university they apply to.",
              },
              {
                num: "02",
                title: "Verified institutions only",
                desc: "Every university account is manually approved by an admin before it can post a circular.",
              },
              {
                num: "03",
                title: "Real-time status tracking",
                desc: "Every application carries a full timestamped history — Submitted through Accepted or Rejected.",
              },
              {
                num: "04",
                title: "Deadline-aware",
                desc: "Circulars close automatically once the deadline passes — no more applying to expired postings.",
              },
              {
                num: "05",
                title: "Role-based access",
                desc: "Students, universities, and admins each see exactly the tools relevant to them, nothing else.",
              },
              {
                num: "06",
                title: "Built for one admissions cycle",
                desc: "Designed around a single semester's admissions workflow, from posting to final decision.",
              },
            ].map((item) => (
              <div className="highlight-card" key={item.num}>
                <span className="highlight-num">{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <div className="landing-brand">
              <div className="letterhead-mark">UA</div>
              <span>UniApply</span>
            </div>
            <p>Centralized university admission portal.</p>
          </div>
          <div className="landing-footer-links">
            <p className="eyebrow">Account</p>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </div>
          <div className="landing-footer-links">
            <p className="eyebrow">Project</p>
            <a href="https://github.com/aseeefg/UniApply" target="_blank" rel="noreferrer">
              GitHub repository
            </a>
          </div>
        </div>
        <p className="landing-copyright">UniApply — a CSE470 Software Engineering project.</p>
      </footer>
    </div>
  );
}
