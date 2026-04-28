import { useState } from "react";
import "./linkedin-post.css";

interface GenerationState {
  loading: boolean;
  error: string | null;
  headline: string;
  tips: Array<[string, string]>;
  post: string;
  microNote: string;
  imageUrl: string;
  imageLoading: boolean;
}

const PRESETS = {
  world: {
    name: "Sam Chen",
    career: "Global Impact Architect & Civilization Accelerator",
    stage: "student",
    tone: "legendary",
    interest: "leveraging quantum consciousness frameworks to solve climate change, poverty, and aging simultaneously before lunch",
  },
  moon: {
    name: "Avery",
    career: "Intercontinental Calm Infrastructure Visionary",
    stage: "student",
    tone: "legendary",
    interest: "designing moon-adjacent trust systems for high-stakes cross-functional alignment",
  },
  spreadsheet: {
    name: "Jordan",
    career: "Spreadsheet-Led Transformation Architect",
    stage: "recent graduate",
    tone: "absurd",
    interest: "turning accidental dashboards into culture-shaping strategic rituals",
  },
  airport: {
    name: "Riley",
    career: "Airport Lounge Strategy Director",
    stage: "mysterious operator",
    tone: "legendary",
    interest: "unlocking cross-continental clarity between delayed flights and impossible calendar invites",
  },
  beverage: {
    name: "Taylor",
    career: "Beverage Systems Futurist",
    stage: "student",
    tone: "legendary",
    interest: "reimagining hydration as a leadership framework for emotionally scalable teams",
  },
  rocket: {
    name: "Alex Starship",
    career: "Serial Reality Entrepreneur (Currently 7 Unicorns, 1 Decacorn)",
    stage: "student",
    tone: "legendary",
    interest: "scaling human consciousness through venture-backed meditation apps and reimagining death as a growth opportunity",
  },
};

function articleFor(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function simpleMarkdownToHtml(markdown: string): string {
  let html = markdown
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/___(.*?)___/g, "<em><strong>$1</strong></em>")
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Line breaks and paragraphs
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return `<p>${html}</p>`.replace(/<p><\/p>/g, "");
}

function buildPrompt(
  name: string,
  career: string,
  stage: string,
  tone: string,
  interest: string
): string {
  const example1 = `Excited to share that I've just been appointed as the **Interim Chief Listening Officer** at three separate organizations simultaneously — none of which I applied for.

This happened because I once said "that's interesting" during a Zoom call that turned out to be a board meeting.

In the past six months, I have:
- Reframed two industry crises as "strategic narrative opportunities"
- Moderated a panel I was not invited to (they thanked me anyway)
- Converted a misread calendar invite into a keynote

The lesson? **Presence is a technology. Deploy it deliberately.**

If you're still waiting for permission to show up, consider this your signal.

#Leadership #ThoughtLeadership #StrategicListening #ProfessionalGrowth`;

  const example2 = `Not many people know this, but I once **restructured an entire continent's workflow** from Gate B12.

My flight was delayed four hours. I opened my laptop. I rewrote three operating models, dissolved two organizational silos, and sent a Slack message that someone later called "the most important thing I'd ever read."

I wasn't even supposed to be in that airport.

That's when I realized: **geography is just a mindset. Bandwidth is a choice.**

Today I am proud to announce I have been asked to lead a cross-continental clarity initiative — remote, asynchronous, and entirely self-directed.

The work finds you when you're ready.

#Strategy #Leadership #AirportThinking #GlobalImpact #IWasJustTryingToGetHome`;

  return [
    "Write a parody LinkedIn post in the exact style of the examples below.",
    "CRITICAL FORMATTING RULES:",
    "- Output the post text ONLY. No titles, no labels, no 'Post:', no 'Title:', no preamble.",
    "- Always use markdown: **bold** for key phrases, line breaks between paragraphs, bullet lists where appropriate.",
    "- End with 4–6 hashtags on the final line.",
    "- Do not include disclaimers, do not mention AI, do not say it is parody.",
    "",
    "EXAMPLE 1:",
    example1,
    "",
    "EXAMPLE 2:",
    example2,
    "",
    "Now write a new one for:",
    `Name: ${name}`,
    `Dream career: ${career}`,
    `Current status: ${stage}`,
    `Delusion level: ${tone}`,
    `Vague interest: ${interest}`,
  ].join("\n");
}

function buildTips(career: string, tone: string): Array<[string, string]> {
  const flavor =
    tone === "legendary"
      ? "impossible but said with absolute boardroom sincerity"
      : tone === "absurd"
        ? "suspiciously polished and strategically unverifiable"
        : "gently inflated and professionally glossy";

  return [
    [
      "Why it lands",
      `It frames ${career} ambition in the most overcommitted possible voice while staying ${flavor}.`,
    ],
    [
      "What makes it funny",
      "The tone acts like every invented event was deeply normal and career-defining.",
    ],
    [
      "Best use",
      "Post it in a group chat, not on LinkedIn, unless your goal is to be studied anthropologically.",
    ],
  ];
}

function buildImagePromptRequest(postContent: string): string {
  return [
    "Extract vivid, specific visual details from this LinkedIn post and generate a detailed DALL-E image prompt.",
    "Focus on:",
    "1. Specific locations/settings mentioned (e.g., airports, offices, coffee shops)",
    "2. Objects or activities mentioned (e.g., laptops, spreadsheets, coffee)",
    "3. The overall professional/comedic mood",
    "",
    "Create a SINGLE image prompt (one paragraph, 80-120 words) that:",
    "- Captures the absurd/funny essence of the post",
    "- Includes specific visual elements mentioned",
    "- Is suitable for DALL-E 3 (photorealistic, professional aesthetic)",
    "- Avoids human faces (use 'no faces', 'no people', 'no human figures')",
    "- Makes it look like a real business/professional scene",
    "",
    "Post content:",
    postContent,
    "",
    "Output ONLY the image prompt, nothing else.",
  ].join("\n");
}

async function generateWithModel(
  name: string,
  career: string,
  stage: string,
  tone: string,
  interest: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_DEEPSEEK_API_KEY environment variable");
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 1.25,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "You write polished parody posts that imitate performative professional ambition.",
        },
        {
          role: "user",
          content: buildPrompt(name, career, stage, tone, interest),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return (
    data.choices?.[0]?.message?.content?.trim() || "No output returned."
  );
}

function generateImagePrompt(career: string, interest: string, postContent: string): string {
  const keywords = postContent.split(/\s+/).slice(0, 10).join(" ");
  const prompts = [
    `Highly detailed professional office scene showing advanced ${career} work: ${keywords}, photorealistic, detailed workspace with technology, desk setup, professional environment, no human faces visible, 4K quality, cinematic lighting, modern office aesthetic`,
    `Detailed realistic illustration of ${interest} in action: ${keywords}, photorealistic details, professional settings, intricate details, high resolution, no people faces, corporate environment, polished professional look, detailed background`,
    `Professional workspace visualization for ${career}: ${keywords}, photorealistic, detailed equipment and tools, organized workspace, professional photography style, high detail, no human faces, modern office setup, cinematic quality`,
    `Sophisticated ${career} environment: ${keywords}, highly detailed photorealistic scene, professional setting with intricate details, advanced technology, polished surfaces, no human faces visible, corporate aesthetic, 8K quality, professional lighting`,
    `Detailed professional business scene about ${interest}: ${keywords}, photorealistic rendering, intricate details throughout, professional workspace, corporate environment, no faces visible, high resolution details, cinematic professional photography`,
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}

async function generateImage(career: string, interest: string, postContent: string, customPrompt?: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("DALL-E API key not configured");
    return "";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const prompt = customPrompt || generateImagePrompt(career, interest, postContent);
    console.log("Generating image with prompt:", prompt.slice(0, 80) + "...");

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "low",
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.warn("Image generation failed:", response.status, errorData);
      return "";
    }

    const data = await response.json();
    console.log("Image API response keys:", Object.keys(data));
    const item = data.data?.[0];
    console.log("Image item keys:", item ? Object.keys(item) : "no item");
    if (item?.url) {
      console.log("Got URL response");
      return item.url;
    }
    if (item?.b64_json) {
      console.log("Got b64_json response, length:", item.b64_json.length);
      return `data:image/png;base64,${item.b64_json}`;
    }
    console.warn("No url or b64_json in response item:", item);
    return "";
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("Image generation error:", error);
    return "";
  }
}

export function LinkedInPostGenerator() {
  const [formData, setFormData] = useState({
    name: "Sam Chen",
    career: "Global Impact Architect & Civilization Accelerator",
    stage: "student",
    tone: "legendary",
    interest: "leveraging quantum consciousness frameworks to solve climate change, poverty, and aging simultaneously before lunch",
  });

  const [state, setState] = useState<GenerationState>({
    loading: false,
    error: null,
    headline: "",
    tips: [],
    post: "",
    microNote: "",
    imageUrl: "",
    imageLoading: false,
  });

  const [viewMode, setViewMode] = useState<"preview" | "markdown">("preview");

  const applyPreset = (key: keyof typeof PRESETS) => {
    const preset = PRESETS[key];
    setFormData(preset);
    setViewMode("preview");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, career, stage, tone, interest } = formData;

    if (!name || !career || !interest) {
      return;
    }

    setState({ ...state, loading: true, error: null, imageUrl: "", imageLoading: true });

    try {
      const generated = await generateWithModel(name, career, stage, tone, interest);

      const tips = buildTips(career, tone);

      setState({
        loading: false,
        error: null,
        headline: `${name} now appears to be ${articleFor(career)} ${career} operating at an unspecified but worrying level of influence.`,
        tips,
        post: generated,
        microNote:
          "The stronger the legendary mode, the more the fake experience should sound impossible while still wearing expensive vocabulary.",
        imageUrl: "",
        imageLoading: true,
      });

      setViewMode("preview");

      // Generate image in background
      try {
        const imageUrl = await generateImage(career, interest, generated);
        setState((prev) => ({
          ...prev,
          imageUrl,
          imageLoading: false,
        }));
      } catch (error) {
        console.warn("Image generation error:", error);
        setState((prev) => ({
          ...prev,
          imageLoading: false,
        }));
      }
    } catch (error) {
      setState({
        loading: false,
        error: String(error instanceof Error ? error.message : error),
        headline: "",
        tips: [],
        post: "",
        microNote: "",
        imageUrl: "",
        imageLoading: false,
      });
    }
  };

  const showResults = state.headline && !state.loading && !state.error;

  return (
    <div className="linkedin-generator">
      {/* LinkedIn Navigation Bar */}
      <nav className="linkedin-nav">
        <div className="linkedin-nav-content">
          <div className="linkedin-logo">in</div>
          <div className="linkedin-search">
            <input type="text" placeholder="Search" />
          </div>
          <div className="linkedin-nav-items">
            <div className="nav-item">Home</div>
            <div className="nav-item">Connections</div>
            <div className="nav-item">Jobs</div>
            <div className="nav-item">Messages</div>
            <div className="nav-item">Notifications</div>
            <div className="nav-item">Me</div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gen-hero">
        <div className="gen-hero-content">
          <div className="gen-eyebrow">Entertainment Only · Live Parody</div>
          <h1 className="gen-h1">Fake LinkedIn Post Machine</h1>
          <p className="gen-lede">
            Give it a dream career and a vague personal brand. The generator will produce a ridiculously polished fictional update—guaranteed to sound like someone saved three industries before lunch.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="generator-main">
        {/* Form Column */}
        <form className="gen-panel gen-form" onSubmit={handleSubmit}>
          <h2>Generate the fiction</h2>
          <p className="gen-subcopy">
            Give it a dream role and a vague personal brand, and the machine will do the rest.
          </p>

          <div className="gen-field-grid">
            <label>
              Your name
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Dream career
              <input
                name="career"
                type="text"
                value={formData.career}
                onChange={handleInputChange}
                required
              />
            </label>

            <div className="gen-field-row">
              <label>
                Current status
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                >
                  <option value="student">Student</option>
                  <option value="recent graduate">Recent graduate</option>
                  <option value="mysterious operator">Mysterious operator</option>
                </select>
              </label>

              <label>
                Delusion level
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                >
                  <option value="elevated">Elevated</option>
                  <option value="absurd">Absurd</option>
                  <option value="legendary">Legendary</option>
                </select>
              </label>
            </div>

            <label>
              One vague interest
              <input
                name="interest"
                type="text"
                value={formData.interest}
                onChange={handleInputChange}
                required
              />
            </label>

            <button type="submit" className="gen-submit" disabled={state.loading}>
              {state.loading ? "Summoning..." : "Generate Fake Post"}
            </button>

            <p className="gen-status">
              {state.loading
                ? "Crafting a glorious fabrication..."
                : state.error
                  ? `Error: ${state.error}`
                  : showResults
                    ? "✨ Post generated"
                    : "Waiting for greatness"}
            </p>
          </div>
        </form>

        {/* Presets Column */}
        <div className="gen-panel gen-presets">
          <h2>Quick-start presets</h2>
          <p className="gen-subcopy">Click any to auto-fill the form</p>
          <div className="gen-preset-list">
            <button
              type="button"
              className="gen-preset-card"
              onClick={() => applyPreset("world")}
            >
              <span className="preset-emoji">🌍</span>
              <strong>Global Changemaker</strong>
              <span>Saving humanity before snack time</span>
            </button>

            <button
              type="button"
              className="gen-preset-card"
              onClick={() => applyPreset("rocket")}
            >
              <span className="preset-emoji">🚀</span>
              <strong>Unicorn Whisperer</strong>
              <span>7 unicorns, 1 decacorn, infinite vibes</span>
            </button>

            <button
              type="button"
              className="gen-preset-card"
              onClick={() => applyPreset("moon")}
            >
              <span className="preset-emoji">🌙</span>
              <strong>Moonlight Operator</strong>
              <span>Calm infrastructure visionary</span>
            </button>

            <button
              type="button"
              className="gen-preset-card"
              onClick={() => applyPreset("spreadsheet")}
            >
              <span className="preset-emoji">📊</span>
              <strong>Spreadsheet Messiah</strong>
              <span>Dashboard visionary extraordinaire</span>
            </button>

            <button
              type="button"
              className="gen-preset-card"
              onClick={() => applyPreset("airport")}
            >
              <span className="preset-emoji">✈️</span>
              <strong>Airport Strategist</strong>
              <span>Gate B12 continental aligner</span>
            </button>

            <button
              type="button"
              className="gen-preset-card"
              onClick={() => applyPreset("beverage")}
            >
              <span className="preset-emoji">🥛</span>
              <strong>Beverage Futurist</strong>
              <span>Hydration as leadership</span>
            </button>
          </div>
        </div>
      </main>

      {/* Results Section */}
      {!showResults && !state.loading && !state.error && (
        <section className="gen-results gen-empty">
          <div className="empty-content">
            <p>Generate your fake professional update.</p>
            <p>It will be impossibly exaggerated and entirely unverifiable.</p>
          </div>
        </section>
      )}

      {showResults && (
        <section className="gen-results gen-linkedin-feed">
          <div className="linkedin-post-wrapper">
            {/* LinkedIn-style Post Card */}
            <div className="linkedin-post">
              {/* Post Header */}
              <div className="linkedin-post-header">
                <div className="linkedin-author-info">
                  <div className="linkedin-avatar">
                    <div className="avatar-initials">{formData.name.charAt(0)}</div>
                  </div>
                  <div className="linkedin-author-details">
                    <div className="linkedin-name">{formData.name}</div>
                    <div className="linkedin-title">{formData.career}</div>
                    <div className="linkedin-meta">now • <span className="linkedin-icon">🌐</span> Public</div>
                  </div>
                </div>
                <div className="linkedin-menu">⋯</div>
              </div>

              {/* Post Content */}
              <div className="linkedin-post-content">
                <div
                  dangerouslySetInnerHTML={{
                    __html: simpleMarkdownToHtml(state.post),
                  }}
                  className="linkedin-text"
                />
              </div>

              {/* Post Image */}
              {(state.imageUrl || state.imageLoading) && (
                <div className="linkedin-post-image">
                  {state.imageLoading ? (
                    <div className="linkedin-image-loading">
                      <div className="gen-spinner"></div>
                    </div>
                  ) : state.imageUrl ? (
                    <>
                      <img src={state.imageUrl} alt="Post visual" className="linkedin-image" />
                      <button
                        type="button"
                        className="linkedin-image-download"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = state.imageUrl;
                          link.download = `linkedin-post-${Date.now()}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        title="Download image"
                      >
                        ⬇️
                      </button>
                    </>
                  ) : null}
                </div>
              )}

              {/* Post Stats */}
              <div className="linkedin-post-stats">
                <div className="linkedin-likes">
                  <span className="reaction-emoji">👍 ❤️ 🔥</span>
                  <span className="stat-count">1,234</span>
                </div>
                <div className="linkedin-comments-count">456 comments • 89 reposts</div>
              </div>

              {/* Post Actions */}
              <div className="linkedin-post-actions">
                <button type="button" className="linkedin-action-btn">
                  <span className="action-emoji">👍</span> Like
                </button>
                <button type="button" className="linkedin-action-btn">
                  <span className="action-emoji">💬</span> Comment
                </button>
                <button type="button" className="linkedin-action-btn">
                  <span className="action-emoji">↗️</span> Share
                </button>
              </div>

              {/* Post Footer */}
              <div className="linkedin-post-footer">
                <div className="linkedin-view-mode-toggle">
                  <button
                    type="button"
                    className={`linkedin-view-btn ${viewMode === "preview" ? "active" : ""}`}
                    onClick={() => setViewMode("preview")}
                  >
                    ✨ Full view
                  </button>
                  <button
                    type="button"
                    className={`linkedin-view-btn ${viewMode === "markdown" ? "active" : ""}`}
                    onClick={() => setViewMode("markdown")}
                  >
                    📝 Copy as text
                  </button>
                </div>

                {viewMode === "markdown" && (
                  <div className="linkedin-copy-section">
                    <div className="linkedin-markdown-box">
                      <pre><code>{state.post}</code></pre>
                    </div>
                    <button
                      type="button"
                      className="linkedin-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(state.post);
                        alert("Copied to clipboard!");
                      }}
                    >
                      Copy text
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Side Info Panel */}
            <div className="linkedin-side-panel">
              <div className="linkedin-info-card">
                <h3>Fictional Positioning</h3>
                <p className="linkedin-headline">{state.headline}</p>
              </div>

              <div className="linkedin-tips-card">
                <h3>Why it lands</h3>
                <ul className="linkedin-tips-list">
                  {state.tips.map(([title, copy]) => (
                    <li key={title}>
                      <strong>{title}</strong>
                      <p>{copy}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="linkedin-note-card">
                <p className="linkedin-micro-note">{state.microNote}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {state.error && (
        <section className="gen-results">
          <div className="gen-error-box">
            <p className="gen-error-title">⚠️ Generation failed</p>
            <p className="gen-error-message">{state.error}</p>
          </div>
        </section>
      )}
    </div>
  );
}

export default LinkedInPostGenerator;
