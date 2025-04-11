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
    "I have six years of studying experience with hands on in this field. In the past, [I pursued a diploma in computer engineering](/#education) and [part of 2 hackathons for fun](/#hackathons). I also had the pleasure of being a part of a club [GDG DDU](https://gdg.community.dev/gdg-on-campus-dharmsinh-desai-university-nadiad-india/).",
  avatarUrl: "/jeet.jpg",
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
      Resume:{
        name: "Resume",
        url: "https://drive.google.com/file/d/1HIZ7sCziQqdML4FCJiTe6m4V13HhjNLW/view?usp=sharing",
        icon: Icons.resume,
        navbar: true,
      },
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
      school: "Dharmsinh Desai University (DDU)",
      href: "https://www.ddu.ac.in/",
      degree: "Bachelor of Technology in Computer Engineering",
      logoUrl: "/ddu.png",
      start: "2023",
      end: "2026",
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
      school: "Seventh-Day Adventist (SDA), Ahmedabad",
      href: "https://www.sdaschoolahmedabad.org/",
      degree: "Till 10th Grade",
      logoUrl: "/sda.avif",
      start: "2008",
      end: "2020",
    },
    
  ],
  projects: [
    {
      title: "Smart Trip Planner",
      href: "https://smart-trip-planner-v1.vercel.app/",
      dates: "December 2024 - March 2025",
      active: true,
      description:
        "With Smart Trip Planner, you can plan your trip in a smart way. Make a perfect itinerary for your trip. You can also add your own places to the itinerary.",
      technologies: [
        "Typescript",
        "React",
        "Vite",
        "Shadcn UI",
        "Redux",
        "JWT",
        "TailwindCSS",
        "Gemini API",
        "Flask",
        "MongoDB",
      ],
      links: [
        {
          type: "Website",
          href: "https://smart-trip-planner-v1.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://www.github.com/jeetbhuptani/smarttripplanner",
          icon: <Icons.github className="size-3" />,
        }
      ],
      image: "",
      video:
        "./stp.mp4",
    },
    {
      title: "MediChain",
      href: "https://github.com/jeetbhuptani/medichainmvc",
      dates: "Auguest 2024 - November 2024",
      active: true,
      description:
        "A compact and efficient web application for managing inventory and sales in a pharmacy. Built using the MVC architecture, it provides a user-friendly interface for managing products, sales, and customers.",
      technologies: [
        "C#",
        "ASP.NET Core",
        ".NET Authentication",
        "Entity Framework",
        "MVVM",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/jeetbhuptani/medichainmvc",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "mcmvc.mp4",
    },
    {
      title: "Zen-Z",
      href: "https://github.com/jeetbhuptani/zen-z",
      dates: "July 2024 - November 2024",
      active: true,
      description:
        "A productivity tool to maintain tasks, habits and journal entries and track those activities. Zen means peace and Z is for Gen Z.",
      technologies: [
        "React",
        "Typescript",
        "JWT",
        "TailwindCSS",
        "MongoDB",
        "Express",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/jeetbhuptani/zen-z",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "./zenz.mp4",
    },
    {
      title: "Simple Product Store",
      href: "https://github.com/jeetbhuptani/mern-crud",
      dates: "February 2025 - March 2025",
      active: true,
      description:
        "A simple and fun project for clean MERN production and deployment. CRUD operations for product store.",
      technologies: [
        "React",
        "Vite",
        "Chakra UI",
        "Zustand",
        "ExpressJS",
        "MongoDB",
      ],
      links: [
        {
          type: "Website",
          href: "https://mern-crud-ewrj.onrender.com/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/jeetbhuptani/mern-crud",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "./ps.mp4",
    },
    {
      title: "The Cook Book (TCB)",
      href: "https://github.com/jeetbhuptani/thecookbook",
      dates: "February 2024 - March 2024",
      active: true,
      description:
        "An ultimate recipe book for food lovers. You can find recipes for all types of food and even review & report them. You can also add your own recipes.",
      technologies: [
        "Python",
        "Django",
        "SQLite",
        "Django Admin & Authentication",
        "Bootstrap",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/jeetbhuptani/thecookbook",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video:
        "./tcb.mp4",
    },
  ],
  hackathons: [
    {
      title: "DUHacks 4.0",
      dates: "February 22th -23th, 2025",
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
