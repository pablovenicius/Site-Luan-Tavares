// Instância única do Prisma Client (evita abrir várias conexões em desenvolvimento).
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
