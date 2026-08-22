import { Request, Response } from "express";
import { prisma } from "../db";
import { SubscribeInput } from "../schemas/subscription.schema";

export async function toggleSubscription(req: Request, res: Response) {
  const userId = req.userId as string;
  const { userId: channelId } = req.body as SubscribeInput;

  if (channelId === userId) {
    res.status(400).json({ error: "Cannot subscribe to your own channel" });
    return;
  }

  const channel = await prisma.user.findUnique({
    where: { id: channelId },
    select: { id: true },
  });

  if (!channel) {
    res.status(404).json({ error: "Channel not found" });
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingSubscription = await tx.subscription.findFirst({
      where: { userId: channelId, subscriberId: userId },
      select: { id: true },
    });

    if (existingSubscription) {
      await tx.subscription.delete({ where: { id: existingSubscription.id } });

      const updatedChannel = await tx.user.update({
        where: { id: channelId },
        data: { subscriberCount: { decrement: 1 } },
        select: { subscriberCount: true },
      });

      return { isSubscribed: false, subscriberCount: updatedChannel.subscriberCount };
    }

    await tx.subscription.create({
      data: { userId: channelId, subscriberId: userId },
    });

    const updatedChannel = await tx.user.update({
      where: { id: channelId },
      data: { subscriberCount: { increment: 1 } },
      select: { subscriberCount: true },
    });

    return { isSubscribed: true, subscriberCount: updatedChannel.subscriberCount };
  });

  res.json(result);
}
