import { Request, Response } from "express";
import { prisma } from "../db";
import { LikeInput } from "../schemas/like.schema";

export async function getLikeInfo(req: Request, res: Response) {
  const uploadId = req.params.id as string;
  const userId = req.userId;

  const video = await prisma.upload.findUnique({
    where: { id: uploadId },
    select: { id: true },
  });

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  const [likeCount, existingLike] = await Promise.all([
    prisma.like.count({ where: { uploadId } }),
    userId
      ? prisma.like.findFirst({ where: { uploadId, userId }, select: { id: true } })
      : null,
  ]);

  res.json({ likeCount, isLiked: Boolean(existingLike) });
}

export async function likeVideo(req: Request, res: Response) {
  const userId = req.userId as string;
  const { uploadId } = req.body as LikeInput;

  const video = await prisma.upload.findUnique({
    where: { id: uploadId },
    select: { id: true },
  });

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  const existingLike = await prisma.like.findFirst({
    where: { uploadId, userId },
    select: { id: true },
  });

  if (existingLike) {
    res.status(409).json({ error: "Already liked" });
    return;
  }

  await prisma.like.create({ data: { userId, uploadId } });

  const likeCount = await prisma.like.count({ where: { uploadId } });

  res.status(201).json({ liked: true, likeCount });
}

export async function unlikeVideo(req: Request, res: Response) {
  const userId = req.userId as string;
  const uploadId = req.params.uploadId as string;

  const existingLike = await prisma.like.findFirst({
    where: { uploadId, userId },
    select: { id: true },
  });

  if (!existingLike) {
    res.status(404).json({ error: "Like not found" });
    return;
  }

  await prisma.like.delete({ where: { id: existingLike.id } });

  const likeCount = await prisma.like.count({ where: { uploadId } });

  res.json({ liked: false, likeCount });
}
