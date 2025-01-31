import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import VoiceDictation from "@/components/VoiceDictation";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto">
          <VoiceDictation />
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Index;