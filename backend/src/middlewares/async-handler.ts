import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;
/**
 * utility function that create a wrapper around express request handler -
 * that's it allowed to handle async errors without to use next() function
 *
 * @param fn - async request handler
 * @returns returns a request handler function decorate with try catch block around function passing by param
 */
export const asyncHandler = (fn: AsyncHandler): AsyncHandler => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
