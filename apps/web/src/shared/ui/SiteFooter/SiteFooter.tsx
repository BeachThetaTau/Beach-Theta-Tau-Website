import { FaInstagram, FaFacebook } from "react-icons/fa";
import { LuMail } from "react-icons/lu";

const socials = [
  {
    href: "https://www.instagram.com/beachthetatau/",
    icon: FaInstagram,
    alt: "Instagram",
    label: "@beachthetatau",
    external: true,
  },
  {
    href: "https://www.facebook.com/beachthetatau/",
    icon: FaFacebook,
    alt: "Facebook",
    label: "CSULB Theta Tau",
    external: true,
  },
  {
    href: "mailto:beachthetatau@gmail.com",
    icon: LuMail,
    alt: "E-mail",
    label: "beachthetatau@gmail.com",
    external: false,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-footer text-footer-text">
      <div className="container-page flex flex-col gap-10 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <img src="/logo.svg" alt="Theta Tau logo" className="h-16 w-16 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="m-0 font-semibold text-white">Theta Tau</p>
            <p className="m-0 text-sm">Xi Epsilon Chapter</p>
            <p className="m-0 text-sm">California State University, Long Beach</p>
            <p className="m-0 mt-3 text-xs text-footer-text/70">
              © Theta Tau is an SLD sponsored student organization
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              aria-label={`${social.alt}: ${social.label}`}
              className="group inline-flex items-center gap-3 no-underline transition-colors hover:text-white"
              {...(social.external ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              <social.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span className="text-sm">{social.label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
