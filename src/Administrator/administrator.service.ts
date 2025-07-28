import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { AdminAddressEntity, AdminEntity } from "./administrator.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminAddressDTO, AdminDTO, MailDTO } from "./administrator.dto";
import { BookDTO, SellerDTO } from "src/Seller/seller.dto";
import { CustomerDto, ModeratorDto } from "src/moderator/moderator.dto";
import { CustomerEntity, ModeratorEntity } from "src/moderator/moderator.entity";
import { BookEntity, SellerEntity } from "src/Seller/seller.entity";
import * as bcrypt from 'bcrypt';
import { MailerService } from "@nestjs-modules/mailer";



@Injectable()
export class AdminService {
    
    
    constructor(
        @InjectRepository(AdminEntity) private adminRepository: Repository<AdminEntity>,
        @InjectRepository(AdminAddressEntity) private adminaddressRepository: Repository<AdminAddressEntity>,
        @InjectRepository(ModeratorEntity) private moderatorRepository: Repository<ModeratorEntity>,
        @InjectRepository(BookEntity) private bookRepository: Repository<BookEntity>,
        @InjectRepository(SellerEntity) private sellerRepository: Repository<SellerEntity>,
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
        //  Add More Here
        private adminmailerService: MailerService
        ){}

        AddModerator(moderator_info: ModeratorDto) {
            return this.moderatorRepository.save(moderator_info);
        }
        DeleteBookInfo(id: number) {
            return this.bookRepository.delete(id);
        }
        UpdateBookInfo(id: number, updated_data: BookDTO) : Promise<any> {
            return this.bookRepository.update(id, updated_data);
        }
        DeleteSeller(id: number) {
            return this.sellerRepository.delete(id);
        }
        DeleteCustomer(id: number) {
            return this.customerRepository.delete(id);
        }
        ViewAllCustomers() {
            return this.customerRepository.find();
        }
        AddCustomer(customer_info : CustomerDto) {
            return this.customerRepository.save(customer_info);
        }
        ViewAllSellers() {
            return this.customerRepository.find()
        }
        AddSeller(seller_info: SellerDTO) {
            return this.sellerRepository.save(seller_info);
        }
        async DeleteAddress(email: string) : Promise<any> {
            const admin = await this.adminRepository.findOne({where: {Email: email}});
            const decision = await this.adminaddressRepository.delete({admin: (await admin)});
            if(decision){
                return null;
            }else{
                return {"Error":"Address is not Available"};
            }
        }
        async UpdateAddress(Seller_Email: any, updated_data: AdminAddressDTO) : Promise<any>{
            const admin = await this.sellerRepository.findOneBy({Email: Seller_Email});
            await this.adminaddressRepository.update((await admin).Seller_ID, updated_data); // Where to Update , Updated Data
            const address = await this.adminaddressRepository.findOneBy({admin: (await admin)});
            if (address) {
                return address;
            } else {
                return null;
            }
        }
        async AddAddress(Seller_Email: any, address_info: AdminAddressDTO) : Promise<any> {
            const seller_info = await this.adminRepository.findOneBy({Email: Seller_Email});
            if(seller_info != null){
                const adminaddressEntity = this.adminaddressRepository.create(address_info);
                adminaddressEntity.admin = seller_info;
                return this.adminaddressRepository.save(adminaddressEntity);
            }else{
                return null;
            }
        }
        ViewAdminProfile(email: any) {
            return this.adminRepository.findOneBy({Email: email});
        }
        async UpdateProfileInfo(email: any, updated_data: AdminDTO) : Promise<any> {
            const saved_seller = await this.sellerRepository.findOneBy({Email: email});
            const salt = await bcrypt.genSalt();
            updated_data.Password = await bcrypt.hash(updated_data.Password, salt);
            await this.sellerRepository.update(saved_seller.Seller_ID, updated_data); // Where to Update , Updated Data
            return this.sellerRepository.findOneBy({Seller_ID: saved_seller.Seller_ID});
        }
        ViewAdminAddress(email: any) {
            return this.adminaddressRepository.find({
                where: { admin: { Email: email } },
                relations: {
                    admin: true,
                }
                });
        }
        
        async Login(admin_info: AdminDTO) : Promise<any> {
            // const seller = this.sellerRepository.findOneBy({Email: seller_info.Email, Password: seller_info.Password});
       
        // console.log("Service Login promise 1"); // Working
        const admin = await this.adminRepository.findOneBy({Email: admin_info.Email});
        console.log(admin)
        // console.log("Service Login promise 2"); // Working
        console.log(admin)
        if(admin != null){
            const match : boolean = await bcrypt.compare(admin_info.Password, admin.Password);
            console.log(match)
            if (match) {
                // console.log("Service Login promise 2"); // Working
                return admin;
            }else{
                return null;
            }
        }
        // console.log("Service Login promise 3"); // Working
        return null;
    
        }

        async SendMail(mail_info: MailDTO) : Promise<any> {
            return await this.adminmailerService.sendMail({
                to: mail_info.Email,
                subject: mail_info.Subject,
                text: mail_info.Message,
            });
        }


}