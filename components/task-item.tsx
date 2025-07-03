'use client';

import { useState } from 'react';
import type { Task, TaskStatus } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: TaskStatus) => void;
}

export function TaskItem({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaskItemProps) {
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const handleToggleStatus = () => {
    const newStatus: TaskStatus =
      task.status === 'pending' ? 'completed' : 'pending';
    onToggleStatus(task.id, newStatus);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  const suggestSubtasks = async () => {
    setIsLoadingSubtasks(true);
    try {
      const response = await fetch('/api/suggest-subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get subtask suggestions');
      }

      setSubtasks(data.subtasks);
      setShowSubtasks(true);

      // Show info message if using fallback or generic suggestions
      if (data.message) {
        console.info('Subtask generation info:', data.message);
      }
    } catch (error) {
      console.error('Error getting subtask suggestions:', error);

      // Provide client-side fallback
      const fallbackSubtasks = [
        'Break this task into smaller components',
        'Research requirements and gather information',
        'Create a detailed action plan',
        'Execute the first step',
        'Review and refine the approach',
      ];

      setSubtasks(fallbackSubtasks);
      setShowSubtasks(true);
    } finally {
      setIsLoadingSubtasks(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status === 'pending';

  return (
    <div
      className={`border-bottom p-3 ${
        task.status === 'completed' ? 'bg-light bg-opacity-50' : ''
      }`}
    >
      <div className="d-flex align-items-start justify-content-between">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-2">
            <button
              className={`btn btn-sm me-3 ${
                task.status === 'completed'
                  ? 'btn-success'
                  : 'btn-outline-secondary'
              }`}
              onClick={handleToggleStatus}
              title={
                task.status === 'completed'
                  ? 'Mark as pending'
                  : 'Mark as completed'
              }
            >
              <i
                className={`bi ${
                  task.status === 'completed'
                    ? 'bi-check-circle-fill'
                    : 'bi-circle'
                }`}
              ></i>
            </button>
            <h6
              className={`mb-0 ${
                task.status === 'completed'
                  ? 'text-decoration-line-through text-muted'
                  : ''
              }`}
            >
              {task.title}
            </h6>
            {isOverdue && (
              <span className="badge bg-danger ms-2">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Overdue
              </span>
            )}
          </div>

          {task.description && (
            <p
              className={`mb-2 ${
                task.status === 'completed' ? 'text-muted' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="d-flex flex-wrap gap-2 align-items-center">
            {task.dueDate && (
              <small className={`text-muted ${isOverdue ? 'text-danger' : ''}`}>
                <i className="bi bi-calendar me-1"></i>
                Due: {formatDate(task.dueDate)}
              </small>
            )}
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              Created: {formatDate(task.createdAt)}
            </small>
          </div>

          {showSubtasks && subtasks.length > 0 && (
            <div className="mt-3 p-3 bg-info bg-opacity-10 rounded">
              <h6 className="text-info-emphasis mb-2">
                <i className="bi bi-lightbulb me-2"></i>
                AI Suggested Subtasks:
              </h6>
              <ul className="list-unstyled mb-0">
                {subtasks.map((subtask, index) => (
                  <li key={index} className="mb-1">
                    <i className="bi bi-arrow-right me-2 text-info"></i>
                    {subtask}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="d-flex flex-column gap-1 ms-3">
          <button
            className="btn btn-outline-info btn-sm"
            onClick={suggestSubtasks}
            disabled={isLoadingSubtasks}
            title="Get AI subtask suggestions"
          >
            {isLoadingSubtasks ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                AI
              </>
            ) : (
              <>
                <i className="bi bi-lightbulb me-1"></i>
                AI
              </>
            )}
          </button>
          <button
            className="btn btn-outline-primary btn-sm gap-3"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            {' '}
            Edit
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDelete}
            title="Delete task"
          >
            {' '}
            Delete
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
