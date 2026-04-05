export interface YouTubeCreator {
  channelId: string;
  name: string;
  tags: string[];
}

export const DEFAULT_CREATORS: YouTubeCreator[] = [
  { channelId: "UCLvnJL8htRR1T9cbSccaoVw", name: "Aswath Damodaran", tags: ["Investing & Stocks", "Real Estate"] },
  { channelId: "UCDXTQ8nWmx_EhZ2v-kp7QxA", name: "Ben Felix", tags: ["Investing & Stocks", "Budgeting & Saving"] },
  { channelId: "UCASM0cgfkJxQ1ICmRilfHLw", name: "Patrick Boyle", tags: ["Investing & Stocks", "Crypto & New Tech"] },
  { channelId: "UC4a-Gbdw7vOaccHmFo40b9g", name: "Khan Academy", tags: ["Budgeting & Saving", "Investing & Stocks", "Taxes"] },
  { channelId: "UCoUxsWakJucWg46KW5RsvPw", name: "Financial Times", tags: ["Investing & Stocks", "Career & Salary"] },
  { channelId: "UCEAZeUIeJs0IjQiqTCdVSIg", name: "Yahoo Finance", tags: ["Investing & Stocks", "Career & Salary"] },
  { channelId: "UCGtbVv_ACgV7difdVZ92NMw", name: "Corporate Finance Institute", tags: ["Investing & Stocks", "Career & Salary"] },
];

const STORAGE_KEY = "econology_youtube_creators";

export function getCreators(): YouTubeCreator[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CREATORS;
  } catch {
    return DEFAULT_CREATORS;
  }
}

export function saveCreators(creators: YouTubeCreator[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creators));
}
