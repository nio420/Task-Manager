"use client"

import { useState, useEffect } from "react"
import { TaskForm } from "@/components/task-form"
import { TaskList } from "@/components/task-list"
import type { Task } from "@/types/task"

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
  }

  const handleSaveEdit = (taskData: Omit<Task, "id" | "createdAt">) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
      setEditingTask(null)
    }
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="display-4 text-center mb-4 text-primary">
            <i className="bi bi-check-circle-fill me-2"></i>
            AI Task Manager
          </h1>
          <p className="lead text-center text-muted mb-5">Organize your tasks and let AI suggest actionable subtasks</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                {editingTask ? "Edit Task" : "Add New Task"}
              </h5>
            </div>
            <div className="card-body">
              <TaskForm
                onSubmit={editingTask ? handleSaveEdit : addTask}
                initialData={editingTask || undefined}
                isEditing={!!editingTask}
                onCancel={editingTask ? handleCancelEdit : undefined}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-task me-2"></i>
                Your Tasks ({tasks.length})
              </h5>
            </div>
            <div className="card-body p-0">
              <TaskList
                tasks={tasks}
                onEdit={handleEdit}
                onDelete={deleteTask}
                onToggleStatus={(id, status) => updateTask(id, { status })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
