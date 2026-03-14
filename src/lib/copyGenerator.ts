export interface CopyFormData {
  productName: string;
  oneLineDescription: string;
  targetCustomer: string;
  painPoint: string;
  tone: 'bold' | 'friendly' | 'direct' | 'calm' | null;
  ctaGoal: string;
}

export interface GeneratedCopy {
  heroHeadline: string;
  subHeadline: string;
  ctaButton: string;
  problemSection: string;
  featuresSection: string;
  footerCta: string;
}

export const toneLabels = {
  bold: 'Bold',
  friendly: 'Friendly',
  direct: 'Direct',
  calm: 'Calm',
} as const;

export const toneDescriptions = {
  bold: 'Confident and powerful',
  friendly: 'Warm and approachable',
  direct: 'Clear and to the point',
  calm: 'Serene and trustworthy',
} as const;

export function generateCopy(data: CopyFormData): GeneratedCopy {
  const { productName, oneLineDescription, targetCustomer, painPoint, tone, ctaGoal } = data;
  
  const toneAdjectives = {
    bold: ['crush', 'dominate', 'revolutionize', 'unlock'],
    friendly: ['help', 'discover', 'love', 'enjoy'],
    direct: ['get', 'solve', 'build', 'create'],
    calm: ['find', 'achieve', 'simplify', 'improve'],
  };
  
  const verbs = toneAdjectives[tone || 'direct'];
  const verb1 = verbs[0];
  const verb2 = verbs[1];
  
  const heroHeadlines = {
    bold: `${productName}: ${verb1} your ${targetCustomer.toLowerCase()} struggles`,
    friendly: `Love building for ${targetCustomer.toLowerCase()}? So do we!`,
    direct: `The ${productName} that ${verb1}s your ${painPoint.toLowerCase()} problem`,
    calm: `Find peace in solving your ${targetCustomer.toLowerCase()} challenges`,
  };
  
  const subHeadlines = {
    bold: `Stop letting ${painPoint.toLowerCase()} hold you back. Start ${verb2}ing today.`,
    friendly: `${oneLineDescription} We'll help you every step of the way!`,
    direct: `${oneLineDescription} Built specifically for ${targetCustomer.toLowerCase()}.`,
    calm: `${oneLineDescription} Take a deep breath — we've got you covered.`,
  };
  
  const problemSections = {
    bold: `You're tired of ${painPoint.toLowerCase()}. It's holding you back from reaching your full potential. Every day you wait is a day of lost opportunity. But here's the thing — it doesn't have to be this way. ${productName} was built for people like you who refuse to settle for mediocrity.`,
    friendly: `We know what it's like when ${painPoint.toLowerCase()} gets in the way. It can feel frustrating and overwhelming, especially when you're trying to do your best work. That's exactly why we created ${productName} — to make your life easier and help you get back to what matters most.`,
    direct: `${painPoint.toLowerCase()} is costing you time and money. You need a solution, and you need it now. ${productName} is the answer. It's built for ${targetCustomer.toLowerCase()} who want results without the hassle.`,
    calm: `Sometimes ${painPoint.toLowerCase()} can feel overwhelming. You deserve a solution that brings clarity rather than more chaos. ${productName} was designed with your peace of mind in mind — simple, effective, and always there when you need it.`,
  };
  
  const featuresSections = {
    bold: `• ${verb1.charAt(0).toUpperCase() + verb1.slice(1)} ${painPoint.toLowerCase()} in minutes, not hours\n• Built for serious ${targetCustomer.toLowerCase()} who demand results\n• Industry-leading performance that delivers\n• 24/7 support from people who care about your success`,
    friendly: `• Easy-to-use features that anyone can master\n• Friendly support team ready to help you succeed\n• Perfect for ${targetCustomer.toLowerCase()} at any experience level\n• Loved by thousands of happy users worldwide`,
    direct: `• Fast setup — start in under 5 minutes\n• Built specifically for ${targetCustomer.toLowerCase()}\n• No complicated tutorials needed\n• Direct results you can measure from day one`,
    calm: `• Simple, intuitive design that's easy to use\n• Reliable and consistent performance\n• Thoughtfully crafted for a stress-free experience\n• Support that responds when you need it most`,
  };
  
  const footerCtas = {
    bold: `Ready to ${verb1} your future? Don't wait — your competitors are already ahead.`,
    friendly: `Join thousands of happy ${targetCustomer.toLowerCase()} who transformed their workflow. We'd love to have you!`,
    direct: `Ready to solve ${painPoint.toLowerCase()}? Get started now.`,
    calm: `Take a moment for yourself. Let us help you find a better way forward.`,
  };
  
  return {
    heroHeadline: heroHeadlines[tone || 'direct'],
    subHeadline: subHeadlines[tone || 'direct'],
    ctaButton: ctaGoal || 'Try Free',
    problemSection: problemSections[tone || 'direct'],
    featuresSection: featuresSections[tone || 'direct'],
    footerCta: footerCtas[tone || 'direct'],
  };
}
