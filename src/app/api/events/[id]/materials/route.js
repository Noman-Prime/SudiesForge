import { eventMaterials } from "@/controllers/eventMaterials";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async (req, { params }) => {
    const { id } = await params;

    return eventMaterials(req, id);
};