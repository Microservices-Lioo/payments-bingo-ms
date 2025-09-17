import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { CreatePaymentSessionDto } from './dtos';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe( envs.STRIPE_SECRET );

    constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

    async createPaymentSession(createPaymentSessionDto: CreatePaymentSessionDto) {
        const { currency, items, orderId } = createPaymentSessionDto;
        try {
            const line_items = items.map( item => {
                return {
                    price_data: {
                            currency,
                            product_data: {
                                name: item.name
                            },
                            unit_amount: Math.round(item.price * 100) // 2000 es $20
                        },
                        quantity: item.quantity
                }
            })
    
            const session = await this.stripe.checkout.sessions.create({
                payment_intent_data: {
                    metadata: { orderId }
                },
                line_items: line_items,
                mode: 'payment',
                success_url: envs.STRIPE_SUCCESS_URL,
                cancel_url: envs.STRIPE_CANCEL_URL,
            });
    
            return {
                success_url: session.success_url,
                cancel_url: session.cancel_url,
                url: session.url,
            };
        } catch (error) {
            console.error(error);
            throw new RpcException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to create payment session`
            })
        }

    }

    async stripeWebhook(data: { signature: string, rawBody: string, encoding: string }) {
        const { signature, rawBody, encoding } = data;

        // Convertir de vuelta a Buffer
        const buffer = Buffer.from(rawBody, encoding as BufferEncoding);

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                buffer,
                signature,
                envs.STRIPE_ENDPOINT_SECRET
            );
        } catch (err) {
            console.error(err.message);
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: `Webhook signature verification failed`
            });
        }

        switch(event.type) {
            case 'charge.succeeded':
                const chargeSucceded = event.data.object;
                const  payload = {
                    stripePaymentId: chargeSucceded.id,
                    orderId: chargeSucceded.metadata.orderId,
                    receiptUrl: chargeSucceded.receipt_url
                }
                this.client.emit('payment.succeeded', payload);
            break;
            default:
                console.log(`Event ${event.type} not handled`);
        }
        return signature;
    }

}
