import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { path } = await request.json()
  revalidatePath(path)
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
