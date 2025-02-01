import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import VoiceDictation from "@/components/VoiceDictation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  completed: boolean;
}

const Index = () => {
  const {
    user,
    isLoading: authLoading,
    tasks,
    fetchTasks,
  } = useContext(AuthContext);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const now = new Date();

      const upcoming = tasks
        .filter((task) => !task.completed && task.date)
        .filter((task) => {
          // Create a date object from the scheduled date and time
          const taskDateTime = new Date(task.date);
          if (task.time) {
            const [hours, minutes] = task.time.split(":");
            taskDateTime.setHours(parseInt(hours, 10));
            taskDateTime.setMinutes(parseInt(minutes, 10));
          }
          return taskDateTime.getTime() >= now.getTime();
        })
        .sort((a, b) => {
          const dateTimeA = new Date(a.date);
          const dateTimeB = new Date(b.date);

          if (a.time) {
            const [hoursA, minutesA] = a.time.split(":");
            dateTimeA.setHours(parseInt(hoursA, 10));
            dateTimeA.setMinutes(parseInt(minutesA, 10));
          }

          if (b.time) {
            const [hoursB, minutesB] = b.time.split(":");
            dateTimeB.setHours(parseInt(hoursB, 10));
            dateTimeB.setMinutes(parseInt(minutesB, 10));
          }

          return dateTimeA.getTime() - dateTimeB.getTime();
        })
        .slice(0, 5);

      setUpcomingTasks(upcoming);
    } else {
      setUpcomingTasks([]);
    }
  }, [tasks]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Upcoming Tasks & Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!tasks || tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks found</p>
              ) : upcomingTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No upcoming tasks or meetings
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start space-x-4 p-3 rounded-lg bg-white border"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(task.date)}
                          </div>
                          {task.time && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(task.time)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <VoiceDictation />
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Index;
