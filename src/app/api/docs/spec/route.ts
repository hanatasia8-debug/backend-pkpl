import { NextResponse } from "next/server";
import { openApiSpec } from "../../../../modules/docs/swagger.config";

export async function GET() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_SWAGGER !== "true") {
    return NextResponse.json({ error: "Access Restricted in Production" }, { status: 404 });
  }
  return NextResponse.json(openApiSpec);
}
