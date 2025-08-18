"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SimpleCVParser() {
  const [isLoading, setIsLoading] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<any>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setCvFile(file)
      setParseResult(null)
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file.",
        variant: "destructive",
      })
    }
  }

  const handleParse = async () => {
    if (!cvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CV file first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("cv", cvFile)

      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setParseResult(result.parseResult)
        toast({
          title: "Success!",
          description: "CV parsed successfully.",
        })
      } else {
        throw new Error(result.error || "Parsing failed")
      }
    } catch (error) {
      console.error("Parse error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse CV",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadResult = () => {
    if (!parseResult) return

    const blob = new Blob([JSON.stringify(parseResult, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cv-parse-result-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">CV Parser Test</h1>
        <p className="text-muted-foreground">Test the Textkernel CV parsing functionality</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CV
          </CardTitle>
          <CardDescription>Select a PDF file to parse with Textkernel API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cv-file">CV File (PDF)</Label>
            <Input id="cv-file" type="file" accept=".pdf" onChange={handleFileChange} className="mt-1" />
          </div>

          {cvFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          <Button onClick={handleParse} disabled={!cvFile || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing CV...
              </>
            ) : (
              "Parse CV"
            )}
          </Button>
        </CardContent>
      </Card>

      {parseResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Parse Results
              <Button onClick={downloadResult} variant="outline" size="sm">
                Download JSON
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parseResult.Value?.ResumeData?.ContactInformation && (
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="bg-muted p-3 rounded text-sm">
                    <p>
                      <strong>Name:</strong>{" "}
                      {parseResult.Value.ResumeData.ContactInformation.CandidateName?.FormattedName || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {parseResult.Value.ResumeData.ContactInformation.EmailAddresses?.[0] || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {parseResult.Value.ResumeData.ContactInformation.Telephones?.[0]?.Raw || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {parseResult.Value?.ResumeData?.Skills && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Skills (
                    {Array.isArray(parseResult.Value.ResumeData.Skills)
                      ? parseResult.Value.ResumeData.Skills.length
                      : "N/A"}
                    )
                  </h3>
                  <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {Array.isArray(parseResult.Value.ResumeData.Skills) ? (
                      <>
                        {parseResult.Value.ResumeData.Skills.slice(0, 10).map((skill: any, index: number) => (
                          <span key={index} className="inline-block bg-background px-2 py-1 rounded mr-2 mb-1">
                            {skill.Name || skill}
                          </span>
                        ))}
                        {parseResult.Value.ResumeData.Skills.length > 10 && (
                          <span className="text-muted-foreground">
                            ...and {parseResult.Value.ResumeData.Skills.length - 10} more
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground">
                        Skills data format: {typeof parseResult.Value.ResumeData.Skills}
                        <pre className="mt-2 text-xs">
                          {JSON.stringify(parseResult.Value.ResumeData.Skills, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Raw Data Preview</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(parseResult, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
