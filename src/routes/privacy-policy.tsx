import { createFileRoute } from "@tanstack/react-router";
import { MaskReveal, Reveal } from "@/components/motion/primitives";

const title = "Privacy Policy — The Content Architecture";
const description =
  "How The Content Architecture handles personal data, analytics, purchases, and email for customers and site visitors.";

const SECTIONS = [
  {
    h: "Data we collect",
    p: "We collect the email address you provide at checkout or when you ask to be notified about an upcoming edition, and anonymous, cookie-less usage analytics for the site itself.",
  },
  {
    h: "Analytics",
    p: "Traffic is measured with a privacy-friendly analytics provider that does not set cookies and does not build cross-site profiles. No personally identifying information is stored alongside page views.",
  },
  {
    h: "Payments",
    p: "Purchases are processed by Stripe. Card details never reach this site; Stripe stores and processes them under its own privacy terms and shares only the information needed to fulfil your licence.",
  },
  {
    h: "Email",
    p: "Your email is used to deliver repository access, licence details, and product updates. You can ask for it to be deleted at any time.",
  },
  {
    h: "Your rights",
    p: "You can request access to, correction of, or deletion of your data by writing to hello@edoardolunardi.dev. Requests are handled within 30 days.",
  },
];

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <section className="px-6 pt-40 pb-28 md:px-10 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="mono-label text-muted-foreground">Legal</p>
        </Reveal>
        <MaskReveal
          as="h1"
          text="Privacy Policy"
          className="display-title mt-6 text-[clamp(2.25rem,5.2vw,4.5rem)]"
        />
        <div className="mt-16 max-w-2xl">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.h} delay={i * 0.06}>
              <div className="border-t border-border py-8">
                <p className="mono-label text-muted-foreground">
                  {String(i + 1).padStart(3, "0")} / {s.h}
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">{s.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}