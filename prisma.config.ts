import 'dotenv/config';
import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma", // O comando vai criar essa pasta e arquivo sozinho!
    db: {
      connection: process.env.DATABASE_URL!, // Lê o link correto do seu .env
    },
  }),
});
