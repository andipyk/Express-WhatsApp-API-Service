import { Router } from 'express';
import { ScheduledMessageController } from '../controllers/scheduled-message.controller';
import { 
  validateRequest, 
  scheduledMessageValidation, 
  bulkScheduledMessageValidation 
} from '../middlewares/validation.middleware';

const router = Router();
const scheduledMessageController = new ScheduledMessageController();

// Schedule a single message
router.post(
  '/',
  validateRequest(scheduledMessageValidation),
  scheduledMessageController.scheduleMessage
);

// Schedule multiple messages
router.post(
  '/bulk',
  validateRequest(bulkScheduledMessageValidation),
  scheduledMessageController.scheduleBulkMessages
);

// Cancel a scheduled message
router.delete('/:id', scheduledMessageController.cancelScheduledMessage);

// Get a specific scheduled message
router.get('/:id', scheduledMessageController.getScheduledMessage);

// Get all scheduled messages
router.get('/', scheduledMessageController.getAllScheduledMessages);

export const scheduledMessageRouter = router; 