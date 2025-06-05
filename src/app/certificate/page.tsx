import BlurFade from "@/components/magicui/blur-fade";
import { CertificateCard } from "@/components/certificate-card";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;

export const metadata = {
  title: "Certificates",
  description: "My professional certifications and achievements.",
};

export default function CertificatesPage() {
  return (
    <section id="certificates">
      <div className="space-y-12 w-full py-12">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                Certificates
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Professional Certifications
              </h1>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Here are some of my professional certifications that validate my
                skills and knowledge in various technologies and platforms.
              </p>
            </div>
          </div>
        </BlurFade>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 max-w-[1200px] mx-auto">
          {DATA.certificates.map((certificate, id) => (
            <BlurFade
              key={certificate.title}
              delay={BLUR_FADE_DELAY * 2 + id * 0.05}
            >
              <CertificateCard
                title={certificate.title}
                issuer={certificate.issuer}
                date={certificate.date}
                description={certificate.description}
                image={certificate.image}
                credentialId={certificate.credentialId}
                links={certificate.links}
              />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}