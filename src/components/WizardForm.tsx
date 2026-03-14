"use client";

import { useState } from "react";
import type { CopyFormData, GeneratedCopy } from "~/lib/copyGenerator";
import { toneLabels, toneDescriptions } from "~/lib/copyGenerator";
import CopyPreview from "~/components/CopyPreview";

const STEPS = [
  { key: "productName", label: "Product Name", placeholder: "e.g., CopyAI" },
  { key: "oneLineDescription", label: "One-line Description", placeholder: "e.g., AI-powered landing page copywriter" },
  { key: "targetCustomer", label: "Target Customer / ICP", placeholder: "e.g., SaaS founders and indie hackers" },
  { key: "painPoint", label: "Main Pain Point", placeholder: "e.g., writing compelling copy that converts" },
  { key: "tone", label: "Tone", placeholder: "" },
  { key: "ctaGoal", label: "CTA Goal", placeholder: "try free" },
] as const;

export default function WizardForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CopyFormData>({
    productName: "",
    oneLineDescription: "",
    targetCustomer: "",
    painPoint: "",
    tone: null,
    ctaGoal: "",
  });
  const [result, setResult] = useState<GeneratedCopy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;
  const canProceed = step.key === "tone" ? !!formData.tone : !!formData[step.key as keyof CopyFormData];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: formData.productName,
          description: formData.oneLineDescription,
          icp: formData.targetCustomer,
          pain: formData.painPoint,
          tone: formData.tone || "direct",
          cta: formData.ctaGoal || "Try Free",
        }),
      });

      const text = await response.text();
      let data: Record<string, unknown>;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          response.ok
            ? "Invalid response from server"
            : `Request failed (${response.status}). Make sure the API server is running on port 3001.`
        );
      }

      if (!response.ok) {
        throw new Error(
          (data && typeof data.error === "string" ? data.error : null) ||
            "Generation failed"
        );
      }
      
      // Transform API response to match GeneratedCopy format
      const generatedCopy: GeneratedCopy = {
        heroHeadline: data.hero || "Your headline here",
        subHeadline: data.sub || "Your subheadline here",
        ctaButton: data.cta || formData.ctaGoal || "Try Free",
        problemSection: data.problem || "Problem description here",
        featuresSection: Array.isArray(data.features) 
          ? data.features.map((f: string, i: number) => `Feature ${i + 1}: ${f}`).join("\n")
          : "Feature 1: Your first feature\nFeature 2: Your second feature\nFeature 3: Your third feature",
        footerCta: data.footer_cta || "Ready to get started?",
      };
      
      setResult(generatedCopy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAgain = () => {
    setResult(null);
    setError(null);
  };

  const handleToneSelect = (tone: CopyFormData["tone"]) => {
    setFormData({ ...formData, tone });
  };

  if (result) {
    return <CopyPreview result={result} onGenerateAgain={handleGenerateAgain} />;
  }

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100">
        <div
          className="h-full bg-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Dots */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-2">
        {STEPS.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index < currentStep
                ? "bg-purple-600"
                : index === currentStep
                ? "bg-purple-600 w-6"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Step Label */}
          <p className="mb-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
            Step {currentStep + 1} of {STEPS.length}
          </p>

          {/* Question */}
          <h1 className="mb-8 text-4xl font-semibold text-gray-900">{step.label}</h1>

          {/* Input Based on Step */}
          <div className="mb-12">
            {step.key === "tone" ? (
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(toneLabels) as Array<keyof typeof toneLabels>).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleToneSelect(t)}
                    className={`rounded-xl border-2 p-6 text-left transition-all duration-200 ${
                      formData.tone === t
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="block text-lg font-semibold text-gray-900">
                      {toneLabels[t]}
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      {toneDescriptions[t]}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={formData[step.key as keyof CopyFormData] as string}
                onChange={(e) =>
                  setFormData({ ...formData, [step.key]: e.target.value })
                }
                placeholder={step.placeholder}
                className="w-full border-b-2 border-gray-200 bg-transparent py-4 text-2xl text-gray-900 placeholder-gray-300 focus:border-purple-600 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canProceed && !isLastStep) {
                    handleNext();
                  }
                }}
              />
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`text-lg text-gray-400 transition-colors hover:text-gray-600 ${
                currentStep === 0 ? "invisible" : ""
              }`}
            >
              ← Back
            </button>

            {isLastStep ? (
              <button
                onClick={handleGenerate}
                disabled={!canProceed || loading}
                className={`rounded-full px-8 py-4 text-lg font-semibold text-white transition-all duration-200 ${
                  canProceed && !loading
                    ? "bg-purple-600 hover:bg-purple-700 hover:shadow-lg"
                    : "cursor-not-allowed bg-gray-300"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Your AI is writing copy...
                  </span>
                ) : (
                  "Generate Copy"
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`rounded-full px-8 py-4 text-lg font-semibold transition-all duration-200 ${
                  canProceed
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
