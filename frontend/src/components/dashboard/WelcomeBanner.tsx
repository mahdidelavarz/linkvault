"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

const QUOTES = [
  "Knowledge is power. Keep it organized! 🚀",
  "Your digital brain, beautifully organized. 🧠",
  "Every great project starts with a saved link. 🔗",
  "Stay focused, stay organized. ✨",
  "Your second brain is getting smarter! 💡",
];

export default function WelcomeBanner() {
  const user = useAuthStore((state) => state.user);
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="welcome-banner">
        <div className="welcome-banner-content">
          <h2 className="welcome-banner-greeting">
            {greeting && `${greeting}, `}{user?.username || "there"}! 👋
          </h2>
          <p className="welcome-banner-quote">{quote}</p>
        </div>
        <div className="welcome-banner-icon" aria-hidden="true">
          🗂️
        </div>
      </div>
    </>
  );
}

const CSS = `
.welcome-banner {
  display:          flex;
  align-items:      center;
  justify-content:  space-between;
  gap:              20px;
  padding:          24px 28px;
  background:       linear-gradient(135deg, var(--primary, #3b82f6) 0%, #8b5cf6 100%);
  border-radius:    var(--radius-xl);
  color:            #fff;
  overflow:         hidden;
  position:         relative;
}
.welcome-banner::before {
  content:          '';
  position:         absolute;
  top:              -50%;
  right:            -10%;
  width:            300px;
  height:           300px;
  background:       rgba(255,255,255,0.06);
  border-radius:    50%;
  pointer-events:   none;
}
.welcome-banner-content {
  position:    relative;
  z-index:     1;
  flex:        1;
  min-width:   0;
}
.welcome-banner-greeting {
  font-size:       var(--text-2xl);
  font-weight:     700;
  letter-spacing:  -0.02em;
  margin-bottom:   4px;
}
.welcome-banner-quote {
  font-size:   var(--text-sm);
  opacity:     0.85;
  color:       rgba(255,255,255,0.9);
}
.welcome-banner-icon {
  font-size:      56px;
  flex-shrink:    0;
  position:       relative;
  z-index:        1;
  opacity:        0.7;
}
@media (max-width: 639px) {
  .welcome-banner {
    padding: 18px 20px;
    gap:    12px;
  }
  .welcome-banner-greeting { font-size: var(--text-xl); }
  .welcome-banner-icon     { font-size: 40px; }
}
@media (max-width: 479px) {
  .welcome-banner-icon { display: none; }
}
`;