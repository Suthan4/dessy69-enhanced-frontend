import { SplashScreen } from "@/components/ui/SplashScreen";
import { IceCream } from "lucide-react";

export default function Loading() {
  return (
    <SplashScreen
      title="Fruit Fuel"
      subtitle="Powering your cravings"
      logo={<IceCream className="w-10 h-10 text-white" />}
      loadingText="Preparing freshness..."
    />
  );
}
