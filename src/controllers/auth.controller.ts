import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { env } from "../config/env";
import { SignupInput, SigninInput } from "../schemas/auth.schema";

export async function signup(req: Request, res: Response) {
  const { username, password, gender, channelName } = req.body as SignupInput;

  // Fast-path check for a friendly error message. Note the actual
  // guarantee against duplicates is the DB unique constraint —
  // the P2002 case (race between two concurrent signups) is
  // handled centrally in errorHandler.ts.
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { channelName }] },
    select: { username: true, channelName: true },
  });

  if (existingUser) {
    if (existingUser.username === username) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }

    res.status(409).json({ error: "Channel name already taken" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { username, password: hashedPassword, gender, channelName },
  });

  res.status(201).json({ message: "User created successfully" });
}

export async function signin(req: Request, res: Response) {
  const { username, password } = req.body as SigninInput;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, userId: user.id });
}
