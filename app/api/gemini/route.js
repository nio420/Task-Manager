import { NextResponse } from 'next/server';

export async function POST(request) {
  const { taskTitle } = await request.json();

  const suggestionsMap = {
    'Plan birthday party': [
      'Book venue',
      'Send invitations',
      'Order cake',
      'Plan decorations',
      'Prepare playlist',
    ],
    'Prepare for job interview': [
      'Research company',
      'Practice coding questions',
      'Prepare questions to ask',
      'Review resume',
      'Choose appropriate outfit',
    ],
  };

  const suggestions =
    suggestionsMap[taskTitle] || [
      'Subtask 1',
      'Subtask 2',
      'Subtask 3',
      'Subtask 4',
      'Subtask 5',
    ];

  return NextResponse.json({ subtasks: suggestions });
}