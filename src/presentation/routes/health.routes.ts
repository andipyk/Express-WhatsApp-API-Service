import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy'
  });
});

export const healthRouter = router; 