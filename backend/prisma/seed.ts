// Cadastra as 10 suítes da pousada. Pode ser executado várias vezes sem duplicar (upsert).
// Rode com: npm run db:seed
import { prisma } from '../src/lib/prisma';

// Numeração real da pousada: térreo (1xx) e andar superior (2xx).
const SUITES = ['101', '102', '103', '104', '201', '202', '203', '204', '205', '206'];

async function main() {
  for (const numero of SUITES) {
    await prisma.quarto.upsert({
      where: { numero },
      update: { nome: `Suíte ${numero}` },
      create: { numero, nome: `Suíte ${numero}`, capacidade: 2 },
    });
  }
  console.log(`${SUITES.length} suítes cadastradas.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
