import { Img, Link, Section, Text } from "react-email"

import { getBrandLogoMark } from "@/emails/assets"
import { siteConfig } from "@/lib/site"

export function BrandHeader() {
  const logoMark = getBrandLogoMark()

  return (
    <Section className="mb-8">
      {/* One link: mark is decorative beside the visible brand name (email a11y). */}
      <Link href={siteConfig.url} className="text-ink no-underline">
        <Img
          src={logoMark.src}
          alt=""
          width={logoMark.width}
          height={logoMark.height}
          style={{ display: "inline", verticalAlign: "middle" }}
        />
        <Text
          className="m-0 text-[17px] font-semibold leading-none tracking-[-0.04em] text-ink"
          style={{ display: "inline", marginLeft: 12, verticalAlign: "middle" }}
        >
          {siteConfig.name}
        </Text>
      </Link>
    </Section>
  )
}
