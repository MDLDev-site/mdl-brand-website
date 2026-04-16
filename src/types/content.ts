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
