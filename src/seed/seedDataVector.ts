import { ChromaClient } from "chromadb";
import storeJson from "../../data/store.json";
import productDataJson from "../../data/product-data.json";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import dotevn from "dotenv";
dotevn.config();
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-ada-002",
});

function createDocumentsFromJson(data: any[]): Document[] {
  return data.map(
    (item) =>
      new Document({
        pageContent: JSON.stringify(item),
        metadata: flattenMetadata(item),
        id: item.store_id || item.product_id,
      })
  );
}

function flattenMetadata(item: any): Record<string, any> {
  return {
    store_id: item.store_id,
    store_name: item.store_name,
    description: item.description,
    address: item.address,
    phone: item.contact?.phone,
    email: item.contact?.email,
    instagram: item.contact?.instagram,
    monday_to_saturday: item.hours?.monday_to_saturday,
    sunday: item.hours?.sunday,
    tags: item.tags?.join(", "),
  };
}

async function insertStoreAndProductsToChroma() {
  try {
    const storeCollection = new Chroma(embeddings, {
      collectionName: "stores",
      url: "http://localhost:8001",
    });

    const productCollection = new Chroma(embeddings, {
      collectionName: "nike_shoes",
      url: "http://localhost:8000",
    });

    // Data toko
    const storesData = storeJson;
    const storeDocuments = createDocumentsFromJson(storesData);

    await storeCollection.addDocuments(storeDocuments, {
      ids: storesData.map((store) => store.store_id.toString()),
    });

    // Data produk sepatu Nike
    const nikeShoesData = productDataJson;
    const productDocuments = createDocumentsFromJson(nikeShoesData);

    await productCollection.addDocuments(productDocuments, {
      ids: nikeShoesData.map((shoe) => shoe.product_id.toString()),
    });

    console.log("Data toko dan produk berhasil disimpan ke Chroma DB!");
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

// Panggil fungsi untuk menyimpan data toko dan produk
insertStoreAndProductsToChroma().catch(console.error);
