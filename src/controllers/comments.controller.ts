import { Request, Response } from "express";
import { prisma } from "../db";
import { CommentInput } from "../schemas/comment.schema";
import { getPagination } from "../utils/pagination";

export async function getComments(req: Request, res: Response) {
  const uploadId = req.params.id as string;
  const { limit, skip, page } = getPagination(req);

  const video = await prisma.upload.findUnique({
    where: { id: uploadId },
    select: { id: true },
  });

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { uploadId },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, channelName: true, profilePicture: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where: { uploadId } }),
  ]);

  res.json({
    comments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function createComment(req: Request, res: Response) {
  const userId = req.userId as string;
  const { comment, uploadId } = req.body as CommentInput;

  const video = await prisma.upload.findUnique({
    where: { id: uploadId },
    select: { id: true },
  });

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  const createdComment = await prisma.comment.create({
    data: { comment, userId, uploadId },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, channelName: true, profilePicture: true } },
    },
  });

  res.status(201).json(createdComment);
}

export async function deleteComment(req: Request, res: Response) {
  const userId = req.userId as string;
  const commentId = req.params.commentId as string;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true },
  });

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  if (comment.userId !== userId) {
    res.status(403).json({ error: "You can only delete your own comments" });
    return;
  }

  await prisma.comment.delete({ where: { id: commentId } });

  res.json({ message: "Comment deleted successfully" });
}
