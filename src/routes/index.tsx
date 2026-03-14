import { createFileRoute } from "@tanstack/react-router";
import WizardForm from "~/components/WizardForm";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <WizardForm />;
}
