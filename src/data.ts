export type Member = { name: string; role: string; tasks: string; hue: number };

export const TEAM: Member[] = [
  {
    name: "Yousef",
    role: "Backend",
    tasks: "Repo, CI, docker-compose, FastAPI skeleton, database model and the SQL upload endpoint.",
    hue: 210,
  },
  {
    name: "Noureen",
    role: "Parsing",
    tasks: "Hardens the SQL parser on real databases like Pagila and Northwind, and fixes what breaks.",
    hue: 340,
  },
  {
    name: "Osama",
    role: "Modeling and evaluation",
    tasks: "Collects benchmark databases, hand-labels fact and dimension tables, and scores the classifier.",
    hue: 150,
  },
  {
    name: "Abdelrahman",
    role: "AI",
    tasks: "Builds the LLM provider interface and domain detection with validated output.",
    hue: 270,
  },
  {
    name: "Kenzey",
    role: "Frontend A",
    tasks: "React, Vite, TypeScript and the ReactFlow graph with fact and dimension styles.",
    hue: 30,
  },
  {
    name: "Yousef",
    role: "Frontend B",
    tasks: "Upload and project pages, and the first rough screens for the schema editor.",
    hue: 190,
  },
];