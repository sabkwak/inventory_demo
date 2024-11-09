import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Handle GET request
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    try {
        // Fetch the ingredient details from the database
        const ingredient = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                grower: true,
                category: true,
            },
        });

        if (!ingredient) {
            return NextResponse.json({ message: "Ingredient not found" }, { status: 404 });
        }

        return NextResponse.json(ingredient, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

// If you want to handle other methods like POST, you can add those here, for example:
export async function POST(req: NextRequest) {
    // Implement POST logic here
    return NextResponse.json({ message: "POST request received" });
}
