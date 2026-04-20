// Call notes section definitions shared between the call-notes page and the PDF parser.

export interface CallNoteSection {
  key: string;
  label: string;
  aliases: string[];
}

export const CALL_NOTE_SECTIONS: CallNoteSection[] = [
  { key: 'overview',               label: 'Overview',                          aliases: ['overview', 'summary', 'about'] },
  { key: 'problem',                label: 'Problem',                           aliases: ['problem', 'challenge', 'pain point'] },
  { key: 'solution',               label: 'Solution / Product',                aliases: ['solution / product', 'solution/product', 'solution'] },
  { key: 'product_business_model', label: 'Product & Business Model',          aliases: ['product & business model', 'product and business model', 'business model', 'revenue model', 'model'] },
  { key: 'traction_metrics',       label: 'Traction & Metrics',                aliases: ['traction & metrics', 'traction and metrics', 'traction metrics', 'traction', 'metrics', 'numbers', 'kpis'] },
  { key: 'founding_team',          label: 'Founding Team',                     aliases: ['founding team', 'team', 'founders'] },
  { key: 'competition',            label: 'Competition',                       aliases: ['competition', 'competitive landscape', 'competitors'] },
  { key: 'roadmap_gtm',            label: 'Roadmap / GTM / Expansion',         aliases: ['roadmap', 'gtm', 'expansion', 'roadmap / gtm / expansion', 'go to market'] },
  { key: 'fundraise_history',      label: 'Fundraise History & Current Raise', aliases: ['fundraise', 'fundraising', 'raise', 'fundraise history', 'current raise', 'fundraise history & current raise'] },
];
