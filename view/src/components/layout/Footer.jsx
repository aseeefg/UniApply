import { Link } from "react-router-dom";
import Letterhead from "../Letterhead";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 pt-12 pb-4">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="max-w-[280px]">
            <Letterhead as="span" compact />
            <p className="text-slate text-sm mt-2">Centralized university admission portal.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="eyebrow">Account</p>
            <Link to="/login" className="text-ink-soft text-sm no-underline hover:text-seal">Log in</Link>
            <Link to="/register" className="text-ink-soft text-sm no-underline hover:text-seal">Register</Link>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="eyebrow">Project</p>
            <a
              href="https://github.com/aseeefg/UniApply"
              target="_blank"
              rel="noreferrer"
              className="text-ink-soft text-sm no-underline hover:text-seal"
            >
              GitHub repository
            </a>
          </div>
        </div>

        <p className="text-center text-slate font-mono text-[0.78rem] mt-10 pb-2">
          UniApply - a CSE470 Software Engineering project.
        </p>
      </div>
    </footer>
  );
}
