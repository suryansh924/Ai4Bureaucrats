import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Notes = () => {
  const { notes, addNote } = useContext(AuthContext);
  const [viewPrivate, setViewPrivate] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {viewPrivate ? "Private Notes" : "My Notes"}
        </h1>
        <Button onClick={() => setViewPrivate(!viewPrivate)}>
          {viewPrivate ? "View Public Notes" : "View Private Notes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes
          .filter((note) => note.isPrivate === viewPrivate)
          .map((note) => (
            <Card key={note.id} className="p-4">
              <h3 className="text-xl font-semibold">{note.title}</h3>
              <p className="text-sm text-gray-500">{note.tags?.join(", ")}</p>
              <p className="text-gray-700 mt-2">
                {note.content.substring(0, 100)}...
              </p>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Notes;
