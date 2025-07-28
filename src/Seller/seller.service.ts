/*
https://docs.nestjs.com/providers#services
*/

import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { AddressDTO, BookDTO, FeedbackDTO, MailDTO, OrderDTO, SellerDTO, UpdatePasswordDTO } from './seller.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, Not, In } from 'typeorm';
import { AddressEntity, BookEntity, FeedbackEntity, OrderEntity, PinCodeEntity, SellerCustomerBookEntity, SellerEntity } from './seller.entity';
import { promises } from 'dns';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { Console } from 'console';
import { CustomerEntity } from 'src/moderator/moderator.entity';

@Injectable()
export class SellerService {
    
    constructor(
        @InjectRepository(SellerEntity) private sellerRepository: Repository<SellerEntity>,
        @InjectRepository(FeedbackEntity) private feedbackRepository: Repository<FeedbackEntity>,
        @InjectRepository(BookEntity) private bookRepository: Repository<BookEntity>,
        @InjectRepository(AddressEntity) private addressRepository: Repository<AddressEntity>,
        @InjectRepository(PinCodeEntity) private pincodeRepository: Repository<PinCodeEntity>,
        @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>,
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(SellerCustomerBookEntity) private selcusbokRepository: Repository<SellerCustomerBookEntity>,
        //  Add More Here
        private mailerService: MailerService
        ){}

    
    
    

// ########################################### BOOK ##############################################
    current_book_info : BookDTO
    current_feedback_info : FeedbackDTO

    async AddBooks(Email: string, book_info: BookDTO): Promise<BookEntity> {
        const seller_info = await this.sellerRepository.findOneBy({ Email: Email });
        const bookEntity = this.bookRepository.create(book_info);
        bookEntity.seller = seller_info; // Assign the entire seller_info object
        console.log(seller_info.Seller_ID); // Working
        console.log("Email = "+Email);
        return this.bookRepository.save(bookEntity); // Save the bookEntity, not book_info
      }

     async ViewAllBooks(email): Promise<SellerEntity[]> {
        
        const data = await  this.sellerRepository.find({
            where: { Email: email },
            relations: {
                books: true
            }
            });
            console.log(data);
            return data;
    }


    async ViewSingleBook(id: number): Promise<BookEntity> {
        return this.bookRepository.findOneBy({Book_ID: id});
        
    }

    async UpdateBookInfo(b_id:number, updated_data: BookDTO): Promise<BookEntity> {
        await this.bookRepository.update(b_id, updated_data); // Where to Update , Updated Data
        return this.bookRepository.findOneBy({Book_ID: b_id});

    }

    DeleteBookInfo(id: number): any {
        this.bookRepository.delete(id);
        return {"Success":"Book Deleted Successfully"};
    }

    // ! Not Useable
    UploadBookImage(filename: string): any {
        if(this.current_book_info != null && filename != null){
            this.current_book_info.Book_Image = filename;
            return this.current_book_info;
        }else{
            return null;
        }
    }

    async getBookImages(id: number, res: any): Promise<any> {

        const currentBook = await this.bookRepository.findOneBy({ Book_ID: id });
        const currentBookDTO: BookDTO = plainToClass(BookDTO, currentBook);
        if (currentBook) {
            const currentBookDTO: BookDTO = plainToClass(BookDTO, currentBook);
            console.log(currentBookDTO);
            return res.sendFile(currentBookDTO.Book_Image, {
              root: './assets/book_images',
            });
          } else {
            return null;
          }

    }



    // getBookData

    async getBookData(sellerEmail: string, searchType: string, searchItem: string): Promise<BookEntity[]> {
        
        const seller = await this.sellerRepository.findOne({ where: { Email: sellerEmail } });
    
        if (!seller) {
          throw new NotFoundException('Seller not found');
        }
    
        const queryBuilder = this.bookRepository.createQueryBuilder('book')
          .where('book.seller.Seller_ID = :sellerId', { sellerId: seller.Seller_ID });
    
        if (searchType === 'Title') {
          queryBuilder.andWhere('book.Title LIKE :searchItem', {
            searchItem: `%${searchItem}%`,
          });
        } else if (searchType === 'Author') {
          queryBuilder.andWhere('book.Author LIKE :searchItem', {
            searchItem: `%${searchItem}%`,
          });
        } else if (searchType === 'ISBN') {
          queryBuilder.andWhere('book.ISBN LIKE :searchItem', {
            searchItem: `%${searchItem}%`,
          });
        } else if (searchType === 'Condition') {
          queryBuilder.andWhere('book.Condition LIKE :searchItem', {
            searchItem: `%${searchItem}%`,
          });
        } else if (searchType === 'Price') {
          // Assuming the Price column is of type string
          queryBuilder.andWhere('book.Price = :searchItem', {
            searchItem,
          });
        }
    
        return queryBuilder.getMany();
      }


    


// ############################################# SELLER ##############################################

    async SendFeedback(email : string, feedback_info: FeedbackEntity): Promise<FeedbackEntity> {
        const now: Date = new Date();
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
        };
        const seller = await this.sellerRepository.findOneBy({Email: email});
        const dateString: string = now.toLocaleString(undefined, options);
        // console.log(dateString); // Working
        feedback_info.Date = dateString;
        feedback_info.Receiver_Type = "Admin";
        feedback_info.Sender_ID = seller.Seller_ID;
        return this.feedbackRepository.save(feedback_info);
    }


    async ViewCustomerFeedback(Email:string): Promise<FeedbackEntity[]> {
        return this.feedbackRepository.find({
            where: { Receiver_Type: 'Seller' }
          });
    }


    async Signup(seller_info: SellerDTO): Promise<SellerEntity> {
        seller_info.Profile_Picture = "temp.svg";
        const salt = await bcrypt.genSalt();
        seller_info.Password = await bcrypt.hash(seller_info.Password, salt);
        return this.sellerRepository.save(seller_info);
    }

    async DeleteAccount(email:string): Promise<void> {
        const saved_seller = await this.sellerRepository.findOneBy({Email: email});
        await this.sellerRepository.delete(saved_seller.Seller_ID);
    }

    async ViewSellerProfile(email : string): Promise<SellerEntity> {
        // session.Seller_Email
        return this.sellerRepository.findOneBy({Email: email});
    }
        




    async UpdateProfileInfo(email:string, updated_data: SellerDTO): Promise<SellerEntity> {
        const saved_seller = await this.sellerRepository.findOneBy({Email: email});
        const salt = await bcrypt.genSalt();
        // updated_data.Password = await bcrypt.hash(updated_data.Password, salt);
        updated_data.Email = saved_seller.Email;
        updated_data.Password = saved_seller.Password;
        updated_data.Profile_Picture = saved_seller.Profile_Picture;
        await this.sellerRepository.update(saved_seller.Seller_ID, updated_data); // Where to Update , Updated Data
        return this.sellerRepository.findOneBy({Seller_ID: saved_seller.Seller_ID});
    }

    async Login(seller_info: SellerDTO): Promise<SellerEntity> {
        
        // const seller = this.sellerRepository.findOneBy({Email: seller_info.Email, Password: seller_info.Password});
       
        // console.log("Service Login promise 1"); // Working
        const saved_seller = await this.sellerRepository.findOneBy({Email: seller_info.Email});
        // console.log("Service Login promise 2"); // Working
        console.log(saved_seller)
        if(saved_seller != null){
            const match : boolean = await bcrypt.compare(seller_info.Password, saved_seller.Password);

            if (match) {
                // console.log("Service Login promise 2"); // Working
                return saved_seller;
            }else{
                return null;
            }
        }
        // console.log("Service Login promise 3"); // Working
        return null;
    }

    async UploadSellerImage(email:string,image:string): Promise<SellerEntity> {
        
        const current_seller = this.sellerRepository.findOneBy({Email: email});
        if(current_seller){
            (await current_seller).Profile_Picture = image;
            await this.sellerRepository.update((await current_seller).Seller_ID,(await current_seller));
            return this.sellerRepository.findOneBy({Seller_ID: (await current_seller).Seller_ID});
        }
        
    }

    async getSellerImages(email:string, res: any): Promise<any> {

        const current_seller = this.sellerRepository.findOneBy({Email: email});
        // console.log("Current seller Image Getting = "+(await current_seller).Profile_Picture) // Working
        if(current_seller){
            res.sendFile((await current_seller).Profile_Picture,{ root: './assets/profile_images' })
        }
    }


    async ForgetPassword(Seller_Email: string){
        // * Generate 6 Digit Code Pin
        const generatePin = (): string => (Math.floor(Math.random() * 900000) + 100000).toString();
      
        const current_seller = await this.sellerRepository.findOneBy({ Email: Seller_Email });
        console.log("Current Seller = "+current_seller);
        let user_has_pin = await this.pincodeRepository.findOneBy({ seller: await current_seller });
        console.log("Seller Has a pin = "+current_seller);

        if (user_has_pin) {
          // update
          console.log("Updating");
          user_has_pin.Pin_Code = generatePin();
          await this.pincodeRepository.update(user_has_pin.Pin_ID, user_has_pin);
          console.log("Update Done");
        console.log("User Has a pin = "+user_has_pin.Pin_Code);
        } else {
          // create
          console.log("Creating");
        //   user_has_pin.Pin_Code = generatePin();
          user_has_pin = {
            Pin_ID: undefined, // Pin_ID is autogenerated by the database
            Pin_Code: generatePin(),
            seller: current_seller,
          };
          console.log("Created");
          console.log("User Has a pin = "+user_has_pin.Pin_Code);

          await this.pincodeRepository.save(user_has_pin);
          console.log("Inserted into the database")
        }
      
        // * Send Email to the Seller
        
  const emailSubject = 'Password Reset Verification Code';
  const emailBody = `
Dear Seller,
You have requested to reset your password for your account. To proceed with the password reset, please use the verification code provided below:

Verification Code: ${user_has_pin.Pin_Code}

Please enter this code on the password reset page to verify your identity. This code will expire after a certain duration for security purposes.

If you did not request a password reset or if you have any concerns regarding your account security, please contact our support team immediately.

Best regards,
Interstellar Library Team
`;


        return await this.mailerService.sendMail({
            to: Seller_Email,
            subject: emailSubject,
            text: emailBody,
        });
      }
      
    async SendPin(pin_code: string) {
        const pin_availability = await this.pincodeRepository.findOneBy({ Pin_Code : pin_code });

        if(pin_availability != null){
            const generatePin = (): string => (Math.floor(Math.random() * 900000) + 100000).toString();

            // const result = await this.pincodeRepository.update({ Pin_Code: pin_code }, { Pin_Code: "Dead#Body_Is@Dangerous?*!^XZVSDW" });
            const new_pin_code = generatePin();
            const result = await this.pincodeRepository.update({ Pin_Code: pin_code }, { Pin_Code: new_pin_code});
            return {"Success":"Pin is Available"};
        }
        else{
            return null;
        }
    }

    // ! Update Password

    // ############################################# ADDRESS ##############################################

    async AddAddress(Seller_Email: string, address_info: AddressDTO) : Promise<AddressEntity> {
        const seller_info = await this.sellerRepository.findOneBy({Email: Seller_Email});
        if(seller_info != null){
            const addressEntity = this.addressRepository.create(address_info);
            addressEntity.seller = seller_info;
            return this.addressRepository.save(addressEntity);
        }else{
            return null;
        }
    }

    async ViewSellerAddress(Seller_Email: string): Promise<AddressEntity[]> {
        return this.addressRepository.find({
            where: { seller: { Email: Seller_Email } },
            relations: {
                seller: true,
            }
            });
    }


    async UpdateAddress(Seller_Email: any, updated_data: AddressDTO) : Promise<AddressDTO> {
      console.log("Current seller mail = "+Seller_Email);
        const seller_info = await this.sellerRepository.findOneBy({Email: Seller_Email});
        console.log("Seller ID = "+ (await seller_info).Seller_ID)
        const old_address = await this.addressRepository.findOne({
          where: { seller: await seller_info },
        });
        if(old_address != undefined && old_address != null){
          //  Data Available
          console.log("Address ID = "+ old_address.Address_ID)
          updated_data.Address_ID = old_address.Address_ID;
          await this.addressRepository.update(old_address.Address_ID, updated_data); // Where to Update , Updated Data
        }else{
          // Create a address
          const addressEntity = this.addressRepository.create(updated_data);
            addressEntity.seller = seller_info;
            await this.addressRepository.save(addressEntity);
          
        }
        const address = await this.addressRepository.findOneBy({seller: (await seller_info)});
        if (address) {
            return address;
        } else {
            return null;
        }
    }

    async DeleteAddress(Seller_Email: any) : Promise<any> {
        const seller_info = await this.sellerRepository.findOneBy({Email: Seller_Email});
        const decision = await this.addressRepository.delete({seller: (await seller_info)});
        if(decision){
            return null;
        }else{
            return {"Error":"Address is not Available"};
        }
    }

    // ############################################# ORDER ##############################################
    async ViewAllOrders(Seller_Email: string): Promise<any> {
        // Get the seller information based on the email
        const seller = await this.sellerRepository.findOneBy({ Email: Seller_Email });
      
        console.log("Seller Information = "+seller); // Working
      
        // Get the seller's ID
        const sellerId = seller.Seller_ID; 
        // console.log("Seller ID = "+sellerId); // Working


        const orders = await this.orderRepository.find({
            where: {
                seller: { Seller_ID: sellerId },
                Order_Status: Not(In(['Delivered', 'Cancelled'])),
              },
              relations: ['seller'],
            });

      
        if(orders != null) {
            return orders;
      }else{
            return null;
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

    async UpdateOrderStatus(id: number, updated_data: OrderDTO) : Promise<OrderEntity> {
        await this.orderRepository.update(id, updated_data); // Where to Update , Updated Data
        const updated_order = await this.orderRepository.findOneBy({Order_ID: id});
        if(updated_order != null) {
            return updated_order;
        }else{
            return null;
        }
    }

    async Update_Order_Status(id: number, update_status:string) : Promise<boolean> {
        const order = await this.orderRepository.findOneBy({Order_ID: id});
        if(order != null) {
            if(update_status == "Delivered"){
                order.Order_Status = "Delivered";
                
                
            }else if(update_status == "Cancelled"){
                order.Order_Status = "Cancelled";
            }else{
                order.Order_Status = "Pending";
            }
            const decision = await this.orderRepository.update(id, order);
            if (decision.affected !== undefined && decision.affected > 0) {return true;} else {return false;}
        }else{
            return false;
        }
    }

    // ! Total COst
    async ShowTotalCost(Seller_Email: string): Promise<any> {


        // Get the seller information based on the email
  const seller = await this.sellerRepository.findOneBy({ Email: Seller_Email });

  // Get the seller's ID
  const sellerId = seller.Seller_ID;

  // Find all the order IDs associated with the seller's ID
  const sellerCustomerBooks = await this.selcusbokRepository.find({
    where: { seller: { Seller_ID: sellerId } },
    relations: ["order"],
  });

  // Extract the order IDs from the sellerCustomerBooks
  const orderIds = sellerCustomerBooks.map((scb) => scb.order.Order_ID);

  // Find all the orders based on the extracted order IDs
  const final_orders = await this.orderRepository.findByIds(orderIds);

  // Calculate the total cost lamda function
  const totalCost = final_orders.reduce((sum, order) => {
    const bookPrice = parseFloat(order.Book_Price);
    return sum + bookPrice;
  }, 0);

  if (final_orders != null) {
    return {
      totalCost: totalCost.toFixed(2), // Convert the total cost to a fixed decimal point
    };
  } else {
    return null;
  }
    }

    // Update Password
    async UpdatePassword(tempMail: string, update_data:UpdatePasswordDTO): Promise<any> {
        console.log("Temp Mail = "+tempMail);
        console.log("New Pass = "+update_data.Password);
        const seller = await this.sellerRepository.findOneBy({ Email: tempMail });
        console.log("Seller = "+seller);
        const saltRounds = 10; // Number of hashing rounds
      
        const salt = await bcrypt.genSalt(saltRounds); // Generate a salt string with specified number of rounds
      
        seller.Password = await bcrypt.hash(update_data.Password, salt); // Hash the newPass with the salt
        console.log("Hashed Password = "+seller.Password);
        const final_data = await this.sellerRepository.update(
          seller.Seller_ID,
          seller
        );
      
        console.log("Final Data = "+final_data);
        if (final_data !== null) {
          return { Success: 'Password Updated Successfully' };
        } else {
          return null;
        }
      }

      async SendMail(mail_info: MailDTO) : Promise<any> {
        return await this.mailerService.sendMail({
            to: mail_info.Email,
            subject: mail_info.Subject,
            text: mail_info.Message,
        });
    }


    // * Extra Features 
    async calculateMonthlyIncome(sellerEmail: string): Promise<number> {
      
      // Get the seller information based on the email
      const seller_info = await this.sellerRepository.findOneBy({ Email: sellerEmail });

      console.log("Seller ID = "+seller_info.Seller_ID);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Month is zero-based
      const currentYear = currentDate.getFullYear();
      console.log("Current Month = "+currentMonth)
      console.log("Current Year = "+currentYear)

      const orders = await this.orderRepository.find({
        where: {
          Order_Status: 'Delivered',
          },
          relations: ['seller'], // Assuming you have a 'seller' relationship in your OrderEntity
      });

      console.log("Orders = "+orders);
      let totalIncome = 0;
      orders.forEach(order => {
        const orderDateParts = order.Order_Date.split('/');
        const orderDay = parseInt(orderDateParts[0], 10);
        const orderMonth = parseInt(orderDateParts[1], 10);
        const orderYear = parseInt(orderDateParts[2], 10);
        console.log("Day = "+orderDay);
        console.log("Month = "+orderMonth);
        console.log("Year = "+orderYear);

        if (
          orderMonth === currentMonth &&
          orderYear === currentYear &&
          order.seller.Seller_ID === seller_info.Seller_ID
        ) {
          console.log("Book Price = "+order.Book_Price);
          totalIncome += parseFloat(order.Book_Price);
        }
      });

      return totalIncome;
    }

    async GetTotalNumberOfPendingOrderCurrentMonth(sellerEmail: string): Promise<number> {
      
      // Get the seller information based on the email
      const seller_info = await this.sellerRepository.findOneBy({ Email: sellerEmail });

      console.log("Seller ID = "+seller_info.Seller_ID);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Month is zero-based
      const currentYear = currentDate.getFullYear();
      console.log("Current Month = "+currentMonth)
      console.log("Current Year = "+currentYear)

      const orders = await this.orderRepository.find({
        where: {
          Order_Status: 'Pending',
          },
          relations: ['seller'], // Assuming you have a 'seller' relationship in your OrderEntity
      });

      console.log("Orders = "+orders);
      let totalOrder = 0;
      orders.forEach(order => {
        const orderDateParts = order.Order_Date.split('/');
        const orderDay = parseInt(orderDateParts[0], 10);
        const orderMonth = parseInt(orderDateParts[1], 10);
        const orderYear = parseInt(orderDateParts[2], 10);
        console.log("Day = "+orderDay);
        console.log("Month = "+orderMonth);
        console.log("Year = "+orderYear);

        if (
          orderMonth === currentMonth &&
          orderYear === currentYear &&
          order.seller.Seller_ID === seller_info.Seller_ID
        ) {
          totalOrder += 1
        }
      });

      return totalOrder;
    }


    async getOrderCountsByMonth(): Promise<any> {
      const orders = await this.orderRepository.find();
      
      const orderCountsByMonth: Record<string, number> = {};
      
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
      ];
      
      for (let month = 1; month <= 12; month++) {
        const monthName = monthNames[month - 1];
        orderCountsByMonth[monthName] = 0;
      }
  
      orders.forEach(order => {
        const orderDateParts = order.Order_Date.split('/');
        const orderMonth = parseInt(orderDateParts[1], 10);
        const orderMonthName = monthNames[orderMonth - 1];
        
        orderCountsByMonth[orderMonthName] += 1;
      });
  
      return orderCountsByMonth;
    }


    // * Get Income List for each month

    async calculateMonthlyRevenues(sellerEmail: string): Promise<any> {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
  
      const seller = await this.sellerRepository.findOneBy({ Email: sellerEmail });
  
      const orders = await this.orderRepository.find({
        where: {
          Order_Status: 'Delivered',
          seller: { Seller_ID: seller.Seller_ID },
        },
        relations: ['seller'], // Assuming you have a 'seller' relationship in your OrderEntity
      });
  
      const revenueByMonth: Record<string, number> = {};
  
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
      ];
  
      for (let month = 1; month <= 12; month++) {
        const monthName = monthNames[month - 1];
        revenueByMonth[monthName] = 0;
      }
  
      orders.forEach(order => {
        const orderDateParts = order.Order_Date.split('/');
        const orderMonth = parseInt(orderDateParts[1], 10);
        const orderYear = parseInt(orderDateParts[2], 10);
        const orderMonthName = monthNames[orderMonth - 1];
  
        if (orderYear === currentYear) {
          revenueByMonth[orderMonthName] += parseFloat(order.Book_Price);
        }
      });
  
      return revenueByMonth;
    }




}

