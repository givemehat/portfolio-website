window.appData = window.appData || {};

window.appData.featuredCertifications = [

  // 1. Companies
  { title: "Fundamentals of Quantum Algorithms", issuer: "IBM", date: "May 2026", image: "assets/certs/ibm_quantum.png", focus: ["Quantum Algorithms"], imgStyle: "border: 2px solid var(--cyan); box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);" },
  { title: "Qiskit Developer Workshop", issuer: "IBM & Quantica", date: "Mar 2026", image: "assets/certs/qiskit_developer.png", focus: ["Qiskit", "Quantum"], imgStyle: "border: 2px solid var(--cyan); box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);" },
  { title: "Basics of Quantum Information", issuer: "IBM", date: "Mar 2026", image: "assets/certs/ibm_basics_quantum.png", focus: ["Quantum Info"], imgStyle: "border: 2px solid var(--cyan); box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);" },
  { title: "McKinsey Forward Program", issuer: "McKinsey & Company", date: "Jun 2026", image: "assets/certs/mckinsey.png", focus: ["Problem-Solving", "Strategy"], imgStyle: "border: 2px solid var(--cyan); box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);" },
  { title: "SEBI Investor Awareness", issuer: "SEBI", date: "Jun 2025", image: "assets/certs/sebi_nism.png", focus: ["Finance", "Markets"] },
  { title: "AWS AI Practitioner Challenge", issuer: "Udacity", date: "Apr 2026", image: "assets/certs/udacity_aws.png", focus: ["AWS", "AI"], imgStyle: "border: 2px solid var(--cyan); box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);" },
  { title: "AWS AI & ML Scholars Challenge", issuer: "Udacity", date: "Mar 2026", image: "assets/certs/aws.png", focus: ["AWS", "AI/ML"], imgStyle: "border: 2px solid var(--cyan); box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);" },
  { title: "AWS Cloud Clubs - AI/ML Team", issuer: "AWS", date: "2025-26", image: "assets/certs/aws_cloud_club.png", focus: ["AWS", "Community"], imgStyle: "border: 2px solid var(--cyan); box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);" },
  { title: "Optimization problems and algorithms", issuer: "Udemy", date: "Jun 2026", image: "assets/certs/udemy_optimization.png", focus: ["Algorithms", "PSO"] },
  { title: "Certified Legal Researcher in Online Research", issuer: "Manupatra Academy", date: "Oct 2025", image: "assets/certs/manupatra_legal.png", focus: ["Legal Research"] },
  
  // 2. IITs
  { title: "Hands-on Quantum Computing", issuer: "IIT Delhi (GIAN)", date: "Oct 2025", image: "assets/certs/gian_quantum.png", focus: ["Quantum", "Qiskit"] },
  { title: "Workshop on Quantum Computing and QKD", issuer: "IIT Delhi", date: "Mar 2026", image: "assets/certs/iitd_qkd.png", focus: ["Quantum", "QKD"] },
  { title: "Probability for Computer Science", issuer: "NPTEL", date: "May 2026", image: "assets/certs/nptel_prob.png", focus: ["Mathematics"] },

  // 3. NITs
  { title: "India US UK SPARC Workshop", issuer: "NIT Delhi", date: "Jul 2026", image: "assets/certs/sparc_new.png", focus: ["6G", "Open RAN"] },
  { title: "Bacterial Chemotaxis Talk", issuer: "NIT Calicut", date: "Oct 2025", image: "assets/certs/bhauthiki.png", focus: ["Biophysics", "Statistics"] },
  { title: "Cognitive Engineering", issuer: "NIT Rourkela (GIAN)", date: "Aug 2025", image: "assets/certs/gian_cognitive.png", focus: ["Human Factors"] },

  // 4. IIITs & IISERs
  { title: "Electronic Design Carnival Training", issuer: "IIIT Delhi", date: "Jul 2026", image: "assets/certs/edc_new.png", focus: ["CAD", "PCB Design"] },
  { title: "AI in Mental Health Assessment", issuer: "IISER Bhopal & ICMR", date: "Mar 2026", image: "assets/certs/iiser_ai_mental_health.png", focus: ["AI", "Healthcare"] },

  // 5. Others
  { title: "Summer School UOB", issuer: "University of Brighton", date: "Jul 2026", image: "assets/certs/summer_school.png", focus: ["Computing Edge"] },
  { title: "AWS Student Community Day Attendee", issuer: "Sharda University", date: "Apr 2026", image: "assets/certs/sharda_aws.png", focus: ["Cloud", "Community"] },
  { title: "STTP Emerging Trends in AI, ML & Cyber", issuer: "Gautam Buddha University", date: "Feb 2026", image: "assets/certs/gbu_ai_sttp.png", focus: ["AI", "Cybersecurity"] },
  { title: "Learning on Sustainability", issuer: "University of East London", date: "Nov 2025", image: "assets/certs/uel_sustainability.jpg", focus: ["Sustainability"] },
  { title: "Certificate of Appreciation", issuer: "Drone Federation India", date: "Nov 2025", image: "assets/certs/nidar_drone.png", focus: ["Drones", "Volunteering"] },
  { title: "GLP Sensitization Workshop", issuer: "NGCMA", date: "Oct 2025", image: "assets/certs/glp.png", focus: ["Compliance", "GLP"] },
  { title: "Eclipses Exchanges and Explosions", issuer: "Propagation Institute", date: "2025", image: "assets/certs/propagation_astro.png", focus: ["Astrophysics"] },
  { title: "Java Programming", issuer: "Incapp", date: "Nov 2025", image: "assets/certs/incapp.png", focus: ["Java"] },
  { title: "Nasha Mukt Viksit Bharat Pledge", issuer: "Ministry of Youth Affairs", date: "2026", image: "assets/certs/nasha_mukt_pledge.png", focus: ["Social Cause", "Pledge"] },
  { title: "Nasha Mukt Yuva Quiz", issuer: "NSS & NCC Cell, GBU", date: "Aug 2026", image: "assets/certs/nasha_mukt_quiz.jpg", focus: ["Quiz", "Awareness"] },
  { title: "Special Internship on Voter Registration (SIR)", issuer: "District Magistrate Office & GBU", date: "Nov 2025", image: "assets/certs/gbu_internship_sir.png", focus: ["Internship", "Civic Duty"] },
  { title: "Legal Shield of the Digital World: DPDPA", issuer: "Cyber Shakti Foundation", date: "Dec 2025", image: "assets/certs/cyber_shakti.png", focus: ["Cyber Law", "Data Privacy"] },
  { title: "Team Sponsor - GDG on Campus", issuer: "Google Developers Group GBU", date: "2026", image: "assets/certs/gdg_sponsor.png", focus: ["Community", "Sponsor"] }
];

window.appData.certifications = [];

window.appData.featuredProjects = [
  {
    title: "AI/ML Capstone Project - IIT Guwahati",
    date: "Completed",
    description: "A comprehensive Machine Learning and AI capstone consisting of 5 major tasks: Predictive Maintenance Classification (LogReg, Decision Tree), Gas Turbine Regression, Palmer Penguins Clustering (K-Means), and Advanced Computer Vision using a fine-tuned YOLOv8n on VisDrone2019 and a custom CNN on Fashion MNIST.",
    link: "https://drive.google.com/drive/u/1/folders/1zGVdV4yGSP7T_nODbi_nbBGst107jPBY",
    image: "assets/aiml_capstone.jpg",
    skills: ["Machine Learning", "YOLOv8", "CNN", "K-Means", "Regression"]
  },
  {
    title: "Quantum Dissipative Market Simulator (QDMS)",
    date: "May 2026 – Present",
    description: "QDMS models financial liquidity cascades and shock propagation via Open Quantum System dynamics. It solves the Lindblad Master Equation using Qiskit/QuTiP to simulate market crashes. Built with a FastAPI backend, ML predictors (LSTM/XGBoost), and a React 19 dashboard.",
    link: "https://github.com/givemehat/Quantum-Dissipative-Market-Simulator-QDMS-",
    image: "assets/qdms_thumbnail.jpg",
    skills: ["Quantum Computing", "Qiskit", "FastAPI", "React 19"]
  },
  {
    title: "DevPulse - CLI Productivity Tracker",
    date: "Published / v1.0.4",
    description: "A lightweight, distraction-free terminal-based productivity tracker. Features include a GitHub-style Activity Heatmap, Session Timer, Coding Streaks, Weekly Summaries, and local SQLite storage. Install via `pip install raj-devpulse-cli` and run `devpulse stats`.",
    link: "https://pypi.org/project/raj-devpulse-cli/",
    skills: ["Python", "CLI", "SQLite", "Productivity"]
  },
  {
    title: "Human Temporal Prediction Under Uncertainty",
    date: "Jul 2026",
    description: "Data collected from 6 participants across UNO rounds to analyze behavior under uncertainty. Evaluated 'Experienced' vs 'No Mercy' precursor rounds using statistical and ML models. This served as a pilot/proof of concept for predicting temporal outcomes and human decision-making under hidden information constraints.",
    link: "#",
    skills: ["Cognitive Neuroscience", "Human Psychology", "Machine Learning"]
  },
  {
    title: "Restoring Damaged Indian Folk Art Using Deep Learning: An AI-Driven Framework for Cultural Heritage Preservation",
    date: "Under Review",
    description: "Research paper on restoring damaged Indian folk art using deep learning. Co-authored with Utkrisht Patel.",
    link: "#",
    skills: ["Deep Learning", "Computer Vision", "Research Paper"]
  },
  {
    title: "Noise Resilience and Parameter Efficiency of Quantum Classifiers: A Comparative Analysis Using IBM Qiskit 1.x",
    date: "Completed",
    description: "Research paper evaluating the parameter efficiency and noise resilience of quantum classifiers using Qiskit. Co-authored with Utkrisht Patel and Dr. Rakesh Kumar Yadav (Associate Professor, Gautam Buddha University).",
    link: "#",
    skills: ["Quantum Computing", "Qiskit", "Research Paper"]
  },
  {
    title: "The Prophecy of Faith: A Love Beyond Belief But In Different Manner",
    date: "Published: 28 July 2026",
    description: "In the dusty lanes of Sultanpur, where prophecy is spoken before love is confessed, Aditya and Srivelli find each other only to be told their Rashi's are fatally incompatible. A literary tragedy about love, friendship, and the grief of knowing an ending before it arrives. Co-authored with Shagun Raghuwanshi.",
    link: "https://www.amazon.in/dp/B0HBYX9X5T",
    skills: ["Author", "Book", "Amazon Kindle"]
  },
  {
    title: "GSSoC 2026 Contributor / Mentee",
    date: "2026",
    description: "Selected as a Contributor and Mentee for GirlScript Summer of Code (GSSoC) 2026 in the Open Source + AI/Agents Track. Actively contributing, learning, and collaborating with amazing developers in the open-source AI community.",
    link: "https://lnkd.in/geJgNZ7t",
    skills: ["Open Source", "AI/Agents", "GSSoC"]
  },
  {
    title: "SSoC Season 5 Contributor",
    date: "2026",
    description: "Selected as a Contributor for Social Summer of Code (SSoC) Season 5, India's largest open source program. Contributing to real projects, learning from mentors, and shipping code that matters.",
    link: "https://lnkd.in/gHNU23YS",
    skills: ["Open Source", "SSoC", "Mentorship"]
  },
  {
    title: "Qiskit Community Tools",
    date: "Active",
    description: "Open-source contributions to Qiskit ecosystem tooling and educational resources.",
    link: "https://github.com/givemehat",
    image: "", 
    gradient: "card-cover--gradient-3",
    skills: ["Python", "Qiskit", "Jupyter"]
  }
];

window.appData.githubUser = "givemehat";

window.appData.results = [
  { title: "Semester 1 Result", image: "assets/results/sem1.png" },
  { title: "Semester 2 Result", image: "assets/results/sem2.png" },
  { title: "Sem 2 Back (Electronics)", image: "assets/results/sem2_back1.png" },
  { title: "Sem 2 Back (Eng. Physics)", image: "assets/results/sem2_back2.png" },
  { title: "Semester 3 Result", image: "assets/results/sem3.png" },
  { title: "Semester 4 Result", image: "assets/results/sem4.png" }
];
