import { StateGraph, END, START } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";
import { StateAnnotation } from "./state";
import { ChatAnthropic } from "@langchain/anthropic";
import dotenv from "dotenv";
import { MemorySaver } from "@langchain/langgraph";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

dotenv.config();

const checkpointer = new MemorySaver();

const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-20240620",
  apiKey:
    process.env.ANTHROPIC_API_KEY ||
    "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",
});

const callModel = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig
): Promise<typeof StateAnnotation.Update> => {
  // Panggil model dengan pesan yg ada di state
  const res = await model.invoke(state.messages, _config);

  // res adalah AI response string, kita buat objek AIMessage baru
  const aiMessage = new AIMessage(res);

  // Return update messages dengan menambahkan response dari AI
  return {
    messages: [...state.messages, aiMessage],
  };
};

const tentukanIntent = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig
) => {
  const userMsg = state.messages[0].content.toString().toLowerCase() || "";

  let intent = "unknown";
  if (userMsg.includes("refund")) {
    intent = "refund";
  } else if (
    userMsg.includes("belum sampai") ||
    userMsg.includes("pengiriman")
  ) {
    intent = "cek_status_pengiriman";
  }

  return {
    intent,
  };
};

const cekData = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig
) => {
  const userMsg = state.messages[0].content.toString().toLowerCase() || "";
  const lengkap =
    userMsg.includes("nomor resi") || userMsg.includes("id pesanan");

  return {
    dataLengkap: lengkap,
  };
};

const responAkhir = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig
) => {
  let reply = "Mohon maaf, kami belum memahami maksud Anda.";

  if (state.intent === "refund") {
    reply = "Untuk proses refund, mohon berikan nomor pesanan Anda.";
  } else if (state.intent === "cek_status_pengiriman") {
    if (!state.dataLengkap) {
      reply =
        "Mohon sertakan nomor resi atau ID pesanan untuk cek status pengiriman.";
    } else {
      reply = "Terima kasih! Status pengiriman Anda sedang kami proses.";
    }
  }

  return {
    messages: [
      new AIMessage({
        additional_kwargs: {
          role: "assistant",
        },

        content: reply,
      }),
    ],
  };
};

// Routing graph sudah oke, biar looping callModel sampai ada pesan masuk
export const route = (
  state: typeof StateAnnotation.State
): "__end__" | "callModel" => {
  if (state.messages.length > 1) {
    // Jika sudah ada balasan AI, maka selesai
    return "__end__";
  }
  return "callModel";
};

const workflow = new StateGraph(StateAnnotation)
  .addNode("callModel", callModel)
  .addNode("tentukanIntent", tentukanIntent)
  .addNode("cekData", cekData)
  .addNode("responAkhir", responAkhir)

  .addEdge(START, "callModel")
  .addEdge("callModel", "tentukanIntent")
  .addEdge("tentukanIntent", "cekData")
  .addEdge("cekData", "responAkhir")
  .addEdge("responAkhir", END);

export const graph = workflow.compile();

graph.name = "New Agent";

async function runGraph() {
  const config = { configurable: { thread_id: "conversation-num-1" } };

  let inputs = {
    messages: [
      new HumanMessage("Barang saya belum sampai, tolong dicek dong."),
    ],
  };

  for await (const { messages } of await graph.stream(inputs, {
    ...config,
    streamMode: "values",
  })) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.content) console.log("Assistant:", lastMsg.content);
    else console.log("Unknown message:", lastMsg);
    console.log("-----\n");
  }

  inputs = {
    messages: [
      new HumanMessage("123456789 ini nomor id resi atau pesanan saya"),
    ],
  };

  for await (const { messages } of await graph.stream(inputs, {
    ...config,
    streamMode: "values",
  })) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.content) console.log("Assistant:", lastMsg.content);
    else console.log("Unknown message:", lastMsg);
    console.log("-----\n");
  }

  inputs = {
    messages: [new HumanMessage("berapa nomor id resi saya? saya lupa")],
  };

  for await (const { messages } of await graph.stream(inputs, {
    ...config,
    streamMode: "values",
  })) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.content) console.log("Assistant:", lastMsg.content);
    else console.log("Unknown message:", lastMsg);
    console.log("-----\n");
  }
}

runGraph();
