/**
 * mockData.js
 * -----------
 * Mock job listings used by the whole application.
 *
 * This is a FRONTEND-ONLY project, so there is no real backend or
 * database. All jobs below are fictional sample data used purely for
 * demonstration purposes.
 */

const jobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Karachi, Pakistan',
    type: 'Full-time',
    salary: '$60,000 - $80,000',
    experience: '2-4 years',
    keywords: ['React', 'JavaScript', 'CSS', 'Frontend'],
    shortDescription:
      'Build beautiful, high-performance user interfaces for our flagship SaaS dashboard using modern React.',
    description:
      'TechCorp is looking for a passionate Frontend Developer to join our product engineering team. You will work closely with designers and backend engineers to ship polished, accessible, and blazing-fast interfaces used by thousands of customers every day.\n\nYou will own features end to end — from turning Figma designs into reusable React components to optimising bundle size and runtime performance. This is a hybrid role based in Karachi with two days a week in the office.',
    responsibilities: [
      'Build and maintain responsive UI components using React and modern CSS',
      'Collaborate with designers to translate mockups into pixel-perfect interfaces',
      'Write clean, tested, and reusable frontend code',
      'Optimise application performance and accessibility',
      'Participate in code reviews and mentor junior developers',
    ],
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git', 'REST APIs'],
    companyInfo:
      'TechCorp is a Karachi-based software company building cloud collaboration tools for teams around the world. We value ownership, curiosity, and a healthy work-life balance.',
    postedDate: '2026-08-28',
  },
  {
    id: 2,
    title: 'Remote Node.js Engineer',
    company: 'ByteBridge',
    location: 'Remote (Worldwide)',
    type: 'Remote',
    salary: '$85,000 - $110,000',
    experience: '3-5 years',
    keywords: ['Node.js', 'Backend', 'API', 'Remote'],
    shortDescription:
      'Design and scale reliable REST and real-time APIs powering millions of requests a day for our fintech platform.',
    description:
      'ByteBridge is a fully distributed fintech company. As a Node.js Engineer you will design, build, and operate the backend services behind our payments platform.\n\nYou will work async-first with a global team, write robust TypeScript/JavaScript services, and make architectural decisions that keep our systems fast, safe, and available. Fully remote — you can work from anywhere with a stable connection and a few hours of overlap with the EU time zone.',
    responsibilities: [
      'Develop and maintain high-throughput Node.js microservices',
      'Design RESTful APIs and WebSocket integrations',
      'Write automated tests and participate in code reviews',
      'Monitor, troubleshoot, and improve service reliability',
      'Document APIs and architecture decisions',
    ],
    skills: ['Node.js', 'Express', 'JavaScript', 'PostgreSQL', 'Redis', 'Docker'],
    companyInfo:
      'ByteBridge is a remote-first fintech startup with 40+ engineers across 15 countries. We build modern payment infrastructure and believe great work can happen anywhere.',
    postedDate: '2026-09-01',
  },
  {
    id: 3,
    title: 'React Developer',
    company: 'CodeLabs',
    location: 'Lahore, Pakistan',
    type: 'Full-time',
    salary: '$55,000 - $75,000',
    experience: '1-3 years',
    keywords: ['React', 'Redux', 'JavaScript', 'Frontend'],
    shortDescription:
      'Craft component libraries and interactive dashboards with React and Redux at a fast-moving software studio.',
    description:
      'CodeLabs is a software studio that builds products for international clients. We are expanding our Lahore engineering hub and need a React Developer who loves component-driven development.\n\nYou will work on several client projects — from e-commerce stores to analytics dashboards — so adaptability and strong fundamentals matter more than years on paper.',
    responsibilities: [
      'Develop reusable React components and design systems',
      'Manage application state with Redux Toolkit',
      'Integrate third-party APIs and libraries',
      'Write unit tests with Jest and React Testing Library',
      'Collaborate with QA and project managers to ship quality releases',
    ],
    skills: ['React', 'Redux', 'JavaScript', 'Tailwind CSS', 'Jest', 'Git'],
    companyInfo:
      'CodeLabs is a product studio in Lahore with 60+ people. We combine engineering and design to launch digital products that users love, serving clients across the US and Europe.',
    postedDate: '2026-08-30',
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    company: 'InnovateSoft',
    location: 'Islamabad, Pakistan',
    type: 'Full-time',
    salary: '$70,000 - $95,000',
    experience: '3-6 years',
    keywords: ['React', 'Node.js', 'MongoDB', 'Full Stack'],
    shortDescription:
      'Own full-stack features across a React frontend and a Node.js/MongoDB backend for our healthcare platform.',
    description:
      'InnovateSoft builds digital health products used by hospitals and clinics. We are looking for a Full Stack Developer who can move confidently between the browser and the server.\n\nYou will take features from database schema to polished UI, working in small cross-functional squads alongside product managers and clinicians to improve patient care through technology.',
    responsibilities: [
      'Build end-to-end features across frontend and backend',
      'Design MongoDB schemas and optimise queries',
      'Create secure REST APIs with Node.js and Express',
      'Implement authentication and role-based access control',
      'Write and maintain integration tests',
    ],
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'AWS'],
    companyInfo:
      'InnovateSoft is an Islamabad-based company on a mission to modernise healthcare IT in South Asia. We are mission-driven, collaborative, and growing quickly.',
    postedDate: '2026-09-03',
  },
  {
    id: 5,
    title: 'UI/UX Designer',
    company: 'PixelWorks',
    location: 'Remote (Asia)',
    type: 'Contract',
    salary: '$45,000 - $65,000',
    experience: '2-5 years',
    keywords: ['UI', 'UX', 'Figma', 'Design'],
    shortDescription:
      'Design intuitive, delightful product experiences and maintain a scalable design system at a digital agency.',
    description:
      'PixelWorks is a boutique digital agency crafting products for startups. We are hiring a UI/UX Designer to lead the design of web and mobile products end to end.\n\nYou will conduct user research, create wireframes and high-fidelity prototypes in Figma, run usability tests, and partner with developers to ensure pixel-perfect implementation.',
    responsibilities: [
      'Create user flows, wireframes, and interactive prototypes',
      'Design high-fidelity UI for web and mobile products',
      'Build and maintain a scalable component-based design system',
      'Run usability testing and iterate based on feedback',
      'Collaborate closely with developers during implementation',
    ],
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'Wireframing'],
    companyInfo:
      'PixelWorks is a remote-first design agency working with funded startups across Asia and North America. We are a small, senior team obsessed with craft and clarity.',
    postedDate: '2026-08-26',
  },
  {
    id: 6,
    title: 'Python Developer',
    company: 'DataTech',
    location: 'Hyderabad, Pakistan',
    type: 'Full-time',
    salary: '$65,000 - $90,000',
    experience: '2-4 years',
    keywords: ['Python', 'Django', 'Backend', 'Data'],
    shortDescription:
      'Build data pipelines and backend services in Python/Django for a growing analytics company.',
    description:
      'DataTech helps businesses make sense of their data. As a Python Developer you will build the backend services and data pipelines that ingest, process, and serve millions of records.\n\nYou will write clean Django applications, design ETL jobs, and optimise query performance. An interest in machine learning is a plus but not required.',
    responsibilities: [
      'Develop and maintain Django-based backend services',
      'Build and schedule ETL data pipelines',
      'Write efficient SQL and optimise database queries',
      'Create REST APIs for analytics dashboards',
      'Automate deployments with CI/CD tooling',
    ],
    skills: ['Python', 'Django', 'PostgreSQL', 'Pandas', 'Docker', 'Linux'],
    companyInfo:
      'DataTech is an analytics software company in Hyderabad with clients in retail and logistics. We turn raw data into decisions our customers act on daily.',
    postedDate: '2026-08-29',
  },
  {
    id: 7,
    title: 'DevOps Engineer',
    company: 'CloudSystems',
    location: 'Karachi, Pakistan',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    experience: '3-6 years',
    keywords: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    shortDescription:
      'Automate infrastructure, harden CI/CD, and run Kubernetes clusters at scale for enterprise clients.',
    description:
      'CloudSystems provides managed cloud infrastructure to enterprise customers. We are looking for a DevOps Engineer who thrives on automation and reliability.\n\nYou will design infrastructure as code, build CI/CD pipelines, and operate Kubernetes clusters across multiple AWS regions. On-call rotation is shared and well-compensated.',
    responsibilities: [
      'Design and manage AWS infrastructure with Terraform',
      'Build and maintain CI/CD pipelines in GitHub Actions',
      'Operate and scale Kubernetes (EKS) clusters',
      'Implement monitoring, logging, and alerting with Prometheus/Grafana',
      'Automate security scanning and compliance checks',
    ],
    skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    companyInfo:
      'CloudSystems is a managed cloud provider headquartered in Karachi with a strong regional presence. We help enterprises migrate and run workloads in the cloud reliably and securely.',
    postedDate: '2026-09-02',
  },
  {
    id: 8,
    title: 'Backend Developer',
    company: 'WebSolutions',
    location: 'Rawalpindi, Pakistan',
    type: 'Full-time',
    salary: '$60,000 - $85,000',
    experience: '2-5 years',
    keywords: ['Java', 'Spring Boot', 'Backend', 'Microservices'],
    shortDescription:
      'Develop scalable Java/Spring Boot microservices for high-traffic e-commerce and logistics systems.',
    description:
      'WebSolutions builds large-scale e-commerce and logistics platforms. We are hiring a Backend Developer to work on our order management and inventory microservices.\n\nYou will design resilient services, integrate with message queues, and work in a structured, well-tested codebase. We value clean architecture and engineering discipline.',
    responsibilities: [
      'Develop microservices with Java and Spring Boot',
      'Design REST APIs and event-driven integrations',
      'Implement caching and optimise database access',
      'Write comprehensive unit and integration tests',
      'Collaborate with frontend and QA teams on releases',
    ],
    skills: ['Java', 'Spring Boot', 'MySQL', 'RabbitMQ', 'Docker', 'Microservices'],
    companyInfo:
      'WebSolutions is a software company in Rawalpindi powering commerce for regional retail chains. With 200+ employees, we combine engineering excellence with strong client delivery.',
    postedDate: '2026-08-31',
  },
  {
    id: 9,
    title: 'Mobile App Developer',
    company: 'AppWorld',
    location: 'Remote (Pakistan)',
    type: 'Remote',
    salary: '$55,000 - $80,000',
    experience: '2-4 years',
    keywords: ['React Native', 'Mobile', 'iOS', 'Android'],
    shortDescription:
      'Ship cross-platform mobile apps with React Native, reaching millions of users on both iOS and Android.',
    description:
      'AppWorld is a mobile-first company behind several popular consumer apps. As a Mobile App Developer you will build features used by millions of people every week.\n\nYou will work on our React Native codebase, collaborate with product and design, and ensure a smooth, native-feeling experience across platforms.',
    responsibilities: [
      'Develop and ship features in React Native',
      'Integrate native modules and third-party SDKs',
      'Optimise app performance and startup time',
      'Write tests and fix bugs reported from production',
      'Coordinate releases to the App Store and Google Play',
    ],
    skills: ['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Android', 'Firebase'],
    companyInfo:
      'AppWorld builds consumer mobile applications and is fully remote within Pakistan. We are product-obsessed, ship often, and care deeply about app quality.',
    postedDate: '2026-09-04',
  },
  {
    id: 10,
    title: 'Software Engineer',
    company: 'FutureTech',
    location: 'Karachi, Pakistan',
    type: 'Full-time',
    salary: '$75,000 - $105,000',
    experience: '4-7 years',
    keywords: ['Software Engineer', 'Full Stack', 'JavaScript', 'Architecture'],
    shortDescription:
      'Solve challenging product and platform problems as a generalist software engineer in our core product team.',
    description:
      'FutureTech builds AI-assisted developer tools used by engineering teams worldwide. We are looking for a well-rounded Software Engineer to join our core product squad.\n\nYou will work across the stack — from crafting polished React UIs to building scalable backend services. We value engineers who can take a vague problem, break it down, and ship a thoughtful solution.',
    responsibilities: [
      'Develop full-stack features across product surfaces',
      'Design pragmatic architecture that scales with growth',
      'Improve engineering tooling and developer experience',
      'Mentor junior engineers through pairing and reviews',
      'Contribute to product strategy and technical roadmap',
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'GraphQL', 'System Design'],
    companyInfo:
      'FutureTech is a well-funded startup with offices in Karachi and San Francisco. Our products help thousands of developers ship software faster with AI assistance.',
    postedDate: '2026-09-05',
  },
  {
    id: 11,
    title: 'Data Scientist',
    company: 'InsightAI',
    location: 'Lahore, Pakistan',
    type: 'Full-time',
    salary: '$80,000 - $110,000',
    experience: '3-6 years',
    keywords: ['Python', 'Machine Learning', 'Data Science', 'AI'],
    shortDescription:
      'Build production ML models that power personalised recommendations and forecasting for retail clients.',
    description:
      'InsightAI applies machine learning to retail and e-commerce. As a Data Scientist you will take models from research notebooks to production APIs.\n\nYou will explore large datasets, train and evaluate models, and partner with engineers to deploy and monitor them. A strong grasp of statistics and Python is essential.',
    responsibilities: [
      'Analyse large datasets and extract actionable insights',
      'Design, train, and evaluate machine learning models',
      'Build recommendation and forecasting systems',
      'Deploy models to production and monitor performance',
      'Communicate findings clearly to non-technical stakeholders',
    ],
    skills: ['Python', 'Machine Learning', 'Pandas', 'scikit-learn', 'SQL', 'TensorFlow'],
    companyInfo:
      'InsightAI is a Lahore-based AI company bringing applied machine learning to South Asian retailers, helping them forecast demand and personalise shopping experiences.',
    postedDate: '2026-09-01',
  },
  {
    id: 12,
    title: 'Cybersecurity Analyst',
    company: 'SecureNet',
    location: 'Islamabad, Pakistan',
    type: 'Full-time',
    salary: '$70,000 - $95,000',
    experience: '2-5 years',
    keywords: ['Security', 'SOC', 'Penetration Testing', 'Cybersecurity'],
    shortDescription:
      'Monitor, investigate, and respond to security threats while hardening our clients\u2019 infrastructure.',
    description:
      'SecureNet provides managed security services to financial and government clients. We are hiring a Cybersecurity Analyst to join our 24/7 security operations team.\n\nYou will monitor security alerts, perform investigations, conduct penetration tests, and help clients remediate vulnerabilities. Certifications such as Security+ or CEH are a strong plus.',
    responsibilities: [
      'Monitor security alerts and respond to incidents',
      'Perform vulnerability assessments and penetration tests',
      'Analyse logs and network traffic for suspicious activity',
      'Document incidents and produce security reports',
      'Advise clients on security best practices',
    ],
    skills: ['Network Security', 'Linux', 'SIEM', 'Penetration Testing', 'Incident Response', 'Python'],
    companyInfo:
      'SecureNet is a cybersecurity firm headquartered in Islamabad. Our analysts protect critical infrastructure across banking, telecom, and the public sector.',
    postedDate: '2026-08-27',
  },
];

export default jobs;
