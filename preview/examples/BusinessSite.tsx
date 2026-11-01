// Example template — a small-business site built ONLY from the data-driven page
// sections plus PricingTable and LogoWall: no hand-composed layout. This is the
// shape a page generator emits (a list of blocks with plain props).
import { Clock, Palette, Search, ShieldCheck, Smartphone, Zap } from 'lucide-solid'
import type { JSX } from 'solid-js'

import {
  ContactSection,
  CtaBanner,
  Faq,
  FeatureGrid,
  Hero,
  LogoWall,
  PricingTable,
  SiteFooter,
  SiteNav,
  TeamGrid,
  Testimonials,
  toast,
} from '../../src'

export default function BusinessSite(): JSX.Element {
  return (
    <div data-testid="business-site" class="rounded-xl border border-border">
      <SiteNav
        brand="Northwind Studio"
        sticky={false}
        links={[
          { label: 'Services', href: '#bs-features' },
          { label: 'Pricing', href: '#bs-pricing' },
          { label: 'FAQ', href: '#bs-faq' },
          { label: 'Contact', href: '#bs-contact' },
        ]}
        cta={{ label: 'Get a quote', href: '#bs-contact' }}
      />
      <Hero
        eyebrow="Web studio · Mexico City"
        title="Websites that bring customers in"
        subtitle="A fast, good-looking site for your business, live in days instead of months."
        primary={{ label: 'Get a quote', href: '#bs-contact' }}
        secondary={{ label: 'See pricing', href: '#bs-pricing' }}
        image="https://picsum.photos/seed/a4-business/1200/900"
        layout="split"
      />
      <div class="mx-auto w-full max-w-6xl px-5 pb-8">
        <LogoWall
          logos={[
            { src: 'https://picsum.photos/seed/techdaily/160/48', alt: 'TechDaily' },
            { src: 'https://picsum.photos/seed/stylemag/160/48', alt: 'StyleMag' },
            { src: 'https://picsum.photos/seed/marketwire/160/48', alt: 'MarketWire' },
            { src: 'https://picsum.photos/seed/urbanpost/160/48', alt: 'UrbanPost' },
            { src: 'https://picsum.photos/seed/dailyscoop/160/48', alt: 'DailyScoop' },
            { src: 'https://picsum.photos/seed/northwire/160/48', alt: 'NorthWire' },
          ]}
        />
      </div>
      <FeatureGrid
        id="bs-features"
        title="Everything a small business needs"
        subtitle="No plugins to babysit, no surprise bills."
        items={[
          { title: 'Fast by default', text: 'Pages load in under a second on a phone.', icon: <Zap /> },
          { title: 'Secure', text: 'HTTPS, backups and updates handled for you.', icon: <ShieldCheck /> },
          {
            title: 'Mobile first',
            text: 'Designed for the screen your customers use.',
            icon: <Smartphone />,
          },
          { title: 'Found on search', text: 'Clean markup and metadata out of the box.', icon: <Search /> },
          { title: 'Your brand', text: 'Colors and type that match your business.', icon: <Palette /> },
          { title: 'Live in days', text: 'Most sites launch within two weeks.', icon: <Clock /> },
        ]}
      />
      <Testimonials
        title="What our clients say"
        items={[
          {
            quote: 'We doubled our bookings the month the new site went live.',
            name: 'Ana Ruiz',
            role: 'Owner, Brisa Spa',
          },
          {
            quote: 'They understood what we needed in one call.',
            name: 'Luis Ortega',
            role: 'Director, Ortega Legal',
          },
          {
            quote: 'Fast, clear, and the site looks great on phones.',
            name: 'Marta Gil',
            role: 'Founder, Pan & Co.',
          },
        ]}
      />
      <section id="bs-pricing" class="mx-auto w-full max-w-6xl px-5 py-20">
        <PricingTable
          tiers={[
            {
              name: 'Starter',
              price: '$4,900 MXN',
              features: ['One-page site', 'Contact form', 'Hosting 1 year'],
              cta: { label: 'Choose', href: '#bs-contact' },
            },
            {
              name: 'Business',
              price: '$9,900 MXN',
              features: ['Up to 6 pages', 'Blog', 'Hosting 1 year', 'Analytics'],
              highlighted: true,
              cta: { label: 'Choose', href: '#bs-contact' },
            },
            {
              name: 'Store',
              price: '$19,900 MXN',
              features: ['Online store', 'Payments', 'Hosting 1 year'],
              cta: { label: 'Choose', href: '#bs-contact' },
            },
          ]}
        />
      </section>
      <TeamGrid
        title="Meet the team"
        members={[
          { name: 'Ana Ruiz', role: 'Founder', bio: 'Ten years building sites for local shops.' },
          { name: 'Luis Ortega', role: 'Design lead', bio: 'Turns brands into pages people remember.' },
          { name: 'Marta Gil', role: 'Developer', bio: 'Keeps every site fast and accessible.' },
        ]}
      />
      <Faq
        id="bs-faq"
        title="Frequently asked questions"
        items={[
          { question: 'How long does a site take?', answer: 'Most sites go live in one to two weeks.' },
          { question: 'Can I edit it myself?', answer: 'Yes. Text and photos are editable without code.' },
          {
            question: 'Do you offer hosting?',
            answer: 'Hosting, domain and SSL are included in every plan.',
          },
        ]}
      />
      <CtaBanner
        title="Ready to get more customers?"
        subtitle="Tell us about your business and get a quote within a day."
        primary={{ label: 'Get a quote', href: '#bs-contact' }}
        secondary={{ label: 'Call us', href: 'tel:+525512345678' }}
      />
      <ContactSection
        id="bs-contact"
        title="Get in touch"
        subtitle="We reply within one business day."
        fields={['name', 'email', 'phone', 'message']}
        onSubmit={(values) => toast.success(`Thanks, ${values.name ?? 'friend'}! We'll be in touch.`)}
        email="hello@northwind.example"
        phone="+52 55 1234 5678"
        address={'Av. Reforma 123\nCiudad de México'}
      />
      <SiteFooter
        brand="Northwind Studio"
        tagline="Websites for small businesses."
        columns={[
          {
            title: 'Company',
            links: [
              { label: 'About', href: '#bs-features' },
              { label: 'Team', href: '#bs-features' },
            ],
          },
          {
            title: 'Services',
            links: [
              { label: 'Websites', href: '#bs-pricing' },
              { label: 'Hosting', href: '#bs-pricing' },
            ],
          },
          {
            title: 'Help',
            links: [
              { label: 'FAQ', href: '#bs-faq' },
              { label: 'Contact', href: '#bs-contact' },
            ],
          },
        ]}
        social={[
          { network: 'instagram', href: 'https://instagram.com' },
          { network: 'facebook', href: 'https://facebook.com' },
          { network: 'tiktok', href: 'https://tiktok.com' },
          { network: 'youtube', href: 'https://youtube.com' },
        ]}
      />
    </div>
  )
}
