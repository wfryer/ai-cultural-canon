// seed.js
// One-time Firestore seeding script - FINAL VERSION with comprehensive content from CSV

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase config (Ensure this matches your provided config)
const firebaseConfig = {
  apiKey: "AIzaSyBJdfPZMw-5Wq71bepIMgLzifvlxvBZZCE",
  authDomain: "ai-canon.firebaseapp.com",
  projectId: "ai-canon",
  storageBucket: "ai-canon.firebasestorage.app",
  messagingSenderId: "507983631324",
  appId: "1:507983631324:web:1bedcb37632dafb69ef519"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Categories (Required by the specification)
const categoriesToCreate = [
  {
    name: "Contemporary Industry Leaders",
    description: "Modern leaders shaping AI in industry, research, and global deployment."
  },
  {
    name: "Historical & Foundational AI Figures",
    description: "Early architects of computing, AI theory, and the foundations of machine intelligence."
  },
  {
    name: "AI Ethics & Governance Leaders",
    description: "Researchers and advocates shaping AI safety, fairness, regulation, and societal impact."
  }
];

// People data derived from the uploaded ai_people_table.csv file
const peopleToCreate = [
{ name: "Sam Altman", category: "Contemporary Industry Leaders", dob: "1985-04-22", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Sam_Altman", imageURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg/1920px-Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg", youtubeURL: "https://www.youtube.com/watch?v=4OrG2q_MDVg", bioMarkdown: "Sam Altman is an American entrepreneur and investor best known as the former CEO of OpenAI and a leading figure in the recent boom in generative AI. He previously led the startup accelerator Y Combinator and has co‑founded companies including Loopt and Worldcoin.", tags: ["OpenAI", "ChatGPT", "entrepreneur", "Silicon Valley"] },
{ name: "Dario Amodei", category: "Contemporary Industry Leaders", dob: "1983", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Dario_Amodei", imageURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg/2560px-Dario_Amodei_at_TechCrunch_Disrupt_2023_01.jpg", youtubeURL: "https://www.youtube.com/watch?v=mYDSSRS-B5U", bioMarkdown: "Dario Amodei is an American computer scientist and co‑founder of Anthropic, an AI safety and research company focused on building large language models like Claude. He previously worked on AI research and safety at OpenAI.", tags: ["Anthropic", "CEO", "AI safety", "Claude"] },
{ name: "Daniela Amodei", category: "Contemporary Industry Leaders", dob: "1986–1987", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Daniela_Amodei", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=8cJAXfbuzx0", bioMarkdown: "Daniela Amodei is an American technology executive and co‑founder of Anthropic, where she serves as president overseeing operations and leadership. She previously held roles at Stripe and OpenAI before helping start Anthropic.", tags: ["Anthropic", "president", "AI safety", "leadership"] },
{ name: "Yoshua Bengio", category: "Contemporary Industry Leaders", dob: "1964-03-05", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Yoshua_Bengio", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=uawLjkSI7Mo", bioMarkdown: "Yoshua Bengio is a Canadian computer scientist and one of the key pioneers of deep learning and artificial neural networks. He is a professor at the Université de Montréal, founder of MILA, and co‑recipient of the 2018 Turing Award with Geoffrey Hinton and Yann LeCun.", tags: ["deep learning", "Turing Award", "MILA", "neural networks"] },
{ name: "Joy Buolamwini", category: "AI Ethics & Governance Leaders", dob: "1990", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Joy_Buolamwini", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=UG_X_7g63rY", bioMarkdown: "Joy Buolamwini is a Ghanaian‑American computer scientist and digital activist known for exposing racial and gender bias in facial recognition systems. She founded the Algorithmic Justice League to advocate for equitable and accountable AI.", tags: ["algorithmic bias", "facial recognition", "AI ethics", "Algorithmic Justice League"] },
{ name: "Kate Crawford", category: "AI Ethics & Governance Leaders", dob: "1977", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Kate_Crawford", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=fMym_BKWQzk", bioMarkdown: "Kate Crawford is an Australian researcher, academic, and author who studies the social, political, and environmental impacts of artificial intelligence. She is known for her book *Atlas of AI* and for co‑founding the AI Now Institute at New York University.", tags: ["Atlas of AI", "data politics", "AI ethics", "scholar"] },
{ name: "Jeff Dean", category: "Contemporary Industry Leaders", dob: "1968-07-23", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Jeff_Dean", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=FraDFZ2t__A", bioMarkdown: "Jeff Dean is an American computer scientist best known for his work designing Google's large‑scale distributed systems and leading its AI research efforts. He has played a central role in projects like MapReduce, BigTable, and TensorFlow.", tags: ["Google", "large\u2011scale systems", "TensorFlow", "machine learning"] },
{ name: "Timnit Gebru", category: "AI Ethics & Governance Leaders", dob: "1983", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Timnit_Gebru", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=b_--xrN3eso", bioMarkdown: "Timnit Gebru is an Ethiopian‑American computer scientist and prominent critic of bias and power in AI systems. She co‑founded the organization Black in AI and leads the Distributed AI Research Institute (DAIR).", tags: ["algorithmic bias", "AI ethics", "DAIR", "Black in AI"] },
{ name: "Demis Hassabis", category: "Contemporary Industry Leaders", dob: "1976-07-27", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Demis_Hassabis", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=Kr3Sh2PKA8Y", bioMarkdown: "Demis Hassabis is a British computer scientist, neuroscientist, and entrepreneur who co‑founded DeepMind, now Google DeepMind. Under his leadership the lab created breakthrough systems like AlphaGo and AlphaFold.", tags: ["DeepMind", "reinforcement learning", "AlphaGo", "neuroscience"] },
{ name: "Geoffrey Hinton", category: "Contemporary Industry Leaders", dob: "1947-12-06", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Geoffrey_Hinton", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=QH6QqjIwv68", bioMarkdown: "Geoffrey Hinton is a British‑Canadian cognitive psychologist and computer scientist widely known as a \"godfather of deep learning.\" His work on neural networks and backpropagation helped enable modern advances in artificial intelligence.", tags: ["deep learning", "backpropagation", "Turing Award", "AI safety"] },
{ name: "Jensen Huang", category: "Contemporary Industry Leaders", dob: "1963-02-17", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Jensen_Huang", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=0zXSrsKlm5A", bioMarkdown: "Jensen Huang is a Taiwanese‑American entrepreneur and co‑founder of NVIDIA, where he serves as president and CEO. Under his leadership NVIDIA's graphics processors became foundational hardware for modern AI and high‑performance computing.", tags: ["NVIDIA", "GPUs", "AI chips", "CEO"] },
{ name: "Yann LeCun", category: "Contemporary Industry Leaders", dob: "1960-07-08", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Yann_LeCun", imageURL: "", youtubeURL: "", bioMarkdown: "Yann LeCun is a French computer scientist known for pioneering convolutional neural networks and deep learning. He is a Turing Award laureate and serves as chief AI scientist at Meta.", tags: ["convolutional networks", "Meta AI", "deep learning", "Turing Award"] },
{ name: "Fei-Fei Li", category: "Contemporary Industry Leaders", dob: "1976-08-27", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Fei-Fei_Li", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=40riCqvRoMs", bioMarkdown: "Fei‑Fei Li is a Chinese‑American computer scientist and professor at Stanford University known for her work in computer vision and the ImageNet dataset. She has also been a leading voice for human‑centered and ethical AI.", tags: ["computer vision", "ImageNet", "Stanford", "AI ethics"] },
{ name: "Ada Lovelace", category: "Historical & Foundational AI Figures", dob: "1815-12-10", dod: "1852-11-27", wikipediaURL: "https://en.wikipedia.org/wiki/Ada_Lovelace", imageURL: "", youtubeURL: "", bioMarkdown: "Ada Lovelace was a 19th‑century English mathematician who worked with Charles Babbage on his proposed Analytical Engine. She is often described as the first computer programmer for her notes describing how the machine could execute algorithms.", tags: ["first programmer", "analytical engine", "mathematics", "history of computing"] },
{ name: "John McCarthy", category: "Historical & Foundational AI Figures", dob: "1927-09-04", dod: "2011-10-24", wikipediaURL: "https://en.wikipedia.org/wiki/John_McCarthy_(computer_scientist)", imageURL: "", youtubeURL: "", bioMarkdown: "John McCarthy was an American computer scientist who coined the term \"artificial intelligence\" and organized the 1956 Dartmouth conference that launched the field. He invented the Lisp programming language and made fundamental contributions to time‑sharing and AI research.", tags: ["artificial intelligence", "Lisp", "time\u2011sharing", "Dartmouth workshop"] },
{ name: "Marvin Minsky", category: "Historical & Foundational AI Figures", dob: "1927-08-09", dod: "2016-01-24", wikipediaURL: "https://en.wikipedia.org/wiki/Marvin_Minsky", imageURL: "", youtubeURL: "", bioMarkdown: "Marvin Minsky was an American cognitive scientist and co‑founder of the MIT Artificial Intelligence Laboratory. He made influential contributions to AI theory, robotics, and models of human cognition.", tags: ["MIT AI Lab", "cognitive science", "robotics", "perceptrons"] },
{ name: "Mira Murati", category: "Contemporary Industry Leaders", dob: "1988", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Mira_Murati", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=Ru76kAEmVfU", bioMarkdown: "Mira Murati is an Albanian‑born engineer and technology executive who served as chief technology officer at OpenAI. She has overseen the development of high‑profile AI systems such as DALL·E, ChatGPT, and related tools.", tags: ["OpenAI", "CTO", "AI products", "DALL\u00b7E"] },
{ name: "Elon Musk", category: "Contemporary Industry Leaders", dob: "1971-06-28", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Elon_Musk", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=Ra3fv8gl6NE", bioMarkdown: "Elon Musk is a South African‑born entrepreneur and business magnate who leads companies including Tesla, SpaceX, and xAI. He has been a prominent voice on both the promise and dangers of advanced artificial intelligence.", tags: ["Tesla", "SpaceX", "xAI", "Neuralink", "entrepreneur"] },
{ name: "Allen Newell", category: "Historical & Foundational AI Figures", dob: "1927-03-19", dod: "1992-07-19", wikipediaURL: "https://en.wikipedia.org/wiki/Allen_Newell", imageURL: "", youtubeURL: "", bioMarkdown: "Allen Newell was an American researcher in computer science and cognitive psychology who helped found the field of artificial intelligence. He co‑developed early AI programs such as the Logic Theorist and General Problem Solver and worked on unified theories of human cognition.", tags: ["cognitive psychology", "AI", "general problem solver", "information processing"] },
{ name: "Andrew Ng", category: "Contemporary Industry Leaders", dob: "1976-04-18", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Andrew_Ng", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=jGwO_UgTS7I", bioMarkdown: "Andrew Ng is a British‑born computer scientist and entrepreneur known for his work in machine learning and online education. He co‑founded Google Brain, led Baidu's AI Group, and created widely used online machine learning courses.", tags: ["machine learning", "online education", "Coursera", "Google Brain"] },
{ name: "Stuart Russell", category: "AI Ethics & Governance Leaders", dob: "1962", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Stuart_J._Russell", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=EBK-a94IFHY", bioMarkdown: "Stuart Russell is a British‑American computer scientist and professor at the University of California, Berkeley, known for co‑authoring the leading AI textbook *Artificial Intelligence: A Modern Approach*. In recent years he has focused on the long‑term safety and regulation of powerful AI systems.", tags: ["AI safety", "UC Berkeley", "AI textbook", "alignment"] },
{ name: "Claude Shannon", category: "Historical & Foundational AI Figures", dob: "1916-04-30", dod: "2001-02-24", wikipediaURL: "https://en.wikipedia.org/wiki/Claude_Shannon", imageURL: "", youtubeURL: "", bioMarkdown: "Claude Shannon was an American mathematician, electrical engineer, and cryptographer known as the \"father of information theory.\" His work on digital communication and switching circuits laid the foundations for modern digital computing and telecommunications.", tags: ["information theory", "communication", "digital circuits", "cryptography"] },
{ name: "Herbert Simon", category: "Historical & Foundational AI Figures", dob: "1916-06-15", dod: "2001-02-09", wikipediaURL: "https://en.wikipedia.org/wiki/Herbert_A._Simon", imageURL: "", youtubeURL: "", bioMarkdown: "Herbert A. Simon was an American polymath whose work spanned economics, psychology, computer science, and management. He introduced influential ideas such as bounded rationality and satisficing and received both the Turing Award and the Nobel Prize in Economics.", tags: ["bounded rationality", "decision\u2011making", "cognitive science", "Nobel laureate"] },
{ name: "Mustafa Suleyman", category: "Contemporary Industry Leaders", dob: "1984", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Mustafa_Suleyman", imageURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Mustafa_Suleyman_photo_%28cropped%29.jpg/1280px-Mustafa_Suleyman_photo_%28cropped%29.jpg", youtubeURL: "https://www.youtube.com/watch?v=CD7dJlS2JHQ", bioMarkdown: "Mustafa Suleyman CBE (born 1984) is a British AI entrepreneur best known as the co-founder and former head of applied AI at DeepMind (acquired by Google), and is currently the CEO of Microsoft AI. After DeepMind, he co-founded the machine learning company Inflection AI in 2022.", tags: ["DeepMind", "Microsoft AI", "Inflection AI", "entrepreneur", "AI policy"] },
{ name: "Ilya Sutskever", category: "Contemporary Industry Leaders", dob: "1985", dod: "", wikipediaURL: "https://en.wikipedia.org/wiki/Ilya_Sutskever", imageURL: "", youtubeURL: "", bioMarkdown: "Ilya Sutskever is a Israeli‑Canadian computer scientist and one of the leading researchers in deep learning, known for work on sequence models and neural networks. He co‑founded OpenAI and served as its chief scientist.", tags: ["deep learning", "sequence models", "OpenAI", "neural networks"] },
{ name: "Alan Turing", category: "Historical & Foundational AI Figures", dob: "1912-06-23", dod: "1954-06-07", wikipediaURL: "https://en.wikipedia.org/wiki/Alan_Turing", imageURL: "", youtubeURL: "https://www.youtube.com/watch?v=UA2YqVR1kQk", bioMarkdown: "Alan Turing was an English mathematician and logician whose work founded modern computer science and formalized the concept of computation. During World War II he played a key role in breaking German Enigma codes and later proposed the influential \"Turing test\" for machine intelligence.", tags: ["computability", "Enigma", "Turing test", "computer science"] },
{ name: "Norbert Wiener", category: "Historical & Foundational AI Figures", dob: "1894-11-26", dod: "1964-03-18", wikipediaURL: "https://en.wikipedia.org/wiki/Norbert_Wiener", imageURL: "", youtubeURL: "", bioMarkdown: "Norbert Wiener was an American mathematician and philosopher best known as the founder of cybernetics, the study of control and communication in animals and machines. His ideas about feedback and systems influenced computer science, engineering, and social theory.", tags: ["cybernetics", "control theory", "mathematics", "feedback systems"] }
];

// Seed function
async function seedDatabase() {
  console.log("🌱 Starting AI Cultural Canon database seeding…");

  // Create categories (Safely skips if categories exist)
  const catRef = collection(db, "categories");
  const existingCatsSnap = await getDocs(catRef);
  let categoryMap = {};

  if (existingCatsSnap.empty) {
    console.log("➕ Creating categories…");
    for (const cat of categoriesToCreate) {
      const docRef = await addDoc(catRef, {
        ...cat,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      categoryMap[cat.name] = docRef.id;
    }
  } else {
    console.log("📂 Categories already exist — loading IDs…");
    existingCatsSnap.forEach(docSnap => {
      const data = docSnap.data();
      categoryMap[data.name] = docSnap.id;
    });
  }

  console.log("Category map:", categoryMap);

  // Check for existing people before insertion
  const peopleRef = collection(db, "people");
  const existingPeopleSnap = await getDocs(peopleRef);

  if (!existingPeopleSnap.empty) {
    console.warn("⚠️ People already exist! Not inserting new people via seed script.");
    console.warn("Since the 'people' collection was deleted, this warning should not appear.");
    return;
  }

  console.log("➕ Adding people with full content fields from CSV data…");

  for (const p of peopleToCreate) {
    const catID = categoryMap[p.category];

    if (!catID) {
      console.error(`❌ ERROR: Category not found for ${p.name}. Check category mapping.`);
      continue;
    }

    await addDoc(peopleRef, {
      name: p.name,
      wikipediaURL: p.wikipediaURL,
      categoryID: catID,
      dob: p.dob || "",             
      dod: p.dod || "",             
      imageURL: p.imageURL || "",   
      youtubeURL: p.youtubeURL || "", 
      bioMarkdown: p.bioMarkdown || "", 
      tags: p.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`✔ Added ${p.name}`);
  }

  console.log("🎉 Seed complete!");
}

seedDatabase().catch(err => console.error(err));