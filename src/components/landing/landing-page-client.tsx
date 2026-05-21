// ═══════════════════════════════════════════════════════════
// Landing Page Client Component
// Beautiful, animated marketing page with hero, features, CTA
// ═══════════════════════════════════════════════════════════

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  CheckSquare,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  MessageSquare,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const features = [
  {
    icon: Brain,
    title: "AI Knowledge Assistant",
    description:
      "Upload documents and chat with your knowledge base. Get instant summaries, answers, and task suggestions powered by AI.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: CheckSquare,
    title: "Smart Task Management",
    description:
      "Kanban boards with drag-and-drop, priority management, and automated task generation from your notes and documents.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageSquare,
    title: "Realtime Collaboration",
    description:
      "Live comments, instant notifications, and presence indicators. Know who's online and working on what, in real-time.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Actionable Analytics",
    description:
      "Track team productivity with beautiful charts and AI-generated insights. Make data-driven decisions effortlessly.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Workspace Management",
    description:
      "Create workspaces, invite team members, and manage roles. Keep everything organized across your entire organization.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Role-based access control, secure authentication, input sanitization, and rate limiting built right in.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

export default function LandingPageClient() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* ── Ambient Background ───────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[40%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent blur-3xl" />
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Nexo<span className="text-gradient">ra</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto max-w-4xl"
        >
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Powered by AI — Built for Teams</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl lg:text-8xl"
          >
            Your team&apos;s
            <br />
            <span className="text-gradient">knowledge amplified</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Collaborate smarter with AI-powered knowledge management. Upload
            documents, chat with your data, manage tasks, and track team
            productivity — all in one beautiful platform.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/sign-up">
              <Button
                size="lg"
                className="group h-12 min-w-[200px] bg-gradient-to-r from-indigo-500 to-violet-600 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-[1.02]"
              >
                Start for Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 min-w-[200px] text-base font-semibold backdrop-blur-sm"
            >
              <Globe className="mr-2 h-4 w-4" />
              View Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Dashboard Preview ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50 p-2 shadow-2xl shadow-black/10 backdrop-blur-sm">
            <div className="overflow-hidden rounded-lg border border-border/30 bg-background">
              {/* Mock dashboard header */}
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="mx-auto h-5 w-64 rounded-md bg-muted/50" />
              </div>
              {/* Mock dashboard body */}
              <div className="flex h-[300px] md:h-[400px]">
                {/* Sidebar */}
                <div className="hidden w-56 border-r border-border/30 p-4 md:block">
                  <div className="mb-4 h-8 w-32 rounded-md bg-muted/50" />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`mb-2 h-8 rounded-md ${
                        i === 1 ? "bg-indigo-500/20" : "bg-muted/30"
                      }`}
                      style={{ width: `${70 + i * 5}%` }}
                    />
                  ))}
                </div>
                {/* Main content */}
                <div className="flex-1 p-6">
                  <div className="mb-6 h-8 w-48 rounded-md bg-muted/50" />
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { color: "bg-indigo-500/20", label: "23" },
                      { color: "bg-emerald-500/20", label: "18" },
                      { color: "bg-amber-500/20", label: "5" },
                      { color: "bg-violet-500/20", label: "92%" },
                    ].map((card, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center rounded-lg ${card.color} p-4`}
                      >
                        <div className="text-2xl font-bold">{card.label}</div>
                        <div className="mt-1 h-3 w-16 rounded bg-muted/50" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 h-32 rounded-lg bg-muted/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-3xl" />
        </motion.div>
      </section>

      {/* ── Features Section ─────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-3xl font-bold tracking-tight md:text-5xl"
          >
            Everything your team needs
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mb-16 max-w-2xl text-lg text-muted-foreground"
          >
            A complete platform that brings AI, task management, and real-time
            collaboration together in one beautiful interface.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-xl hover:shadow-black/5"
            >
              <div
                className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              {/* Hover gradient */}
              <div
                className={`absolute inset-0 -z-10 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.03]`}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA Section ──────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700 px-8 py-16 text-center text-white shadow-2xl shadow-indigo-500/25 md:px-16"
        >
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold md:text-5xl">
              Ready to supercharge your team?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
              Join thousands of teams already using Nexora to work smarter,
              collaborate faster, and achieve more.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="h-12 min-w-[200px] bg-white text-base font-semibold text-indigo-600 shadow-xl hover:bg-white/90 transition-all duration-300 hover:scale-[1.02]"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Nexora</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Nexora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
