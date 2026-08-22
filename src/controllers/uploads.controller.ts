import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/r2Client";
import { env } from "../config/env";
import { sanitizeFilename } from "../utils/sanitizeFilename";
import { PresignedUrlInput } from "../schemas/upload.schema";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const MAX_VIDEO_FILE_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

async function generatePresignedUrl(opts: {
  fileName: string;
  fileType: string;
  fileSize: number;
  folder: "videos" | "thumbnails";
}) {
  const safeFileName = sanitizeFilename(opts.fileName);
  const key = `${opts.folder}/${randomUUID()}-${safeFileName}`;

  const putUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: opts.fileType,
      ContentLength: opts.fileSize,
    }),
    { expiresIn: 3600 }
  );

  return { putUrl, finalUrl: `${env.R2_PUBLIC_URL}/${key}` };
}

export async function getVideoPresignedUrl(req: Request, res: Response) {
  const { fileType, fileSize, fileName } = req.body as PresignedUrlInput;

  if (!ALLOWED_VIDEO_TYPES.includes(fileType)) {
    res.status(400).json({ error: "Invalid video file type" });
    return;
  }

  if (fileSize > MAX_VIDEO_FILE_SIZE) {
    res.status(400).json({ error: "Video file is too large. Maximum size is 200 MB." });
    return;
  }

  const { putUrl, finalUrl } = await generatePresignedUrl({
    fileName,
    fileType,
    fileSize,
    folder: "videos",
  });

  res.json({ putUrl, finalVideoUrl: finalUrl });
}

export async function getThumbnailPresignedUrl(req: Request, res: Response) {
  const { fileType, fileSize, fileName } = req.body as PresignedUrlInput;

  if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
    res.status(400).json({ error: "Invalid image file type" });
    return;
  }

  if (fileSize > MAX_IMAGE_FILE_SIZE) {
    res.status(400).json({ error: "Thumbnail is too large. Maximum size is 5 MB." });
    return;
  }

  const { putUrl, finalUrl } = await generatePresignedUrl({
    fileName,
    fileType,
    fileSize,
    folder: "thumbnails",
  });

  res.json({ putUrl, finalThumbnailUrl: finalUrl });
}
