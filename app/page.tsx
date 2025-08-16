import { SimpleCVParser } from "@/components/simple-cv-parser"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <SimpleCVParser />
      <Toaster />
    </main>
  )
}
