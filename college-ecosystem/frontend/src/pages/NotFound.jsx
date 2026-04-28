import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 mesh-bg">
      <div className="text-8xl mb-6 opacity-20">🎓</div>
      <h1 className="text-6xl font-display font-bold gradient-text mb-3">404</h1>
      <p className="text-white/40 text-xl mb-2">Page not found</p>
      <p className="text-white/25 text-sm mb-8">Looks like you wandered off campus!</p>
      <Link to="/" className="btn-primary">← Back to Home</Link>
    </div>
  );
}
