/**
 * CBSE Rationalized Syllabus 2025-26
 * Classes 9 to 12 — All Subjects
 * Medium of Instruction: English
 * Hindi included as a subject (chapter titles in English for AI context)
 */

export const CBSE_SYLLABUS: Record<number, Record<string, Record<number, string>>> = {

  // ============================================================
  // CLASS 9
  // ============================================================
  9: {

    science: {
      1: "Matter in Our Surroundings",
      2: "Is Matter Around Us Pure",
      3: "Atoms and Molecules",
      4: "Structure of the Atom",
      5: "The Fundamental Unit of Life",
      6: "Tissues",
      7: "Motion",
      8: "Force and Laws of Motion",
      9: "Gravitation",
      10: "Work and Energy",
      11: "Sound",
      12: "Why Do We Fall Ill",
      13: "Natural Resources",
    },

    maths: {
      1: "Number Systems",
      2: "Polynomials",
      3: "Coordinate Geometry",
      4: "Linear Equations in Two Variables",
      5: "Introduction to Euclid's Geometry",
      6: "Lines and Angles",
      7: "Triangles",
      8: "Quadrilaterals",
      9: "Circles",
      10: "Heron's Formula",
      11: "Surface Areas and Volumes",
      12: "Statistics",
    },

    // Social Science — History (India and the Contemporary World I)
    history: {
      1: "The French Revolution",
      2: "Socialism in Europe and the Russian Revolution",
      3: "Nazism and the Rise of Hitler",
      4: "Forest Society and Colonialism",
      5: "Pastoralists in the Modern World",
    },

    // Social Science — Geography (Contemporary India I)
    geography: {
      1: "India — Size and Location",
      2: "Physical Features of India",
      3: "Drainage",
      4: "Climate",
      5: "Natural Vegetation and Wildlife",
      6: "Population",
    },

    // Social Science — Civics (Democratic Politics I)
    civics: {
      1: "What is Democracy? Why Democracy?",
      2: "Constitutional Design",
      3: "Electoral Politics",
      4: "Working of Institutions",
      5: "Democratic Rights",
    },

    // Social Science — Economics (Understanding Economic Development)
    economics: {
      1: "The Story of Village Palampur",
      2: "People as Resource",
      3: "Poverty as a Challenge",
      4: "Food Security in India",
    },

    // English — Beehive (Main Reader)
    english: {
      1: "The Fun They Had",
      2: "The Sound of Music",
      3: "The Little Girl",
      4: "A Truly Beautiful Mind",
      5: "The Snake and the Mirror",
      6: "My Childhood",
      7: "Reach for the Top",
      8: "On Killing a Tree (Poem) / The Bond of Love (Prose)",
      9: "The Road Not Taken (Poem) / Kathmandu (Prose)",
      10: "If I Were You",
    },

    // Hindi — Kshitij (Main Reader) — Chapter titles in English for AI context
    hindi: {
      1: "Do Bailon Ki Katha (Story of Two Bullocks) — Premchand",
      2: "Lhasa Ki Or (Towards Lhasa) — Rahul Sankrityayan",
      3: "Upbhoktavad Ki Sanskriti (Culture of Consumerism) — Shyam Charan Dubey",
      4: "Sanwale Sapnon Ki Yaad (Memory of Dark Dreams) — Jaabir Husain",
      5: "Nana Sahab Ki Putri Devi Maina Ko Bhasm Kar Diya Gaya — Chapala Devi",
      6: "Premchand Ke Phate Joote (Premchand's Torn Shoes) — Harishankar Parsai",
      7: "Mere Bachpan Ke Din (Days of My Childhood) — Mahadevi Verma",
      8: "Ek Kutta Aur Ek Maina (A Dog and a Myna) — Hazari Prasad Dwivedi",
    },

    // Hindi — Kritika (Supplementary Reader)
    "hindi kritika": {
      1: "Is Jal Pralay Mein (In This Flood) — Fanishwarnath Renu",
      2: "Mere Sang Ki Auraten (Women of My Company) — Mridula Garg",
      3: "Reedh Ki Haddi (The Backbone) — Jagdish Chandra Mathur",
      4: "Mati Wali (The Clay Woman) — Vidyasagar Nautiyal",
      5: "Kis Tarah Aakhirkar Main Hindi Mein Aaya — Shamsher Bahadur Singh",
    },
  },

  // ============================================================
  // CLASS 10
  // ============================================================
  10: {

    science: {
      // Rationalized 2025-26 NCERT — 13 chapters
      1: "Chemical Reactions and Equations",
      2: "Acids, Bases and Salts",
      3: "Metals and Non-metals",
      4: "Carbon and its Compounds",
      5: "Life Processes",
      6: "Control and Coordination",
      7: "How do Organisms Reproduce",
      8: "Heredity",
      9: "Light — Reflection and Refraction",
      10: "The Human Eye and the Colourful World",
      11: "Electricity",
      12: "Magnetic Effects of Electric Current",
      13: "Our Environment",
      // Removed in rationalization: Periodic Classification, Sources of Energy,
      // Management of Natural Resources, Heredity and Evolution (split)
    },

    maths: {
      // Rationalized 2025-26 NCERT — 14 chapters (Constructions removed)
      1: "Real Numbers",
      2: "Polynomials",
      3: "Pair of Linear Equations in Two Variables",
      4: "Quadratic Equations",
      5: "Arithmetic Progressions",
      6: "Triangles",
      7: "Coordinate Geometry",
      8: "Introduction to Trigonometry",
      9: "Some Applications of Trigonometry",
      10: "Circles",
      11: "Areas Related to Circles",
      12: "Surface Areas and Volumes",
      13: "Statistics",
      14: "Probability",
    },

    // Social Science — History (India and the Contemporary World II)
    history: {
      1: "The Rise of Nationalism in Europe",
      2: "Nationalism in India",
      3: "The Making of a Global World",
      4: "The Age of Industrialisation",
      5: "Print Culture and the Modern World",
    },

    // Social Science — Geography (Contemporary India II)
    geography: {
      1: "Resources and Development",
      2: "Forest and Wildlife Resources",
      3: "Water Resources",
      4: "Agriculture",
      5: "Minerals and Energy Resources",
      6: "Manufacturing Industries",
      7: "Lifelines of National Economy",
    },

    // Social Science — Civics (Democratic Politics II)
    civics: {
      1: "Power Sharing",
      2: "Federalism",
      3: "Gender, Religion and Caste",
      4: "Political Parties",
      5: "Outcomes of Democracy",
    },

    // Social Science — Economics (Understanding Economic Development)
    economics: {
      1: "Development",
      2: "Sectors of the Indian Economy",
      3: "Money and Credit",
      4: "Globalisation and the Indian Economy",
      5: "Consumer Rights",
    },

    // English — First Flight (Main Reader)
    english: {
      1: "A Letter to God",
      2: "Nelson Mandela: Long Walk to Freedom",
      3: "Two Stories about Flying",
      4: "From the Diary of Anne Frank",
      5: "The Hundred Dresses — I",
      6: "The Hundred Dresses — II",
      7: "Glimpses of India",
      8: "Mijbil the Otter",
      9: "Madam Rides the Bus",
      10: "The Sermon at Benares",
      11: "The Proposal",
    },

    // Hindi — Kshitij Part 2 (Main Reader) — titles in English for AI context
    hindi: {
      1: "Surdas Ke Pad (Verses of Surdas)",
      2: "Ram-Lakshman-Parshuram Samvad (Dialogue of Ram, Lakshman and Parshuram) — Tulsidas",
      3: "Dev Ke Savaiye aur Kavitt (Savaiye and Kavitt of Dev)",
      4: "Aatmakathya (Autobiography) — Jayashankar Prasad",
      5: "Utsah aur At Nahin Rahi (Enthusiasm / The Rains Won't Stop) — Suryakant Tripathi Nirala",
      6: "Yeh Danturhit Muskan aur Fasal (This Toothless Smile / The Crop) — Nagarjun",
      7: "Chaya Mat Chhuna (Don't Touch the Shadow) — Girija Kumar Mathur",
      8: "Kanyadan (Giving Away the Daughter) — Rituraj",
      9: "Sangatkar (The Accompanist) — Manglesh Dabral",
      10: "Netaji Ka Chashma (Netaji's Spectacles) — Swayam Prakash",
      11: "Balgobhin Bhagat — Ramvriksha Benipuri",
      12: "Lakhnavi Andaz (Lucknowi Style) — Yashpal",
      13: "Manviya Karuna Ki Divy Chamak (Divine Glow of Human Compassion) — Sarveshwar Dayal Saxena",
      14: "Ek Kahani Yeh Bhi (This Story Too) — Mannu Bhandari",
      15: "Stri Shiksha Ke Virodhi Kutarkon Ka Khandan (Refutation of Arguments Against Women's Education) — Mahavir Prasad Dwivedi",
      16: "Naubatkhane Mein Ibadat (Worship in the Bandstand) — Yatindra Mishra",
      17: "Sanskriti (Culture) — Bhagwat Sharan Upadhyay",
    },

    // Hindi — Kritika Part 2 (Supplementary Reader)
    "hindi kritika": {
      1: "Mata Ka Anchal (Mother's Lap) — Shivramprasad Mishra",
      2: "George Pancham Ki Naak (George V's Nose) — Kamleswar",
      3: "Sana Sana Hath Jodi (Folding Hands Together) — Madhu Kankaria",
      4: "Ehi Thaiyan Jhulni Herani Ho Rama (Where Did My Earring Fall, O Rama) — Shivprasad Mishra",
      5: "Main Kyon Likhta Hoon (Why Do I Write) — Nirmal Verma",
    },
  },

  // ============================================================
  // CLASS 11
  // ============================================================
  11: {

    physics: {
      // Rationalized 2025-26 — Physical World removed, 14 chapters
      1: "Units and Measurements",
      2: "Motion in a Straight Line",
      3: "Motion in a Plane",
      4: "Laws of Motion",
      5: "Work, Energy and Power",
      6: "System of Particles and Rotational Motion",
      7: "Gravitation",
      8: "Mechanical Properties of Solids",
      9: "Mechanical Properties of Fluids",
      10: "Thermal Properties of Matter",
      11: "Thermodynamics",
      12: "Kinetic Theory",
      13: "Oscillations",
      14: "Waves",
    },

    chemistry: {
      // Rationalized 2025-26 — Hydrogen and Environmental Chemistry removed
      1: "Some Basic Concepts of Chemistry",
      2: "Structure of Atom",
      3: "Classification of Elements and Periodicity in Properties",
      4: "Chemical Bonding and Molecular Structure",
      5: "Thermodynamics",
      6: "Equilibrium",
      7: "Redox Reactions",
      8: "Organic Chemistry — Some Basic Principles and Techniques",
      9: "Hydrocarbons",
      10: "The s-Block Elements",
      11: "The p-Block Elements",
      12: "States of Matter",
    },

    biology: {
      // Rationalized 2025-26 — some chapters merged/removed
      1: "The Living World",
      2: "Biological Classification",
      3: "Plant Kingdom",
      4: "Animal Kingdom",
      5: "Morphology of Flowering Plants",
      6: "Anatomy of Flowering Plants",
      7: "Cell: The Unit of Life",
      8: "Biomolecules",
      9: "Cell Cycle and Cell Division",
      10: "Transport in Plants",
      11: "Mineral Nutrition",
      12: "Photosynthesis in Higher Plants",
      13: "Respiration in Plants",
      14: "Plant Growth and Development",
      15: "Digestion and Absorption",
      16: "Breathing and Exchange of Gases",
      17: "Body Fluids and Circulation",
      18: "Excretory Products and their Elimination",
      19: "Locomotion and Movement",
      20: "Neural Control and Coordination",
      21: "Chemical Coordination and Integration",
    },

    maths: {
      // Rationalized 2025-26 — Mathematical Reasoning removed
      1: "Sets",
      2: "Relations and Functions",
      3: "Trigonometric Functions",
      4: "Complex Numbers and Quadratic Equations",
      5: "Linear Inequalities",
      6: "Permutations and Combinations",
      7: "Binomial Theorem",
      8: "Sequences and Series",
      9: "Straight Lines",
      10: "Conic Sections",
      11: "Introduction to Three Dimensional Geometry",
      12: "Limits and Derivatives",
      13: "Statistics",
      14: "Probability",
    },

    // English — Hornbill (Main Reader)
    english: {
      1: "The Portrait of a Lady — Khushwant Singh",
      2: "We're Not Afraid to Die… if We Can All Be Together — Gordon Cook and Alan East",
      3: "Discovering Tut: the Saga Continues — A.R. Williams",
      4: "Landscape of the Soul — Nathalie Trouveroy",
      5: "The Ailing Planet: the Green Movement's Role — Nani Palkhivala",
      6: "The Browning Version — Terence Rattigan",
      7: "The Adventure — Jayant Narlikar",
      8: "Silk Road — Nick Middleton",
    },

    // English — Snapshots (Supplementary Reader)
    "english snapshots": {
      1: "The Summer of the Beautiful White Horse — William Saroyan",
      2: "The Address — Marga Minco",
      3: "Ranga's Marriage — Masti Venkatesha Iyengar",
      4: "Albert Einstein at School — Patrick Pringle",
      5: "Mother's Day — J.B. Priestley",
      6: "The Ghat of the Only World — Amitav Ghosh",
      7: "Birth — A.J. Cronin",
      8: "The Tale of Melon City — Vikram Seth",
    },

    // Hindi — Aroh Part 1 (Main Reader)
    hindi: {
      1: "Hum To Ek Ek Kar Jaanenge (We Shall Go One by One) — Kabir",
      2: "Meera Ke Pad (Verses of Meera) — Mirabai",
      3: "Pathik (The Traveller) — Ram Naresh Tripathi",
      4: "Veh Aankhen (Those Eyes) — Sumitranandan Pant",
      5: "Ghar Ki Yaad (Longing for Home) — Bhawani Prasad Mishra",
      6: "Champ Ke Phool (Champak Flowers) — Madhav Prasad Shukla",
      7: "Gazal — Dushyant Kumar",
      8: "Hum Jo Andheri Raahon Mein (We Who Walk Dark Paths) — Sahir Ludhianvi",
      9: "Sab Aankhen Khol Ke Dekho (Open All Eyes and See) — Kedarnath Agarwal",
      10: "Namak Ka Daroga (The Salt Inspector) — Premchand",
      11: "Miyan Nasiruddin — Krishna Sobti",
      12: "Apna Malwa — Khushiyon Ka Karwan (Our Malwa — Caravan of Joy) — Bhagwat Rawat",
      13: "Vidai Sambhashan (Farewell Address) — Bal Gangadhar Tilak",
      14: "Jahan Koi Wapsi Nahin (Where There Is No Return) — Nirmal Verma",
      15: "Spiti Mein Baarish (Rain in Spiti) — Krishna Naabh",
      16: "Bharatiya Kalaon Mein Prakriti (Nature in Indian Arts) — Prabhakar Machwe",
    },

    // Hindi — Vitan Part 1 (Supplementary Reader)
    "hindi vitan": {
      1: "Bhaarat Maata (Mother India) — Jawaharlal Nehru",
      2: "Rajasthan Ki Rajat Boondein (Silver Drops of Rajasthan) — Anupam Mishra",
      3: "Aalo Aandhhari (Light and Darkness) — Bama Faustina",
    },
  },

  // ============================================================
  // CLASS 12
  // ============================================================
  12: {

    physics: {
      // Rationalized 2025-26 — Magnetism and Matter, Communication Systems removed
      1: "Electric Charges and Fields",
      2: "Electrostatic Potential and Capacitance",
      3: "Current Electricity",
      4: "Moving Charges and Magnetism",
      5: "Electromagnetic Induction",
      6: "Alternating Current",
      7: "Electromagnetic Waves",
      8: "Ray Optics and Optical Instruments",
      9: "Wave Optics",
      10: "Dual Nature of Radiation and Matter",
      11: "Atoms",
      12: "Nuclei",
      13: "Semiconductor Electronics: Materials, Devices and Simple Circuits",
    },

    chemistry: {
      // Rationalized 2025-26 — Surface Chemistry, General Principles of Isolation removed
      1: "Solutions",
      2: "Electrochemistry",
      3: "Chemical Kinetics",
      4: "The d and f Block Elements",
      5: "Coordination Compounds",
      6: "Haloalkanes and Haloarenes",
      7: "Alcohols, Phenols and Ethers",
      8: "Aldehydes, Ketones and Carboxylic Acids",
      9: "Amines",
      10: "Biomolecules",
      11: "The Solid State",
      12: "The p-Block Elements",
    },

    biology: {
      // Rationalized 2025-26
      1: "Reproduction in Organisms",
      2: "Sexual Reproduction in Flowering Plants",
      3: "Human Reproduction",
      4: "Reproductive Health",
      5: "Principles of Inheritance and Variation",
      6: "Molecular Basis of Inheritance",
      7: "Evolution",
      8: "Human Health and Disease",
      9: "Microbes in Human Welfare",
      10: "Biotechnology: Principles and Processes",
      11: "Biotechnology and its Applications",
      12: "Organisms and Populations",
      13: "Ecosystem",
      14: "Biodiversity and Conservation",
    },

    maths: {
      // Rationalized 2025-26 — Linear Programming removed from some boards
      1: "Relations and Functions",
      2: "Inverse Trigonometric Functions",
      3: "Matrices",
      4: "Determinants",
      5: "Continuity and Differentiability",
      6: "Application of Derivatives",
      7: "Integrals",
      8: "Application of Integrals",
      9: "Differential Equations",
      10: "Vector Algebra",
      11: "Three Dimensional Geometry",
      12: "Linear Programming",
      13: "Probability",
    },

    // English — Flamingo (Main Reader)
    english: {
      1: "The Last Lesson — Alphonse Daudet",
      2: "Lost Spring — Anees Jung",
      3: "Deep Water — William Douglas",
      4: "The Rattrap — Selma Lagerlof",
      5: "Indigo — Louis Fischer",
      6: "Poets and Pancakes — Asokamitran",
      7: "The Interview — Christopher Silvester / Umberto Eco",
      8: "Going Places — A.R. Barton",
    },

    // English — Vistas (Supplementary Reader)
    "english vistas": {
      1: "The Third Level — Jack Finney",
      2: "The Tiger King — Kalki",
      3: "The Enemy — Pearl S. Buck",
      4: "On the Face of It — Susan Hill",
      5: "Memories of Childhood — Zitkala-Sa / Bama",
      6: "The Cutting of My Long Hair / We Too Are Human Beings",
    },

    // Hindi — Aroh Part 2 (Main Reader)
    hindi: {
      1: "Aatmaparichay aur Ek Geet (Self-Introduction and A Song) — Harivansh Rai Bachchan",
      2: "Patang (The Kite) — Alok Dhanwa",
      3: "Kavita Ke Bahane aur Baat Seedhi Thi Par (On the Pretext of Poetry / The Talk Was Straight) — Kunwar Narayan",
      4: "Camere Mein Band Apahij (The Disabled Locked in the Camera) — Raghuvir Sahay",
      5: "Saharsh Swikara Hai (Accepted with Joy) — Gajanan Madhav Muktibodh",
      6: "Usha — Shamsher Bahadur Singh",
      7: "Badal Raag (Song of the Clouds) — Suryakant Tripathi Nirala",
      8: "Kavitawali aur Lakshman Murchha (Kavitawali and Lakshman's Faint) — Tulsidas",
      9: "Rubaiyan aur Gazal (Rubaiyat and Ghazal) — Firaq Gorakhpuri",
      10: "Chhota Mera Khet aur Bagulo Ke Pankh (My Small Field / Wings of Cranes) — Umashankara Joshi",
      11: "Bhasmavrit Shringaar (Ash-Covered Adornment) — Hazari Prasad Dwivedi",
      12: "Baazar Darshan (Vision of the Market) — Jainendra Kumar",
      13: "Kaale Megha Paani De (Dark Clouds Give Water) — Dharmvir Bharati",
      14: "Pahelwan Ki Dholak (The Wrestler's Drum) — Fanishwarnath Renu",
      15: "Charlie Chaplin Yani Hum Sab (Charlie Chaplin i.e. All of Us) — Vishnu Khare",
      16: "Namak (Salt) — Razia Sajjad Zaheer",
      17: "Shram Vibhajan aur Jati Pratha (Division of Labour and Caste System) — B.R. Ambedkar",
      18: "Meri Kalpana Ka Adarsh Samaj (My Ideal Imagined Society) — B.R. Ambedkar",
    },

    // Hindi — Vitan Part 2 (Supplementary Reader)
    "hindi vitan": {
      1: "Siver Weding (Silver Wedding) — Manohar Shyam Joshi",
      2: "Jooze (Joose) — Liliana Heker (translated)",
      3: "Atit Mein Dabe Paon (Treading Softly into the Past) — Om Thanvi",
      4: "Diary Ke Panne (Pages from a Diary) — Anne Frank (translated)",
    },

    // Class 12 Commerce subjects
    accountancy: {
      1: "Accounting for Not-for-Profit Organisation",
      2: "Accounting for Partnership: Basic Concepts",
      3: "Reconstitution of a Partnership Firm — Admission of a Partner",
      4: "Reconstitution of a Partnership Firm — Retirement and Death of a Partner",
      5: "Dissolution of Partnership Firm",
      6: "Accounting for Share Capital",
      7: "Issue and Redemption of Debentures",
      8: "Financial Statements of a Company",
      9: "Analysis of Financial Statements",
      10: "Accounting Ratios",
      11: "Cash Flow Statement",
    },

    "business studies": {
      1: "Nature and Significance of Management",
      2: "Principles of Management",
      3: "Business Environment",
      4: "Planning",
      5: "Organising",
      6: "Staffing",
      7: "Directing",
      8: "Controlling",
      9: "Financial Management",
      10: "Financial Markets",
      11: "Marketing Management",
      12: "Consumer Protection",
    },

    "economics macro": {
      1: "Introduction to Macroeconomics",
      2: "National Income Accounting",
      3: "Money and Banking",
      4: "Determination of Income and Employment",
      5: "Government Budget and the Economy",
      6: "Open Economy Macroeconomics",
    },

    "economics micro": {
      1: "Introduction to Microeconomics",
      2: "Theory of Consumer Behaviour",
      3: "Production and Costs",
      4: "The Theory of the Firm under Perfect Competition",
      5: "Market Equilibrium",
      6: "Non-Competitive Markets",
    },
  },
};

// ============================================================
// Helper: resolve chapter name from grade + subject + chapter number
// ============================================================
export function resolveChapter(grade: number, subject: string, chapter: number): string | null {
  const key = subject.toLowerCase().trim()
    .replace(/^math$/, "maths")
    .replace(/^mathematics$/, "maths")
    .replace(/^sst$/, "social science")
    .replace(/^social$/, "social science")
    .replace(/^bio$/, "biology")
    .replace(/^phy$/, "physics")
    .replace(/^chem$/, "chemistry")
    .replace(/^eco$/, "economics")
    .replace(/^accounts$/, "accountancy")
    .replace(/^business$/, "business studies");

  return CBSE_SYLLABUS[grade]?.[key]?.[chapter] ?? null;
}

// ============================================================
// Helper: get all chapters for a subject
// ============================================================
export function getSubjectChapters(grade: number, subject: string): Record<number, string> | null {
  const key = subject.toLowerCase().trim();
  return CBSE_SYLLABUS[grade]?.[key] ?? null;
}

// ============================================================
// Helper: list all subjects for a grade
// ============================================================
export function getSubjectsForGrade(grade: number): string[] {
  return Object.keys(CBSE_SYLLABUS[grade] ?? {});
}
