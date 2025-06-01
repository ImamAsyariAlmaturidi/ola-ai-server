import { BaseMessage, BaseMessageLike } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";
export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[], BaseMessageLike[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),

  intent: Annotation<string>({
    value: (_prev, next) => next,
    default: () => "",
  }),

  dataLengkap: Annotation<boolean>({
    value: (_prev, next) => next, // replace juga
    default: () => false,
  }),
});
