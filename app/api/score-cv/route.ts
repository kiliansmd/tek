import { type NextRequest, NextResponse } from "next/server"

const TEXTKERNEL_API_KEY = "btU9Mn+i5nJkDi/yDiNKkoK0oqt/p422Uas9gbKr"
const TEXTKERNEL_ACCOUNT_ID = "27631519"
const TEXTKERNEL_BASE_URL = "https://api.eu.textkernel.com/tx/v10"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const cvFile = formData.get("cv") as File
    const jobFile = formData.get("job") as File

    if (!cvFile || !jobFile) {
      return NextResponse.json(
        {
          success: false,
          error: "Both CV and job description files are required",
        },
        { status: 400 },
      )
    }

    // Validate file types
    if (cvFile.type !== "application/pdf" || jobFile.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF files are supported",
        },
        { status: 400 },
      )
    }

    // Validate file sizes (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (cvFile.size > maxSize || jobFile.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File size must be less than 10MB",
        },
        { status: 400 },
      )
    }

    // Convert files to base64
    const cvBuffer = await cvFile.arrayBuffer()
    const jobBuffer = await jobFile.arrayBuffer()
    const cvBase64 = Buffer.from(cvBuffer).toString("base64")
    const jobBase64 = Buffer.from(jobBuffer).toString("base64")

    const currentDate = new Date().toISOString().split("T")[0] // Gets YYYY-MM-DD format

    // First, parse the CV
    console.log("[v0] Starting CV parsing...")
    const parseResumeResponse = await fetch(`${TEXTKERNEL_BASE_URL}/parser/resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Tx-AccountId": TEXTKERNEL_ACCOUNT_ID,
        "Tx-ServiceKey": TEXTKERNEL_API_KEY,
      },
      body: JSON.stringify({
        DocumentAsBase64String: cvBase64,
        DocumentLastModified: currentDate,
        Configuration: {
          SkillsSettings: {
            TaxonomyVersion: "V2",
            Normalize: true,
          },
        },
      }),
    })

    if (!parseResumeResponse.ok) {
      const errorText = await parseResumeResponse.text()
      console.error("[v0] Resume parsing failed:", errorText)
      let errorDetails = `${parseResumeResponse.status} ${parseResumeResponse.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.Info?.Message) {
          errorDetails = errorJson.Info.Message
        }
      } catch (e) {
        // Use default error details if JSON parsing fails
      }
      throw new Error(`Resume parsing failed: ${errorDetails}`)
    }

    const resumeData = await parseResumeResponse.json()
    console.log("[v0] CV parsed successfully, ResumeData structure:", JSON.stringify(resumeData, null, 2))

    // Parse the job description
    console.log("[v0] Starting job parsing...")
    const parseJobResponse = await fetch(`${TEXTKERNEL_BASE_URL}/parser/joborder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Tx-AccountId": TEXTKERNEL_ACCOUNT_ID,
        "Tx-ServiceKey": TEXTKERNEL_API_KEY,
      },
      body: JSON.stringify({
        DocumentAsBase64String: jobBase64,
        DocumentLastModified: currentDate,
        Configuration: {
          SkillsSettings: {
            TaxonomyVersion: "V2",
            Normalize: true,
          },
        },
      }),
    })

    if (!parseJobResponse.ok) {
      const errorText = await parseJobResponse.text()
      console.error("[v0] Job parsing failed:", errorText)
      let errorDetails = `${parseJobResponse.status} ${parseJobResponse.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.Info?.Message) {
          errorDetails = errorJson.Info.Message
        }
      } catch (e) {
        // Use default error details if JSON parsing fails
      }
      throw new Error(`Job parsing failed: ${errorDetails}`)
    }

    const jobData = await parseJobResponse.json()
    console.log("[v0] Job parsed successfully, JobData structure:", JSON.stringify(jobData, null, 2))

    // Now score the resume against the job
    console.log("[v0] Starting scoring with data structure:")
    const scoringPayload = {
      SourceResume: {
        Id: `source_resume_${Date.now()}`,
        ResumeData: resumeData.Value.ResumeData,
      },
      TargetJobs: [
        {
          Id: `job_${Date.now()}`,
          JobData: jobData.Value.JobData,
        },
      ],
      Settings: {
        PositionTitle: true,
        PositionTitleWeight: 1.0,
        Skills: true,
        SkillsWeight: 1.0,
        Education: true,
        EducationWeight: 1.0,
        Experience: true,
        ExperienceWeight: 1.0,
        Languages: true,
        LanguagesWeight: 1.0,
      },
    }

    console.log("[v0] Scoring payload:", JSON.stringify(scoringPayload, null, 2))

    const scoringResponse = await fetch(`${TEXTKERNEL_BASE_URL}/scorer/bimetric/resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Tx-AccountId": TEXTKERNEL_ACCOUNT_ID,
        "Tx-ServiceKey": TEXTKERNEL_API_KEY,
      },
      body: JSON.stringify(scoringPayload),
    })

    if (!scoringResponse.ok) {
      const errorText = await scoringResponse.text()
      console.error("[v0] Scoring failed:", errorText)
      let errorDetails = `${scoringResponse.status} ${scoringResponse.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.Info?.Message) {
          errorDetails = errorJson.Info.Message
        }
      } catch (e) {
        // Use default error details if JSON parsing fails
      }
      throw new Error(`Scoring failed: ${errorDetails}`)
    }

    const scoringData = await scoringResponse.json()
    console.log("[v0] Scoring completed successfully:", JSON.stringify(scoringData, null, 2))

    return NextResponse.json({
      success: true,
      resumeData: resumeData.Value,
      jobData: jobData.Value,
      scoringResults: scoringData.Value,
      files: {
        cvName: cvFile.name,
        jobName: jobFile.name,
      },
    })
  } catch (error) {
    console.error("[v0] API Error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process files and score CV",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
