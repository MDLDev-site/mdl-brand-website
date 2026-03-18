/**
 * Content types matching mdl-brand-site-cms schema.
 * Keep in sync with mdl-brand-site-cms/lib/types/content.types.ts
 */

export interface CTAButton {
  text: string;
  link: string;
}

export interface HeroSection {
  type: 'hero';
  heading: string;
  subheading: string;
  cta: {
    primary: CTAButton;
    secondary?: CTAButton;
  };
  background_color?: string;
  background_image?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface FeatureGridSection {
  type: 'feature_grid';
  heading: string;
  description?: string;
  features: Feature[];
}

export interface CTABannerSection {
  type: 'cta_banner';
  heading: string;
  description?: string;
  button: CTAButton;
}

export type Section = HeroSection | FeatureGridSection | CTABannerSection;

export interface PageContent {
  page: {
    title: string;
    description: string;
  };
  sections: Section[];
}

export interface NavigationLink {
  text: string;
  href: string;
}

export interface Navigation {
  brand: {
    name: string;
    logo: string;
  };
  links: NavigationLink[];
  cta: CTAButton;
}
