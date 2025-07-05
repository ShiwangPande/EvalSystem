import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, FileText, Star, Users, BarChart3, CheckCircle, Zap, Shield } from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container py-20 px-4">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Modern Evaluation Platform
          </Badge>
          
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Criteria Evaluation System
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              A powerful, modern platform for evaluating submissions based on customizable criteria. 
              Perfect for academic assessments, competitions, and project reviews with advanced analytics.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="text-base px-8 py-3">
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base px-8 py-3">
              <Link href="/submissions">View Submissions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built with modern technology and user experience in mind
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Smart Submissions</CardTitle>
              <CardDescription className="text-base">
                Students can easily submit their work with detailed descriptions, 
                file attachments, and real-time progress tracking.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Criteria-Based Evaluation</CardTitle>
              <CardDescription className="text-base">
                Evaluate submissions using customizable criteria with weighted scoring systems 
                and detailed feedback mechanisms.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Multi-Evaluator Support</CardTitle>
              <CardDescription className="text-base">
                Support for multiple evaluators with role-based access, 
                comprehensive feedback, and collaborative evaluation workflows.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription className="text-base">
                Comprehensive analytics and reporting with visual charts, 
                performance metrics, and detailed insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Quality Assurance</CardTitle>
              <CardDescription className="text-base">
                Built-in quality checks, plagiarism detection, and 
                standardized evaluation processes for consistent results.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription className="text-base">
                Enterprise-grade security with data encryption, 
                role-based permissions, and comprehensive audit trails.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 px-4">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of educators and students who trust our platform for their evaluation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8 py-3">
              <Link href="/dashboard">
                Start Evaluating <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base px-8 py-3">
              <Link href="/submissions/new">Create Submission</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}