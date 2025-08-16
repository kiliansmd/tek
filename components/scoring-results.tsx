"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  BarChart3,
  User,
  Briefcase,
  Award,
  GraduationCap,
  Languages,
  Wrench,
  FileText,
  Table,
} from "lucide-react"
import { downloadJSON, downloadCSV, downloadSummaryReport, type DownloadData } from "@/lib/download-utils"

interface ScoringResultsProps {
  results: any
}

export function ScoringResults({ results }: ScoringResultsProps) {
  const { scoringResults, resumeData, jobData, files } = results

  const downloadResults = () => {
    downloadJSON(results, `cv-scoring-results-${new Date().toISOString().split("T")[0]}.json`)
  }

  const downloadParsedData = (data: any, filename: string) => {
    downloadJSON(data, filename)
  }

  const downloadCSVSummary = () => {
    downloadCSV(results as DownloadData)
  }

  const downloadTextReport = () => {
    downloadSummaryReport(results as DownloadData)
  }

  const overallScore = Math.round(scoringResults.SuggestedScore * 100)
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const getDetailedBreakdown = () => {
    const breakdown = scoringResults.ApplicantScoreBreakdown || {}
    return [
      {
        name: "Skills Match",
        score: breakdown.Skills || 0,
        icon: Wrench,
        description: "Technical and soft skills alignment",
      },
      {
        name: "Experience",
        score: breakdown.Experience || 0,
        icon: Award,
        description: "Relevant work experience match",
      },
      {
        name: "Education",
        score: breakdown.Education || 0,
        icon: GraduationCap,
        description: "Educational background alignment",
      },
      {
        name: "Languages",
        score: breakdown.Languages || 0,
        icon: Languages,
        description: "Language requirements match",
      },
    ]
  }

  const getCandidateInfo = () => {
    const contact = resumeData.ResumeData?.ContactInformation
    const experience = resumeData.ResumeData?.EmploymentHistory
    const education = resumeData.ResumeData?.Education

    return {
      name: contact?.CandidateName?.FormattedName || "N/A",
      email: contact?.EmailAddresses?.[0]?.InternetEmailAddress || "N/A",
      phone: contact?.Telephones?.[0]?.Raw || "N/A",
      totalExperience: experience?.length || 0,
      highestEducation: education?.[0]?.Degree?.Name || "N/A",
    }
  }

  const getJobInfo = () => {
    const jobData_ = jobData.JobData
    return {
      title: jobData_?.JobTitles?.[0]?.Name || "N/A",
      company: jobData_?.EmployerNames?.[0]?.Name || "N/A",
      location: jobData_?.JobLocations?.[0]?.Municipality || "N/A",
      requiredSkills: jobData_?.Skills?.length || 0,
    }
  }

  const candidateInfo = getCandidateInfo()
  const jobInfo = getJobInfo()
  const detailedBreakdown = getDetailedBreakdown()

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Overall Match Score</CardTitle>
          <CardDescription>How well does this CV match the job requirements?</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}%</div>
          <Progress value={overallScore} className="w-full max-w-md mx-auto h-3" />
          <Badge variant={getScoreBadgeVariant(overallScore)} className="text-lg px-4 py-2">
            {overallScore >= 80 ? "Excellent Match" : overallScore >= 60 ? "Good Match" : "Poor Match"}
          </Badge>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {overallScore >= 80
              ? "This candidate is an excellent fit for the position and should be prioritized for interview."
              : overallScore >= 60
                ? "This candidate shows good potential and may be worth considering with additional evaluation."
                : "This candidate may not be the best fit for this specific role, but could be suitable for other positions."}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="candidate">Candidate Info</TabsTrigger>
          <TabsTrigger value="job">Job Details</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {detailedBreakdown.map((item) => {
              const IconComponent = item.icon
              const score = Math.round(item.score * 100)
              return (
                <Card key={item.name}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {item.name}
                    </CardTitle>
                    <CardDescription className="text-xs">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{score}%</span>
                      <Badge variant={score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive"}>
                        {score >= 70 ? "Good" : score >= 50 ? "Fair" : "Poor"}
                      </Badge>
                    </div>
                    <Progress value={score} className="h-2" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="candidate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                    <p className="font-medium">{candidateInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email</span>
                    <p className="font-medium">{candidateInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Phone</span>
                    <p className="font-medium">{candidateInfo.phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Work Experience</span>
                    <p className="font-medium">{candidateInfo.totalExperience} positions</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Highest Education</span>
                    <p className="font-medium">{candidateInfo.highestEducation}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">CV File</span>
                    <p className="font-medium">{files.cvName}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <Button
                variant="outline"
                onClick={() => downloadParsedData(resumeData, `parsed-cv-${files.cvName.replace(".pdf", ".json")}`)}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Complete CV Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Job Title</span>
                    <p className="font-medium">{jobInfo.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Company</span>
                    <p className="font-medium">{jobInfo.company}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Location</span>
                    <p className="font-medium">{jobInfo.location}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Required Skills</span>
                    <p className="font-medium">{jobInfo.requiredSkills} skills identified</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Job Description File</span>
                    <p className="font-medium">{files.jobName}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <Button
                variant="outline"
                onClick={() => downloadParsedData(jobData, `parsed-job-${files.jobName.replace(".pdf", ".json")}`)}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Complete Job Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Download Options
              </CardTitle>
              <CardDescription>
                Export your analysis results in various formats for further review and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button onClick={downloadTextReport} className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Summary Report (TXT)
                  <span className="ml-auto text-xs text-muted-foreground">Human-readable summary</span>
                </Button>

                <Button onClick={downloadCSVSummary} variant="outline" className="w-full justify-start bg-transparent">
                  <Table className="h-4 w-4 mr-2" />
                  Score Summary (CSV)
                  <span className="ml-auto text-xs text-muted-foreground">Spreadsheet format</span>
                </Button>

                <Button onClick={downloadResults} variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Complete Analysis (JSON)
                  <span className="ml-auto text-xs text-muted-foreground">All technical data</span>
                </Button>

                <Separator />

                <Button
                  variant="outline"
                  onClick={() => downloadParsedData(resumeData, `parsed-cv-${files.cvName.replace(".pdf", ".json")}`)}
                  className="w-full justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  CV Data Only (JSON)
                  <span className="ml-auto text-xs text-muted-foreground">Candidate data only</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadParsedData(jobData, `parsed-job-${files.jobName.replace(".pdf", ".json")}`)}
                  className="w-full justify-start"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Job Data Only (JSON)
                  <span className="ml-auto text-xs text-muted-foreground">Job requirements only</span>
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium mb-1">File Format Guide:</p>
                <p>
                  • <strong>TXT Report:</strong> Easy-to-read summary for sharing with stakeholders
                </p>
                <p>
                  • <strong>CSV Summary:</strong> Import into Excel or Google Sheets for analysis
                </p>
                <p>
                  • <strong>JSON Files:</strong> Technical data for integration with other systems
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
