"use client";

import { useEffect, useState } from "react";
import { getContent, updateContent } from "@/lib/api";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("hero"); // "hero" | "contact"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  // Hero fields
  const [heroName, setHeroName] = useState("");
  const [heroTagline, setHeroTagline] = useState("");
  const [heroBio, setHeroBio] = useState("");
  const [heroHighlights, setHeroHighlights] = useState([""]);
  const [heroClosingText, setHeroClosingText] = useState("");
  const [heroFunFact, setHeroFunFact] = useState("");
  const [heroCtaText, setHeroCtaText] = useState("");

  // Contact fields
  const [contactIntro, setContactIntro] = useState("");
  const [contactHighlights, setContactHighlights] = useState([""]);
  const [contactConnectText, setContactConnectText] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactResumeText, setContactResumeText] = useState("");
  const [contactClosingText, setContactClosingText] = useState("");
  const [contactCtaText, setContactCtaText] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [heroRes, contactRes] = await Promise.allSettled([
          getContent("hero"),
          getContent("contact"),
        ]);

        if (heroRes.status === "fulfilled") {
          const h = heroRes.value.data;
          setHeroName(h.name || "");
          setHeroTagline(h.tagline || "");
          setHeroBio(h.bio || "");
          setHeroHighlights(h.highlights?.length ? h.highlights : [""]);
          setHeroClosingText(h.closingText || "");
          setHeroFunFact(h.funFact || "");
          setHeroCtaText(h.ctaText || "");
        }

        if (contactRes.status === "fulfilled") {
          const c = contactRes.value.data;
          setContactIntro(c.intro || "");
          setContactHighlights(c.highlights?.length ? c.highlights : [""]);
          setContactConnectText(c.connectText || "");
          setContactPhone(c.phone || "");
          setContactEmail(c.email || "");
          setContactResumeText(c.resumeText || "");
          setContactClosingText(c.closingText || "");
          setContactCtaText(c.ctaText || "");
        }
      } catch (err) {
        console.error("Failed to load content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const saveHero = async () => {
    setSaving(true);
    setSuccess("");
    try {
      await updateContent("hero", {
        name: heroName,
        tagline: heroTagline,
        bio: heroBio,
        highlights: heroHighlights.filter(Boolean),
        closingText: heroClosingText,
        funFact: heroFunFact,
        ctaText: heroCtaText,
      });
      setSuccess("Hero section updated successfully!");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveContact = async () => {
    setSaving(true);
    setSuccess("");
    try {
      await updateContent("contact", {
        intro: contactIntro,
        highlights: contactHighlights.filter(Boolean),
        connectText: contactConnectText,
        phone: contactPhone,
        email: contactEmail,
        resumeText: contactResumeText,
        closingText: contactClosingText,
        ctaText: contactCtaText,
      });
      setSuccess("Contact section updated successfully!");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateHighlight = (list, setList, index, value) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addHighlight = (list, setList) => {
    setList([...list, ""]);
  };

  const removeHighlight = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[#111118] border border-[#1e1e2e] rounded-lg animate-pulse" />
        <div className="h-64 bg-[#111118] border border-[#1e1e2e] rounded-xl animate-pulse" />
      </div>
    );
  }

  const inputClass = "w-full px-3 py-1.5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClass = "block text-xs font-medium text-gray-300 mb-1";

  return (
    <div className="space-y-4 max-w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e1e2e] pb-3">
        <div>
          <h1 className="text-xl font-bold text-white">Content Management</h1>
          <p className="text-gray-400 text-xs mt-0.5">Edit text copy and preview live frontend display</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Section Tabs */}
          <div className="flex items-center bg-[#111118] p-0.5 rounded-md border border-[#1e1e2e]">
            <button
              onClick={() => setActiveTab("hero")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === "hero" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              Hero Section
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === "contact" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              Contact Section
            </button>
          </div>

          {/* Live Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border transition-colors ${showPreview
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                : "bg-[#111118] text-gray-400 border-[#1e1e2e] hover:text-white"
              }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? "Hide Live Preview" : "Show Live Preview"}
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-md px-3 py-2 flex items-center justify-between">
          <span>{success}</span>
          <span className="text-[10px] text-emerald-500">Saved to DB</span>
        </div>
      )}

      {/* Main Grid: Editor Form + Live Preview */}
      <div className={`grid grid-cols-1 ${showPreview ? "lg:grid-cols-2" : "max-w-full"} gap-4`}>
        {/* Left Column: Form Editor */}
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-2">
            <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              {activeTab === "hero" ? "Hero Section Form" : "Contact Section Form"}
            </h2>
            <span className="text-[10px] text-gray-500">Auto-synced to preview</span>
          </div>

          {/* Hero Form */}
          {activeTab === "hero" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={heroName} onChange={(e) => setHeroName(e.target.value)} className={inputClass} placeholder="Prem Bhooma" />
              </div>

              <div>
                <label className={labelClass}>Tagline</label>
                <input type="text" value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)} className={inputClass} placeholder="Full-Stack Developer & Digital Craftsman" />
              </div>

              <div>
                <label className={labelClass}>Bio Description</label>
                <textarea value={heroBio} onChange={(e) => setHeroBio(e.target.value)} rows={3} className={`${inputClass} resize-y`} placeholder="Your bio..." />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelClass}>Highlights List</label>
                  <button type="button" onClick={() => addHighlight(heroHighlights, setHeroHighlights)} className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium">
                    + Add Item
                  </button>
                </div>
                <div className="space-y-1.5">
                  {heroHighlights.map((h, i) => (
                    <div key={i} className="flex gap-1.5">
                      <input type="text" value={h} onChange={(e) => updateHighlight(heroHighlights, setHeroHighlights, i, e.target.value)} className={`${inputClass} flex-1`} placeholder="⚡ Need a pixel-perfect UI?" />
                      {heroHighlights.length > 1 && (
                        <button type="button" onClick={() => removeHighlight(heroHighlights, setHeroHighlights, i)} className="px-2 text-gray-500 hover:text-red-400 text-sm">×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Closing Paragraph</label>
                <textarea value={heroClosingText} onChange={(e) => setHeroClosingText(e.target.value)} rows={3} className={`${inputClass} resize-y`} placeholder="With a knack for turning ideas into high-performance web apps..." />
              </div>

              <div>
                <label className={labelClass}>Fun Fact</label>
                <textarea value={heroFunFact} onChange={(e) => setHeroFunFact(e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="When I'm not conquering the web..." />
              </div>

              <div>
                <label className={labelClass}>CTA Button / Link Text</label>
                <input type="text" value={heroCtaText} onChange={(e) => setHeroCtaText(e.target.value)} className={inputClass} placeholder="Let's build something awesome together! CONTACT ME ✨" />
              </div>

              <div className="pt-3 border-t border-[#1e1e2e]">
                <button
                  onClick={saveHero}
                  disabled={saving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Hero Section"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Contact Form */}
          {activeTab === "contact" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Introduction Paragraph</label>
                <textarea value={contactIntro} onChange={(e) => setContactIntro(e.target.value)} rows={3} className={`${inputClass} resize-y`} placeholder="I don't just code—I architect mind-blowing digital universes!..." />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelClass}>Highlights List</label>
                  <button type="button" onClick={() => addHighlight(contactHighlights, setContactHighlights)} className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium">
                    + Add Item
                  </button>
                </div>
                <div className="space-y-1.5">
                  {contactHighlights.map((h, i) => (
                    <div key={i} className="flex gap-1.5">
                      <input type="text" value={h} onChange={(e) => updateHighlight(contactHighlights, setContactHighlights, i, e.target.value)} className={`${inputClass} flex-1`} placeholder="🚀 Need a UI so perfect it'll make your jaw drop?" />
                      {contactHighlights.length > 1 && (
                        <button type="button" onClick={() => removeHighlight(contactHighlights, setContactHighlights, i)} className="px-2 text-gray-500 hover:text-red-400 text-sm">×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Connect Heading Text</label>
                <input type="text" value={contactConnectText} onChange={(e) => setContactConnectText(e.target.value)} className={inputClass} placeholder="Let's connect and create the future! Hit me up at:" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} placeholder="+91 917788 1213" />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} placeholder="bhoomasagar1213@gmail.com" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Resume Download CTA Text</label>
                <input type="text" value={contactResumeText} onChange={(e) => setContactResumeText(e.target.value)} className={inputClass} placeholder="Snag my resume and see the madness for yourself!" />
              </div>

              <div>
                <label className={labelClass}>Closing Paragraph</label>
                <textarea value={contactClosingText} onChange={(e) => setContactClosingText(e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="When I'm not coding up a storm, catch me grooving to Pop beats..." />
              </div>

              <div>
                <label className={labelClass}>CTA Button / Link Text</label>
                <input type="text" value={contactCtaText} onChange={(e) => setContactCtaText(e.target.value)} className={inputClass} placeholder="Let's ignite something legendary together! CONTACT ME ✨" />
              </div>

              <div className="pt-3 border-t border-[#1e1e2e]">
                <button
                  onClick={saveContact}
                  disabled={saving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Contact Section"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Real-Time Frontend Preview */}
        {showPreview && (
          <div className="space-y-2">
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-gray-300">Live Frontend Preview</span>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono">
                {activeTab === "hero" ? "Target: /home" : "Target: /contact"}
              </span>
            </div>

            {/* Simulated Live Viewport Card */}
            <div className="bg-[#050508] border border-[#1e1e2e] rounded-lg p-5 min-h-[550px] relative overflow-hidden shadow-2xl space-y-4">
              {/* Background gradient accent */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

              {activeTab === "hero" ? (
                /* HERO LIVE PREVIEW */
                <div className="space-y-4 text-xs">
                  {/* Name Title */}
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-500 drop-shadow">
                    {heroName || "Your Name"}
                  </h1>

                  {heroTagline && (
                    <p className="text-indigo-400 text-xs font-medium uppercase tracking-wider">{heroTagline}</p>
                  )}

                  <div className="space-y-3 text-gray-300 leading-relaxed font-light">
                    {heroBio && <p>{heroBio}</p>}

                    {heroHighlights.filter(Boolean).length > 0 && (
                      <ul className="space-y-1 pl-1">
                        {heroHighlights.filter(Boolean).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-gray-300">
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {heroClosingText && <p>{heroClosingText}</p>}
                    {heroFunFact && <p className="text-gray-400 italic">{heroFunFact}</p>}
                  </div>

                  {heroCtaText && (
                    <div className="pt-3">
                      <span className="inline-flex items-center text-xs font-medium text-yellow-400 hover:underline cursor-pointer">
                        {heroCtaText}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* CONTACT LIVE PREVIEW */
                <div className="space-y-4 text-xs">
                  <div className="border-b border-[#1e1e2e] pb-2">
                    <h2 className="text-lg font-bold text-white">Contact & Connect</h2>
                  </div>

                  <div className="space-y-3 text-gray-300 leading-relaxed font-light">
                    {contactIntro && <p>{contactIntro}</p>}

                    {contactHighlights.filter(Boolean).length > 0 && (
                      <ul className="space-y-1 pl-1">
                        {contactHighlights.filter(Boolean).map((item, idx) => (
                          <li key={idx} className="text-gray-300">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    {contactConnectText && <p className="font-medium text-white">{contactConnectText}</p>}

                    <div className="space-y-1 bg-[#111118] border border-[#1e1e2e] rounded-md p-2.5 font-mono text-[11px]">
                      {contactPhone && (
                        <p className="text-gray-300">
                          📞 Phone: <span className="text-indigo-400">{contactPhone}</span>
                        </p>
                      )}
                      {contactEmail && (
                        <p className="text-gray-300">
                          📧 Email: <span className="text-indigo-400">{contactEmail}</span>
                        </p>
                      )}
                    </div>

                    {contactResumeText && (
                      <p className="text-gray-400">
                        {contactResumeText}{" "}
                        <span className="text-emerald-400 underline font-medium cursor-pointer">
                          Download Resume
                        </span>
                      </p>
                    )}

                    {contactClosingText && <p>{contactClosingText}</p>}
                  </div>

                  {contactCtaText && (
                    <div className="pt-2">
                      <span className="inline-flex items-center text-xs font-medium text-yellow-400 hover:underline cursor-pointer">
                        {contactCtaText}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
