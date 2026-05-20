import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as aiService from './ai.service';

export const askAi = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { message, caseId, conversationId, stream } = req.body;

  if (stream === true) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const result = await aiService.queryAi(
        user.id,
        { message, caseId, conversationId },
        (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );

      res.write(`data: ${JSON.stringify({
        done: true,
        conversationId: result.conversationId,
        aiQueriesUsed: result.aiQueriesUsed,
      })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Streaming Error' })}\n\n`);
      res.end();
    }
  } else {
    const result = await aiService.queryAi(user.id, req.body);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
});
