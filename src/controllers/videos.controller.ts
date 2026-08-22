import { Request, Response } from "express";
import { prisma } from "../db";
import { env } from "../config/env";
import { UploadInput } from "../schemas/video.schema";
import { getPagination } from "../utils/pagination";

export async function getAllVideos(req: Request, res: Response) {
  const { limit, skip, page } = getPagination(req);

  const [videos, total] = await Promise.all([
    prisma.upload.findMany({
      select: {
        id: true,
        title: true,
        thumbnail: true,
        videoUrl: true,
        views: true,
        createdAt: true,
        user: {
          select: { id: true, channelName: true, profilePicture: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.upload.count(),
  ]);

  res.json({
    videos,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

/**
 * Returns everything VideoWatch needs in one call: the video,
 * channel info, like/comment counts, and whether the current
 * viewer (if any) has liked / subscribed.
 */
export async function getVideoById(req: Request, res: Response) {
  const videoId = req.params.id as string;
  const viewerId = req.userId;

  const video = await prisma.upload.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      thumbnail: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          channelName: true,
          profilePicture: true,
          subscriberCount: true,
        },
      },
    },
  });

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  const [likeCount, commentCount, existingLike, subscription] =
    await Promise.all([
      prisma.like.count({ where: { uploadId: videoId } }),
      prisma.comment.count({ where: { uploadId: videoId } }),
      viewerId
        ? prisma.like.findFirst({
            where: { uploadId: videoId, userId: viewerId },
            select: { id: true },
          })
        : null,
      viewerId && viewerId !== video.userId
        ? prisma.subscription.findFirst({
            where: { userId: video.userId, subscriberId: viewerId },
            select: { id: true },
          })
        : null,
    ]);

  res.json({
    id: video.id,
    title: video.title,
    description: video.description,
    videoUrl: video.videoUrl,
    thumbnail: video.thumbnail,
    views: video.views,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
    user: video.user,
    likeCount,
    commentCount,
    isLiked: Boolean(existingLike),
    isSubscribed: Boolean(subscription),
  });
}

export async function incrementViewCount(req: Request, res: Response) {
  const videoId = req.params.id as string;

  const updatedVideo = await prisma.upload.update({
    where: { id: videoId },
    data: { views: { increment: 1 } },
    select: { views: true },
  });

  res.json({ views: updatedVideo.views });
}

export async function createVideo(req: Request, res: Response) {
  const userId = req.userId as string;
  const data = req.body as UploadInput;

  // Guard against clients registering arbitrary third-party URLs
  // as a "video" — both URLs must point into our own R2 bucket,
  // i.e. they must have come from our presigned-upload flow.
  if (
    !data.videoUrl.startsWith(env.R2_PUBLIC_URL) ||
    !data.thumbnail.startsWith(env.R2_PUBLIC_URL)
  ) {
    res.status(400).json({ error: "videoUrl/thumbnail must be uploaded via this API" });
    return;
  }

  const video = await prisma.upload.create({
    data: { ...data, userId },
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      thumbnail: true,
      views: true,
      createdAt: true,
    },
  });

  res.status(201).json(video);
}

export async function deleteVideo(req: Request, res: Response) {
  const userId = req.userId as string;
  const videoId = req.params.id as string;

  const video = await prisma.upload.findUnique({
    where: { id: videoId },
    select: { id: true, userId: true },
  });

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  if (video.userId !== userId) {
    res.status(403).json({ error: "You can only delete your own videos" });
    return;
  }

  await prisma.$transaction([
    prisma.like.deleteMany({ where: { uploadId: videoId } }),
    prisma.comment.deleteMany({ where: { uploadId: videoId } }),
    prisma.upload.delete({ where: { id: videoId } }),
  ]);

  res.json({ message: "Video deleted successfully" });
}
