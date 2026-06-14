import path from "node:path";

export type EngineeringDatasetConfig = {
  year: number;
  slug: string;
  /** Path relative to the engineering data directory */
  relativeFile: string;
};

// Path to the engineering data directory
const DATA_ROOT = "/Users/advaitnandeshwar/Desktop/mhtchet3yr/fe_output";

/** Available engineering datasets */
export const ENGINEERING_DATASETS: EngineeringDatasetConfig[] = [
  {
    year: 2024,
    slug: "fe-2024",
    relativeFile: "fe2024/allotments.csv",
  },
  {
    year: 2025,
    slug: "fe-2025",
    relativeFile: "fe2025/allotments.csv",
  },
];

export function resolveDatasetPath(relativeFile: string): string {
  return path.join(DATA_ROOT, relativeFile);
}

export function findDataset(slug: string): EngineeringDatasetConfig | undefined {
  return ENGINEERING_DATASETS.find((dataset) => dataset.slug === slug);
}
