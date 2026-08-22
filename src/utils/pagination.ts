import { Request } from "express";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Reads ?page= and ?limit= from the query string, with sane
 * defaults and an upper bound so nobody can request limit=100000.
 */
export function getPagination(req: Request): PaginationParams {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
