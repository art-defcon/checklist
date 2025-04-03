import { CreateChecklistButton } from "@/components/checklist/create-button";
import { FeatureCard } from "@/components/ui/card";
import { File, Globe, Monitor } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Zug-Zug Checklist</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Create, share, and track your checklists easily. No account required.
          Just create and share the link.
        </p>

        <div className="mt-8">
          <CreateChecklistButton />
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<File className="w-6 h-6" />}
            title="Create Quickly"
            description="Make a checklist in seconds. No account or setup required."
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6" />}
            title="Share Instantly"
            description="Share your checklist with a simple link that works anywhere."
          />
          <FeatureCard
            icon={<Monitor className="w-6 h-6" />}
            title="Track Progress"
            description="See your completion status at a glance with visual indicators."
          />
        </div>

        <footer className="mt-16 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Zug-Zug Checklist</p>
        </footer>
      </div>
    </div>
  );
}
