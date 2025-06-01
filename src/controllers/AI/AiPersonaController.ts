import { Request, Response } from "express";
import AiPersona from "../../models/AI/AiPersona";

export default class AiPersonaController {
  static async saveAiPersona(req: Request, res: Response): Promise<Response> {
    try {
      const {
        userId,
        channel,
        interactionType,
        style = "santai",
        useEmoji = true,
        promptTemplate,
      } = req.body;

      if (!userId || !channel || !interactionType || !promptTemplate) {
        return res.status(400).json({
          error:
            "userId, channel, interactionType, and promptTemplate are required",
        });
      }

      let persona = await AiPersona.findOne({
        userId,
        channel,
        interactionType,
      });

      if (persona) {
        persona.style = style;
        persona.useEmoji = useEmoji;
        persona.promptTemplate = promptTemplate;
        await persona.save();
      } else {
        persona = new AiPersona({
          userId,
          channel,
          interactionType,
          style,
          useEmoji,
          promptTemplate,
        });
        await persona.save();
      }

      return res
        .status(200)
        .json({ message: "AI persona saved", data: persona });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async getAiPersona(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, channel, interactionType } = req.query;

      if (!userId || !channel || !interactionType) {
        return res.status(400).json({
          error:
            "Eh bro/sis, kamu harus kasih userId, channel, dan interactionType dulu ya!",
        });
      }

      const persona = await AiPersona.findOne({
        userId: userId.toString(),
        channel: channel.toString(),
        interactionType: interactionType.toString(),
      });

      if (!persona) {
        return res.status(404).json({
          message:
            "Waduh, persona AI-nya belum nongol nih, coba bikin dulu ya!",
        });
      }

      return res.status(200).json({
        message: "Yeay, persona AI-nya ketemu! Siap diajak ngobrol santai nih.",
        data: persona,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Aduh, server kita lagi ngambek nih. Coba lagi nanti ya!",
      });
    }
  }
}
