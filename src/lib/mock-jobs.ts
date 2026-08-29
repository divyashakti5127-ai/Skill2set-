export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  matchScore: number;
  description: string;
  whyMatch: string;
}

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Mechanical Design Engineer",
    company: "Tata Technologies",
    location: "Pune, India",
    workMode: "Hybrid",
    matchScore: 92,
    description:
      "Design and develop mechanical components for automotive and industrial products using CAD tools.",
    whyMatch:
      "A strong fit for candidates with mechanical engineering, AutoCAD, SolidWorks, and automotive interests.",
  },
  {
    id: "2",
    title: "Financial Analyst",
    company: "Deloitte",
    location: "Bengaluru, India",
    workMode: "Hybrid",
    matchScore: 88,
    description:
      "Support financial planning, reporting, forecasting, and business-performance analysis.",
    whyMatch:
      "A good fit for finance, accounting, Excel, reporting, and analytical skills.",
  },
  {
    id: "3",
    title: "Graphic Designer",
    company: "Canva",
    location: "Remote",
    workMode: "Remote",
    matchScore: 85,
    description:
      "Create visual assets, marketing designs, social-media creatives, and brand materials.",
    whyMatch:
      "A good fit for design, branding, illustration, Photoshop, Figma, and creative skills.",
  },
];
