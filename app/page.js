'use client';

import { useState } from 'react';

export default function HomePage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Prepare for job interview',
      description: 'Technical interview for React developer position',
      status: 'pending',
      dueDate: '',
      subtasks: [],
    },
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    dueDate: '',
  });

  function addTask() {
    if (!newTask.title.trim()) return alert('Task title is required');
    setTasks(prev => [...prev, { id: Date.now(), subtasks: [], ...newTask }]);
    setNewTask({ title: '', description: '', status: 'pending', dueDate: '' });
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function toggleStatus(id) {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' }
          : t
      )
    );
  }

  async function suggestSubtasks(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: task.title }),
      });
      const data = await res.json();
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, subtasks: data.subtasks } : t))
      );
    } catch {
      alert('Failed to fetch subtasks from AI');
    }
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Smart Task Manager</h1>

      <div className="mb-5 border p-3 rounded">
        <h4>Add New Task</h4>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Title"
          value={newTask.title}
          onChange={e =>
            setNewTask(prev => ({ ...prev, title: e.target.value }))
          }
        />
        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={newTask.description}
          onChange={e =>
            setNewTask(prev => ({ ...prev, description: e.target.value }))
          }
        />
        <input
          type="date"
          className="form-control mb-2"
          value={newTask.dueDate}
          onChange={e =>
            setNewTask(prev => ({ ...prev, dueDate: e.target.value }))
          }
        />
        <button className="btn btn-primary" onClick={addTask}>
          Add Task
        </button>
      </div>

      <div>
        {tasks.length === 0 && <p>No tasks added yet.</p>}

        {tasks.map(task => (
          <div
            key={task.id}
            className="card mb-3"
            style={{ opacity: task.status === 'completed' ? 0.6 : 1 }}
          >
            <div className="card-body">
              <h5 className="card-title">
                {task.title}{' '}
                <span
                  className={`badge ${
                    task.status === 'pending'
                      ? 'bg-warning text-dark'
                      : 'bg-success'
                  }`}
                >
                  {task.status}
                </span>
              </h5>
              <p className="card-text">{task.description}</p>
              <p>
                <strong>Due Date:</strong> {task.dueDate || <em>Not set</em>}
              </p>
              <button
                className="btn btn-sm btn-secondary me-2"
                onClick={() => toggleStatus(task.id)}
              >
                Toggle Status
              </button>
              <button
                className="btn btn-sm btn-info text-white"
                onClick={() => suggestSubtasks(task.id)}
              >
                Suggest Subtasks
              </button>
              <button
                className="btn btn-sm btn-danger float-end"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>

              {task.subtasks.length > 0 && (
                <ul className="mt-3">
                  {task.subtasks.map((subtask, i) => (
                    <li key={i}>{subtask}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
