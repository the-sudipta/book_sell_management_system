import { Inject, Injectable } from "@nestjs/common";
import { CustomerDto, ModeratorDto, ModeratorLoginDto} from "./moderator.dto";
import { CustomerEntity, ModeratorEntity} from "./moderator.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SellerEntity, BookEntity, FeedbackEntity } from "src/Seller/seller.entity";
import { SellerDTO } from "src/Seller/seller.dto";
import * as bcrypt from 'bcrypt';




@Injectable()
export class ModeratorService {
    constructor(
        @InjectRepository(ModeratorEntity)
        private readonly moderatorRepository: Repository<ModeratorEntity>,
        @InjectRepository(CustomerEntity)
        private readonly customerRepository: Repository<CustomerEntity>,
        @InjectRepository(SellerEntity)
        private readonly sellerRepository: Repository<SellerEntity>,
        @InjectRepository(BookEntity)
        private readonly bookRepository: Repository<BookEntity>,
        @InjectRepository(FeedbackEntity)
        private readonly feedbackRepository: Repository<FeedbackEntity>
    ) {}
    
    customer_curr: CustomerDto;
    seller_curr: SellerDTO;
    moderator_curr: ModeratorDto;

    getHello(): string {
        return 'Hello Moderator!';
    }

    async getCustomerById(id:number): Promise<CustomerEntity> {
        return this.customerRepository.findOneBy({id: id});
    }
    
    async getSellerById(id:number): Promise<SellerEntity> {
        return this.sellerRepository.findOneBy({Seller_ID: id});
    }

    async updateProfile(email:string, data: ModeratorDto): Promise<ModeratorEntity> {
        await this.moderatorRepository.update({email: email}, data);
        const upMod= await this.moderatorRepository.findOneBy({email: email});
        if(upMod != null) {
            return upMod;
        }
        else {
            return null;
        }
    }

    async getAllBooks(): Promise<BookEntity[]> {
        return this.bookRepository.find();
    }

    async register(data: ModeratorDto): Promise<any> {  
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(data.password, salt);
        data.password = hashedPassword;
        return this.moderatorRepository.save(data);
    }
    /*async Login(moderator_info: ModeratorLoginDto): Promise<any>{
        const moderatorData = await this.moderatorRepository.findOneBy({email: moderator_info.email});
        //console.log(moderatorData);
        if(moderatorData != null) 
        {
            const isMatch:boolean = await bcrypt.compare(moderator_info.password, moderatorData.password);
            //console.log(isMatch);
            if(isMatch) {
                return moderatorData;
            }
            else {
                return null;
            }
        }
        console.log(moderator_info);
        const moderatorData = await this.moderatorRepository.findOneBy({email: moderator_info.email});
        console.log(moderatorData);
        const match:boolean= await bcrypt.compare(moderator_info.password, moderatorData.password);
        console.log (match);
        return match;
    }*/

    async login(moderator_info: ModeratorLoginDto): Promise<any> {
        const moderatorData = await this.moderatorRepository.findOneBy({ email: moderator_info.email });
        console.log (moderatorData.password);
        console.log (moderator_info.password);
        if (moderatorData != null) {
            const match : boolean = await bcrypt.compare(moderator_info.password, moderatorData.password);
            console.log("Match - "+match)
            if( match){
                return {message: "Login Successful"};
            }else{
                return null;
            }
        }
    }

    logout(): object {
        return ({message: "Logout"})
    }
    async updateCustomer(id:number, data:CustomerDto): Promise<CustomerEntity> {
        const cusInf= await this.customerRepository.findOneBy({id: id});
        await this.customerRepository.update((await cusInf).id, data);
        const upCus= await this.customerRepository.findOneBy({id: id});
        if(upCus != null) {
            return upCus;
        }
        else {
            return null;
        }
    }

    async updateSeller(id:number, data:SellerDTO): Promise<SellerEntity> {
        await this.sellerRepository.update({Seller_ID: id}, data);
        const upSell = await this.sellerRepository.findOneBy({Seller_ID: id});
        if(upSell != null) {
            return upSell;
        }
        else {
            return null;
        }
    }

    async getCustomerFeedback(): Promise<FeedbackEntity[]> {
        return this.feedbackRepository.find({
            where: {Receiver_Type: 'Customer'}
        });
    }

    async getSellerFeedback(): Promise<FeedbackEntity[]> {
        return this.feedbackRepository.find({
            where: {Receiver_Type: 'Seller'}
        });
    }

    removeBook(id:number): any {
        this.bookRepository.delete(id);
        return {message: "Book Deleted"};
    }

    deleteAccount(id:number): any {
        this.moderatorRepository.delete(id);
        return {message: "Account Deleted"};
    }

    async forgetPassword(email:string, data: ModeratorDto): Promise<ModeratorEntity> {
        const generatePin=Math.floor(100000 + Math.random() * 900000);
        return;
    }
}
