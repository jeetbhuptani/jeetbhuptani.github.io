import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Jeet Bhuptani",
  initials: "JB",
  url: "https://www.github.com.jeetbhuptani",
  location: "Ahmedabad, GUJ, India",
  locationLink: "https://www.google.com/maps/place/ahmedabad",
  description:
    "Technologist and Software Engineer. I am all about building products that solve real-world problems. I love to learn new technologies and apply them to my projects.",
  summary:
    "I have six years of studying experience with hands on in this field. In the past, [I pursued a diploma in computer engineering](/#education) and [part of 2 hackathons for fun](/#hackathons). I also had the pleasure of being a part of the a club [GDG DDU](https://gdg.community.dev/gdg-on-campus-dharmsinh-desai-university-nadiad-india/).",
  avatarUrl: "/me.png",
  skills: [
    "C++",
    "Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "MERN/MEAN",
    ".NET",
    "GCP",
    "Docker",
    "Canva",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "jeet.work.id@gmail.com",
    tel: "+919638827462",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://www.github.com/jeetbhuptani",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/jeetbhuptani",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://www.twitter.com/jeetbhuptani",
        icon: Icons.x,

        navbar: true,
      },
      // Youtube: {
      //   name: "Youtube",
      //   url: "https://dub.sh/dillion-youtube",
      //   icon: Icons.youtube,
      //   navbar: true,
      // },
      email: {
        name: "Send Email",
        url: "#",
        icon: Icons.email,

        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Google Developer Group DDU",
      href: "https://gdg.community.dev/gdg-on-campus-dharmsinh-desai-university-nadiad-india/",
      badges: [],
      location: "Remote",
      title: "Cloud Team Member",
      logoUrl: "/google.png",
      start: "Sep 2024",
      end: "Present",
      description:
        "I am a part of the Google Developer Group DDU, where I am a Cloud Team Member. I am responsible for organizing events and workshops related to Google Cloud technologies. I also help in mentoring students and guiding them in their projects.",
    },
  ],
  education: [
    {
      school: "Seventh-Day Adventist (SDA), Ahmedabad",
      href: "https://www.sdaschoolahmedabad.org/",
      degree: "Till 10th Grade",
      logoUrl: "/sda.avif",
      start: "2008",
      end: "2020",
    },
    {
      school: "Government Polytechnic, Ahmedabad",
      href: "http://www.gpahmedabad.ac.in/",
      degree: "Diploma in Computer Engineering",
      logoUrl: "/gpa.png",
      start: "2020",
      end: "2023",
    },
    {
      school: "Dharmsinh Desai University (DDU)",
      href: "https://www.ddu.ac.in/",
      degree: "Bachelor of Technology in Computer Engineering",
      logoUrl: "/ddu.png",
      start: "2023",
      end: "2026",
    },
  ],
  projects: [
    {
      title: "Chat Collect",
      href: "https://chatcollect.com",
      dates: "Jan 2024 - Feb 2024",
      active: true,
      description:
        "With the release of the [OpenAI GPT Store](https://openai.com/blog/introducing-the-gpt-store), I decided to build a SaaS which allows users to collect email addresses from their GPT users. This is a great way to build an audience and monetize your GPT API usage.",
      technologies: [
        "Next.js",
        "Typescript",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "Stripe",
        "Shadcn UI",
        "Magic UI",
      ],
      links: [
        {
          type: "Website",
          href: "https://chatcollect.com",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "",
      video:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/chat-collect.mp4",
    },
    {
      title: "Magic UI",
      href: "https://magicui.design",
      dates: "June 2023 - Present",
      active: true,
      description:
        "Designed, developed and sold animated UI components for developers.",
      technologies: [
        "Next.js",
        "Typescript",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "Stripe",
        "Shadcn UI",
        "Magic UI",
      ],
      links: [
        {
          type: "Website",
          href: "https://magicui.design",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/magicuidesign/magicui",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "https://cdn.magicui.design/bento-grid.mp4",
    },
    {
      title: "llm.report",
      href: "https://llm.report",
      dates: "April 2023 - September 2023",
      active: true,
      description:
        "Developed an open-source logging and analytics platform for OpenAI: Log your ChatGPT API requests, analyze costs, and improve your prompts.",
      technologies: [
        "Next.js",
        "Typescript",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "Shadcn UI",
        "Magic UI",
        "Stripe",
        "Cloudflare Workers",
      ],
      links: [
        {
          type: "Website",
          href: "https://llm.report",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/dillionverma/llm.report",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "https://cdn.llm.report/openai-demo.mp4",
    },
    {
      title: "Automatic Chat",
      href: "https://automatic.chat",
      dates: "April 2023 - March 2024",
      active: true,
      description:
        "Developed an AI Customer Support Chatbot which automatically responds to customer support tickets using the latest GPT models.",
      technologies: [
        "Next.js",
        "Typescript",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "Shadcn UI",
        "Magic UI",
        "Stripe",
        "Cloudflare Workers",
      ],
      links: [
        {
          type: "Website",
          href: "https://automatic.chat",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "",
      video:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/automatic-chat.mp4",
    },
  ],
  hackathons: [
    {
      title: "DUHacks 4.0",
      dates: "February 22th -23th, 2022",
      location: "DDU, Nadiad",
      description:
        "Part of the organizing team. I was responsible for designing the poster for the event and managing the event.",
      image:
        "https://duhacks.tech/_next/image?url=%2Fassets%2Fimages%2Fduhacks.png&w=128&q=75",
      links: [{
        title: "Duhacks",
        icon: <Icons.globe className="h-4 w-4" />,
        href: "https://duhacks.tech/",
      },],
    },
    {
      title: "DUHacks 3.0",
      dates: "February 24th -25th, 2024",
      location: "DDU, Nadiad",
      description:
        "Developed a web application which helps restaurants to give leftover food to the needy people.",
      image:
        "https://duhacks.tech/_next/image?url=%2Fassets%2Fimages%2Fduhacks.png&w=128&q=75",
      links: [
        {
          title: "Github",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/karangondaliya/NourishNet",
        },
        {
          title: "Devfolio",
          icon: <img className="h-4 w-4" src="./devfolio.svg" />,
          href: "https://devfolio.co/projects/nourishnet-8909",
        },
      ],
    },
  ],
} as const;
