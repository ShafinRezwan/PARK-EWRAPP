"use client";

import Link from "next/link";
import { useState } from "react";
import Modal from "../Modal";
import CreateTaskModal from "../CreateTaskModal";
type Task = {
  id: number;
  title: string;
  jobNumber: string;
  dateOfCompletion: string;
  completion: boolean;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Send Jeremy EWRS for Job 26-045",
    jobNumber: "26-045",
    dateOfCompletion: "Aug-15-2026",
    completion: true,
  },
  {
    id: 2,
    title: "Review EWR 9841",
    jobNumber: "26-050",
    dateOfCompletion: "Aug-18-2026",
    completion: false,
  },
  {
    id: 3,
    title: "Review EWR 99804",
    jobNumber: "26-023",
    dateOfCompletion: "Aug-20-2026",
    completion: true,
  },
];

export default function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const toggleTaskCompletion = (taskId: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completion: !task.completion,
            }
          : task,
      ),
    );
  };

  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-6">
        <h2 className="text-3xl font-bold text-park-green">
          Tasks / Deadlines
        </h2>

        <button
          className="shrink-0 rounded-md border-[3px] border-park-green bg-park-green px-10 py-2 text-xl font-bold text-white transition hover:border-green-800 hover:bg-green-800"
          onClick={() => setShowCreateTask(true)}
        >
          Create New Task
        </button>
        <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)}>
          <CreateTaskModal onClose={() => setShowCreateTask(false)} />
        </Modal>
      </div>

      <section className="flex min-h-0 flex-col rounded-md border-[3px] border-black px-4 py-2">
        <div className="mx-2 h-40 overflow-y-auto pr-2">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="grid grid-cols-[1fr_150px_180px_50px] items-center gap-8 border-b-2 border-park-gray px-6 py-3 text-xl text-black"
              >
                <span
                  className={`transition-all duration-300 ${
                    task.completion
                      ? ""
                      : "line-through text-park-gray opacity-60"
                  }`}
                >
                  {task.title}
                </span>

                <span
                  className={`transition-all duration-300 ${
                    task.completion
                      ? ""
                      : "line-through text-park-gray opacity-60"
                  }`}
                >
                  {task.jobNumber}
                </span>

                <span
                  className={`transition-all duration-300 ${
                    task.completion
                      ? ""
                      : "line-through text-park-gray opacity-60"
                  } "whitespace-nowrap text-center"`}
                >
                  {task.dateOfCompletion}
                </span>

                <button
                  type="button"
                  onClick={() => toggleTaskCompletion(task.id)}
                  aria-label={
                    task.completion
                      ? `Mark ${task.title} as incomplete`
                      : `Mark ${task.title} as complete`
                  }
                  aria-pressed={task.completion}
                  className={`flex h-9 w-9 items-center justify-center rounded-md text-2xl text-white transition ${
                    task.completion
                      ? "transition-all duration-400 border-park-green border-3 bg-white hover:bg-park-green"
                      : "transition-all duration-400 bg-park-gray hover:bg-gray-500"
                  }`}
                >
                  {task.completion ? "" : "✓"}
                </button>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-2xl text-park-gray">
              No current tasks
            </p>
          )}
        </div>
      </section>
    </>
  );
}
