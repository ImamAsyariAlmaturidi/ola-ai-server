export interface AiPersonaRequestBody {
  userId: string;
  channel: string;
  interactionType: string;
  style?: "formal" | "santai" | "profesional";
  useEmoji?: boolean;
  promptTemplate: string;
}
