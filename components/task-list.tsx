"use client"

import type { Task, TaskStatus } from "@/types/task"
import { TaskItem } from "./task-item"

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, status: TaskStatus) => void
}

export function TaskList({ tasks, onEdit, onDelete, onToggleStatus }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-clipboard-x display-1 text-muted"></i>
        <h4 className="text-muted mt-3">No tasks yet</h4>
        <p className="text-muted">Add your first task to get started!</p>
      </div>
    )
  }

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  return (
    <div>
      {pendingTasks.length > 0 && (
        <div className="mb-4">
          <div className="bg-warning bg-opacity-10 px-3 py-2 border-bottom">
            <h6 className="mb-0 text-warning-emphasis">
              <i className="bi bi-clock me-2"></i>
              Pending Tasks ({pendingTasks.length})
            </h6>
          </div>
          {pendingTasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <div className="bg-success bg-opacity-10 px-3 py-2 border-bottom">
            <h6 className="mb-0 text-success-emphasis">
              <i className="bi bi-check-circle me-2"></i>
              Completed Tasks ({completedTasks.length})
            </h6>
          </div>
          {completedTasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
          ))}
        </div>
      )}
    </div>
  )
}
