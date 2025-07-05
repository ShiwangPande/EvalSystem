"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Home, FileText, ClipboardList, Settings, Users, BarChart3, User, Shield, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useCurrentUser } from "@/hooks/use-current-user"

const studentNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Submissions", href: "/submissions", icon: FileText },
]

const evaluatorNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Submissions", href: "/submissions", icon: FileText },
  { name: "Evaluations", href: "/evaluations", icon: ClipboardList },
]

const adminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Submissions", href: "/submissions", icon: FileText },
  { name: "Evaluations", href: "/evaluations", icon: ClipboardList },
  { name: "Criteria", href: "/criteria", icon: Settings },
  { name: "Users", href: "/users", icon: Users },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, isSignedIn } = useUser()
  const { role, isLoading } = useCurrentUser()

  const getNavigationItems = () => {
    switch (role) {
      case 'STUDENT':
        return studentNavigation
      case 'EVALUATOR':
        return evaluatorNavigation
      case 'ADMIN':
        return adminNavigation
      default:
        return studentNavigation
    }
  }

  const getRoleIcon = () => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      case 'EVALUATOR':
        return <GraduationCap className="h-4 w-4" />
      case 'STUDENT':
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleDisplayName = () => {
    switch (role) {
      case 'ADMIN':
        return 'Admin'
      case 'EVALUATOR':
        return 'Evaluator'
      case 'STUDENT':
        return 'Student'
      default:
        return 'User'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg md:text-xl">EvalSystem</span>
          </Link>

          {isSignedIn && !isLoading && (
            <nav className="hidden lg:flex items-center gap-6">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:text-primary relative",
                    pathname === item.href 
                      ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full" 
                      : "text-muted-foreground hover:scale-105"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <ThemeToggle />
          
          {isSignedIn ? (
            <>
              {/* Compact user info for medium screens */}
              <div className="hidden md:flex lg:hidden items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getRoleIcon()}
                  {getRoleDisplayName()}
                </Badge>
              </div>
              
              {/* Full user info for large screens */}
              <div className="hidden lg:flex items-center gap-2">
                <Badge variant="secondary" className="hidden lg:inline-flex">
                  {getRoleIcon()}
                  {getRoleDisplayName()}
                </Badge>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
              </div>
              
              <SignOutButton>
                <Button variant="outline" size="sm" className="hidden lg:inline-flex">
                  Sign Out
                </Button>
              </SignOutButton>
            </>
          ) : (
            <SignInButton>
              <Button size="sm">
                Sign In
              </Button>
            </SignInButton>
          )}

          {isSignedIn && !isLoading && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-bold text-xl">EvalSystem</span>
                  </div>

                  {/* User Info */}
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-lg shadow-sm">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getRoleIcon()}
                            {getRoleDisplayName()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex-1 p-4">
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Menu
                      </div>
                      {getNavigationItems().map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                            pathname === item.href
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-primary hover:bg-muted"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="p-4 border-t">
                    <SignOutButton>
                      <Button variant="outline" size="sm" className="w-full">
                        Sign Out
                      </Button>
                    </SignOutButton>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
