import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

declare global {
  interface Window {
    lucide?: {
      createIcons: () => void;
    };
  }
}

type Lang = "en" | "zh";

const _base = import.meta.env.BASE_URL;
const _p = (file: string) => `${_base}previews/${file}`;

type Project = {
  icon: string;
  iconBackground: string;
  iconColor: string;
  surface: string;
  surfaceAccent: string;
  labelColor: string;
  patternRotation?: string;
  name: Record<Lang, string>;
  summary: Record<Lang, string>;
  description: Record<Lang, string[]>;
  tags: string[];
  github: string | null;
  demo: string | null;
  previewImgs?: string[];
};

type InfoRow = {
  icon: string;
  tone: string;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  modal?: boolean;
};

const PROJECTS: Project[] = [
  {
    icon: "book-open",
    iconBackground: "oklch(.92 .05 250)",
    iconColor: "oklch(.40 .12 250)",
    surface: "oklch(.92 .04 250)",
    surfaceAccent: "oklch(.87 .055 250)",
    labelColor: "oklch(.45 .08 250)",
    patternRotation: "rotate(30)",
    name: { en: "LingoCafe", zh: "LingoCafe" },
    summary: {
      en: "A language learning community platform with SMS auth, distributed counters, AI-powered feed, and full-text search — live at lingocafe.online.",
      zh: "语言学习社区平台，含短信登录、分布式计数器、AI Feed 和全文搜索，已上线 lingocafe.online。",
    },
    description: {
      en: [
        "Auth & Publish: Spring Security SMS OTP, dual-token stateless sessions; OSS presigned URL frontend direct upload for images, video, and Markdown; DeepSeek one-click article summarization.",
        "Counter & Like: Redis SDS binary-compact counting, Lua atomic updates, self-healing consistency rebuild; bitmap idempotency with Kafka async aggregation and disaster-replay fallback.",
        "Feed & Social Graph: Three-tier cache (Caffeine + Redis), hotkey detection, adaptive TTL, single-flight lock; social graph synced via Outbox → Canal → Kafka pipeline.",
        "Search & AI: Elasticsearch function_score (BM25 + business signals), search_after cursor pagination, RAG Q&A with streaming LLM response.",
      ],
      zh: [
        "认证与发布：Spring Security 短信 OTP 双 token 无状态登录；OSS 预签名 URL 前端直传图文视频 Markdown；DeepSeek 一键文章摘要。",
        "计数与点赞：Redis SDS 紧凑存储 + Lua 原子更新 + 自愈一致性重建；Bitmap 幂等 + Kafka 异步聚合写入。",
        "Feed 与社交图：三级缓存（Caffeine + Redis）+ 热点检测 + 自适应 TTL；Outbox → Canal → Kafka 管道同步。",
        "搜索与 AI：Elasticsearch function_score（BM25 + 业务信号）+ search_after 游标分页 + 向量 RAG 流式 LLM 响应。",
      ],
    },
    tags: ["Java 21", "Spring Boot", "Redis", "Kafka", "Elasticsearch", "Spring AI"],
    github: "https://github.com/runlingli",
    demo: "https://lingocafe.online",
    previewImgs: [_p("lingocafe1.png"), _p("lingocafe2.png"), _p("lingocafe3.png")],
  },
  {
    icon: "layers",
    iconBackground: "oklch(.92 .05 290)",
    iconColor: "oklch(.40 .12 290)",
    surface: "oklch(.92 .04 290)",
    surfaceAccent: "oklch(.87 .055 290)",
    labelColor: "oklch(.45 .08 290)",
    patternRotation: "rotate(-45)",
    name: { en: "Aconn", zh: "Aconn" },
    summary: {
      en: "UC Davis campus social app on the App Store — cut search latency from >30s to <3s with hybrid RAG, DeepSeek intent parsing, and ~85% infra cost reduction.",
      zh: "已上架 App Store 的 UC Davis 校园社交应用——混合 RAG + DeepSeek 意图解析，搜索延迟从 30 秒降至 3 秒，基础设施成本降低约 85%。",
    },
    description: {
      en: [
        "Replaced Voyage AI (rate-limited, 3 RPM) with locally-served bge-small; DeepSeek LLM intent parsing for query routing; async SSE — latency >30s → <3s.",
        "Scraped 10+ UC Davis dept sites via Cloudflare bypass; pgvector HNSW fusing tsvector (×1.9) + cosine (×1.35); P@5 = 1.00, R@10 = 1.00 vs 0.80/0.50 baseline.",
        "Cloud Run → Cloud SQL via Unix domain socket (eliminated 120s TCP hang); weekly Cloud Scheduler pipeline, idempotent Datastore sync; ~85% infra cost reduction.",
        "Published to App Store.",
      ],
      zh: [
        "用本地 bge-small 替代限流 Voyage AI；DeepSeek 意图解析路由查询；异步 SSE——延迟从 30 秒降至 3 秒。",
        "绕过 Cloudflare 抓取 10+ UC Davis 部门网站；pgvector HNSW 融合 tsvector（×1.9）+ 余弦（×1.35）；P@5=1.00，R@10=1.00。",
        "Cloud Run → Cloud SQL Unix socket 消除 120 秒 TCP 超时；Cloud Scheduler 每周内容管道 + 幂等 Datastore 同步；基础设施成本降低约 85%。",
        "已上架 App Store。",
      ],
    },
    tags: ["Python", "Flask", "pgvector", "DeepSeek", "GCP Cloud Run", "Cloud SQL"],
    github: "https://github.com/runlingli",
    demo: "https://apps.apple.com/us/app/aconn/id6760412162",
    previewImgs: [_p("aconn1.png"), _p("aconn2.png"), _p("aconn3.png")],
  },
  {
    icon: "brain",
    iconBackground: "oklch(.92 .05 220)",
    iconColor: "oklch(.40 .12 220)",
    surface: "oklch(.92 .04 220)",
    surfaceAccent: "oklch(.87 .055 220)",
    labelColor: "oklch(.45 .08 220)",
    patternRotation: "rotate(45)",
    name: { en: "TaxCounsel RAG", zh: "TaxCounsel RAG" },
    summary: {
      en: "AI-powered tax advisory with hybrid retrieval, LLM critic query repair, and RAGAS-validated accuracy (faithfulness 0.89, relevancy 0.92, recall 0.87).",
      zh: "AI 税务问答系统，含混合检索与 LLM critic 查询修复，RAGAS 验证：faithfulness 0.89，relevancy 0.92，recall 0.87。",
    },
    description: {
      en: [
        "Hybrid Retrieval: BM25 + dense vector with RRF fusion and CrossEncoder reranking for sparse IRS terminology; FastAPI + Qdrant + LangGraph orchestration.",
        "LLM Critic: LLM-based sufficiency evaluator replaces hard confidence threshold; query-rewrite retry loop with structured refusal for out-of-scope requests.",
        "Evaluation: RAGAS-validated — faithfulness 0.89, relevancy 0.92, context recall 0.87; page-level IRS citations via PyMuPDF.",
      ],
      zh: [
        "混合检索：BM25 + 向量检索通过 RRF 融合和 CrossEncoder 重排处理 IRS 稀疏术语；FastAPI + Qdrant + LangGraph 编排。",
        "LLM Critic：基于 LLM 的充分性评估器替代固定置信阈值；查询重写重试循环 + 结构化拒答。",
        "RAGAS 验证：faithfulness 0.89，relevancy 0.92，recall 0.87；PyMuPDF 提取页级 IRS 引用。",
      ],
    },
    tags: ["Python", "LlamaIndex", "Qdrant", "LangGraph", "FastAPI", "RAGAS"],
    github: "https://github.com/runlingli",
    demo: null,
  },
];

const INTERESTS = [
  "Spring Boot & distributed systems",
  "Hybrid retrieval & reranking",
  "Kafka & event streaming",
  "Elasticsearch full-text search",
  "RAG pipelines",
  "LLM evaluation with RAGAS",
  "GCP Cloud Run & Cloud SQL",
  "React + TypeScript",
  "FastAPI backends",
  "Language learning tech",
];

const STATUS_ROWS: InfoRow[] = [
  {
    icon: "graduation-cap",
    tone: "b",
    title: { en: "B.S. in Computer Science", zh: "计算机科学本科在读" },
    subtitle: { en: "UC Davis · 2023 - Present", zh: "UC Davis · 2023 至今" },
  },
  {
    icon: "cpu",
    tone: "p",
    title: { en: "Software Engineer · CodeLab × Google", zh: "软件工程师 · CodeLab × Google" },
    subtitle: { en: "Resume matching pipeline · GCP Cloud Run", zh: "简历匹配系统 · GCP Cloud Run" },
    modal: true,
  },
  {
    icon: "zap",
    tone: "g",
    title: { en: "Open to 2026 opportunities", zh: "开放 2026 岗位机会" },
    subtitle: { en: "Backend · ML · full-stack", zh: "后端 · ML · 全栈" },
  },
];

const CODELAB_EXP = {
  previewImg: _p("codelab1.jpg"),
  title: { en: "CodeLab × Google", zh: "CodeLab × Google" },
  role: { en: "Software Engineer", zh: "软件工程师" },
  description: {
    en: [
      "Built a resume-to-job-description matching pipeline for a Google-sponsored CodeLab Davis project.",
      "Designed and deployed a cloud-native NLP service on GCP Cloud Run for semantic matching of candidate profiles against job listings at scale.",
      "Collaborated with a cross-functional student engineering team in an agile sprint environment.",
    ],
    zh: [
      "在 Google 赞助的 CodeLab Davis 项目中构建简历与职位描述语义匹配系统。",
      "在 GCP Cloud Run 上设计并部署了处理大规模候选人档案的云原生 NLP 服务。",
      "与跨职能学生工程团队在敏捷冲刺环境中协作完成。",
    ],
  },
  tags: ["Python", "GCP Cloud Run", "NLP", "Google Cloud"],
  link: "https://codelabdavis.com",
  linkLabel: "codelabdavis.com",
};

const copy = (lang: Lang, en: string, zh: string) => (lang === "zh" ? zh : en);

/* ── GLOBE ── */
type GlobeCity = { name: string; country: string; lat: number; lon: number };

const GLOBE_CITIES: GlobeCity[] = [
  // North America
  { name: "San Francisco", country: "USA", lat: 37.8, lon: -122.4 },
  { name: "Seattle", country: "USA", lat: 47.6, lon: -122.3 },
  { name: "Los Angeles", country: "USA", lat: 34.1, lon: -118.2 },
  { name: "New York", country: "USA", lat: 40.7, lon: -74.0 },
  { name: "Chicago", country: "USA", lat: 41.9, lon: -87.6 },
  { name: "Boston", country: "USA", lat: 42.4, lon: -71.1 },
  { name: "Austin", country: "USA", lat: 30.3, lon: -97.7 },
  { name: "Vancouver", country: "Canada", lat: 49.3, lon: -123.1 },
  { name: "Toronto", country: "Canada", lat: 43.7, lon: -79.4 },
  { name: "Montreal", country: "Canada", lat: 45.5, lon: -73.6 },
  { name: "Mexico City", country: "Mexico", lat: 19.4, lon: -99.1 },
  // South America
  { name: "Bogotá", country: "Colombia", lat: 4.7, lon: -74.1 },
  { name: "Lima", country: "Peru", lat: -12.1, lon: -77.0 },
  { name: "São Paulo", country: "Brazil", lat: -23.5, lon: -46.6 },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9, lon: -43.2 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6, lon: -58.4 },
  { name: "Santiago", country: "Chile", lat: -33.5, lon: -70.7 },
  // Western Europe
  { name: "London", country: "UK", lat: 51.5, lon: -0.1 },
  { name: "Dublin", country: "Ireland", lat: 53.3, lon: -6.3 },
  { name: "Lisbon", country: "Portugal", lat: 38.7, lon: -9.1 },
  { name: "Madrid", country: "Spain", lat: 40.4, lon: -3.7 },
  { name: "Barcelona", country: "Spain", lat: 41.4, lon: 2.2 },
  { name: "Paris", country: "France", lat: 48.9, lon: 2.4 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.4, lon: 4.9 },
  { name: "Brussels", country: "Belgium", lat: 50.8, lon: 4.4 },
  { name: "Zurich", country: "Switzerland", lat: 47.4, lon: 8.5 },
  { name: "Berlin", country: "Germany", lat: 52.5, lon: 13.4 },
  { name: "Munich", country: "Germany", lat: 48.1, lon: 11.6 },
  { name: "Vienna", country: "Austria", lat: 48.2, lon: 16.4 },
  // Scandinavia & Eastern Europe
  { name: "Oslo", country: "Norway", lat: 59.9, lon: 10.7 },
  { name: "Stockholm", country: "Sweden", lat: 59.3, lon: 18.1 },
  { name: "Copenhagen", country: "Denmark", lat: 55.7, lon: 12.6 },
  { name: "Helsinki", country: "Finland", lat: 60.2, lon: 25.0 },
  { name: "Warsaw", country: "Poland", lat: 52.2, lon: 21.0 },
  { name: "Prague", country: "Czech Republic", lat: 50.1, lon: 14.4 },
  { name: "Rome", country: "Italy", lat: 41.9, lon: 12.5 },
  { name: "Milan", country: "Italy", lat: 45.5, lon: 9.2 },
  { name: "Athens", country: "Greece", lat: 37.9, lon: 23.7 },
  { name: "Kyiv", country: "Ukraine", lat: 50.5, lon: 30.5 },
  { name: "Moscow", country: "Russia", lat: 55.8, lon: 37.6 },
  { name: "Istanbul", country: "Turkey", lat: 41.0, lon: 28.9 },
  // Middle East & Africa
  { name: "Tel Aviv", country: "Israel", lat: 32.1, lon: 34.8 },
  { name: "Dubai", country: "UAE", lat: 25.2, lon: 55.3 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7, lon: 46.7 },
  { name: "Cairo", country: "Egypt", lat: 30.0, lon: 31.2 },
  { name: "Lagos", country: "Nigeria", lat: 6.5, lon: 3.4 },
  { name: "Nairobi", country: "Kenya", lat: -1.3, lon: 36.8 },
  { name: "Johannesburg", country: "South Africa", lat: -26.2, lon: 28.0 },
  { name: "Cape Town", country: "South Africa", lat: -33.9, lon: 18.4 },
  // South & Southeast Asia
  { name: "Mumbai", country: "India", lat: 19.1, lon: 72.9 },
  { name: "Delhi", country: "India", lat: 28.6, lon: 77.2 },
  { name: "Bangalore", country: "India", lat: 12.9, lon: 77.6 },
  { name: "Karachi", country: "Pakistan", lat: 24.9, lon: 67.0 },
  { name: "Dhaka", country: "Bangladesh", lat: 23.8, lon: 90.4 },
  { name: "Bangkok", country: "Thailand", lat: 13.8, lon: 100.5 },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8, lon: 106.7 },
  { name: "Hanoi", country: "Vietnam", lat: 21.0, lon: 105.8 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1, lon: 101.7 },
  { name: "Singapore", country: "Singapore", lat: 1.3, lon: 103.8 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2, lon: 106.8 },
  { name: "Manila", country: "Philippines", lat: 14.6, lon: 121.0 },
  // East Asia
  { name: "Beijing", country: "China", lat: 39.9, lon: 116.4 },
  { name: "Shanghai", country: "China", lat: 31.2, lon: 121.5 },
  { name: "Shenzhen", country: "China", lat: 22.5, lon: 114.1 },
  { name: "Hong Kong", country: "China", lat: 22.3, lon: 114.2 },
  { name: "Chengdu", country: "China", lat: 30.6, lon: 104.1 },
  { name: "Seoul", country: "South Korea", lat: 37.6, lon: 127.0 },
  { name: "Tokyo", country: "Japan", lat: 35.7, lon: 139.7 },
  { name: "Osaka", country: "Japan", lat: 34.7, lon: 135.5 },
  { name: "Taipei", country: "Taiwan", lat: 25.0, lon: 121.5 },
  // Oceania & Central Asia
  { name: "Sydney", country: "Australia", lat: -33.9, lon: 151.2 },
  { name: "Melbourne", country: "Australia", lat: -37.8, lon: 145.0 },
  { name: "Auckland", country: "New Zealand", lat: -36.9, lon: 174.8 },
  { name: "Almaty", country: "Kazakhstan", lat: 43.3, lon: 76.9 },
];

function Globe({ lang }: { lang: Lang }) {
  const cRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const rotRef = useRef(0);
  const projRef = useRef<d3.GeoProjection | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoRef = useRef<{ land: any; borders: any; graticule: any } | null>(null);
  const [pinned, setPinned] = useState<GlobeCity | null>(null);

  // Fetch real country + border data
  useEffect(() => {
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((world: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = world as any;
        geoRef.current = {
          land: topojson.feature(w, w.objects.land),
          borders: topojson.mesh(w, w.objects.countries, (a: unknown, b: unknown) => a !== b),
          graticule: d3.geoGraticule()(),
        };
      })
      .catch(() => {});
  }, []);

  // Render loop
  useEffect(() => {
    const cv = cRef.current;
    if (!cv) return;
    const S = 200;
    cv.width = S; cv.height = S;

    const projection = d3.geoOrthographic()
      .scale(S / 2 - 3)
      .translate([S / 2, S / 2])
      .clipAngle(90);
    projRef.current = projection;

    const ctx = cv.getContext("2d")!;
    const path = d3.geoPath().projection(projection).context(ctx);
    const graticule = d3.geoGraticule()();

    const draw = () => {
      ctx.clearRect(0, 0, S, S);
      projection.rotate([rotRef.current, -20, 0]);
      rotRef.current += 0.30;

      // Ocean
      ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 3, 0, Math.PI * 2);
      ctx.fillStyle = "#e8e7e5"; ctx.fill();

      // Graticule (always visible)
      ctx.beginPath(); path(graticule);
      ctx.strokeStyle = "rgba(0,0,0,0.07)"; ctx.lineWidth = 0.5; ctx.stroke();

      // Land + country borders (when data is loaded)
      const geo = geoRef.current;
      if (geo) {
        ctx.beginPath(); path(geo.land);
        ctx.fillStyle = "#1c1c1c"; ctx.fill();

        ctx.beginPath(); path(geo.borders);
        ctx.strokeStyle = "#e8e7e5"; ctx.lineWidth = 0.45; ctx.stroke();
      }

      // Sphere border
      ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.20)"; ctx.lineWidth = 1; ctx.stroke();

      // Gloss highlight
      const grad = ctx.createRadialGradient(S * 0.30, S * 0.25, 0, S / 2, S / 2, S / 2);
      grad.addColorStop(0, "rgba(255,255,255,0.20)");
      grad.addColorStop(0.45, "rgba(255,255,255,0.04)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 3, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const proj = projRef.current;
    const cv = cRef.current;
    if (!proj || !cv) return;
    const S = 200, R = S / 2 - 3;
    const rect = cv.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (S / rect.width);
    const py = (e.clientY - rect.top) * (S / rect.height);
    // Reject clicks outside the sphere circle
    if ((px - S / 2) ** 2 + (py - S / 2) ** 2 > R * R) return;
    const coords = proj.invert?.([px, py]);
    if (!coords) return;
    const [lon, lat] = coords; // D3 returns [longitude, latitude]
    // Normalize longitude difference to [-180, 180] to handle the ±180° wrap
    let best = GLOBE_CITIES[0], bestD = Infinity;
    for (const c of GLOBE_CITIES) {
      const dLat = c.lat - lat;
      const dLon = ((c.lon - lon + 180) % 360 + 360) % 360 - 180;
      const d = dLat * dLat + dLon * dLon;
      if (d < bestD) { bestD = d; best = c; }
    }
    setPinned(best);
  }, []);

  return (
    <div>
      <div className="globe-wrap">
        {/* Outer whirl — CSS-animated dashed SVG rings */}
        <div className="globe-whirl globe-whirl-a">
          <svg viewBox="0 0 256 256" fill="none">
            <circle cx="128" cy="128" r="118" stroke="#1a1a1a" strokeWidth="1.2"
              strokeDasharray="28 12 14 6 8 18 20 8" strokeLinecap="round" fill="none" opacity="0.50"/>
            <circle cx="128" cy="128" r="122" stroke="#1a1a1a" strokeWidth="0.8"
              strokeDasharray="10 22 16 14 24 10" strokeDashoffset="20" strokeLinecap="round" fill="none" opacity="0.28"/>
          </svg>
        </div>
        {/* Inner whirl — counter-rotates */}
        <div className="globe-whirl globe-whirl-b">
          <svg viewBox="0 0 256 256" fill="none">
            <circle cx="128" cy="128" r="114" stroke="#1a1a1a" strokeWidth="1.0"
              strokeDasharray="18 10 8 16 22 6 12" strokeDashoffset="5" strokeLinecap="round" fill="none" opacity="0.22"/>
          </svg>
        </div>
        <canvas ref={cRef} className="globe-canvas-round" style={{ width: 200, height: 200 }} onClick={handleClick} />
      </div>
      <p className="globe-label" style={{ opacity: pinned ? 1 : 0.45 }}>
        {pinned
          ? copy(lang, `→ open to relocate: ${pinned.name}, ${pinned.country}`, `→ 愿意迁居：${pinned.name}，${pinned.country}`)
          : copy(lang, "spin · click any city", "旋转 · 点击任意城市")}
      </p>
    </div>
  );
}

/* ── PLANET PHYSICS ── */
function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
}
function planetColors(mass: number) {
  const t = Math.min(1, mass / 450);
  if (t < 0.30) {
    const s = t / 0.30;
    return {
      c0: `rgba(${lerp(185,105,s)},${lerp(225,175,s)},255,.95)`,
      c1: `rgba(${lerp(105,65,s)},${lerp(175,135,s)},255,.88)`,
      c2: `rgba(${lerp(65,42,s)},${lerp(135,105,s)},252,.65)`,
      a0: `rgba(${lerp(125,85,s)},${lerp(195,155,s)},255,.33)`,
      am: `rgba(${lerp(125,85,s)},${lerp(195,155,s)},255,.08)`,
      ring: `rgba(${lerp(155,115,s)},${lerp(205,175,s)},255,.65)`,
    };
  } else if (t < 0.65) {
    const s = (t - 0.30) / 0.35;
    return {
      c0: `rgba(${lerp(105,255,s)},${lerp(175,132,s)},${lerp(255,48,s)},.95)`,
      c1: `rgba(${lerp(65,222,s)},${lerp(135,92,s)},${lerp(252,28,s)},.88)`,
      c2: `rgba(${lerp(42,188,s)},${lerp(105,58,s)},${lerp(252,14,s)},.65)`,
      a0: `rgba(${lerp(85,255,s)},${lerp(155,112,s)},${lerp(255,58,s)},.33)`,
      am: `rgba(${lerp(85,255,s)},${lerp(155,112,s)},${lerp(255,58,s)},.08)`,
      ring: `rgba(${lerp(115,255,s)},${lerp(175,152,s)},${lerp(255,78,s)},.65)`,
    };
  } else {
    const s = (t - 0.65) / 0.35;
    return {
      c0: `rgba(255,${lerp(132,248,s)},${lerp(48,182,s)},.95)`,
      c1: `rgba(255,${lerp(92,215,s)},${lerp(28,132,s)},.88)`,
      c2: `rgba(${lerp(188,255,s)},${lerp(58,168,s)},${lerp(14,68,s)},.65)`,
      a0: `rgba(255,${lerp(112,232,s)},${lerp(58,162,s)},.38)`,
      am: `rgba(255,${lerp(112,232,s)},${lerp(58,162,s)},.10)`,
      ring: `rgba(255,${lerp(152,238,s)},${lerp(78,182,s)},.65)`,
    };
  }
}

function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [activeNav, setActiveNav] = useState("top");
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [codelabOpen, setCodelabOpen] = useState(false);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const planetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const planetCardRef = useRef<HTMLDivElement | null>(null);
  const planetHintRef = useRef<HTMLDivElement | null>(null);
  const navLockRef = useRef(false);
  const navLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const modalProject = activeProject === null ? null : PROJECTS[activeProject];
  const tickerItems = useMemo(() => [...INTERESTS, ...INTERESTS], []);

  useEffect(() => {
    document.body.style.overflow = (activeProject === null && !codelabOpen) ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [activeProject, codelabOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProject(null);
        setCodelabOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const sectionIds = ["top", "contact", "skills", "projects"];

    const updateActiveSection = () => {
      // Skip while a nav click is still scrolling — prevents flicker
      if (navLockRef.current) return;
      let current = "top";
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 180) current = id;
      }
      setActiveNav(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  useEffect(() => {
    window.lucide?.createIcons();
  }, [lang, activeProject, codelabOpen]);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let width = 0;
    let height = 0;
    let frameId = 0;
    const blobs = [
      { bx: 0.15, by: 0.25, r: 0.5, h: 198 },
      { bx: 0.82, by: 0.15, r: 0.42, h: 280 },
      { bx: 0.5, by: 0.82, r: 0.52, h: 220 },
    ];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const tick = time * 0.00025;

      blobs.forEach((blob, index) => {
        const x = (blob.bx + Math.sin(tick * 0.7 + index * 2.1) * 0.11) * width;
        const y = (blob.by + Math.cos(tick * 0.5 + index * 1.7) * 0.09) * height;
        const radius = blob.r * Math.max(width, height) * 0.55;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `hsla(${blob.h},65%,58%,0.055)`);
        gradient.addColorStop(1, "transparent");
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      });

      frameId = window.requestAnimationFrame(draw);
    };

    resize();
    frameId = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const card = planetCardRef.current;
    const canvas = planetCanvasRef.current;
    const hint = planetHintRef.current;
    const ctx = canvas?.getContext("2d");
    if (!card || !canvas || !hint || !ctx) return;

    type Particle = { x: number; y: number; vx: number; vy: number; sz: number; op: number; hue: number; ambient: boolean };
    let W = 0, H = 0;
    // mass starts at 0; set to initial value after layout is measured
    const st = { p: [] as Particle[], mx: 0, my: 0, active: false, px: 0, py: 0, mass: 0, raf: null as number | null, timer: 0, interacted: false };

    const spawnAmbient = () => {
      if (!W || !H) return;
      st.p.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45, sz: Math.random() * 1.1 + .25, op: .06 + Math.random() * .14, hue: 195 + Math.random() * 80, ambient: true });
    };

    const init = () => {
      const r = card.getBoundingClientRect();
      if (!r.width || !r.height) return false; // layout not ready
      W = canvas.width = r.width; H = canvas.height = r.height;
      if (st.p.length === 0) {
        st.px = W / 2; st.py = H / 2;
        st.mass = 38; // visible initial planet in card center
        for (let i = 0; i < 24; i++) spawnAmbient();
      }
      return true;
    };

    const planetR = (mass: number) => mass * .38;

    const loop = () => {
      // Self-heal if layout wasn't ready at mount time
      if (!W || !H) { init(); }

      ctx.clearRect(0, 0, W, H);

      if (st.active && ++st.timer % 2 === 0 && st.p.filter(p => !p.ambient).length < 180) {
        const e = Math.floor(Math.random() * 4);
        const px = (e === 0 || e === 2) ? Math.random() * W : (e === 1 ? W : 0);
        const py = e === 0 ? 0 : e === 2 ? H : Math.random() * H;
        st.p.push({ x: px + (Math.random() - .5) * 30, y: py + (Math.random() - .5) * 30, vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8, sz: Math.random() * 1.8 + .4, op: .4 + Math.random() * .6, hue: 195 + Math.random() * 70, ambient: false });
      }

      if (st.active) { st.px += (st.mx - st.px) * .1; st.py += (st.my - st.py) * .1; }

      const dead: number[] = [];
      for (let i = 0; i < st.p.length; i++) {
        const p = st.p[i];
        if (p.ambient) {
          if (st.active) { p.ambient = false; p.op = .35 + Math.random() * .4; }
          else {
            p.x += p.vx; p.y += p.vy;
            if (p.x < -8) p.x = W + 8; if (p.x > W + 8) p.x = -8;
            if (p.y < -8) p.y = H + 8; if (p.y > H + 8) p.y = -8;
          }
        } else {
          const dx = st.px - p.x, dy = st.py - p.y, dist = Math.sqrt(dx * dx + dy * dy) || .1;
          if (st.active && dist < 14) { st.mass += .9; dead.push(i); continue; }
          if (st.active) {
            const f = Math.min(220 / (dist * dist), 3.5);
            p.vx += dx / dist * f; p.vy += dy / dist * f;
            const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (sp > 5.5) { p.vx *= 5.5 / sp; p.vy *= 5.5 / sp; }
          } else { p.op -= .013; if (p.op <= 0) { dead.push(i); continue; } }
          p.vx *= .93; p.vy *= .93; p.x += p.vx; p.y += p.vy;
        }
        ctx.save(); ctx.globalAlpha = p.op;
        ctx.fillStyle = p.ambient ? `hsl(${p.hue},55%,72%)` : `hsl(${p.hue},85%,82%)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      for (let i = dead.length - 1; i >= 0; i--) st.p.splice(dead[i], 1);

      if (!st.active) {
        const ambientCount = st.p.filter(p => p.ambient).length;
        if (ambientCount < 24) spawnAmbient();
      }

      if (st.mass > .5) {
        const r = planetR(st.mass);
        const col = planetColors(st.mass);
        const aura = ctx.createRadialGradient(st.px, st.py, 0, st.px, st.py, r * 3.8);
        aura.addColorStop(0, col.a0); aura.addColorStop(.5, col.am); aura.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(st.px, st.py, r * 3.8, 0, Math.PI * 2); ctx.fill();
        const core = ctx.createRadialGradient(st.px - r * .35, st.py - r * .35, r * .05, st.px, st.py, r);
        core.addColorStop(0, col.c0); core.addColorStop(.5, col.c1); core.addColorStop(1, col.c2);
        ctx.fillStyle = core; ctx.beginPath(); ctx.arc(st.px, st.py, r, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.globalAlpha = .28;
        ctx.strokeStyle = col.ring; ctx.lineWidth = .9;
        ctx.beginPath(); ctx.ellipse(st.px, st.py, r * 1.7, r * .5, performance.now() * .0003, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        // Shrink proportionally when not active so large planets don't linger forever
        if (!st.active && st.interacted) st.mass = Math.max(st.mass - 1.8, 0);
      }

      st.raf = requestAnimationFrame(loop);
    };

    const handleEnter = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      st.active = true;
      st.interacted = true;
      st.mx = e.clientX - rect.left;
      st.my = e.clientY - rect.top;
      hint.style.opacity = "0";
    };
    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      st.mx = e.clientX - rect.left; st.my = e.clientY - rect.top;
    };
    const handleLeave = () => {
      st.active = false;
      for (const p of st.p) {
        if (!p.ambient) { const dx = p.x - st.mx, dy = p.y - st.my, d = Math.sqrt(dx * dx + dy * dy) || 1; p.vx = dx / d * (Math.random() * 7 + 2); p.vy = dy / d * (Math.random() * 7 + 2); }
      }
      hint.style.opacity = "1";
    };
    const handleResize = () => {
      const r = card.getBoundingClientRect();
      W = canvas.width = r.width; H = canvas.height = r.height;
    };

    // Defer to next RAF to guarantee layout is painted before measuring
    const initRaf = requestAnimationFrame(() => {
      if (init()) st.raf = requestAnimationFrame(loop);
      else {
        // Fallback: retry once after a frame if layout still not ready
        st.raf = requestAnimationFrame(() => { init(); st.raf = requestAnimationFrame(loop); });
      }
    });
    card.addEventListener("mouseenter", handleEnter);
    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(initRaf);
      if (st.raf) cancelAnimationFrame(st.raf);
      card.removeEventListener("mouseenter", handleEnter);
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <canvas id="bg-canvas" ref={bgCanvasRef} />

      <aside className="sidebar">
        <nav className="sidebar-nav">
          {(["top", "contact", "skills", "projects"] as const).map((id, i) => {
            const meta = [
              { icon: "home", label: "Home" },
              { icon: "mail", label: "Contact" },
              { icon: "code-2", label: "Skills" },
              { icon: "layers", label: "Projects" },
            ][i];
            return (
              <NavLink
                key={id}
                href={`#${id}`}
                icon={meta.icon}
                label={meta.label}
                active={activeNav === id}
                onClick={() => {
                  setActiveNav(id);
                  navLockRef.current = true;
                  // Cancel any previous unlock timer before starting a new one
                  if (navLockTimerRef.current) clearTimeout(navLockTimerRef.current);
                  navLockTimerRef.current = setTimeout(() => {
                    navLockRef.current = false;
                    navLockTimerRef.current = null;
                  }, 1000);
                }}
              />
            );
          })}
        </nav>
      </aside>

      <div className="lang-toggle-dock">
        <button type="button" className={`ltbtn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>EN</button>
        <button type="button" className={`ltbtn ${lang === "zh" ? "active" : ""}`} onClick={() => setLang("zh")}>中</button>
      </div>

      <main className="main-content" id="top">
        <div className="bento">
          <div className="card card-hero">
            <div>
              <div className="hero-avail">
                <span className="dot" />
                <span>{copy(lang, "Open to software engineering internships and new grad roles", "开放软件工程实习和校招岗位机会")}</span>
              </div>
              <h1 className="hero-name">
                Runling <span className="aw">Li</span>
              </h1>
              <div className="hero-sub">
                <span>{copy(lang, "ML-Focused Software Engineer", "偏机器学习方向的软件工程师")}</span>
                <span className="cursor" />
              </div>
            </div>
            <p className="hero-bio">
              {copy(
                lang,
                "I'm a UC Davis CS student building production-grade systems — from a Java Spring Boot community platform live at lingocafe.online and hybrid RAG pipelines, to an iOS campus app published on the App Store. I care about retrieval quality, backend architecture, and user experience in equal measure.",
                "我是 UC Davis 计算机科学学生，构建生产级系统——从已上线 lingocafe.online 的 Java Spring Boot 社区平台、混合 RAG 管道，到已上架 App Store 的校园 iOS 应用。我同等重视检索质量、后端架构和用户体验。",
              )}
            </p>
            <div className="hero-cta">
              <a href="#projects" className="btn btn-p">
                <LucideIcon name="layout-grid" size={13} />
                <span>{copy(lang, "View Projects", "查看项目")}</span>
              </a>
              <a href="#contact" className="btn btn-g">
                <LucideIcon name="mail" size={13} />
                <span>{copy(lang, "Get in touch", "联系我")}</span>
              </a>
            </div>
          </div>

          <div className="card card-planet" id="planet-card" ref={planetCardRef}>
            <canvas id="planet-canvas" ref={planetCanvasRef} />
            <div className="planet-hint" id="planet-hint" ref={planetHintRef}>
              {copy(lang, "hover · every star is a spark of inspiration", "悬停 · 每颗星都是灵感的火花")}
            </div>
          </div>

          <div className="card card-status hov">
            <div className="ctitle">{copy(lang, "// currently", "// 当前状态")}</div>
            {STATUS_ROWS.map((row) => (
              <StatusRow
                key={row.title.en}
                icon={row.icon}
                tone={row.tone}
                title={row.title[lang]}
                subtitle={row.subtitle[lang]}
                onClick={row.modal ? () => setCodelabOpen(true) : undefined}
              />
            ))}
          </div>

          <div className="card card-about hov">
            <div>
              <div className="ctitle">{copy(lang, "// about me", "// 关于我")}</div>
              <p
                className="about-q"
                dangerouslySetInnerHTML={{
                  __html: copy(
                    lang,
                    "I care about building software that feels <em>fast, reliable, and obvious</em> to use.",
                    "快、稳、不用想——这是我对自己代码的<em>基本要求</em>。",
                  ),
                }}
              />
            </div>
            <div className="about-foot">
              // gpa: 3.78/4.0 · {copy(lang, "engineering gpa: 3.97", "工程 GPA：3.97")}
            </div>
          </div>

          <div className="card card-contact hov" id="contact">
            <div>
              <div className="ctact-title">{copy(lang, "Let's build useful AI products.", "一起做真正有用的 AI 产品。")}</div>
              <div className="ctact-sub">{copy(lang, "Open to software engineering, ML, and product-minded roles.", "开放软件工程、机器学习和偏产品方向的岗位机会。")}</div>
            </div>
            <div className="clinks">
              <a href="mailto:runlingli10@gmail.com" className="clink">
                <LucideIcon name="mail" size={14} />
                runlingli10@gmail.com
              </a>
              <a href="https://github.com/runlingli" target="_blank" rel="noreferrer" className="clink">
                <LucideIcon name="github" size={14} />
                github.com/runlingli
              </a>
              <a href="https://www.linkedin.com/in/runlingli" target="_blank" rel="noreferrer" className="clink">
                <LucideIcon name="linkedin" size={14} />
                linkedin.com/in/runlingli
              </a>
              <a href="tel:+15307606192" className="clink">
                <LucideIcon name="phone" size={14} />
                (530) 760-6192
              </a>
            </div>
          </div>

          <div className="card card-skills hov" id="skills">
            <div className="ctitle">{copy(lang, "// skills & tools", "// 技能与工具")}</div>
            <div className="skills-grid">
              <SkillGroup
                lang={lang}
                labelEn="Backend"
                labelZh="后端"
                items={[
                  ["Java", true],
                  ["Python", true],
                  ["Spring Boot", true],
                  ["Spring Security", false],
                  ["FastAPI", false],
                  ["Flask", false],
                  ["MySQL", false],
                  ["Redis", false],
                  ["Kafka", false],
                  ["Elasticsearch", false],
                ]}
              />
              <SkillGroup
                lang={lang}
                labelEn="AI / Search"
                labelZh="AI / 搜索"
                items={[
                  ["RAG", true],
                  ["Hybrid Retrieval", true],
                  ["LlamaIndex", true],
                  ["LangGraph", false],
                  ["Qdrant", false],
                  ["pgvector", false],
                  ["Spring AI", false],
                  ["RAGAS", false],
                ]}
              />
              <SkillGroup
                lang={lang}
                labelEn="Frontend + Infra"
                labelZh="前端与基础设施"
                items={[
                  ["React", true],
                  ["TypeScript", true],
                  ["Docker", false],
                  ["GCP Cloud Run", false],
                  ["Cloud SQL", false],
                  ["Canal", false],
                  ["MyBatis", false],
                  ["Git", false],
                ]}
              />
            </div>
          </div>

          <div className="reloc-section">
            <div className="globe-bg-text">{copy(lang, "Anywhere.", "任何地方。")}</div>
            <div className="globe-inner">
              <div>
                <div className="ctitle">{copy(lang, "// relocation", "// 工作地点")}</div>
                <h2 className="globe-h2">{copy(lang, "Available anywhere on Earth.", "愿意前往地球上任何地方。")}</h2>
                <p className="globe-sub">
                  {copy(
                    lang,
                    "Genuinely open to relocating globally for the right opportunity — research labs, startups, or tech teams anywhere in the world. Visa sponsorship welcome.",
                    "为合适的机会愿意全球搬迁——研究实验室、初创公司、世界各地的技术团队，签证支持亦可接受。",
                  )}
                </p>
                <div className="globe-tags">
                  {["North America", "Europe", "Asia Pacific", "Remote"].map((r) => (
                    <span key={r} className="ptag">{r}</span>
                  ))}
                </div>
              </div>
              <Globe lang={lang} />
            </div>
          </div>

          <div className="proj-section" id="projects">
            <div className="proj-hdr">
              <span className="proj-hdr-lbl">{copy(lang, "// projects", "// 项目")}</span>
              <div className="proj-hdr-line" />
              <span className="proj-hdr-count">{PROJECTS.length}</span>
            </div>
            <div className="proj-grid">
              {PROJECTS.map((project, index) => (
                <button type="button" key={project.name.en} className="card card-proj" onClick={() => setActiveProject(index)}>
                  <ProjectPreview project={project} index={index} />
                  <div className="pbody">
                    <div className="ptop">
                      <div className="picon" style={{ background: project.iconBackground }}>
                        <LucideIcon name={project.icon} size={18} style={{ color: project.iconColor }} />
                      </div>
                      <span className="parrow">
                        <LucideIcon name="arrow-up-right" size={17} />
                      </span>
                    </div>
                    <div className="pname">{project.name[lang]}</div>
                    <div className="pdesc">{project.summary[lang]}</div>
                    <div className="ptags">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="ptag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="pcta">
                      <LucideIcon name="mouse-pointer-click" size={11} />
                      <span>{copy(lang, "View details", "查看详情")}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="fun-section">
            <div className="proj-hdr">
              <span className="proj-hdr-lbl">{copy(lang, "// just for fun", "// 好玩的")}</span>
              <div className="proj-hdr-line" />
            </div>
            <div className="fun-grid">
              <button
                type="button"
                className="card card-proj fun-card"
                onClick={() => (window as any).navigate?.("/linkedin-post")}
              >
                <div className="ppreview">
                  <img src={_p("linkedin1.png")} alt="LinkedIn Post Machine" loading="lazy" className="ppreview-img" />
                </div>
                <div className="pbody">
                  <div className="ptop">
                    <div className="picon" style={{ background: "oklch(.93 .05 70)" }}>
                      <LucideIcon name="sparkles" size={18} style={{ color: "oklch(.55 .14 60)" }} />
                    </div>
                    <span className="parrow"><LucideIcon name="arrow-up-right" size={17} /></span>
                  </div>
                  <div className="pname">{copy(lang, "Fake LinkedIn Post Machine", "假 LinkedIn 帖子生成器")}</div>
                  <div className="pdesc">{copy(lang, "Generates ridiculously polished fictional professional updates — powered by AI", "AI 生成荒诞而精美的职场炫耀帖")}</div>
                  <div className="ptags">
                    <span className="ptag">DeepSeek</span>
                    <span className="ptag">gpt-image-2</span>
                    <span className="ptag fun-toy-tag">{copy(lang, "just for fun", "好玩的")}</span>
                  </div>
                  <div className="pcta">
                    <LucideIcon name="mouse-pointer-click" size={11} />
                    <span>{copy(lang, "Try it", "去玩玩")}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="card card-ticker hov">
            <div className="ticker-lbl">
              <LucideIcon name="chevrons-right" size={12} />
              <span>{copy(lang, "interests", "兴趣方向")}</span>
            </div>
            <div className="ticker-track">
              <div className="ticker-inner">
                {tickerItems.map((item, index) => (
                  <span key={`${item}-${index}`}>
                    <b>{item}</b>
                  </span>
                ))}
                <span>·</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className={`modal-bd ${codelabOpen ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && setCodelabOpen(false)}>
        {codelabOpen && (
          <div className="modal">
            <div className="modal-prev">
              <img src={CODELAB_EXP.previewImg} alt="CodeLab Davis" loading="lazy" className="modal-prev-img" />
            </div>
            <div className="mbody">
              <div className="mtop">
                <div className="micon-title">
                  <div className="micon" style={{ background: "oklch(.92 .04 290)" }}>
                    <LucideIcon name="cpu" size={22} style={{ color: "oklch(.40 .12 290)", display: "flex" }} />
                  </div>
                  <div>
                    <div className="mtitle">{CODELAB_EXP.title[lang]}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{CODELAB_EXP.role[lang]}</div>
                  </div>
                </div>
                <button type="button" className="mclose" onClick={() => setCodelabOpen(false)}>
                  <LucideIcon name="x" size={15} />
                </button>
              </div>
              <ul className="mdesc-list">
                {CODELAB_EXP.description[lang].map((point, i) => <li key={i}>{point}</li>)}
              </ul>
              <div className="ms-title">{copy(lang, "Tech Stack", "技术栈")}</div>
              <div className="mtags">
                {CODELAB_EXP.tags.map((tag) => <span key={tag} className="mtag">{tag}</span>)}
              </div>
              <div className="ms-title">{copy(lang, "Links", "链接")}</div>
              <div className="mlinks">
                <a href={CODELAB_EXP.link} className="mlink pri" target="_blank" rel="noreferrer">
                  <LucideIcon name="external-link" size={13} />
                  {CODELAB_EXP.linkLabel}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`modal-bd ${modalProject ? "open" : ""}`} onClick={(event) => event.target === event.currentTarget && setActiveProject(null)}>
        {modalProject ? (
          <div className="modal">
            <div className="modal-prev">
              <ModalPreview project={modalProject} index={activeProject ?? 0} />
            </div>
            <div className="mbody">
              <div className="mtop">
                <div className="micon-title">
                  <div className="micon" style={{ background: modalProject.iconBackground }}>
                    <LucideIcon name={modalProject.icon} size={22} style={{ color: modalProject.iconColor, display: "flex" }} />
                  </div>
                  <div className="mtitle">{modalProject.name[lang]}</div>
                </div>
                <button type="button" className="mclose" onClick={() => setActiveProject(null)}>
                  <LucideIcon name="x" size={15} />
                </button>
              </div>
              <ul className="mdesc-list">
                {modalProject.description[lang].map((point, i) => <li key={i}>{point}</li>)}
              </ul>
              <div className="ms-title">{copy(lang, "Tech Stack", "技术栈")}</div>
              <div className="mtags">
                {modalProject.tags.map((tag) => (
                  <span key={tag} className="mtag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="ms-title">{copy(lang, "Links", "链接")}</div>
              <div className="mlinks">
                {modalProject.github ? (
                  <a href={modalProject.github} className="mlink sec" target="_blank" rel="noreferrer">
                    <LucideIcon name="github" size={13} />
                    GitHub
                  </a>
                ) : null}
                {modalProject.demo ? (
                  <a href={modalProject.demo} className="mlink pri" target="_blank" rel="noreferrer">
                    <LucideIcon name="external-link" size={13} />
                    {modalProject.name.en === "Aconn"
                      ? copy(lang, "App Store", "App Store")
                      : copy(lang, "Live Demo", "查看演示")}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

type NavLinkProps = {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
};

function NavLink({ href, icon, label, active, onClick }: NavLinkProps) {
  return (
    <a className={`nav-link ${active ? "active" : ""}`} href={href} onClick={onClick}>
      <span className="nav-icon">
        <LucideIcon name={icon} size={14} />
      </span>
      <span className="nl">{label}</span>
    </a>
  );
}

type StatusRowProps = {
  icon: string;
  tone: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
};

function StatusRow({ icon, tone, title, subtitle, onClick }: StatusRowProps) {
  return (
    <div className={`srow ${onClick ? "srow-clickable" : ""}`} onClick={onClick}>
      <div className={`sicon ${tone}`}>
        <LucideIcon name={icon} size={15} />
      </div>
      <div className="srow-body">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      {onClick && (
        <span className="srow-chevron">
          <LucideIcon name="arrow-up-right" size={12} />
        </span>
      )}
    </div>
  );
}

type SkillGroupProps = {
  lang: Lang;
  labelEn: string;
  labelZh: string;
  items: Array<[string, boolean]>;
};

function SkillGroup({ lang, labelEn, labelZh, items }: SkillGroupProps) {
  return (
    <div>
      <div className="sg-label">{copy(lang, labelEn, labelZh)}</div>
      <div className="pills">
        {items.map(([item, highlight]) => (
          <span key={item} className={`pill ${highlight ? "hi" : ""}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Slideshow({ imgs, imgClassName = "modal-prev-img" }: { imgs: string[]; imgClassName?: string }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (imgs.length <= 1) return;
    timerRef.current = setInterval(() => setIdx((n) => (n + 1) % imgs.length), 3000);
  }, [imgs.length]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goTo = (i: number) => { setIdx(i); startTimer(); };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <img src={imgs[idx]} alt="" className={imgClassName} />
      {imgs.length > 1 && (
        <div className="slideshow-dots">
          <div className="slideshow-dots-pill">
            {imgs.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`slideshow-dot ${i === idx ? "active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectPreview({ project, index }: { project: Project; index: number }) {
  const patternId = `project-pattern-${index}`;

  if (project.previewImgs?.length) {
    return (
      <div className="ppreview">
        <img src={project.previewImgs[0]} alt={project.name.en} loading="lazy" className="ppreview-img" />
      </div>
    );
  }

  return (
    <div className="ppreview">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="12" height="12" patternTransform={project.patternRotation}>
            <rect width="12" height="12" fill={project.surface} />
            {index === 2 ? <rect width="12" height="6" fill={project.surfaceAccent} /> : <rect width="6" height="12" fill={project.surfaceAccent} />}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        <rect width="100%" height="100%" fill={project.surface.replace(")", " / 0.45)")} />
      </svg>
      <div className="pprev-lbl" style={{ color: project.labelColor, fontSize: "10px" }}>
        [ screenshot / demo ]
      </div>
    </div>
  );
}

function ModalPreview({ project, index }: { project: Project; index: number }) {
  const patternId = `modal-pattern-${index}`;

  if (project.previewImgs?.length) {
    return <Slideshow imgs={project.previewImgs} />;
  }

  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="14" height="14" patternTransform={`rotate(${index * 30})`}>
            <rect width="14" height="14" fill={project.surface} />
            <rect width="7" height="14" fill={project.surfaceAccent} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        <rect width="100%" height="100%" fill={project.surface.replace(")", "/0.5)")} />
      </svg>
      <div className="modal-prev-lbl" style={{ color: project.labelColor }}>
        [ screenshot / demo ]
      </div>
    </>
  );
}

function LucideIcon({ name, size, style }: { name: string; size: number; style?: CSSProperties }) {
  return <i data-lucide={name} style={{ width: size, height: size, ...style }} />;
}

export default App;
