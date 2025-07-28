/*
https://docs.nestjs.com/providers#services
*/

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerDto } from 'src/moderator/moderator.dto';
import { CustomerEntity } from 'src/moderator/moderator.entity';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BookEntity, OrderEntity } from 'src/Seller/seller.entity';
import { CustomerAddressDTO, MailDTO } from './customer.dto';
import { CustomerAddressEntity } from './customer.entity';
@Injectable()
export class CustomerService {

    constructor(
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(BookEntity) private bookRepository: Repository<BookEntity>,
        @InjectRepository(CustomerAddressEntity) private addressRepository: Repository<CustomerAddressEntity>,
        @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>,
        
        //  Add More Here
        private mailerService: MailerService
        ){}


    async Signup(customer_info: CustomerDto): Promise<CustomerEntity> {
        // seller_info.Profile_Picture = "temp.png";
        const salt = await bcrypt.genSalt();
        customer_info.password = await bcrypt.hash(customer_info.password, salt);
        return this.customerRepository.save(customer_info);
    }
    
    async Login(customer_info: CustomerDto): Promise<CustomerEntity> {
        
        // const seller = this.sellerRepository.findOneBy({Email: seller_info.Email, Password: seller_info.Password});
       
        // console.log("Service Login promise 1"); // Working
        const saved_cutomer = await this.customerRepository.findOneBy({email: customer_info.email});
        // console.log("Service Login promise 2"); // Working
        console.log(saved_cutomer)
        if(saved_cutomer != null){
            const match : boolean = await bcrypt.compare(customer_info.password, saved_cutomer.password);

            if (match) {
                // console.log("Service Login promise 2"); // Working
                return saved_cutomer;
            }else{
                return null;
            }
        }
        // console.log("Service Login promise 3"); // Working
        return null;
    }

    ViewAllBooks(): Promise<BookEntity[]> {
        return this.bookRepository.find()
    }

    async ViewSingleBook(id: number): Promise<BookEntity> {
        return this.bookRepository.findOneBy({Book_ID: id});
    }

    async ViewBooksByName(name: string) : Promise<BookEntity[]> {
        const books = await this.bookRepository.find( {where: { Title: Like('%${name}%') }});
        if(books != null){ 
            return books;
        }else{
            return null;
        }
    }



    async ViewProfile(Customer_Email: string) : Promise<CustomerEntity> {
        const data = this.customerRepository.findOneBy({email: Customer_Email});
        if(data != null){ 
            return data;
        }else{
            return null;
        }
    }

    

    async UpdateProfileInfo(Email: string, updated_data: CustomerDto): Promise<CustomerEntity> {
        const saved_customer = await this.customerRepository.findOneBy({email: Email});
        const salt = await bcrypt.genSalt();
        updated_data.password = await bcrypt.hash(updated_data.password, salt);
        await this.customerRepository.update(saved_customer.id, updated_data); // Where to Update , Updated Data
        return this.customerRepository.findOneBy({id: saved_customer.id});
    }


    async DeleteAccount(email:string): Promise<void> {
        const saved_seller = await this.customerRepository.findOneBy({email: email});
        await this.customerRepository.delete(saved_seller.id);
    }

    async AddAddress(customer_mail: string, address_info: CustomerAddressDTO) : Promise<CustomerAddressEntity> {
        const customer_info = await this.customerRepository.findOneBy({email: customer_mail});
        if(customer_info != null){
            const addressEntity = this.addressRepository.create(address_info);
            addressEntity.customer = customer_info;
            return this.addressRepository.save(addressEntity);
        }else{
            return null;
        }
    }

    async ViewAddress(Email: string): Promise<any> {
        return this.addressRepository.find({
            where: { customer: { email: Email } },
            relations: {
                customer: true,
            }
            });
    }


    async UpdateAddress(Email: any, updated_data: CustomerAddressDTO) : Promise<CustomerAddressDTO> {
        const customer_info = await this.customerRepository.findOneBy({email: Email});
        await this.addressRepository.update((await customer_info).id, updated_data); // Where to Update , Updated Data
        const address = await this.addressRepository.findOneBy({customer: (await customer_info)});
        if (address) {
            return address;
        } else {
            return null;
        }
    }

    async DeleteAddress(Seller_Email: any) : Promise<any> {
        const seller_info = await this.customerRepository.findOneBy({email: Seller_Email});
        const decision = await this.addressRepository.delete({customer: (await seller_info)});
        if(decision){
            return null;
        }else{
            return {"Error":"Address is not Available"};
        }
    }

    async ViewSingleOrder(id: number) : Promise<OrderEntity>{
        const order = await this.orderRepository.findOneBy({Order_ID: id});
        if(order != null) {
            return order;
        }else{
            return null;
        }
    }

    async ViewAllOrders() : Promise<OrderEntity[]>{
        const orders = await this.orderRepository.find();
        if(orders != null) {
            return orders;
        }else{
            return null;
        }
    }

    AddOrder(Customer_Email: any, order_info: any) {
        const data = this.orderRepository.save(order_info);
        if(data != null){
            return true;
        }else{
            return false;
        }
    }


    async SendMail(mail_info: MailDTO) : Promise<any> {
        return await this.mailerService.sendMail({
            to: mail_info.Email,
            subject: mail_info.Subject,
            text: mail_info.Message,
        });
    }





    
 }
