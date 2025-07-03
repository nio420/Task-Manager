"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Task, TaskStatus } from "@/types/task"

interface TaskFormProps {
  onSubmit: (task: Omit<Task, "id" | "createdAt">) => void
  initialData?: Task
  isEditing?: boolean
  onCancel?: () => void
}

export function TaskForm({ onSubmit, initialData, isEditing, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("pending")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description)
      setStatus(initialData.status)
      setDueDate(initialData.dueDate || "")
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert("Please enter a task title")
      return
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      dueDate: dueDate || undefined,
    })

    // Reset form if not editing
    if (!isEditing) {
      setTitle("")
      setDescription("")
      setStatus("pending")
      setDueDate("")
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
      // Reset form
      setTitle("")
      setDescription("")
      setStatus("pending")
      setDueDate("")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="title" className="form-label fw-semibold">
          Task Title *
        </label>
        <input
          type="text"
          className="form-control"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label fw-semibold">
          Description
        </label>
        <textarea
          className="form-control"
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description..."
        />
      </div>

      <div className="mb-3">
        <label htmlFor="status" className="form-label fw-semibold">
          Status
        </label>
        <select
          className="form-select"
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="dueDate" className="form-label fw-semibold">
          Due Date
        </label>
        <input
          type="date"
          className="form-control"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="d-grid gap-2">
        <button type="submit" className="btn btn-primary">
          <i className={`bi ${isEditing ? "bi-check-lg" : "bi-plus-lg"} me-2`}></i>
          {isEditing ? "Update Task" : "Add Task"}
        </button>
        {isEditing && onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
            <i className="bi bi-x-lg me-2"></i>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
