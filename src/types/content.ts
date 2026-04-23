/**
 * Content types matching mdl-brand-site-cms schema.
 * Keep in sync with mdl-brand-site-cms/lib/types/content.types.ts
 */

// Shared types

export interface CTAButton {
  text: string;
  link: string;
}

export interface Navigation {
  brand: {
    name: string;
    logo: string;
  };
  links: Array<{
    text: string;
    href: string;
    hasDropdown?: boolean;
  }>;
  cta: {
    signIn: CTAButton;
    primary: CTAButton;
  };
}

// Section types

export interface HeroSection {
  type: 'hero';
  heading: string[];
  subheading: string;
  cta: {
    primary: CTAButton;
    secondary: CTAButton;
  };
}

export interface LogoBannerSection {
  type: 'logo_banner';
  heading: string;
  logos: Array<{
    src: string;
    alt: string;
  }>;
}

export interface FeatureSection {
  type: 'feature';
  heading: string;
  description: string;
  features: Array<{
    text: string;
  }>;
  image: string;
  imageAlt: string;
  imagePosition: 'left' | 'right';
  cta: {
    primary: CTAButton;
    secondary: CTAButton;
  };
}

export interface CarouselSection {
  type: 'carousel';
  heading: string;
  cards: Array<{
    title: string;
    description: string;
  }>;
}

export interface GridSection {
  type: 'grid';
  heading: string;
  description: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  cta: {
    primary: CTAButton;
    secondary: CTAButton;
  };
}

export interface CustomerSection {
  type: 'customers';
  heading: string;
  caseStudies: Array<{
    quote: string;
    brandLogo: string;
    brandName: string;
    backgroundImage: string;
    gradientColor: string;
    cta: CTAButton;
  }>;
}

export interface AccordionFeaturesSection {
  type: 'accordion_features';
  heading: string[];
  stats: Array<{
    value: string;
    label: string;
  }>;
  cta: {
    primary: CTAButton;
    secondary: CTAButton;
  };
  items: Array<{
    title: string;
    description?: string;
    learnMoreLink?: string;
    expanded?: boolean;
  }>;
}

export interface CTABannerSection {
  type: 'cta_banner';
  heading: string[];
  description: string;
  button: CTAButton;
  backgroundImage?: string;
}

export interface MailingListSection {
  type: 'mailing_list';
  heading: string;
  description: string;
  placeholder: string;
  buttonText: string;
}

export interface DiagonalsSection {
  type: 'diagonals';
  variant: 'grey-to-white' | 'white-to-grey' | 'color-strips';
}

export type Section =
  | HeroSection
  | LogoBannerSection
  | FeatureSection
  | CarouselSection
  | GridSection
  | CustomerSection
  | AccordionFeaturesSection
  | CTABannerSection
  | MailingListSection
  | DiagonalsSection;

export interface PageMeta {
  title: string;
  description: string;
}

export interface PageContent {
  page: PageMeta;
  sections: Section[];
}

// Features page types

export interface FeaturesHeroData {
  heading: string[];
  description: string;
}

export interface AnchorItem {
  id: string;
  label: string;
}

export interface FeatureRow {
  title: string;
  description: string;
  checks?: string[];
  image?: string;
}

export interface FeatureCategory {
  id: string;
  heading: string;
  description: string;
  background: 'white' | 'grey';
  features: FeatureRow[];
}

export interface FeaturesPageContent {
  page: PageMeta;
  hero: FeaturesHeroData;
  anchors: AnchorItem[];
  categories: FeatureCategory[];
}

// Pricing page types

export type PricingProductId = 'on-demand' | 'live';
export type PricingTagVariant = 'recommended' | 'most-popular';
export type PricingButtonVariant = 'grey' | 'blue' | 'orange';

export interface PricingDifferentiator {
  label: string;
  value: string;
}

export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  vatNote: string;
  description: string;
  tag?: {
    label: string;
    variant: PricingTagVariant;
  };
  buttonVariant: PricingButtonVariant;
  differentiators: PricingDifferentiator[];
  cta: CTAButton;
}

export interface PricingProduct {
  id: PricingProductId;
  tabLabel: string;
  description: string;
  tiers: PricingTier[];
}

export interface PricingHeroData {
  heading: string;
  description: string;
  calculatorPrompt: string;
  calculatorButton: string;
  billingToggle: {
    monthlyLabel: string;
    annualLabel: string;
  };
}

export interface PricingComparisonAvailability {
  // String for textual values (e.g. "1TB", "Unlimited"); true/false for checkmark/dash
  value: string | boolean;
}

export interface PricingComparisonRow {
  label: string;
  // One entry per tier in product.tiers, ordered identically
  values: PricingComparisonAvailability[];
}

export interface PricingComparisonGroup {
  id: string;
  heading: string;
  rows: PricingComparisonRow[];
}

export interface PricingComparison {
  productId: PricingProductId;
  groups: PricingComparisonGroup[];
}

export interface PricingCalculatorSlider {
  id: string;
  label: string;
  tooltip: string;
  min: number;
  max: number;
  step: number;
  default: number;
  ticks: number[];
  unit?: string;
}

export interface PricingCalculator {
  heading: string;
  description: string;
  productPrompt: string;
  sliders: PricingCalculatorSlider[];
  outputs: {
    consumptionLabel: string;
    recommendationPrefix: string;
    hoursLabel: string;
    hoursTooltip: string;
    bandwidthLabel: string;
    bandwidthTooltip: string;
  };
  contact: {
    prompt: string;
    cta: CTAButton;
  };
}

export interface PricingFAQItem {
  question: string;
  answer: string;
}

export interface PricingFAQ {
  heading: string;
  description: string;
  cta: CTAButton;
  items: PricingFAQItem[];
}

export interface PricingPageContent {
  page: PageMeta;
  hero: PricingHeroData;
  products: PricingProduct[];
  comparisons: PricingComparison[];
  calculator: PricingCalculator;
  faq: PricingFAQ;
}

export interface FooterColumn {
  title: string;
  links: Array<{
    text: string;
    href: string;
  }>;
}

export interface Footer {
  columns: FooterColumn[];
  copyright: string;
  legal: CTAButton;
  socials: Array<{
    platform: string;
    href: string;
  }>;
}
