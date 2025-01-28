import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FileOrganizer = () => {
  return (
    <Card className="p-4 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4">File Organization</h2>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop files here, or click to select files
        </p>
        <Button className="mt-4">Upload Files</Button>
      </div>
    </Card>
  );
};

export default FileOrganizer;