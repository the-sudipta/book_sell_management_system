import { Module } from "@nestjs/common";
import { ModeratorController } from "./moderator.controller";
import { ModeratorService } from "./moderator.service";
import { Type } from "class-transformer";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerEntity, ModeratorEntity} from "./moderator.entity";
import { BookEntity, FeedbackEntity, SellerEntity } from "src/Seller/seller.entity";
import { AdminEntity } from "src/Administrator/administrator.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ModeratorEntity, SellerEntity, FeedbackEntity ,CustomerEntity, BookEntity, AdminEntity])],
    controllers: [ModeratorController],
    providers: [ModeratorService]
})
export class ModeratorModule {}