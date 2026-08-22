import { Request, Response } from "express";
import { prisma } from "../db";
import { getPagination } from "../utils/pagination";

/**
 * NEW — wasn't in the original file, but a YouTube clone needs a
 * channel page: public profile + that channel's uploaded videos.
 */
export async function getChannelProfile(req: Request, res: Response) {
  const channelId = req.params.id as string;

  const user = await prisma.user.findUnique({
    where: { id: channelId },
    select: {
      id: true,
      channelName: true,
      profilePicture: true,
      subscriberCount: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "Channel not found" });
    return;
  }

  res.json(user);
}

export async function getChannelVideos(req: Request, res: Response) {
  const channelId = req.params.id as string;
  const { limit, skip, page } = getPagination(req);

  const [videos, total] = await Promise.all([
    prisma.upload.findMany({
      where: { userId: channelId },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        videoUrl: true,
        views: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.upload.count({ where: { userId: channelId } }),
  ]);

  res.json({
    videos,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
