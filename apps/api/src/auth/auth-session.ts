import { PrismaService } from "../../prisma/prisma.service.js";

export async function getSessionFromAuthorizationHeader(prisma: PrismaService, authorization?: string) {
    if (!authorization) {
        return null;
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
        return null;
    }

    return prisma.session.findUnique({
        where: {
            token,
        },
        include: {
            user: {
                include: {
                    userProfile: true,
                },
            },
        },
    });
}
