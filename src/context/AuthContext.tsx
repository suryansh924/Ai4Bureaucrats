import React, { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

interface User {
  email: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  tags?: string[];
  createdAt: Date;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  completed: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  notes: Note[];
  addNote: (title: string, content: string) => Promise<void>;
  tasks: Task[];
  addTask: (
    title: string,
    description: string,
    date: string,
    time?: string
  ) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          fetchNotes();
          fetchTasks();
        })
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  useEffect(() => {
    socket.on("taskAdded", (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    });

    socket.on("taskDeleted", (taskId) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    });

    return () => {
      socket.off("taskAdded");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, []);

  useEffect(() => {
    socket.on("noteAdded", (newNote) => {
      setNotes((prevNotes) => [...prevNotes, newNote]);
    });

    socket.on("noteUpdated", (updatedNote) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        )
      );
    });

    socket.on("noteDeleted", (noteId) => {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    });

    return () => {
      socket.off("noteAdded");
      socket.off("noteUpdated");
      socket.off("noteDeleted");
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", res.data.token);
    setUser(res.data);
    await fetchNotes();
    await fetchTasks();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setNotes([]);
    setTasks([]);
  };

  const fetchNotes = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const res = await axios.get("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    }
  };

  const addNote = async (title: string, content: string) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:5000/api/notes",
      { title, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotes([...notes, res.data]);
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    }
  };

  const addTask = async (
    title: string,
    description: string,
    date: string,
    time?: string
  ) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:5000/api/tasks",
      { title, description, date, time },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTasks([...tasks, res.data]);
  };

  const toggleTaskCompletion = async (taskId: string) => {
    await axios.put(
      `http://localhost:5000/api/tasks/${taskId}`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  };

  const deleteTask = async (taskId: string) => {
    await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        notes,
        addNote,
        tasks,
        addTask,
        toggleTaskCompletion,
        deleteTask,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
