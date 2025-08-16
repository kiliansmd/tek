"use client"

import type React from "react"

import { useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PDFUploadSectionProps {
  cvFile: File | null
  jobFile: File | null
  onCvUpload: (file: File | null) => void
  onJobUpload: (file: File | null) => void
}

export function PDFUploadSection({ cvFile, jobFile, onCvUpload, onJobUpload }: PDFUploadSectionProps) {
  const cvInputRef = useRef<HTMLInputElement>(null)
  const jobInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validatePDFFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Please upload a PDF file only."
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return "File size must be less than 10MB."
    }
    return null
  }

  const handleCvDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        const error = validatePDFFile(file)
        if (!error) {
          onCvUpload(file)
        } else {
          alert(error)
        }
      }
    },
    [onCvUpload],
  )

  const handleJobDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        const error = validatePDFFile(file)
        if (!error) {
          onJobUpload(file)
        } else {
          alert(error)
        }
      }
    },
    [onJobUpload],
  )

  const handleCvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const error = validatePDFFile(file)
      if (!error) {
        onCvUpload(file)
      } else {
        alert(error)
      }
    }
  }

  const handleJobFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const error = validatePDFFile(file)
      if (!error) {
        onJobUpload(file)
      } else {
        alert(error)
      }
    }
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Upload both a CV and job description in PDF format to get started. Maximum file size: 10MB per file.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* CV Upload */}
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload CV
            </CardTitle>
            <CardDescription>Upload the candidate's CV in PDF format</CardDescription>
          </CardHeader>
          <CardContent>
            {!cvFile ? (
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleCvDrop}
                onClick={() => cvInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input ref={cvInputRef} type="file" accept=".pdf" onChange={handleCvFileSelect} className="hidden" />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Drag & drop your CV here, or click to select</p>
                <p className="text-xs text-muted-foreground">PDF files only (max 10MB)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{cvFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onCvUpload(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Description Upload */}
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Job Description
            </CardTitle>
            <CardDescription>Upload the job description in PDF format</CardDescription>
          </CardHeader>
          <CardContent>
            {!jobFile ? (
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleJobDrop}
                onClick={() => jobInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input ref={jobInputRef} type="file" accept=".pdf" onChange={handleJobFileSelect} className="hidden" />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop your job description here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">PDF files only (max 10MB)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{jobFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(jobFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onJobUpload(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
