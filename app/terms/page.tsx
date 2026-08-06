import type { Metadata } from "next"

import { LegalPageShell } from "@/components/legal-page-shell"
import { siteConfig } from "@/lib/site"

const description = "Terms that apply when you use the hosted Skills Board service."
const socialTitle = "Terms of Service | Skills Board"
const socialImageAlt = "Skills Board: Your team’s skills. All in one place."

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: "/terms",
    title: socialTitle,
    description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [{ url: "/opengraph-image", alt: socialImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description,
    images: [{ url: "/twitter-image", alt: socialImageAlt }],
  },
}

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description="These terms set the basic rules for using the hosted Skills Board service."
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
        Last updated July 29, 2026
      </p>

      <section>
        <h2>Service operator</h2>
        <p>
          The hosted service is operated under the Skills Board name. The operator can be reached at{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> or at {siteConfig.postalAddress}.
        </p>
      </section>

      <section>
        <h2>Accepting these terms</h2>
        <p>
          By creating an account or using the hosted Skills Board service, you agree to these terms. If you use Skills
          Board for a company or team, you confirm that you are authorized to accept these terms for that organization.
          If you do not agree, do not use the hosted service.
        </p>
      </section>

      <section>
        <h2>The service</h2>
        <p>
          Skills Board provides shared libraries for saving, organizing, finding, and reusing AI skills. Features may
          include team collaboration, public repository discovery, downloads, and agent connections. The hosted service
          may change as the product develops.
        </p>
      </section>

      <section>
        <h2>Accounts and team access</h2>
        <p>
          You must provide accurate account information and keep access to your email secure. You are responsible for
          actions taken through your account and for assigning appropriate team roles. Notify us promptly if you believe
          an account or invitation has been misused.
        </p>
      </section>

      <section>
        <h2>Your content</h2>
        <p>
          You retain ownership of content you submit to Skills Board. You grant Skills Board a limited license to host,
          process, reproduce, and display that content only as needed to operate and improve the service. You are
          responsible for ensuring that you have the rights and permissions needed to submit and share it with your team.
        </p>
      </section>

      <section>
        <h2>Public and third-party material</h2>
        <p>
          Skills Board can surface links, metadata, commands, archives, or instructions from public repositories and
          third-party services. That material remains subject to its original license and terms. Review sources and
          instructions before installing or running anything. Skills Board does not guarantee that third-party material
          is accurate, secure, compatible, or available.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>You may not use Skills Board to:</p>
        <ul>
          <li>Break the law, violate another person's rights, or distribute content you are not allowed to share.</li>
          <li>Probe, disrupt, overload, or bypass security, access controls, rate limits, or service restrictions.</li>
          <li>Introduce malware, malicious instructions, deceptive content, or unauthorized automated traffic.</li>
          <li>Access another account, team, or private content without permission.</li>
          <li>Resell or misrepresent the hosted service in a way that suggests an unauthorized affiliation.</li>
        </ul>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p>
          The hosted service is provided without a guaranteed uptime or support level unless a separate written agreement
          says otherwise. Features may be added, changed, suspended, or removed. When practical, Skills Board will give
          notice of changes that materially reduce core hosted functionality.
        </p>
      </section>

      <section>
        <h2>Suspension and termination</h2>
        <p>
          You may stop using Skills Board at any time. Skills Board may restrict or terminate access when reasonably
          necessary to protect the service or other users, respond to legal requirements, or address a material violation
          of these terms. Where appropriate, we will provide notice and an opportunity to resolve the issue.
        </p>
      </section>

      <section>
        <h2>Disclaimers</h2>
        <p>
          To the extent permitted by law, the hosted service is provided as available and without warranties of
          merchantability, fitness for a particular purpose, non-infringement, or uninterrupted operation. Skills Board
          does not make professional, legal, security, or compliance decisions for you. Nothing in these terms excludes
          rights or warranties that cannot lawfully be excluded.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by law, Skills Board is not liable for indirect, incidental, special, consequential, or
          punitive damages, or for lost profits, data, goodwill, or business opportunities arising from use of the hosted
          service. This limitation does not apply where liability cannot lawfully be limited.
        </p>
      </section>

      <section>
        <h2>Open source software</h2>
        <p>
          The Skills Board source code is available under the license included in its public repository. That license
          governs your use of the source code. These terms separately govern use of the hosted service.
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          These terms may be updated as the service changes. The updated date above identifies the current version.
          Continued use after an update takes effect means you accept the revised terms, except where applicable law
          requires a different form of notice or consent.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          {" "}or mailed to {siteConfig.name}, {siteConfig.postalAddress}.
        </p>
      </section>
    </LegalPageShell>
  )
}
