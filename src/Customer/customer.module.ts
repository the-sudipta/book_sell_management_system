/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/moderator/moderator.entity';
import { BookEntity, FeedbackEntity, OrderEntity, SellerCustomerBookEntity } from 'src/Seller/seller.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { CustomerAddressDTO } from './customer.dto';
import { CustomerAddressEntity } from './customer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CustomerEntity,BookEntity,FeedbackEntity,
         OrderEntity, CustomerEntity, SellerCustomerBookEntity, CustomerAddressEntity]),
    MailerModule.forRoot({
        transport: {
        host: 'smtp.gmail.com',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
        user: 'shakibparvez75@gmail.com',
        pass: 'myfguatwlzhtoeak'
        },
        }})
        ],
    controllers: [CustomerController],
    providers: [CustomerService],
})
export class CustomerModule { }
