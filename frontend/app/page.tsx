import Image from "next/image";
import Text from "./components/Text";

export const metadata = {
  title: "Live Speech To text Hackathon",
  description: "🎙️ > 📝",
};

export default function Home() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:gap-48 gap-5 lg:flex-row-reverse">

        <Text />
      </div>
    </div>
  );
}
