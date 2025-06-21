import { Request, Response } from "express";
import Product from "../models/Product";

export class ProductController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create product", details: error });
    }
  }

  static async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch products", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch product", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update product", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json({ message: "Product deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete product", details: error });
    }
  }
}
