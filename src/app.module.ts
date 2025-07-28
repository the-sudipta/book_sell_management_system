import { CustomerService } from './Customer/customer.service';
import { CustomerModule } from './Customer/customer.module';
import { CustomerController } from './Customer/customer.controller';
import { SellerService } from './Seller/seller.service';
import { SellerController } from './Seller/seller.controller';
import { SellerModule } from './Seller/seller.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModeratorModule } from './moderator/moderator.module';
import { AdminModule } from './Administrator/administrator.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SellerModule, AdminModule, ModeratorModule, CustomerModule, ConfigModule.forRoot(), TypeOrmModule.forRoot(
    { type: 'postgres',
    url: process.env.DATABASE_URL, 
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT, 10),
    username: process.env.PGUSER, // process.env => means .env file of your folder
    password: process.env.PGPASSWORD, //Change to your Password
    database: process.env.PGDATABASE,
    autoLoadEntities: true,
    synchronize: true,
    } ),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
