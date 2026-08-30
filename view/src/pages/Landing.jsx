import { Link } from "react-router-dom";
import { CheckIcon } from "../components/icons";

const tracks = [
  {
    eyebrow: "For Students",
    title: "Apply without the chaos",
    steps: [
      "Build your academic profile once",
      "Search and filter open circulars by program, deadline, or location",
      "Apply directly and track every application's status in one dashboard",
    ],
  },
  {
    eyebrow: "For Universities",
    title: "Manage admissions, not spreadsheets",
    steps: [
      "Get verified and set up your institutional profile",
      "Post, edit, and close admission circulars in minutes",
      "Review applicants and update decisions from one place",
    ],
  },
];

const highlights = [
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
    desc: "Every application carries a full timestamped history - Submitted through Accepted or Rejected.",
  },
  {
    num: "04",
    title: "Deadline-aware",
    desc: "Circulars close automatically once the deadline passes - no more applying to expired postings.",
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
];

// Placeholder testimonials - replace with real user feedback before launch.
const testimonials = [
  {
    role: "Student",
    initials: "S",
    quote:
      "I used to keep track of every university's portal in a spreadsheet. Now I just check one dashboard.",
  },
  {
    role: "University Admin",
    initials: "U",
    quote:
      "Posting a circular and reviewing applicants used to mean juggling emails and spreadsheets. Now it's one place.",
  },
  {
    role: "Student",
    initials: "S",
    quote:
      "Seeing exactly where each application stands - submitted, under review, accepted - removed a lot of guesswork.",
  },
];

export default function Landing() {
  return (
    <div>
      <header className="relative overflow-hidden text-center px-4 pt-16 pb-20 md:pt-24 md:pb-28 border-b-2 border-ink">
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
          <div className="w-[560px] h-[560px] rounded-full border-[16px] border-seal/5 rotate-12" />
          <div className="absolute w-[380px] h-[380px] rounded-full border-[10px] border-brass/10 -rotate-6" />
        </div>

        <p className="eyebrow justify-center flex">Centralized Admissions</p>
        <h1 className="text-3xl md:text-4xl leading-tight max-w-[620px] mx-auto mt-2 mb-4">
          One portal for every university application.
        </h1>
        <p className="max-w-[560px] mx-auto mb-8 text-ink-soft text-[1.05rem] leading-relaxed">
          Students search, compare, and apply to admission circulars from
          multiple universities in one place. Universities post circulars,
          review applicants, and manage decisions without the paperwork.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/register" className="btn-solid btn-lg">Get started</Link>
          <Link to="/login" className="btn-outline btn-lg">I already have an account</Link>
        </div>
      </header>

      <section className="max-w-[1000px] mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {tracks.map((track) => (
          <div
            key={track.eyebrow}
            className="bg-card border border-border border-l-4 border-l-brass rounded-lg p-7 shadow-[0_1px_3px_rgba(24,42,34,0.06)]"
          >
            <p className="eyebrow">{track.eyebrow}</p>
            <h2 className="text-xl mt-1 mb-4">{track.title}</h2>
            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              {track.steps.map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-seal/10 text-seal flex items-center justify-center">
                    <CheckIcon width={14} height={14} />
                  </span>
                  <span className="text-ink-soft text-[0.95rem] leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="landing-highlights">
        <div className="landing-highlights-inner">
          <p className="eyebrow eyebrow-light">Why UniApply</p>
          <h2 className="highlights-title">Built for admissions, not generic forms</h2>
          <div className="highlights-grid">
            {highlights.map((item) => (
              <div className="highlight-card" key={item.num}>
                <span className="highlight-num">{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1000px] mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-10">
          <p className="eyebrow justify-center flex">What People Are Saying</p>
          <h2 className="text-2xl mt-1">Trusted by students and universities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg shadow-[0_1px_3px_rgba(24,42,34,0.06)] p-6 flex flex-col"
            >
              <div className="text-brass mb-4 tracking-wide" aria-hidden="true">★★★★★</div>
              <p className="text-ink-soft text-sm leading-relaxed italic border-b border-border pb-4 mb-4">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <span className="avatar">{t.initials}</span>
                <span className="text-sm text-slate">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
