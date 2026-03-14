"use client";

import { useState } from "react";
import type { GeneratedCopy } from "~/lib/copyGenerator";

interface CopyPreviewProps {
  result: GeneratedCopy;
  onGenerateAgain: () => void;
}

export default function CopyPreview({ result, onGenerateAgain }: CopyPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const allText = `${result.heroHeadline}

${result.subHeadline}

${result.ctaButton}

THE PROBLEM
${result.problemSection}

WHY CHOOSE US
${result.featuresSection}

${result.footerCta}`;

    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = result.featuresSection.split("\n").filter(f => f.trim());

  return (
    <div className="min-h-screen w-full bg-white animate-fade-in">
      {/* Top Buttons */}
      <div className="fixed top-4 right-4 z-10 flex gap-3">
        <button
          onClick={onGenerateAgain}
          className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200"
        >
          Generate Again
        </button>
        <button
          onClick={handleCopyAll}
          className="rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-700"
        >
          {copied ? "✓ Copied!" : "Copy All Text"}
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero Section */}
        <section className="mb-20 text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900">
            {result.heroHeadline}
          </h1>
          <p className="mb-10 text-xl text-gray-500">
            {result.subHeadline}
          </p>
          <button className="rounded-full bg-purple-600 px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-lg">
            {result.ctaButton}
          </button>
        </section>

        {/* Problem Section */}
        <section className="mb-20">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">The Problem</h2>
          <p className="text-lg leading-relaxed text-gray-600">
            {result.problemSection}
          </p>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Why Choose Us</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-100 bg-gray-50 p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {feature.replace(/^[•\-\d:]+/i, "").split(":")[0] || `Feature ${index + 1}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {feature.replace(/^[•\-\d:]+/i, "").split(":").slice(1).join(":").trim() || 
                   "Experience the difference with our powerful solution designed to help you succeed."}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA Section */}
        <section className="rounded-2xl bg-gray-900 px-10 py-16 text-center">
          <h2 className="mb-8 text-3xl font-bold text-white">
            {result.footerCta}
          </h2>
          <button className="rounded-full bg-purple-600 px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-lg">
            {result.ctaButton}
          </button>
        </section>
      </div>
    </div>
  );
}
