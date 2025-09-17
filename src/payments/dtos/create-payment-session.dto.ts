import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";

export class CreatePaymentSessionDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => PaymentSessionItemDto)
    items: PaymentSessionItemDto[]
}

export class PaymentSessionItemDto {
    @IsString()
    name: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

}