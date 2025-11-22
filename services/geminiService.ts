import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LogFile, RepoContext, Message } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are LogSentinal, an elite DevOps and Site Reliability Engineer AI. 
Your capabilities include deep log analysis, stack trace debugging, and infrastructure configuration assessment.

Your specific goal is to analyze provided logs and context to determine the root cause of an issue.
1. **Analyze Logs**: Scrutinize timestamps, error levels, and stack traces.
2. **Classify Issue**: Determine if the root cause is a **Configuration Issue** (e.g., env vars, network ports, permissions, resource limits) or a **Software Bug** (e.g., null pointer, logic error, unhandled exception, off-by-one error).
3. **Repo Awareness**: The user may provide repository context (simulated access). If the issue looks like a Bug, assume you have access to the source code implied by the stack trace and generate a specific code patch or diff.
4. **Output Format**: 
   - Start with a clear "DIAGNOSIS: [CONFIGURATION | BUG | INDETERMINATE]".
   - Explain the reasoning.
   - If CONFIGURATION: Provide the correct setting or command to fix it.
   - If BUG: Provide a git-style patch or code snippet to fix the logic in the file mentioned in the stack trace.

Maintain a professional, technical, and precise tone. Use Markdown for code blocks.
`;

export const analyzeLogsWithGemini = async (
  currentMessage: string,
  history: Message[],
  files: LogFile[],
  repoContext: RepoContext
): Promise<string> => {
  try {
    // Construct the prompt context
    let fileContext = "";
    if (files.length > 0) {
      fileContext = "\n\n--- ATTACHED FILES ---\n";
      files.forEach((f) => {
        fileContext += `\nFile: ${f.name} (${f.type})\n\`\`\`\n${f.content.substring(0, 20000)}\n\`\`\`\n`; // Truncate large files for safety, though gemini-3 has large context
      });
    }

    let repoContextStr = "";
    if (repoContext.hasAccess) {
      repoContextStr = `\n\n--- REPO CONTEXT ---\nRepo URL: ${repoContext.repoUrl}\nBuild Version: ${repoContext.buildVersion}\nBranch: ${repoContext.branch}\n`;
      if (repoContext.customSnippet) {
        repoContextStr += `Relevant Code Snippet Provided:\n\`\`\`${repoContext.customSnippet}\`\`\`\n`;
      }
    }

    const finalPrompt = `${currentMessage}${fileContext}${repoContextStr}`;

    // Transform history to Gemini format (skipping system messages in chat history as we send system instruction via config)
    // We limit history to last 10 turns to keep focus sharp, though context window allows more.
    const validHistory = history
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

    // Use gemini-3-pro-preview for complex reasoning (Thinking)
    const modelId = 'gemini-3-pro-preview'; 

    // We use the chat interface to maintain session context if needed, 
    // but here we treat it as a generation task with history for simplicity in this stateless service pattern
    // or construct a chat session. Let's use models.generateContent with history context manually if needed, 
    // or better, use ai.chats.create if we wanted a persistent object. 
    // For this React app, a single generateContent call with history included is often easier to manage statelessly.

    const contents = [
      ...validHistory,
      {
        role: 'user',
        parts: [{ text: finalPrompt }],
      },
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 4096 }, // Enable thinking for deep diagnosis
        temperature: 0.2, // Low temperature for precision
      },
    });

    return response.text || "Analysis failed. No text returned.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error analyzing logs: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};