import { CVScoringApp } from "@/components/cv-scoring-app"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        <CVScoringApp />
        <Toaster />
      </main>
    </ErrorBoundary>
  )
}
