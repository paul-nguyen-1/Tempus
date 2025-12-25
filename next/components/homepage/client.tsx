import Link from "next/link";
import { Calendar, Clock, Users, Zap } from "lucide-react";

export function ClientHome() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-4xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Scheduling made{" "}
            <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              simple
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Say goodbye to back-and-forth emails. Share your availability and
            let others book time with you effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-input bg-background px-8 py-3 text-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your time
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Flexible Scheduling"
              description="Set recurring availability, specific dates, or date ranges to fit your schedule."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Custom Intervals"
              description="Choose 15, 30, or 60-minute booking slots to match your meeting style."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Easy Booking"
              description="Share your personalized link and let others book time instantly."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Instant Confirmation"
              description="Automatic email confirmations keep everyone on the same page."
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="space-y-8">
            <Step
              number={1}
              title="Set your availability"
              description="Define when you're free for meetings with flexible scheduling options."
            />
            <Step
              number={2}
              title="Share your link"
              description="Send your personalized booking link to colleagues, clients, or anyone."
            />
            <Step
              number={3}
              title="Get booked"
              description="Others pick a time that works, and you both get instant confirmation."
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Ready to take control of your schedule?
          </h2>
          <p className="text-xl opacity-90">
            Join thousands who have simplified their scheduling.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-background text-foreground px-8 py-3 text-lg font-medium hover:bg-background/90 transition-colors mt-4"
          >
            Start Free Today
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Tempus. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
      <div className="text-primary">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 items-start">
      <div className="shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
        {number}
      </div>
      <div className="flex-1 pt-2">
        <h3 className="font-semibold text-xl mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
