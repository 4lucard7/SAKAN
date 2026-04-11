import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/90 px-4 py-6 text-center text-sm text-slate-500">
      <div className="mx-auto max-w-6xl">
        <p>© {new Date().getFullYear()} Sakan. All rights reserved.</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <Link to="#" className="hover:text-slate-600">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="#" className="hover:text-slate-600">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="#" className="hover:text-slate-600">
            Help Center
          </Link>
        </div>
      </div>
    </footer>
  )
}
