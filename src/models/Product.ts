import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  agentId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  weight?: number;
  stock: number;
  thumbnail?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    weight: { type: Number },
    stock: { type: Number, required: true },
    thumbnail: { type: String },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
