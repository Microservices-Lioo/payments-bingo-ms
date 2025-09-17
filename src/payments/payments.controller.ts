import { Controller } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentSessionDto } from './dtos';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('create-payment-session')
  createPaymentSession(
    @Payload() createPaymentSessionDto: CreatePaymentSessionDto
  ) {
    return this.paymentsService.createPaymentSession(createPaymentSessionDto);
  }

  @MessagePattern('webhook')
  stripeWebhook(
    @Payload() payload: { signature: string, rawBody: string, encoding: string },
  ) {
    return this.paymentsService.stripeWebhook(payload);
  }
}
