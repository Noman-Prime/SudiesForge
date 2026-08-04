import event from "@/models/event";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const syncNavigation = async () => {
    const events = await event.find().select("name").lean();

    const navigation = events.map((item) => ({
        _id: item._id.toString(),
        name: item.name,
    }));

    const { env } = await getCloudflareContext({ async: true });

    await env.NAVIGATION_KV.put(
        "events",
        JSON.stringify(navigation),
    );

    return navigation;
};

export default syncNavigation;