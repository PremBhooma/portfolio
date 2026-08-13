"use client";

import { useEffect, useState } from "react";
import { getContent, updateContent } from "@/lib/api";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

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
      setSuccess("Hero content saved!");
      setTimeout(() => setSuccess(""), 3000);
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
      setSuccess("Contact content saved!");
      setTimeout(() => setSuccess(""), 3000);
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
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <p className="text-gray-400 text-sm mt-1">Edit your portfolio page content</p>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[#111118] p-1 rounded-lg w-fit border border-[#1e1e2e]">
        {["hero", "contact"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab} Section
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {/* Hero Tab */}
        {activeTab === "hero" && (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Name</label>
              <input type="text" value={heroName} onChange={(e) => setHeroName(e.target.value)} className={inputClass} placeholder="Your Name" />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input type="text" value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)} className={inputClass} placeholder="Your tagline" />
            </div>
            <div>
              <label className={labelClass}>Bio</label>
              <textarea value={heroBio} onChange={(e) => setHeroBio(e.target.value)} rows={3} className={`${inputClass} resize-y`} placeholder="Your bio..." />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Highlights</label>
                <button type="button" onClick={() => addHighlight(heroHighlights, setHeroHighlights)} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
              </div>
              <div className="space-y-2">
                {heroHighlights.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={h} onChange={(e) => updateHighlight(heroHighlights, setHeroHighlights, i, e.target.value)} className={`${inputClass} flex-1`} placeholder="⚡ Highlight point" />
                    {heroHighlights.length > 1 && (
                      <button type="button" onClick={() => removeHighlight(heroHighlights, setHeroHighlights, i)} className="px-2 text-gray-500 hover:text-red-400">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Closing Text</label>
              <textarea value={heroClosingText} onChange={(e) => setHeroClosingText(e.target.value)} rows={3} className={`${inputClass} resize-y`} placeholder="Closing paragraph..." />
            </div>
            <div>
              <label className={labelClass}>Fun Fact</label>
              <textarea value={heroFunFact} onChange={(e) => setHeroFunFact(e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="When I'm not coding..." />
            </div>
            <div>
              <label className={labelClass}>CTA Text</label>
              <input type="text" value={heroCtaText} onChange={(e) => setHeroCtaText(e.target.value)} className={inputClass} placeholder="Let's connect! ✨" />
            </div>
            <div className="pt-4 border-t border-[#1e1e2e]">
              <button onClick={saveHero} disabled={saving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                {saving ? "Saving..." : "Save Hero Content"}
              </button>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Intro Text</label>
              <textarea value={contactIntro} onChange={(e) => setContactIntro(e.target.value)} rows={3} className={`${inputClass} resize-y`} placeholder="Introduction..." />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Highlights</label>
                <button type="button" onClick={() => addHighlight(contactHighlights, setContactHighlights)} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
              </div>
              <div className="space-y-2">
                {contactHighlights.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={h} onChange={(e) => updateHighlight(contactHighlights, setContactHighlights, i, e.target.value)} className={`${inputClass} flex-1`} placeholder="🚀 Highlight point" />
                    {contactHighlights.length > 1 && (
                      <button type="button" onClick={() => removeHighlight(contactHighlights, setContactHighlights, i)} className="px-2 text-gray-500 hover:text-red-400">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Connect Text</label>
              <input type="text" value={contactConnectText} onChange={(e) => setContactConnectText(e.target.value)} className={inputClass} placeholder="Let's connect!" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Resume CTA Text</label>
              <input type="text" value={contactResumeText} onChange={(e) => setContactResumeText(e.target.value)} className={inputClass} placeholder="Download my resume!" />
            </div>
            <div>
              <label className={labelClass}>Closing Text</label>
              <textarea value={contactClosingText} onChange={(e) => setContactClosingText(e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="Fun closing text..." />
            </div>
            <div>
              <label className={labelClass}>CTA Text</label>
              <input type="text" value={contactCtaText} onChange={(e) => setContactCtaText(e.target.value)} className={inputClass} placeholder="Let's build something! ✨" />
            </div>
            <div className="pt-4 border-t border-[#1e1e2e]">
              <button onClick={saveContact} disabled={saving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                {saving ? "Saving..." : "Save Contact Content"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
