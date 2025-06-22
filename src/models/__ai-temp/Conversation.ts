import { Schema, model, Document, Types } from "mongoose";

export type MessageRole = "user" | "assistant";

export interface IMessage {
  role: MessageRole;
  content: string;
  timestamp?: Date;
}

export interface IConversation extends Document {
  agentId: Types.ObjectId;
  userId: Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

const Conversation = model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
