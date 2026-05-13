import type { APIRoute } from 'astro';
import { loadYaml } from '../lib/yaml-loader';
import type {
  Navigation,
  PageContent,
  HeroSection,
  LogoBannerSection,
  FeatureSection,
  CarouselSection,
  GridSection,
  CustomerSection,
  AccordionFeaturesSection,
  FeaturesPageContent,
  PricingPageContent,
} from '../types/content';

const BASE_URL = import.meta.env.SITE as string;

function findSection<T>(sections: PageContent['sections'], type: string): T | undefined {
  return sections.find((s) => s.type === type) as T | undefined;
}

function findSections<T>(sections: PageContent['sections'], type: string): T[] {
  return sections.filter((s) => s.type === type) as T[];
}

function pricingTable(product: PricingPageContent['products'][number]): string {
  const columns = product.tiers[0]?.differentiators?.map((d) => d.label) ?? [];
  const header = ['Tier', 'Monthly', 'Annual (p/m)', ...columns];
  const separator = header.map(() => '---');
  const rows = product.tiers.map((tier) => {
    const diffValues = columns.map((col) => {
      const match = tier.differentiators?.find((d) => d.label === col);
      return match?.value ?? '—';
    });
    return [tier.name, tier.monthlyPrice, tier.annualPrice, ...diffValues];
  });
  const toRow = (cells: string[]) => `| ${cells.join(' | ')} |`;
  return [toRow(header), toRow(separator), ...rows.map(toRow)].join('\n');
}

export const GET: APIRoute = async () => {
  const [nav, home, features, pricing] = await Promise.all([
    loadYaml<Navigation>('global/navigation.yaml'),
    loadYaml<PageContent>('pages/home.yaml'),
    loadYaml<FeaturesPageContent>('pages/features.yaml'),
    loadYaml<PricingPageContent>('pages/pricing.yaml'),
  ]);

  const hero = findSection<HeroSection>(home.sections, 'hero');
  const logoBanner = findSection<LogoBannerSection>(home.sections, 'logo_banner');
  const featureSections = findSections<FeatureSection>(home.sections, 'feature');
  const carousel = findSection<CarouselSection>(home.sections, 'carousel');
  const grid = findSection<GridSection>(home.sections, 'grid');
  const customers = findSection<CustomerSection>(home.sections, 'customers');
  const accordion = findSection<AccordionFeaturesSection>(home.sections, 'accordion_features');

  // --- Who It's For ---
  const whoItsFor = carousel?.cards
    .map((card) => `- **${card.title}**: ${card.description}`)
    .join('\n') ?? '';

  // --- Key Highlights (home feature sections) ---
  const homeFeatures = featureSections
    .map((s) => {
      const bullets = s.features.map((f) => `  - ${f.text}`).join('\n');
      return `### ${s.heading}\n\n${s.description}\n\n${bullets}`;
    })
    .join('\n\n');

  // --- Fan Viewing Experience (grid) ---
  const gridItems = grid?.features
    .map((f) => `- **${f.title}**: ${f.description}`)
    .join('\n') ?? '';

  // --- Platform Capabilities (accordion) ---
  const accordionItems = accordion?.items
    .map((item) => `### ${item.title}\n\n${item.description}`)
    .join('\n\n') ?? '';

  // --- Full Feature Categories (features.yaml) ---
  const featureCategories = features.categories
    .filter((c) => c.features.length > 0)
    .map((cat) => {
      const items = cat.features.map((f) => {
        let entry = `#### ${f.title}\n\n${f.description}`;
        if (f.checks?.length) {
          entry += '\n\n' + f.checks.map((c) => `- ${c}`).join('\n');
        }
        return entry;
      }).join('\n\n');
      return `### ${cat.heading}\n\n${cat.description}\n\n${items}`;
    })
    .join('\n\n---\n\n');

  // --- Pricing tables ---
  const productTables = pricing.products
    .map((p) => `### ${p.tabLabel}\n\n${p.description}\n\n${pricingTable(p)}`)
    .join('\n\n');

  // --- FAQ ---
  const faqItems = pricing.faq.items
    .map((item) => `**${item.question}**\n${item.answer}`)
    .join('\n\n');

  // --- Customers ---
  const partnerNames = logoBanner?.logos.map((l) => l.alt).join(', ') ?? '';
  const caseStudyNames = customers?.caseStudies.map((c) => c.brandName).join(', ') ?? '';

  // --- Pages ---
  const navPages = nav.links
    .map((link) => `- [${link.text}](${BASE_URL}${link.href})`)
    .join('\n');

  const body = `# ${nav.brand.name}

> ${hero?.subtitle ?? ''}

${hero?.subheading ?? ''}

## Who It's For

${whoItsFor}

## Products

${homeFeatures}

## Viewing Experience

${gridItems}

## Platform Capabilities

${accordionItems}

## Full Feature Reference

${featureCategories}

## Customers

${nav.brand.name} is used by organisations including: ${partnerNames}.

Featured case studies: ${caseStudyNames}.

## Pricing

${pricing.faq.heading ? `${pricing.faq.description}\n\n` : ''}Four tiers per product (monthly or annual billing, 20% discount on annual). No setup fees. All prices exclude VAT.

${productTables}

## Frequently Asked Questions

${faqItems}

## Pages

${navPages}
- [About](${BASE_URL}/about)
- [Pricing](${BASE_URL}/pricing)
- [Sign In](${BASE_URL}/sign-in)
- [Contact](${BASE_URL}/contact)

## Contact

- Website: ${BASE_URL}
- Sales enquiries: ${BASE_URL}/contact
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
