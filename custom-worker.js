import handler from "./.open-next/worker.js";

const runDashboardSynchronization = async (env) => {
    if (!env.DASHBOARD_SYNC_SECRET) {
        throw new Error(
            "DASHBOARD_SYNC_SECRET is missing",
        );
    }

    if (!env.WORKER_SELF_REFERENCE) {
        throw new Error(
            "WORKER_SELF_REFERENCE binding is missing",
        );
    }

    const response =
        await env.WORKER_SELF_REFERENCE.fetch(
            new Request(
                "https://studiesforge.com/api/dashboard/sync",
                {
                    method: "POST",
                    headers: {
                        "x-dashboard-sync-secret":
                            env.DASHBOARD_SYNC_SECRET,
                    },
                },
            ),
        );

    const result = await response.text();

    if (!response.ok) {
        throw new Error(
            `Dashboard synchronization failed: ${result}`,
        );
    }

    console.log(
        "Scheduled dashboard synchronization completed:",
        result,
    );
};

export default {
    fetch: handler.fetch,

    async scheduled(_event, env, ctx) {
        ctx.waitUntil(
            runDashboardSynchronization(env),
        );
    },
};