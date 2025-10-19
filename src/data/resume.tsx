import { Icons } from "@/components/icons";
import { Certificate } from "crypto";
import { HomeIcon, NotebookIcon } from "lucide-react";
import Image from "next/image";

export const DATA = {
  name: "Jeet Bhuptani",
  initials: "JB",
  url: "https://www.github.com.jeetbhuptani",
  location: "Ahmedabad, GUJ, India",
  locationLink: "https://www.google.com/maps/place/ahmedabad",
  description:
    `A ${(() => { const birthDate = new Date('2004-08-01');
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    })()} years young Computer Engineer. I am all about building <s>projects</s> <strong>products</strong>. I love to learn new technologies and apply them to my products.`,
  summary:
    "I have six years of studying experience with hands on in this field. In the past, [I pursued a diploma in computer engineering](/#education) and [part of 4 hackathons for fun & learning](/#hackathons). I also had the pleasure of being a part of a club [GDG DDU](https://gdg.community.dev/gdg-on-campus-dharmsinh-desai-university-nadiad-india/).",
  avatarUrl: "/jeet.jpg",
  skills: [
    "C++",
    "Java",
    "Python",
    "JS/TS",
    "Spring",
    "MERN",
    "NextJS",
    ".NET",
    "GCP",
    "AWS",
    "Docker",
    "AI/ML",
    "Canva",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
    { href: "/certificate", icon: Icons.certificate , label: "Certificates" },
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
        url: "https://bit.ly/jeetbhuptani-resume",
        icon: Icons.resume,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:jeet.work.id@gmail.com",
        icon: Icons.email,

        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Simform",
      href: "https://www.simform.com/",
      badges: [],
      location: "Ahmedabad",
      title: "Trainee",
      logoUrl: "/simform.png",
      start: "Jan 2026",
      end: "Jun 2026",
      description:
        "Upcoming Trainee (Intern) where I will learn and work on assigned and real world projects",
    },
  ],
  volunteer: [
    {
      company: "Google Developer Group DDU",
      href: "https://gdg.community.dev/gdg-on-campus-dharmsinh-desai-university-nadiad-india/",
      badges: [],
      location: "Remote",
      title: "Tech Lead",
      logoUrl: "/google.png",
      start: "Sep 2025",
      end: "Present",
      description:
        "My responsibilities are to manage the technical aspects of the club, organize and manage events and workshops. I also mentor and guide the members of the club in their domain events and coordinate with team leads for smooth functioning of the club.",
    },
    {
      company: "Google Developer Group DDU",
      href: "https://gdg.community.dev/gdg-on-campus-dharmsinh-desai-university-nadiad-india/",
      badges: [],
      location: "Remote",
      title: "Cloud Team Member",
      logoUrl: "/google.png",
      start: "Sep 2024",
      end: "Sep 2025",
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
      title: "Artha AI",
      href: "https://arthaai-7x8z.onrender.com/",
      dates: "May 2025 - May 2025",
      active: true,
      description:
        "अर्थ means 'wealth'. Representing the knowledge of wealth in your language. Learn and Analysis finances in your way with Artha AI.",
      technologies: [
        "Typescript",
        "React",
        "Vite",
        "Shadcn UI",
        "JWT",
        "Express",
        "TailwindCSS",
        "Gemini",
        "MongoDB Atlas",
      ],
      links: [
        {
          type: "Website",
          href: "https://arthaai-7x8z.onrender.com",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://www.github.com/jeetbhuptani/arthaai",
          icon: <Icons.github className="size-3" />,
        }
      ],
      image: "",
      video:
        "./artha.mp4",
    },
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
      title: "Holboxathon",
      dates: "May 24th - 26th, 2025",
      location: "Online",
      description:
        "AI Hackathon organized by Holbox AI. Me and my team developed Intellicruit, an AI-powered recruitment platform that streamlines the hiring process by automating candidate screening and scoring.",
      image: "holbox.png",
      links: [
        {
          title: "Github",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://github.com/MILANBHADARKA/intellicruit",
        },
        {
          title: "Devfolio",
          icon: <Image src="/devfolio.svg" alt="Devfolio Logo" width={16}  height={16} className="h-4 w-4" />,
          href: "https://devfolio.co/projects/intellicruit-8ab9",
        },
      ],
    },
    {
      title: "Ignosis Hackathon",
      dates: "May 6th - 8th, 2025",
      location: "Online",
      description:
        "Internal Hackathon for DDU students organized by Ignosis. I developed Artha AI during this hackathon.",
      image:
        "ignosis.png",
      links: [
      {
        title: "Github",
        icon: <Icons.globe className="h-4 w-4" />,
        href: "https://github.com/jeetbhuptani/arthaai",
      },{
        title: "Artha AI",
        icon: <Icons.globe className="h-4 w-4" />,
        href: "https://arthaai-7x8z.onrender.com/",
      },],
    },
    {
      title: "DUHacks 4.0",
      dates: "February 22th -23th, 2025",
      location: "DDU, Nadiad",
      description:
        "Part of the organizing team. I was responsible for designing the poster for the event and managing the event.",
      image:
        "./duhacks.png",
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
        "duhacks.png",
      links: [
        {
          title: "Github",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/karangondaliya/NourishNet",
        },
        {
          title: "Devfolio",
          icon: <Image src="/devfolio.svg" alt="Devfolio Logo" width={16}  height={16} className="h-4 w-4" />,
          href: "https://devfolio.co/projects/nourishnet-8909",
        },
      ],
    },
  ],
  certificates:[
    {
      title: "AWS Academy Graduate - AWS Academy Machine Learning Foundations",
      issuer: "Amazon Web Services",
      date: "June 2025",
      description: "Demonstrates foundational knowledge of machine learning concepts, AWS ML services, and best practices for implementing ML solutions in the cloud.",
      image: "/certificates/aws-ml-foundations.png",
      credentialId: "",
      links: [
        {
          type: "Certificate",
          href: "https://www.credly.com/badges/07d71884-6bc3-46b0-9b37-89afe39261e4/public_url",
          icon: <Icons.globe className="size-3" />,
        },
      ],
    },
    {
      title: "Disaster Risk Monitoring Using Satellite Imagery",
      issuer: "NVIDIA",
      date: "November 2024",
      description: "Learned how to build and deploy a deep learning model to automate the detection of flood events using satellite imagery from the Sentinel-1 satellite.",
      image: "/certificates/disaster-risk-monitoring.png",
      credentialId: "dzSE06yTR_2M4K1o3H4OXg",
      links: [
        {
          type: "Certificate",
          href: "https://learn.nvidia.com/certificates?id=dzSE06yTR_2M4K1o3H4OXg",
          icon: <Icons.globe className="size-3" />,
        },
      ],
    },
    {
      title: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      issuer: "Amazon Web Services",
      date: "June 2025",
      description: "Demonstrates foundational knowledge of cloud computing concepts, AWS services, and best practices for deploying and managing applications in the cloud.",
      image: "/certificates/aws-cloud-foundations.png",
      credentialId: "",
      links: [
        {
          type: "Certificate",
          href: "https://www.credly.com/badges/e7eff2c3-8bd3-40bb-801b-74c49e83e2db/public_url",
          icon: <Icons.globe className="size-3" />,
        },
      ],
    },
    {
      title: "Responsive Web Design",
      issuer: "freeCodeCamp",
      date: "June 2024",
      description: "Demonstrates knowledge of responsive web design principles, including fluid grids, flexible images, and media queries.",
      image: "/certificates/responsive-web-design.png",
      credentialId: "jeet_bhuptani-rwd",
      links: [
        {
          type: "Certificate",
          href: "https://www.freecodecamp.org/certification/Jeet_Bhuptani/responsive-web-design",
          icon: <Icons.globe className="size-3" />,
        },
      ],
    },
  ]
} as const;
