import React, { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";

interface User {
  email: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
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
  isLoading: boolean;
  tasks: Task[];
  notes: Note[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchTasks: () => Promise<void>;
  fetchNotes: () => Promise<void>;
  addTask: (
    title: string,
    description: string,
    date: string,
    time?: string
  ) => Promise<void>;
  addNote: (
    title: string,
    content: string,
    isPrivate: boolean
  ) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
  updateNote: (noteId: string, updatedNote: Partial<Note>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          fetchTasks();
          fetchNotes();
        })
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      await fetchTasks();
      await fetchNotes();
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTasks([]);
    setNotes([]);
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(data)) {
        console.error("❌ API returned an invalid task list:", data);
        return;
      }

      setTasks(
        data.map((task) => ({
          ...task,
          id: task.id || task._id,
        }))
      );
    } catch (error) {
      console.error("Error fetching tasks:", error.response?.data || error);
    }
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(data)) {
        console.error("❌ API returned an invalid note list:", data);
        return;
      }

      setNotes(
        data.map((note) => ({
          ...note,
          id: note.id || note._id,
        }))
      );
    } catch (error) {
      console.error("Error fetching notes:", error.response?.data || error);
    }
  };

  const addTask = async (
    title: string,
    description: string,
    date: string,
    time?: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/tasks",
        { title, description, date, time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, { ...data, id: data._id }]);
    } catch (error) {
      console.error("Error adding task:", error.response?.data || error);
    }
  };

  const addNote = async (
    title: string,
    content: string,
    isPrivate: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/notes",
        { title, content, isPrivate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([...notes, { ...data, id: data._id }]);
    } catch (error) {
      console.error("Error adding note:", error.response?.data || error);
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
    } catch (error) {
      console.error("Error toggling task:", error.response?.data || error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error.response?.data || error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error.response?.data || error);
    }
  };

  const updateTask = async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        updatedTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
    } catch (error) {
      console.error("Error updating task:", error.response?.data || error);
    }
  };

  const updateNote = async (noteId: string, updatedNote: Partial<Note>) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `http://localhost:5000/api/notes/${noteId}`,
        updatedNote,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map((note) => (note.id === noteId ? data : note)));
    } catch (error) {
      console.error("Error updating note:", error.response?.data || error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        tasks,
        notes,
        login,
        logout,
        fetchTasks,
        fetchNotes,
        addTask,
        addNote,
        toggleTaskCompletion,
        deleteTask,
        deleteNote,
        updateTask,
        updateNote,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
