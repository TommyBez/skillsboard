import type { Metadata } from "next"
import Link from "next/link"

import { LegalPageShell } from "@/components/legal-page-shell"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Skills Board collects, uses, shares, and protects personal data.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="This policy explains what Skills Board collects, why it is used, and the choices available to you."
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
        Last updated July 29, 2026
      </p>

      <section>
        <h2>Controller and contact</h2>
        <p>
          The hosted service is operated under the Skills Board name. Skills Board is the controller for the personal
          data described in this policy. Contact {siteConfig.contactEmail} or write to {siteConfig.name},{" "}
          {siteConfig.postalAddress}.
        </p>
      </section>

      <section>
        <h2>Who this policy covers</h2>
        <p>
          This policy applies to the hosted Skills Board website, application, and email communications. It does not
          govern third-party websites, repositories, or services that you choose to open from Skills Board.
        </p>
      </section>

      <section>
        <h2>Data we collect</h2>
        <ul>
          <li>Account data such as your name, email address, email verification status, and authentication sessions.</li>
          <li>
            Team and library data such as organizations, memberships, invitations, saved skill sources, notes, prompts,
            tags, and collections.
          </li>
          <li>
            Technical and usage data such as browser and device information, IP address, security events, pages viewed,
            and product actions measured through production analytics.
          </li>
          <li>
            Email preference data such as the communication topic, consent source, notice version, consent and
            withdrawal times, delivery failures, complaints, and suppression status. Email addresses used for this
            audit trail are protected with a keyed hash where possible.
          </li>
          <li>
            Messages and information you send when you contact us for support, privacy requests, or product feedback.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use data</h2>
        <ul>
          <li>Provide authentication, team libraries, collaboration, invitations, and agent connections.</li>
          <li>Send requested transactional messages such as sign-in codes and team invitations.</li>
          <li>Protect the service, prevent abuse, diagnose failures, and maintain reliability.</li>
          <li>Understand product use and improve Skills Board.</li>
          <li>
            Send product updates, launch news, practical guides, and research invitations only when you have opted in.
          </li>
          <li>Comply with legal obligations and enforce applicable terms.</li>
        </ul>
      </section>

      <section>
        <h2>Legal bases</h2>
        <p>
          Where data protection law requires a legal basis, Skills Board relies on performance of the service you
          requested, consent for optional product communications, legitimate interests in security and service
          improvement, and compliance with legal obligations. You can withdraw consent for product communications at
          any time without affecting your account.
        </p>
      </section>

      <section>
        <h2>Product communications</h2>
        <p>
          Creating an account does not subscribe you to marketing. Product communications require an affirmative,
          optional choice. You can change that choice in <Link href="/settings/email">Email preferences</Link> or use
          the unsubscribe link in any product email. Withdrawal takes effect for future product communications.
          Transactional sign-in codes and team invitations are separate and are not affected by a marketing
          unsubscribe.
        </p>
      </section>

      <section>
        <h2>Service providers and disclosures</h2>
        <p>Skills Board uses service providers to operate the hosted product, including:</p>
        <ul>
          <li>Vercel for hosting, delivery, and website analytics.</li>
          <li>Neon for hosted application database services.</li>
          <li>Resend for transactional email and consented product communications.</li>
          <li>PostHog for production product analytics.</li>
          <li>GitHub and skills.sh when retrieving public skill and repository information at your request.</li>
        </ul>
        <p>
          These providers process data under their own security and privacy commitments. Skills Board may also disclose
          data when required by law, to protect people or the service, or as part of a business transfer subject to
          appropriate safeguards. Skills Board does not sell personal data.
        </p>
      </section>

      <section>
        <h2>Retention</h2>
        <p>
          Account and workspace data is retained while needed to provide the service. Security, delivery, and diagnostic
          records are retained only as long as reasonably necessary for those purposes. Consent and suppression records
          may be retained after an unsubscribe so Skills Board can demonstrate the choice and avoid sending future
          product communications. Data may be kept longer when required by law or needed to resolve a dispute.
        </p>
      </section>

      <section>
        <h2>Security and international processing</h2>
        <p>
          Skills Board uses reasonable technical and organizational safeguards, including access controls and protected
          email preference identifiers. No system can guarantee absolute security. Data may be processed in countries
          where Skills Board providers operate, subject to applicable provider terms and transfer safeguards.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, delete, restrict, or export personal data,
          object to certain processing, withdraw consent, or complain to a data protection authority. Contact us to make
          a request. We may need to verify your identity before acting on it.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          This policy may change as the product or legal requirements change. The updated date above identifies the
          current version. Material changes will be communicated through an appropriate product or account notice.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For privacy questions or requests, email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          {" "}or write to {siteConfig.name}, {siteConfig.postalAddress}.
        </p>
      </section>
    </LegalPageShell>
  )
}
