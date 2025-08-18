"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Briefcase, GraduationCap, Award, Languages, Download, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CVData {
  contactInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  skills: string[]
  experience: Array<{
    title: string
    company: string
    startDate: string
    endDate: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    startDate: string
    endDate: string
    description: string
  }>
  languages: string[]
  certifications: string[]
}

interface CVDataEditorProps {
  parseResult: any
  onDataChange?: (data: CVData) => void
}

function CVDataEditor({ parseResult, onDataChange }: CVDataEditorProps) {
  const [cvData, setCvData] = useState<CVData>({
    contactInfo: { name: "", email: "", phone: "", address: "" },
    skills: [],
    experience: [],
    education: [],
    languages: [],
    certifications: [],
  })
  const [newSkill, setNewSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (parseResult?.Value?.ResumeData) {
      const resumeData = parseResult.Value.ResumeData

      const extractedData: CVData = {
        contactInfo: {
          name: resumeData.ContactInformation?.CandidateName?.FormattedName || "",
          email: resumeData.ContactInformation?.EmailAddresses?.[0] || "",
          phone: resumeData.ContactInformation?.Telephones?.[0]?.Raw || "",
          address: resumeData.ContactInformation?.Location?.CountryCode || "",
        },
        skills: Array.isArray(resumeData.Skills)
          ? resumeData.Skills.map((skill: any) => skill.Name || skill).filter(Boolean)
          : [],
        experience: Array.isArray(resumeData.EmploymentHistory)
          ? resumeData.EmploymentHistory.map((job: any) => ({
              title: job.JobTitle?.Raw || "",
              company: job.Employer?.Name?.Raw || "",
              startDate: job.StartDate?.Date || "",
              endDate: job.EndDate?.Date || "",
              description: job.Description || "",
            }))
          : [],
        education: Array.isArray(resumeData.Education)
          ? resumeData.Education.map((edu: any) => ({
              degree: edu.Degree?.Name?.Raw || "",
              institution: edu.SchoolName?.Raw || "",
              startDate: edu.StartDate?.Date || "",
              endDate: edu.EndDate?.Date || "",
              description: edu.Text || "",
            }))
          : [],
        languages: Array.isArray(resumeData.Languages)
          ? resumeData.Languages.map((lang: any) => lang.Language || lang)
          : [],
        certifications: Array.isArray(resumeData.Certifications)
          ? resumeData.Certifications.map((cert: any) => cert.Name || cert)
          : [],
      }

      setCvData(extractedData)
      onDataChange?.(extractedData)
    }
  }, [parseResult, onDataChange])

  const updateContactInfo = (field: keyof CVData["contactInfo"], value: string) => {
    const newData = {
      ...cvData,
      contactInfo: { ...cvData.contactInfo, [field]: value },
    }
    setCvData(newData)
    onDataChange?.(newData)
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      const newData = {
        ...cvData,
        skills: [...cvData.skills, newSkill.trim()],
      }
      setCvData(newData)
      setNewSkill("")
      onDataChange?.(newData)
    }
  }

  const removeSkill = (index: number) => {
    const newData = {
      ...cvData,
      skills: cvData.skills.filter((_, i) => i !== index),
    }
    setCvData(newData)
    onDataChange?.(newData)
  }

  const addLanguage = () => {
    if (newLanguage.trim()) {
      const newData = {
        ...cvData,
        languages: [...cvData.languages, newLanguage.trim()],
      }
      setCvData(newData)
      setNewLanguage("")
      onDataChange?.(newData)
    }
  }

  const removeLanguage = (index: number) => {
    const newData = {
      ...cvData,
      languages: cvData.languages.filter((_, i) => i !== index),
    }
    setCvData(newData)
    onDataChange?.(newData)
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      const newData = {
        ...cvData,
        certifications: [...cvData.certifications, newCertification.trim()],
      }
      setCvData(newData)
      setNewCertification("")
      onDataChange?.(newData)
    }
  }

  const removeCertification = (index: number) => {
    const newData = {
      ...cvData,
      certifications: cvData.certifications.filter((_, i) => i !== index),
    }
    setCvData(newData)
    onDataChange?.(newData)
  }

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...cvData.experience]
    newExperience[index] = { ...newExperience[index], [field]: value }
    const newData = { ...cvData, experience: newExperience }
    setCvData(newData)
    onDataChange?.(newData)
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...cvData.education]
    newEducation[index] = { ...newEducation[index], [field]: value }
    const newData = { ...cvData, education: newEducation }
    setCvData(newData)
    onDataChange?.(newData)
  }

  const downloadEditedData = () => {
    const blob = new Blob([JSON.stringify(cvData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `edited-cv-data-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download Complete",
      description: "Edited CV data has been downloaded as JSON.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CV Data Editor</h2>
        <Button onClick={downloadEditedData} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Edited Data
        </Button>
      </div>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Edit personal contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={cvData.contactInfo.name}
                    onChange={(e) => updateContactInfo("name", e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={cvData.contactInfo.email}
                    onChange={(e) => updateContactInfo("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={cvData.contactInfo.phone}
                    onChange={(e) => updateContactInfo("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={cvData.contactInfo.address}
                    onChange={(e) => updateContactInfo("address", e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills
              </CardTitle>
              <CardDescription>Manage technical and soft skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                />
                <Button onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeSkill(index)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
              <CardDescription>Edit employment history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {cvData.experience.map((exp, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Job Title</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => updateExperience(index, "title", e.target.value)}
                        placeholder="Job title"
                      />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                        placeholder="Start date"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                        placeholder="End date"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, "description", e.target.value)}
                      placeholder="Job description and responsibilities"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
              <CardDescription>Edit educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {cvData.education.map((edu, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                        placeholder="Degree/Qualification"
                      />
                    </div>
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                        placeholder="School/University"
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                        placeholder="Start date"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                        placeholder="End date"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={edu.description}
                      onChange={(e) => updateEducation(index, "description", e.target.value)}
                      placeholder="Additional details about education"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language"
                    onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                  />
                  <Button onClick={addLanguage} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cvData.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {language}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeLanguage(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add a certification"
                    onKeyPress={(e) => e.key === "Enter" && addCertification()}
                  />
                  <Button onClick={addCertification} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cvData.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {cert}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeCertification(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { CVDataEditor }
export default CVDataEditor
