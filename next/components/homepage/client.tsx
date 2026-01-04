import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  Check,
  ArrowRight,
  Building2,
  Shield,
} from "lucide-react";

export function ClientHome() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <section className="px-4 py-20 lg:py-32 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Professional scheduling that works for your business
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Streamline your calendar management with enterprise-grade
              scheduling software. Eliminate back-and-forth emails and focus on
              what matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-8 py-4 text-base font-semibold text-white hover:bg-gray-800 transition-colors shadow-sm"
              >
                Start free trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-8 py-4 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Sign in
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your schedule
            </h2>
            <p className="text-lg text-gray-600">
              Professional tools designed for modern teams and businesses
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Flexible Scheduling"
              description="Configure recurring availability, specific dates, or custom date ranges to match your workflow."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Custom Time Slots"
              description="Define 15, 30, or 60-minute intervals with buffer times and meeting limits."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Team Coordination"
              description="Share booking links internally or externally with role-based permissions."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Enterprise Security"
              description="Built with security and privacy as top priorities for your business data."
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple process, powerful results
            </h2>
            <p className="text-lg text-gray-600">
              Get started in minutes with our streamlined setup
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ProcessStep
              number="01"
              title="Configure availability"
              description="Set your working hours and meeting preferences with granular control over your schedule."
            />
            <ProcessStep
              number="02"
              title="Share your link"
              description="Distribute your personalized booking URL to clients, colleagues, or embed on your website."
            />
            <ProcessStep
              number="03"
              title="Manage bookings"
              description="View, modify, and track all appointments from a centralized dashboard with analytics."
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Built for professional teams
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Tempus provides enterprise-grade scheduling with the flexibility
                and reliability your business demands.
              </p>
              <ul className="space-y-4">
                <BenefitItem text="Reduce scheduling time with automated booking" />
                <BenefitItem text="Eliminate double-bookings and conflicts" />
                <BenefitItem text="Integrate with your existing calendar" />
                <BenefitItem text="Track and analyze booking patterns" />
                <BenefitItem text="Customizable booking pages" />
              </ul>
            </div>
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to optimize your scheduling?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start streamlining your calendar management today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-gray-900 px-8 py-4 text-base font-semibold hover:bg-gray-100 transition-colors"
            >
              Start your free trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white hover:text-gray-900 transition-colors"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/features"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/docs"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2025 Tempus, Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
            </div>
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
    <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="text-5xl font-bold text-gray-200 mb-4">{number}</div>
      <h3 className="font-semibold text-xl text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="shrink-0 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center mt-0.5">
        <Check className="h-4 w-4 text-white" />
      </div>
      <span className="text-gray-700 font-medium">{text}</span>
    </li>
  );
}
