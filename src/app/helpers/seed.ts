import { UserRole } from "@prisma/client";
import * as bcrypt from 'bcryptjs';
import { prisma } from "../shared/prisma";
import config from "../../config";

const seedSuperAdmin = async () => {
    try {
        const isExistSuperAdmin = await prisma.user.findFirst({
            where: {
                role: UserRole.SUPER_ADMIN
            }
        });

        if (isExistSuperAdmin) {
            console.log("Super admin already exists!")
            return;
        };

        const hashedPassword = await bcrypt.hash("123456", Number(config.salt_round))

        const superAdminData = await prisma.user.create({
            data: {
                email: "admin@gmail.com",
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                admin: {
                    create: {
                        name: "Admin",
                        //email: "super@admin.com",
                        contactNumber: "01234567890"
                    }
                }
            }
        });

        console.log("Super Admin Created Successfully!", superAdminData);
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await prisma.$disconnect();
    }
};

export default seedSuperAdmin;