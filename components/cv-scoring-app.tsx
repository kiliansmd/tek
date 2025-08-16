"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, BarChart3, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { PDFUploadSection } from "./pdf-upload-section"
import { ScoringResults } from "./scoring-results"

interface ErrorState {
  message: string
  details?: string
}

export function CVScoringApp() {
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [jobFile, setJobFile] = useState<File | null>(null)
  const [scoringResults, setScoringResults] = useState<any>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)
  const { toast } = useToast()

  const handleScoring = async () => {
    if (!cvFile || !jobFile) {
      toast({
        title: "Missing Files",
        description: "Please upload both a CV and job description before scoring.",
        variant: "destructive",
      })
      return
    }

    setIsScoring(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("cv", cvFile)
      formData.append("job", jobFile)

      const response = await fetch("/api/score-cv", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const results = await response.json()

      if (!results.success) {
        throw new Error(results.error || "Scoring failed")
      }

      setScoringResults(results)
      toast({
        title: "Analysis Complete",
        description: "CV and job description have been successfully analyzed.",
      })
    } catch (error) {
      console.error("Scoring error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"

      setError({
        message: "Failed to analyze CV and job description",
        details: errorMessage,
      })

      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsScoring(false)
    }
  }

  const resetApp = () => {
    setCvFile(null)
    setJobFile(null)
    setScoringResults(null)
    setError(null)
    toast({
      title: "Reset Complete",
      description: "Ready for new CV analysis.",
    })
  }

  const canScore = cvFile && jobFile && !isScoring

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">CV-Job Scoring System</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your CV and job description to get an intelligent matching score powered by Textkernel AI
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">{error.message}</p>
              {error.details && (
                <details className="text-sm">
                  <summary className="cursor-pointer hover:underline">Technical Details</summary>
                  <p className="mt-2 p-2 bg-destructive/10 rounded text-xs font-mono">{error.details}</p>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!scoringResults ? (
        <div className="space-y-8">
          <PDFUploadSection cvFile={cvFile} jobFile={jobFile} onCvUpload={setCvFile} onJobUpload={setJobFile} />

          {/* Progress Indicator */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {cvFile ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={cvFile ? "text-green-600" : ""}>CV Uploaded</span>
              </div>
              <div className="h-px w-8 bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                {jobFile ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={jobFile ? "text-green-600" : ""}>Job Description Uploaded</span>
              </div>
              <div className="h-px w-8 bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                {isScoring ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : canScore ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={isScoring ? "text-primary" : canScore ? "text-primary" : ""}>
                  {isScoring ? "Analyzing..." : "Ready to Score"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleScoring} disabled={!canScore} size="lg" className="px-8 py-3 text-lg min-w-[200px]">
              {isScoring ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Score CV vs Job
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          {!canScore && !isScoring && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {!cvFile && !jobFile
                  ? "Upload both files to get started"
                  : !cvFile
                    ? "Please upload a CV file"
                    : "Please upload a job description file"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <ScoringResults results={scoringResults} />
          <div className="flex justify-center gap-4">
            <Button onClick={resetApp} variant="outline" size="lg">
              <Upload className="mr-2 h-5 w-5" />
              Analyze Another CV
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
