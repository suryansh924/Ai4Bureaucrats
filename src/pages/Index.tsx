import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import VoiceDictation from "@/components/VoiceDictation";
import TaskManager from "@/components/TaskManager";
import FileOrganizer from "@/components/FileOrganizer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-24 md:pb-6">
        <div className="grid gap-6 md:grid-cols-2">
          <VoiceDictation />
          <TaskManager />
          <FileOrganizer />
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Index;