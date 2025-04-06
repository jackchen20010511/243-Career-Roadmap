export const metadata = {
  title: "Home - Open PRO",
  description: "Page description",
};

import Features from "@/components/features";
import Header from "@/components/ui/header";

export default function Home() {
  return (
    <>
      <Header />
      <Features />
    </>
  );
}
