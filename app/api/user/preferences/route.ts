import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    return Response.json({
      preferences: user?.preferences || {
        theme: "light",
        language: "English",
        timezone: "UTC",
      },
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
