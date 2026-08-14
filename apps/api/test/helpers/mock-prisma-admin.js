function createMockPrismaAdmin(state, clone, now) {
    let tick = 0;
    const nextTimestamp = () => new Date(Date.parse(now().toISOString()) + tick++ * 1000).toISOString();

    return {
        featureFlag: {
            findMany: async ({ where, orderBy } = {}) => {
                const flags = state.featureFlags.filter((flag) => flag.deletedAt === where?.deletedAt);
                if (orderBy?.createdAt === "desc") {
                    flags.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
                }

                return flags.map((flag) => clone(flag));
            },
        },
        integrationClient: {
            findMany: async ({ where, orderBy } = {}) => {
                const clients = state.integrationClients.filter((client) => client.deletedAt === where?.deletedAt);
                if (orderBy?.createdAt === "desc") {
                    clients.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
                }

                return clients.map((client) => clone(client));
            },
        },
        seed: {
            featureFlag(data) {
                state.featureFlags.push({
                    id: data.id,
                    key: data.key,
                    name: data.name,
                    enabled: data.enabled ?? false,
                    payload: data.payload ?? null,
                    deletedAt: data.deletedAt ?? null,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    updatedAt: data.updatedAt ?? nextTimestamp(),
                });
            },
            integrationClient(data) {
                state.integrationClients.push({
                    id: data.id,
                    code: data.code,
                    name: data.name,
                    secretHash: data.secretHash ?? null,
                    deletedAt: data.deletedAt ?? null,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    updatedAt: data.updatedAt ?? nextTimestamp(),
                });
            },
        },
    };
}

module.exports = {
    createMockPrismaAdmin,
};
