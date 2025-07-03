import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 })
    }

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.log("Gemini API key not configured, using fallback subtasks")

      // Generate contextual fallback subtasks based on the task title
      const fallbackSubtasks = generateFallbackSubtasks(title, description)

      return NextResponse.json({
        subtasks: fallbackSubtasks,
        message: "Using generic suggestions. Configure GOOGLE_GENERATIVE_AI_API_KEY for AI-powered suggestions.",
        isAI: false,
      })
    }

    // Dynamic import to avoid loading AI SDK when not needed
    const { generateText } = await import("ai")
    const { google } = await import("@ai-sdk/google")

    const prompt = `Break down the following task into 3-5 smaller, actionable subtasks:

Task: ${title}
${description ? `Description: ${description}` : ""}

Please provide only the subtasks as a numbered list, with each subtask being specific and actionable. Focus on concrete steps that can be completed individually.

Example format:
1. Research venue options online
2. Contact 3 venues for availability and pricing
3. Book the selected venue
4. Send save-the-date notifications
5. Create guest list and send invitations`

    console.log("Calling Gemini API...")

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 300,
    })

    console.log("Gemini API response received")

    // Parse the response to extract subtasks
    const lines = text.split("\n").filter((line) => line.trim())
    const subtasks = lines
      .filter((line) => /^\d+\./.test(line.trim()))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((subtask) => subtask.length > 0)

    // Fallback if parsing fails
    if (subtasks.length === 0) {
      const fallbackSubtasks = text
        .split("\n")
        .filter((line) => line.trim() && !line.includes("Task:") && !line.includes("Description:"))
        .map((line) =>
          line
            .replace(/^[-*•]\s*/, "")
            .replace(/^\d+\.\s*/, "")
            .trim(),
        )
        .filter((subtask) => subtask.length > 0)
        .slice(0, 5)

      if (fallbackSubtasks.length > 0) {
        return NextResponse.json({ subtasks: fallbackSubtasks, isAI: true })
      }

      // Final fallback with contextual subtasks
      const contextualFallback = generateFallbackSubtasks(title, description)
      return NextResponse.json({ subtasks: contextualFallback, isAI: false })
    }

    return NextResponse.json({ subtasks: subtasks.slice(0, 5), isAI: true })
  } catch (error) {
    console.error("Error generating subtasks:", error)

    // Extract title from request for fallback
    let title = "this task"
    let description = ""
    try {
      const body = await request.json()
      title = body.title || "this task"
      description = body.description || ""
    } catch (e) {
      // Ignore parsing errors
    }

    // Provide contextual fallback subtasks even when there's an error
    const fallbackSubtasks = generateFallbackSubtasks(title, description)

    return NextResponse.json({
      subtasks: fallbackSubtasks,
      message: "AI service temporarily unavailable. Using generic suggestions.",
      isAI: false,
    })
  }
}

function generateFallbackSubtasks(title: string, description?: string): string[] {
  const lowerTitle = title.toLowerCase()
  const lowerDesc = description?.toLowerCase() || ""

  // Generate contextual subtasks based on common task patterns
  if (lowerTitle.includes("plan") || lowerTitle.includes("organize")) {
    return [
      "Research and gather requirements",
      "Create a detailed timeline",
      "Identify necessary resources",
      "Assign responsibilities",
      "Set up monitoring and checkpoints",
    ]
  }

  if (lowerTitle.includes("learn") || lowerTitle.includes("study")) {
    return [
      "Find reliable learning resources",
      "Create a study schedule",
      "Take notes and practice regularly",
      "Test your understanding",
      "Apply what you've learned",
    ]
  }

  if (lowerTitle.includes("buy") || lowerTitle.includes("purchase") || lowerTitle.includes("shop")) {
    return [
      "Research product options and reviews",
      "Compare prices from different sources",
      "Check availability and delivery options",
      "Make the purchase decision",
      "Track delivery and confirm receipt",
    ]
  }

  if (lowerTitle.includes("write") || lowerTitle.includes("create") || lowerTitle.includes("draft")) {
    return [
      "Outline the main structure",
      "Research and gather information",
      "Write the first draft",
      "Review and edit content",
      "Finalize and publish/submit",
    ]
  }

  if (lowerTitle.includes("meeting") || lowerTitle.includes("call")) {
    return [
      "Prepare agenda and materials",
      "Send invitations to participants",
      "Set up meeting location/technology",
      "Conduct the meeting",
      "Follow up with action items",
    ]
  }

  // Default generic subtasks
  return [
    "Break this task into smaller components",
    "Research requirements and gather information",
    "Create a step-by-step action plan",
    "Execute the first phase",
    "Review progress and make adjustments",
  ]
}
