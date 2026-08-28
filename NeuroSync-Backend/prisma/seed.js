// Seeds one clearly-labeled demo account so you can log in and see the
// Dashboard/Result flow populated immediately after setup.
//
// Run with: npm run seed

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@neurosync.app';
const DEMO_PASSWORD = 'demo1234';

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      name: 'Demo User',
      email: DEMO_EMAIL,
      passwordHash,
      settings: { create: {} },
      personalization: {
        create: {
          age: 24,
          gender: 'Prefer not to say',
          education: "Bachelor's degree",
          nativeLanguage: 'English',
          readingFrequency: 'A few times a week',
          glasses: 'No',
          diagnosedDyslexia: 'Not sure',
        },
      },
    },
  });

  // Two demo assessment results so the Dashboard chart has something to draw.
  // These are clearly synthetic — do not treat as real analytics.
  const existing = await prisma.assessment.count({ where: { userId: user.id } });
  if (existing === 0) {
    await prisma.assessment.createMany({
      data: [
        {
          userId: user.id,
          totalCorrect: 6,
          totalScored: 10,
          totalPercent: 60,
          categoryScores: {
            Vocabulary: { correct: 3, total: 5, percent: 60 },
            Spelling: { correct: 3, total: 5, percent: 60 },
          },
          tier: 'Level 2',
          supportLevel: 'Moderate Reading Assistance',
          recommendedExtension: 'EasyRead Plus',
          readingSpeed: 145,
          timeTakenSeconds: 240,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          userId: user.id,
          totalCorrect: 8,
          totalScored: 10,
          totalPercent: 80,
          categoryScores: {
            Vocabulary: { correct: 4, total: 5, percent: 80 },
            Spelling: { correct: 4, total: 5, percent: 80 },
          },
          tier: 'Level 3',
          supportLevel: 'Light Reading Assistance',
          recommendedExtension: 'EasyRead Smart',
          readingSpeed: 172,
          timeTakenSeconds: 210,
        },
      ],
    });
  }

  console.log('Seed complete.');
  console.log(`Demo login -> email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
