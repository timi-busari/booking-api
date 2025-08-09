import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'QueryFailedError') {
    return res.status(400).json({
      error: 'Database query failed',
      message: process.env.NODE_ENV === 'production' ? 'Invalid request' : err.message
    });
  }

  if (err.message.includes('not found')) {
    return res.status(404).json({
      error: 'Resource not found',
      message: err.message
    });
  }

  if (err.message.includes('overlap') || 
      err.message.includes('outside') || 
      err.message.includes('after')) {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
};