export type Stat = {
  value: string;
  label: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type Experience = {
  role: string;
  org: string;
  period: string;
  location?: string;
  stack: string[];
  bullets: string[];
};

export type Project = {
  name: string;
  category: string;
  summary: string;
  impact: string;
  stack: string[];
  details: string[];
};

export const profile = {
  name: "Runling Li",
  shortName: "RL",
  role: "ML-focused software engineer building production RAG systems and fast product experiences.",
  intro:
    "I am a computer science student at UC Davis who likes turning difficult product problems into reliable systems. My work sits across AI infrastructure, backend services, and the kind of frontend polish that makes complex software feel easy to use.",
  availability: "Open to software engineering internships and new grad opportunities.",
  location: "UC Davis, California",
  education: "B.S. in Computer Science, University of California, Davis (2023 - Present)",
  gpa: "3.75 GPA | 3.97 Engineering GPA",
  focusAreas: [
    "RAG pipelines",
    "Hybrid retrieval",
    "LLM evaluation",
    "FastAPI and Go backends",
    "React + TypeScript interfaces",
    "SwiftUI product work",
    "Cloud Run deployment",
    "Search relevance tuning",
  ],
  stats: [
    { value: "3s", label: "Reduced Acorn search latency from 30s+ to under 3s" },
    { value: "0.92", label: "Reached RAGAS answer relevancy on TaxCounsel" },
    { value: "8", label: "Unified models in the prompt evaluation platform" },
  ] as Stat[],
  contact: [
    { label: "Email", value: "lirunlingemily@gmail.com", href: "mailto:lirunlingemily@gmail.com" },
    { label: "GitHub", value: "github.com/runlingli", href: "https://github.com/runlingli" },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/runlingli",
      href: "https://www.linkedin.com/in/runlingli",
    },
  ],
  resumeLinks: [
    { label: "AI Resume", href: "/resume-ai-engineer.docx" },
    { label: "Java Resume", href: "/resume-java.docx" },
    { label: "iOS Resume", href: "/resume-ios.docx" },
    { label: "Python + Go Resume", href: "/resume-python-go.docx" },
  ],
};

export const skillGroups: SkillGroup[] = [
  {
    title: "AI / LLM",
    items: [
      "LlamaIndex",
      "LangGraph",
      "Qdrant",
      "RAGAS",
      "pgvector",
      "sentence-transformers",
      "LiteLLM",
      "FAISS",
    ],
  },
  {
    title: "Backend",
    items: [
      "Python",
      "Go",
      "FastAPI",
      "Flask",
      "PostgreSQL",
      "Redis",
      "gRPC",
      "Docker",
    ],
  },
  {
    title: "Frontend + Product",
    items: [
      "React",
      "TypeScript",
      "Zustand",
      "SwiftUI",
      "URLSession",
      "AsyncStream",
      "Responsive UI",
      "Figma implementation",
    ],
  },
];

export const experiences: Experience[] = [
  {
    role: "Software Engineer",
    org: "UC Davis CodeLab x Google",
    period: "Jan 2026 - Jun 2026 (Expected)",
    stack: ["Python", "FastAPI", "Pydantic", "Docker", "React", "TypeScript", "GCP"],
    bullets: [
      "Benchmarked Docling against PyMuPDF for multi-column resume parsing and selected the extraction backbone for downstream model experiments.",
      "Scaffolded a FastAPI resume matching service with endpoints for job matching, skills autocomplete, and location suggestions.",
      "Built responsive Google Careers Home experiences from Figma specs across desktop, tablet, and mobile with hover and focus-state polish.",
    ],
  },
  {
    role: "Software Engineer Intern",
    org: "Lianqing Power Technology Co.",
    period: "Jun 2025 - Sep 2025",
    location: "Chongqing, China",
    stack: ["Python", "Go", "FAISS", "OpenAI API"],
    bullets: [
      "Built a product Q and A assistant over device specification PDFs using FAISS and embeddings, enabling natural language queries with cited answers.",
      "Developed CRUD APIs in Go for medical device catalog and cart management workflows.",
    ],
  },
];

export const projects: Project[] = [
  {
    name: "TaxCounsel RAG",
    category: "AI Platform",
    summary:
      "A tax advisory system built around reliable retrieval, critic-based query repair, and citation-backed answers.",
    impact:
      "Validated answer quality with faithfulness 0.89, relevancy 0.92, and recall 0.87 using RAGAS.",
    stack: ["Python", "LlamaIndex", "Qdrant", "LangGraph", "FastAPI", "PyMuPDF"],
    details: [
      "Combined BM25 and dense retrieval with reciprocal rank fusion plus CrossEncoder reranking to recover sparse IRS terminology better than vector-only search.",
      "Replaced a fixed confidence threshold with an LLM critic that diagnoses failure modes, rewrites the query, and can refuse out-of-scope requests cleanly.",
      "Served responses through FastAPI with page-level citations extracted from source documents.",
    ],
  },
  {
    name: "Acorn",
    category: "iOS + Search",
    summary:
      "A UC Davis campus event discovery app with semantic search, AI summaries, and an iOS-first browsing experience.",
    impact:
      "Cut search latency from over 30 seconds to under 3 seconds while improving precision and recall.",
    stack: ["SwiftUI", "Python", "Flask", "PostgreSQL", "pgvector", "Cloud Run"],
    details: [
      "Scraped eight UC Davis event sources and fused PostgreSQL full-text search with pgvector similarity for stronger retrieval quality.",
      "Moved blocking model work off the hot path and replaced a rate-limited hosted embedding provider with local bge-small embeddings.",
      "Streamed Claude summaries to iOS using Flask SSE, URLSession.bytes, AsyncStream, and MainActor state updates for progressive rendering.",
    ],
  },
  {
    name: "Prompt Evaluation Platform",
    category: "Developer Tooling",
    summary:
      "A side-by-side comparison tool for benchmarking prompts across multiple LLMs with synchronized evaluation UX.",
    impact:
      "Unified eight models behind one API and used asyncio parallelism to reduce average response time by about 88 percent.",
    stack: ["React", "TypeScript", "FastAPI", "LiteLLM", "PostgreSQL", "Zustand"],
    details: [
      "Built a React + TypeScript evaluation interface for side-by-side prompt testing with synchronized state.",
      "Used FastAPI and LiteLLM to standardize orchestration across multiple providers and persist results to PostgreSQL.",
      "Focused the UI on fast iteration, readable comparisons, and low-friction experimentation loops.",
    ],
  },
];
