// src/utils/chatGPT.ts
import { Configuration, OpenAIApi } from "openai";
import { Task } from "../models/Task";
import { Goal } from "../models/Goal";
import { Note } from "../models/Note";
import { ErrorResponse } from "../types/ErrorResponse";
import goalTaskService from "../services/goalTaskService";
import userProfileService from "../services/userProfileService";
import { UserProfile } from "../models/UserProfile";

import { isPast } from 'date-fns';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function getTaskGoalAssessment(
  tasks?: Task[] | null, 
  goals?: Goal[] | null,
  customPrompt?: string, 
  notes?: Note[] | null,
  navigateToSubscription?: () => void,
  userProfile?: UserProfile | null) {
  if (!userProfile) {
    throw {
      status: 500,
      statusText: "Internal Server Error",
      data: "User profile not found",
    } as ErrorResponse;
  }
  // Add the checks for subscription and quota
  if (navigateToSubscription && (userProfile.subscriptionStatus !== 'active' || userProfile.gptAPIQuotaRemaining === 0 || (userProfile.subscriptionExpiresAt && isPast(userProfile.subscriptionExpiresAt)))) {
    // Use the navigate function from React Router to go to the /subscription route
    navigateToSubscription()
    return;
  }

  if (!configuration.apiKey) {
    throw {
      status: 500,
      statusText: "Internal Server Error",
      data: "OpenAI API key not configured",
    } as ErrorResponse;
  }

  tasks = tasks || [];
  goals = goals || [];
  notes = notes || [];

  try {
    if (goals.length > 0) {
      const goalTaskResponse = await goalTaskService.getByGoalId(goals[0].id, true);
      if (!goalTaskResponse.error && goalTaskResponse.data) {
        tasks = goalTaskResponse.data.map((goalTask) => goalTask.task);
      }
    }

    const prompt = generatePrompt(tasks, goals, notes, customPrompt);
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });

    // Reduce the gptAPIQuotaRemaining by one
    if (userProfile.gptAPIQuotaRemaining) {
      userProfile.gptAPIQuotaRemaining -= 1;
    }
    
    const updatedUserProfile = {
      id: userProfile.id,
      gptAPIQuotaRemaining: userProfile.gptAPIQuotaRemaining ? userProfile.gptAPIQuotaRemaining : 0,
    };
    
    // Update the user profile with only id and gptAPIQuotaRemaining properties
    await userProfileService.update(userProfile.keycloaksubject, updatedUserProfile as UserProfile);
    

    return chatCompletion.data.choices?.[0]?.message?.content ?? "No assessment available";
  } catch (error: unknown) {
    if (hasResponse(error)) {
      console.error(`Error with OpenAI API request: ${error.response}`);
      throw {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      } as ErrorResponse;
    } else {
      console.error(`Error with OpenAI API request: ${(error as Error).message}`);
      throw {
        status: 500,
        statusText: "Internal Server Error",
        data: "An error occurred during your request.",
      } as ErrorResponse;
    }
  }
}

function hasResponse(error: unknown): error is { response: { status: number; statusText: string; data: any } } {
  return (error as { response?: unknown }).response !== undefined;
}

function generatePrompt(tasks: Task[], goals: Goal[], notes: Note[], customPrompt?: string) {
    let taskList = "";
    tasks.forEach((task, index) => {
      taskList += `Task ${index + 1}: ${task.title}, Status: ${task.status}, Description: ${task.description}\n`;
    });

    let goalList = "";
    goals.forEach((goal, index) => {
      goalList += `Goal ${index + 1}: ${goal.title}, Status: ${goal.status}, Description: ${goal.description}\n`;
    });

    let noteList = "";
    if (notes.length > 0) {
      notes.forEach((note, index) => {
        noteList += `Note ${index + 1}: ${note.name}, Description: ${note.richText}\n`;
      });
    }

    const defaultPrompt = "Based on the current tasks and their status, are the tasks helping the user achieve their goals? Please provide your assessment and any recommendations.";
    const promptText = customPrompt || defaultPrompt;

    return `Here are the current tasks, goals, and notes of a user:

  Tasks:
  ${taskList}
  Goals:
  ${goalList}
  ${noteList ? `Notes:\n${noteList}` : ''}

  ${promptText}`;
}

