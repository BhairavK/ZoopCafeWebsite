import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.ts";

const isProduction = process.env.NODE_ENV === "production";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ...(isProduction && {
        ssl: {
            rejectUnauthorized: false,
        },
    }),
});

const prisma = new PrismaClient({
    adapter,
});

export default prisma;