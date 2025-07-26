import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "../generated/prisma";
import * as argon2 from "argon2";
import { Role } from "../src/common/enums/role.enum";

const prisma = new PrismaClient();
const config = new ConfigService();

async function main() {
    const roles = Object.values(Role);
    for (const name of roles) {
        await prisma.role.upsert({
            where: { name },
            update: {},
            create: { name, description: `${name} role` }
        });
    }

    const adminEmail = config.getOrThrow<string>('ADMIN_EMAIL');
    const adminPassword = config.getOrThrow<string>('ADMIN_PASSWORD');
    const adminNumber = config.getOrThrow<string>('ADMIN_NUMBER');

    if (adminEmail && adminPassword) {
        const hash = await argon2.hash(adminPassword, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 10,
            parallelism: 1,
        });
        await prisma.user.upsert({
            where: {
                email: adminEmail
            },
            update: {},
            create: {
                email: adminEmail,
                password: hash,
                number: adminNumber,
                role: {
                    connect: {
                        name: 'ADMIN'
                    }
                }
            }
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });