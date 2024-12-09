import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { validateRequest, messageValidation } from '../middlewares/validation.middleware';

const router = Router();
const whatsappController = new WhatsAppController();

router.post(
  '/send',
  validateRequest(messageValidation),
  whatsappController.sendMessage
);

export const whatsappRouter = router; 