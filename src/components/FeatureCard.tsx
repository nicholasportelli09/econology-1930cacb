import { type ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="group relative rounded-xl p-6 bg-white card-shadow border border-[hsl(240_20%_92%)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_hsl(245_40%_40%/0.18)]">
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg gradient-bg text-primary-foreground">
        {icon}
      </div>
      <h3 className="text-xl font-display font-semibold mb-2" style={{ color: "hsl(240 30% 20%)" }}>{title}</h3>
      <p className="leading-relaxed" style={{ color: "hsl(240 15% 45%)" }}>{description}</p>
    </div>
  );
};

export default FeatureCard;
