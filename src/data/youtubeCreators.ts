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
  { channelId: "UC4FlMVm2eKBB3RyAsnIbMYA", name: "New Money", tags: ["Investing & Stocks", "Budgeting & Saving"] },
  { channelId: "UCnkEhPBMZcEO0QGu51fDFDg", name: "Marginal Revolution University", tags: ["Investing & Stocks", "Career & Salary"] },
  { channelId: "UCmMOkGfgSNIqNqDNFNFSJGw", name: "Mark Meldrum", tags: ["Investing & Stocks"] },
  { channelId: "UCGYYNGc3pk6FFLb3bKRxmMA", name: "The Plain Bagel", tags: ["Investing & Stocks", "Budgeting & Saving"] },
  { channelId: "UCWV3obpZVGgJ3j9FVhEjhgw", name: "Bloomberg Originals", tags: ["Investing & Stocks", "Career & Salary"] },
  { channelId: "UCVgFGCQ-WYBiYYLngSh8lbg", name: "The Economist", tags: ["Investing & Stocks", "Career & Salary"] },
  { channelId: "UCWdiBhNsRe571bMhsDbKMwg", name: "Money & Macro", tags: ["Investing & Stocks", "Budgeting & Saving"] },
  { channelId: "UCMnQ_Q7J34_29YK23_MlhvA", name: "Lyn Alden", tags: ["Investing & Stocks", "Crypto & New Tech"] },
  { channelId: "UCXT_6JkSBSEvqWNsDYeBnQA", name: "Real Vision", tags: ["Investing & Stocks"] },
  { channelId: "UCL0eFNPIpYD5YlJxw-s-i2Q", name: "Eurodollar University", tags: ["Investing & Stocks"] },
  { channelId: "UChlT3pOHCXEkrlU8WUqadGw", name: "Blockworks Macro", tags: ["Investing & Stocks", "Crypto & New Tech"] },
  { channelId: "UCK7tPTUE4N-0mF3Kl0OaR2g", name: "Wall Street Journal", tags: ["Investing & Stocks", "Career & Salary"] },
  { channelId: "UCY6yIlVXxaBGYjrFSFNGZ5A", name: "Gary Stevenson", tags: ["Investing & Stocks", "Budgeting & Saving"] },
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
