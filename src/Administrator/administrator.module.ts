import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { CustomerEntity, ModeratorEntity } from 'src/moderator/moderator.entity';
import { AdministratorController } from './administrator.controller';
import { AdminService } from './administrator.service';
import { BookEntity, FeedbackEntity, SellerEntity } from 'src/Seller/seller.entity';
import { AdminAddressEntity, AdminEntity } from './administrator.entity';


@Module({
    imports: [TypeOrmModule.forFeature([BookEntity,FeedbackEntity,AdminAddressEntity,
        CustomerEntity,AdminEntity, ModeratorEntity, SellerEntity]),
    MailerModule.forRoot({
        transport: {
        host: 'smtp.gmail.com',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
        user: 'mahmudmahmud499a@gmail.com',
        pass: 'ylvfyjxlcjgbbduw'
        },
        }})
        ],
    controllers: [AdministratorController],
    providers: [AdminService],
})
export class AdminModule {}
