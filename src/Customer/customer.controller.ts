/*
https://docs.nestjs.com/controllers#controllers
*/


import { CustomerService } from './customer.service';
import { CustomerDto } from 'src/moderator/moderator.dto';
import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Res, Session, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from "multer";
import { SessionGuard, TempSessionGuard } from './session.gaurd';
import { CustomerEntity } from 'src/moderator/moderator.entity';
import { BookEntity } from 'src/Seller/seller.entity';
import { CustomerAddressDTO, MailDTO } from './customer.dto';

// import multer from 'multer';

@Controller('customer')
export class CustomerController {
    // customerService: any;

    constructor(private readonly customerService: CustomerService){
        // Empty Constructor
    }

    @Get('/index')
    getIndex(): any {
        return "Hello I am your Customer."
    }


    @Post('/signup')
    @UsePipes(new ValidationPipe())
    async Signup(@Body() customer_info: CustomerDto): Promise<any>{
        const seller = await this.customerService.Signup(customer_info);
        if(seller != null){
            return seller;
        }else{
            throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: "Email Already Exists"
            });
        }
    }

    @Post('/login')
    
    async Login(@Body() customer_info: CustomerDto, @Session() session) : Promise<any>{
        const decision = await this.customerService.Login(customer_info);
        if(decision != null){
            session.Customer_Email = customer_info.email;
            return {"Login":"Success"};
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Email or Password is Incorrect"
            });
        }
    }

    @Post('/logout')
    @UseGuards(SessionGuard)
    Logout(@Session() session): object{
        if(session.destroy()){
            return {"Logout":"Success"};
        }else{
            return {"Logout":"Failed"};
        }
        
    }


    @Get('/books')
    @UseGuards(SessionGuard)
    async ViewAllBooks(): Promise<any>{
        const books = await this.customerService.ViewAllBooks();
        if(books != null){
            return books;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: 'No Books Found',
            });
        }
    }

    @Get('/books/search_books/:id')
    @UseGuards(SessionGuard)
    async ViewSingleBook(@Param('id',ParseIntPipe) id:number): Promise<BookEntity>{
        const book = await this.customerService.ViewSingleBook(id);
        console.log("Book = "+book);
        if(id == null){
            throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: "Please Enter Book ID"
            });
        }
        if (book !== null) {
            return book;
        }
        else {
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Book not found"
            });
        }

    }


    @Get('/books/search_books/name/:name')
    @UseGuards(SessionGuard)
    async ViewSingleBookByName(@Param('name') name:string): Promise<BookEntity[]>{
        const book = await this.customerService.ViewBooksByName(name);
        console.log("Book = "+book);
        if(name == null){
            throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: "Please Enter Book ID"
            });
        }
        if (book !== null) {
            return book;
        }
        else {
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Book not found"
            });
        }

    }


    // View Profile
    @Get('/profile')
    @UseGuards(SessionGuard)
    async ViewProfile(@Session() session): Promise<any>{
        const customer = await this.customerService.ViewProfile(session.Customer_Email);
        if(customer != null){
            return customer;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Customer Found"
            });
        }
    }

    //  Update Profile Info
    @Put('/profile/update_profile_info')
    @UseGuards(SessionGuard)
    @UsePipes(new ValidationPipe())
    async UpdateProfileInfo(@Body() updated_data:CustomerDto, @Session() session): Promise<any>{
        const seller = await this.customerService.UpdateProfileInfo(session.Seller_Email,updated_data);
        if (seller != null) {
            return seller;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Seller Found to Update Profile"
            });
        }
    }




    @Delete('/profile/delete_profile')
    @UseGuards(SessionGuard)
    async DeleteAccount(@Session() session): Promise<any>{
        const seller = await this.customerService.DeleteAccount(session.Customer_Email);
        if (seller == null) {
            return {"Delete":"Success"};
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Customer Found to Delete"
            });
        }
    }

    //  Address Code


    @Post('profile/add_address')
    @UseGuards(SessionGuard)
    @UsePipes(new ValidationPipe())
    async AddAddress(@Body() address_info: CustomerAddressDTO, @Session() session): Promise<any>{
        const address_saved = await this.customerService.AddAddress(session.Customer_Email,address_info);
        if(address_saved != null){
            return address_saved;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Seller Found to Add Address"
            });
        }
    }

    @Get('profile/address')
    @UseGuards(SessionGuard)
    async ViewSellerAddress(@Session() session): Promise<any>{
        const seller = await this.customerService.ViewAddress(session.Customer_Email);
        if(seller != null){
            return seller;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Seller Adress Not Found"
            });
        }
    }


    

    @Put('profile/update_profile_info/update_address')
    @UseGuards(SessionGuard)
    @UsePipes(new ValidationPipe())
    async UpdateAddress(@Body() updated_data:CustomerAddressDTO, @Session() session): Promise<any>{
        const updated_address = await this.customerService.UpdateAddress(session.Customer_Email,updated_data);
        if(updated_address != null){
            return updated_address;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Seller Found to Update Address"
            });
        }
    }





    @Delete('profile/delete_address')
    @UseGuards(SessionGuard)
    async DeleteAddress(@Session() session): Promise<any>{
        const address = await this.customerService.DeleteAddress(session.Customer_Email);
        if(address == null){
            return {"Delete":"Success"};
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Seller Found to Delete Address"
            });
        }
    }

    @Get('orders/view_single_order/:id')
    @UseGuards(SessionGuard)
    async ViewSingleOrder(@Param('id',ParseIntPipe) id:number): Promise<any>{
        const order = await this.customerService.ViewSingleOrder(id);
        if(order != null){
            return order;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Order Found"
            });
        }
    }

    //  View All Orders
    @Get('orders/')
    @UseGuards(SessionGuard)
    async ViewAllOrders(): Promise<any>{
        const order = await this.customerService.ViewAllOrders();
        if(order != null){
            return order;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Order Found"
            });
        }
    }

    //  Add Order for Book
    @Post('orders/add_order/')
    @UseGuards(SessionGuard)
    async AddOrder(@Body() order_info: any, @Session() session): Promise<any>{
        const order = await this.customerService.AddOrder(session.Customer_Email,order_info);
        if(order){ 
            return order;
        }else{
            throw new NotFoundException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Orders Could Not be Added"
            });
        }
    }



    @Post('profile/sendmail')
    @UseGuards(SessionGuard)
    async SendMail(@Body() mail_info: MailDTO): Promise<any>{
        const email = await this.customerService.SendMail(mail_info);
        if(email != null){
            return email;
        }
        else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Email Could Not be Sent"
            });
        }
    }



}
