import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting CV parsing...")

    const formData = await request.formData()
    const cvFile = formData.get("cv") as File

    if (!cvFile) {
      return NextResponse.json({ error: "No CV file provided" }, { status: 400 })
    }

    console.log("[v0] CV file received:", cvFile.name, cvFile.size, "bytes")

    // Convert file to base64
    const arrayBuffer = await cvFile.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    console.log("[v0] File converted to base64, length:", base64.length)

    const apiKey = process.env.TEXTKERNEL_API_KEY
    const accountId = process.env.TEXTKERNEL_ACCOUNT_ID
    const baseUrl = process.env.TEXTKERNEL_BASE_URL

    if (!apiKey || !accountId || !baseUrl) {
      console.log("[v0] Missing environment variables")
      return NextResponse.json({ error: "Missing API configuration" }, { status: 500 })
    }

    const apiUrl = `${baseUrl.replace(/\/$/, "")}/parser/resume`
    console.log("[v0] Using API endpoint:", apiUrl)

    // Parse CV with Textkernel
    const parseResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Tx-AccountId": accountId,
        "Tx-ServiceKey": apiKey,
      },
      body: JSON.stringify({
        DocumentAsBase64String: base64,
        DocumentLastModified: new Date().toISOString().split("T")[0],
      }),
    })

    console.log("[v0] Parse response status:", parseResponse.status)

    if (!parseResponse.ok) {
      const errorText = await parseResponse.text()
      console.log("[v0] Parse error response:", errorText)
      return NextResponse.json(
        {
          error: "CV parsing failed",
          details: errorText,
        },
        { status: 500 },
      )
    }

    const parseResult = await parseResponse.json()
    console.log("[v0] Parse successful, result keys:", Object.keys(parseResult))

    return NextResponse.json({
      success: true,
      parseResult: parseResult,
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
