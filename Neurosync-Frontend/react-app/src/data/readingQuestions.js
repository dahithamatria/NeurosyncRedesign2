// Reading question bank. 4 questions per paragraph (linked by paragraphId); 3 are randomly
// selected per assessment. Each question: { id, paragraphId, type, question, options, correctIndex }
const readingQuestions = [
  // p1 - Bacteria
  { id: 'r1a', paragraphId: 'p1', type: 'Main Idea', question: 'What is the main idea of the passage?', options: ['Bacteria are always dangerous and should be avoided', 'Most bacteria in the human body are harmless or beneficial', 'Antibiotics are the best way to stay healthy', 'The microbiome has no effect on mental health'], correctIndex: 1 },
  { id: 'r1b', paragraphId: 'p1', type: 'Supporting Detail', question: 'According to the passage, what can disrupt the balance of the microbiome?', options: ['Drinking water', 'Poor diet or overuse of antibiotics', 'Sleeping too much', 'Reading books'], correctIndex: 1 },
  { id: 'r1c', paragraphId: 'p1', type: 'Vocabulary in Context', question: 'In the passage, the word "microbiome" refers to', options: ['a type of medicine', 'the community of microorganisms living in the body', 'a disease caused by bacteria', 'a piece of lab equipment'], correctIndex: 1 },
  { id: 'r1d', paragraphId: 'p1', type: 'Inference', question: 'Based on the passage, what can be inferred about the immune system?', options: ['It works independently of bacteria', 'It is trained partly through interaction with bacteria', 'It only reacts to viruses', 'It weakens when bacteria are present'], correctIndex: 1 },

  // p2 - Voice assistants
  { id: 'r2a', paragraphId: 'p2', type: 'Main Idea', question: 'What is this passage mainly about?', options: ['The history of telephones', 'The steps involved in how voice assistants process speech', 'Why people dislike technology', 'How to build a computer'], correctIndex: 1 },
  { id: 'r2b', paragraphId: 'p2', type: 'Supporting Detail', question: 'What is the first step a voice assistant takes when you speak to it?', options: ['It searches for an answer', 'It converts sound waves into a digital signal', 'It plays music', 'It shuts down'], correctIndex: 1 },
  { id: 'r2c', paragraphId: 'p2', type: 'Cause Effect', question: 'What can cause a voice assistant to misunderstand a request?', options: ['A fully charged battery', 'Accents, background noise, or unusual phrasing', 'A software update', 'Bright lighting'], correctIndex: 1 },
  { id: 'r2d', paragraphId: 'p2', type: 'Best Title', question: 'Which title best fits this passage?', options: ['The Decline of Smartphones', 'Inside the Invisible Steps of Voice Recognition', 'A History of the Internet', 'Why Robots Cannot Talk'], correctIndex: 1 },

  // p3 - Leaves
  { id: 'r3a', paragraphId: 'p3', type: 'Main Idea', question: 'What does this passage mainly explain?', options: ['Why trees grow taller in summer', 'Why leaves change color in autumn', 'How to plant a garden', 'Why some trees never lose their leaves'], correctIndex: 1 },
  { id: 'r3b', paragraphId: 'p3', type: 'Supporting Detail', question: 'What happens to chlorophyll in autumn?', options: ['It increases', 'It breaks down, revealing other pigments', 'It turns into sugar', 'It stays the same'], correctIndex: 1 },
  { id: 'r3c', paragraphId: 'p3', type: 'Vocabulary in Context', question: 'In the passage, "pigments" most nearly means', options: ['types of soil', 'coloring substances', 'kinds of insects', 'weather patterns'], correctIndex: 1 },
  { id: 'r3d', paragraphId: 'p3', type: 'Conclusion', question: 'What can you conclude about the purpose of leaves falling?', options: ['It happens by accident', 'It helps protect the tree by reducing water loss', 'It has no benefit to the tree', 'It only happens in warm climates'], correctIndex: 1 },

  // p4 - Spaced practice
  { id: 'r4a', paragraphId: 'p4', type: 'Main Idea', question: 'What is the passage mainly about?', options: ['Why exams should be eliminated', 'A more effective way to study using spaced practice', 'The history of schools', 'Why cramming is the best study method'], correctIndex: 1 },
  { id: 'r4b', paragraphId: 'p4', type: 'Supporting Detail', question: 'According to the passage, what strengthens memory the most?', options: ['Rereading notes once', 'Recalling information after a delay', 'Studying only the night before', 'Ignoring difficult topics'], correctIndex: 1 },
  { id: 'r4c', paragraphId: 'p4', type: "Author's Purpose", question: "What is the author's purpose in writing this passage?", options: ['To criticize teachers', 'To explain and recommend an effective study method', 'To describe a historical event', 'To advertise a product'], correctIndex: 1 },
  { id: 'r4d', paragraphId: 'p4', type: 'Vocabulary in Context', question: 'In the passage, "durable" most nearly means', options: ['temporary', 'long-lasting', 'confusing', 'expensive'], correctIndex: 1 },

  // p5 - Silk Road
  { id: 'r5a', paragraphId: 'p5', type: 'Main Idea', question: 'What is the main idea of this passage?', options: ['The Silk Road only carried silk', 'The Silk Road exchanged goods and ideas between cultures', 'The Silk Road was a single paved road', 'The Silk Road no longer influences the world'], correctIndex: 1 },
  { id: 'r5b', paragraphId: 'p5', type: 'Supporting Detail', question: 'What technique traveled from China along the Silk Road?', options: ['Papermaking', 'Photography', 'Printing presses', 'Glassblowing'], correctIndex: 0 },
  { id: 'r5c', paragraphId: 'p5', type: 'True Statement', question: 'Which statement is true according to the passage?', options: ['The Silk Road was a single fixed path', 'Cities along the route grew wealthy from trade', 'Only silk was traded along the route', 'The route had no cultural influence'], correctIndex: 1 },
  { id: 'r5d', paragraphId: 'p5', type: 'Best Title', question: 'Which title best fits this passage?', options: ['A Guide to Modern Trade', 'More Than Silk: Exchange Along an Ancient Route', 'The Fall of Ancient Cities', 'How Silk Is Made'], correctIndex: 1 },

  // p6 - Sleep
  { id: 'r6a', paragraphId: 'p6', type: 'Main Idea', question: 'What is the passage mainly about?', options: ['Why naps are unnecessary', 'The active role sleep plays in brain function', 'The history of alarm clocks', 'Why children need less sleep than adults'], correctIndex: 1 },
  { id: 'r6b', paragraphId: 'p6', type: 'Cause Effect', question: 'What effect can screens before bedtime have?', options: ['They improve sleep quality', 'They delay hormones that promote sleepiness', 'They have no effect on sleep', 'They increase deep sleep'], correctIndex: 1 },
  { id: 'r6c', paragraphId: 'p6', type: 'Supporting Detail', question: 'What does the brain do during deep sleep, according to the passage?', options: ['It stops working completely', 'It clears out waste products', 'It only processes sound', 'It stores fat'], correctIndex: 1 },
  { id: 'r6d', paragraphId: 'p6', type: 'Vocabulary in Context', question: 'In the passage, "essential" most nearly means', options: ['optional', 'necessary', 'harmful', 'rare'], correctIndex: 1 },

  // p7 - Slow travel
  { id: 'r7a', paragraphId: 'p7', type: 'Main Idea', question: 'What is the main idea of this passage?', options: ['Travelers should visit as many places as possible', 'Slow travel offers a deeper, less rushed way to experience places', 'Travel is always stressful', 'Only exotic destinations are worth visiting'], correctIndex: 1 },
  { id: 'r7b', paragraphId: 'p7', type: 'Supporting Detail', question: 'Why is slow travel often more sustainable?', options: ['It requires fewer flights and transfers', 'It always costs more money', 'It requires special visas', 'It avoids local culture'], correctIndex: 0 },
  { id: 'r7c', paragraphId: 'p7', type: 'Conclusion', question: 'What can be concluded about the purpose of slow travel?', options: ['To visit as many landmarks as possible', 'To notice details a hurried traveler might miss', 'To avoid meeting local people', 'To spend as little time as possible in one place'], correctIndex: 1 },
  { id: 'r7d', paragraphId: 'p7', type: 'Best Title', question: 'Which title best fits this passage?', options: ['The Fastest Way to See the World', 'The Quiet Appeal of Slow Travel', 'Why Flying Is Dangerous', 'A History of Tourism'], correctIndex: 1 },

  // p8 - Crows
  { id: 'r8a', paragraphId: 'p8', type: 'Main Idea', question: 'What is the passage mainly about?', options: ['Why crows are dangerous', 'The surprising intelligence of crows', 'How to train a crow as a pet', 'The migration patterns of birds'], correctIndex: 1 },
  { id: 'r8b', paragraphId: 'p8', type: 'Supporting Detail', question: 'How do crows use cars, according to the passage?', options: ['To build nests', 'To crack open hard-shelled nuts', 'To find food scraps only', 'To warn other crows of danger'], correctIndex: 1 },
  { id: 'r8c', paragraphId: 'p8', type: 'True Statement', question: 'Which statement is true according to the passage?', options: ['Crows cannot recognize human faces', 'Crows have been observed using tools', 'Crows are unable to solve puzzles', 'Crows never communicate with each other'], correctIndex: 1 },
  { id: 'r8d', paragraphId: 'p8', type: 'Vocabulary in Context', question: 'In the passage, "rivals" most nearly means', options: ['is equal to or comparable with', 'is much weaker than', 'has no connection to', 'destroys completely'], correctIndex: 0 },

  // p9 - Wetlands
  { id: 'r9a', paragraphId: 'p9', type: 'Main Idea', question: 'What is the main idea of this passage?', options: ['Wetlands should be drained for farmland', 'Wetlands provide important ecological benefits worth restoring', 'Wetlands have no effect on flooding', 'Wetlands are only useful for tourism'], correctIndex: 1 },
  { id: 'r9b', paragraphId: 'p9', type: 'Supporting Detail', question: 'How do wetlands help during heavy rainfall?', options: ['They cause more flooding', 'They act as sponges, absorbing excess rainfall', 'They redirect rain to cities', 'They have no effect on rainfall'], correctIndex: 1 },
  { id: 'r9c', paragraphId: 'p9', type: "Author's Purpose", question: "What is the author's purpose in this passage?", options: ['To argue against restoring wetlands', 'To explain the value of wetlands and their restoration', 'To describe how to build a dam', 'To criticize migratory birds'], correctIndex: 1 },
  { id: 'r9d', paragraphId: 'p9', type: 'Conclusion', question: 'What can be concluded from the passage?', options: ['Environmental damage can never be reversed', 'Restoring damaged ecosystems is possible with effort and patience', 'Wetlands have no impact on wildlife', 'Restoration projects always fail'], correctIndex: 1 },

  // p10 - Dark matter
  { id: 'r10a', paragraphId: 'p10', type: 'Main Idea', question: 'What is this passage mainly about?', options: ['How stars are formed', 'How scientists study the invisible parts of the universe', 'The history of telescopes', 'Why planets orbit the sun'], correctIndex: 1 },
  { id: 'r10b', paragraphId: 'p10', type: 'Supporting Detail', question: 'How do scientists detect dark matter?', options: ['By tasting samples from space', 'Through its gravitational pull on visible objects', 'By seeing it directly with telescopes', 'By measuring its temperature'], correctIndex: 1 },
  { id: 'r10c', paragraphId: 'p10', type: 'Vocabulary in Context', question: 'In the passage, "accelerate" most nearly means', options: ['slow down', 'speed up', 'stop completely', 'reverse direction'], correctIndex: 1 },
  { id: 'r10d', paragraphId: 'p10', type: 'True Statement', question: 'Which statement is true according to the passage?', options: ['Dark matter and dark energy make up most of the universe', 'Stars and planets make up most of the universe', 'Dark matter reflects light directly', 'Scientists fully understand dark energy'], correctIndex: 0 },

  // p11 - Universal design
  { id: 'r11a', paragraphId: 'p11', type: 'Main Idea', question: 'What is the passage mainly about?', options: ['Why accessible design is expensive and unnecessary', 'How universal design benefits people of all abilities', 'The history of wheelchairs', 'Why curb cuts were removed from cities'], correctIndex: 1 },
  { id: 'r11b', paragraphId: 'p11', type: 'Supporting Detail', question: 'What example does the passage give of universal design?', options: ['A locked door', 'A curb cut', 'A tall staircase', 'A small button'], correctIndex: 1 },
  { id: 'r11c', paragraphId: 'p11', type: 'Cause Effect', question: 'Why do companies save money by adopting universal design early?', options: ['Retrofitting a product later is more expensive', 'Universal design requires no planning', 'It reduces the number of customers', 'It eliminates the need for design teams'], correctIndex: 0 },
  { id: 'r11d', paragraphId: 'p11', type: 'Best Title', question: 'Which title best fits this passage?', options: ['Designing for Everyone', 'The Cost of Accessibility', 'Why Design Does Not Matter', 'A History of Architecture'], correctIndex: 0 },

  // p12 - Petrichor
  { id: 'r12a', paragraphId: 'p12', type: 'Main Idea', question: 'What is the passage mainly about?', options: ['The chemistry behind the smell and effects of a thunderstorm', 'Why lightning is dangerous', 'How to predict the weather', 'The history of rain gauges'], correctIndex: 0 },
  { id: 'r12b', paragraphId: 'p12', type: 'Supporting Detail', question: 'What produces the sharp, metallic smell sometimes noticed during a storm?', options: ['Petrichor', 'Ozone', 'Nitrogen', 'Geosmin'], correctIndex: 1 },
  { id: 'r12c', paragraphId: 'p12', type: 'Vocabulary in Context', question: 'In the passage, "compound" most nearly means', options: ['a chemical substance', 'a building', 'a type of cloud', 'a musical note'], correctIndex: 0 },
  { id: 'r12d', paragraphId: 'p12', type: 'Conclusion', question: 'What can be concluded from the passage?', options: ['Rain has no chemical effects', 'Ordinary rainstorms involve complex chemical processes', 'Lightning never affects soil', 'Petrichor is harmful to plants'], correctIndex: 1 },

  // p13 - Renewable batteries
  { id: 'r13a', paragraphId: 'p13', type: 'Main Idea', question: 'What is the main idea of this passage?', options: ['Solar panels are becoming less popular', 'New battery technology helps store renewable energy effectively', 'Batteries are no longer needed for renewable energy', 'Wind turbines are more efficient than batteries'], correctIndex: 1 },
  { id: 'r13b', paragraphId: 'p13', type: 'Supporting Detail', question: 'What challenge does the passage say has emerged with renewable energy?', options: ['A lack of sunlight', 'Storing energy for when it is needed', 'Too much electricity being wasted', 'A shortage of wind'], correctIndex: 1 },
  { id: 'r13c', paragraphId: 'p13', type: "Author's Purpose", question: "What is the author's purpose in this passage?", options: ['To criticize renewable energy', 'To explain how battery technology supports clean energy', 'To describe how solar panels are manufactured', 'To argue against grid-scale storage'], correctIndex: 1 },
  { id: 'r13d', paragraphId: 'p13', type: 'Vocabulary in Context', question: 'In the passage, "scaled up" most nearly means', options: ['reduced in size', 'increased in size or capacity', 'removed entirely', 'kept exactly the same'], correctIndex: 1 },

  // p14 - Habits
  { id: 'r14a', paragraphId: 'p14', type: 'Main Idea', question: 'What is this passage mainly about?', options: ['The dangers of exercise', 'The cycle of cue, routine, and reward behind habits', 'Why willpower is the only way to change behavior', 'The history of psychology'], correctIndex: 1 },
  { id: 'r14b', paragraphId: 'p14', type: 'Supporting Detail', question: 'What is the most effective strategy for breaking an unwanted habit, according to the passage?', options: ['Removing the cue entirely', 'Changing the routine while keeping the same cue and reward', 'Relying only on willpower', 'Ignoring the habit completely'], correctIndex: 1 },
  { id: 'r14c', paragraphId: 'p14', type: 'Vocabulary in Context', question: 'In the passage, "automatic" most nearly means', options: ['requiring great effort', 'happening without much conscious thought', 'impossible to repeat', 'extremely rare'], correctIndex: 1 },
  { id: 'r14d', paragraphId: 'p14', type: 'Conclusion', question: 'What can be concluded from the passage?', options: ['Motivation is more reliable than habits', 'Understanding the habit cycle offers a practical way to shape behavior', 'Habits cannot be changed', 'Rewards have no role in habit formation'], correctIndex: 1 },

  // p15 - Printing press
  { id: 'r15a', paragraphId: 'p15', type: 'Main Idea', question: 'What is the main idea of this passage?', options: ['The printing press had little effect on society', 'The printing press dramatically changed how information spread', 'Books were always cheap to produce', 'Handwritten books were more accurate than printed ones'], correctIndex: 1 },
  { id: 'r15b', paragraphId: 'p15', type: 'Supporting Detail', question: 'What happened to the cost of books after the printing press spread?', options: ['It increased significantly', 'It dropped dramatically', 'It stayed exactly the same', 'Books disappeared entirely'], correctIndex: 1 },
  { id: 'r15c', paragraphId: 'p15', type: 'Cause Effect', question: 'What effect did widespread printing have on language?', options: ['Languages disappeared', 'Standardized spelling and grammar began to emerge', 'Fewer people learned to read', 'Handwriting became more common'], correctIndex: 1 },
  { id: 'r15d', paragraphId: 'p15', type: 'Best Title', question: 'Which title best fits this passage?', options: ['The Printing Press and the Spread of Ideas', 'The Decline of Handwriting', 'A Guide to Modern Publishing', 'Why Books Are Expensive Today'], correctIndex: 0 },

  // p16 - Failed experiments
  { id: 'r16a', paragraphId: 'p16', type: 'Main Idea', question: 'What is the passage mainly about?', options: ['Why scientists should hide failed experiments', 'The value of failed experiments in scientific progress', 'How to avoid all mistakes in research', 'The history of famous scientists'], correctIndex: 1 },
  { id: 'r16b', paragraphId: 'p16', type: 'Supporting Detail', question: 'What are journals and funding agencies increasingly encouraging, according to the passage?', options: ['Hiding negative results', 'Publishing negative results', 'Reducing the number of experiments', 'Avoiding peer review'], correctIndex: 1 },
  { id: 'r16c', paragraphId: 'p16', type: 'Vocabulary in Context', question: 'In the passage, "informative" most nearly means', options: ['useless', 'providing useful knowledge', 'embarrassing', 'expensive'], correctIndex: 1 },
  { id: 'r16d', paragraphId: 'p16', type: 'Conclusion', question: 'What can be concluded from the passage?', options: ['A well-documented failure can help other researchers', 'Failed experiments should never be discussed', 'Only successful experiments are useful', 'Failure always wastes years of work'], correctIndex: 0 },
];

export default readingQuestions;
