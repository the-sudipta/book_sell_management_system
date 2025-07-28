import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Put, Session, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { AdminAddressDTO, AdminDTO, MailDTO } from "./administrator.dto";
import { AdminService } from "./administrator.service";
import { SessionGuard } from "./session.gaurd";
import { BookDTO, SellerDTO } from "src/Seller/seller.dto";
import { CustomerDto, ModeratorDto } from "src/moderator/moderator.dto";
import { BookEntity } from "src/Seller/seller.entity";

@Controller('admin')
export class AdministratorController{
    constructor(private readonly adminService: AdminService) { 
        // Empty Constructor
    }
       


    @Get('/index')
    getIndex(): any {
        return "This is your Admin Speaking!"
    }

    // ############################ Basic Purpose ############################


    // ! Admin Will Not have any Signup. It's Hashed Password will be set manually in the Database.

    @Post('/login')
    async Login(@Body() seller_info: AdminDTO, @Session() session) : Promise<any>{
        const decision = await this.adminService.Login(seller_info);
        if(decision != null){
            session.Seller_Email = seller_info.Email;
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

    @Put('/profile/update_profile_info')
    @UseGuards(SessionGuard)
    @UsePipes(new ValidationPipe())
    async UpdateProfileInfo(@Body() updated_data:AdminDTO, @Session() session): Promise<any>{
        const seller = await this.adminService.UpdateProfileInfo(session.Seller_Email,updated_data);
        if (seller != null) {
            return seller;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Admin Found to Update Profile"
            });
        }
    }

    @Get('/profile')
    @UseGuards(SessionGuard)
    async ViewAdminProfile(@Session() session): Promise<any>{
        const seller = await this.adminService.ViewAdminProfile(session.Seller_Email);
        if(seller != null){
            return seller;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Admin Found to View Profile"
            });
        }
    }




    // ############################ Address Purpose One to One Relation ############################
    @Get('profile/address')
    @UseGuards(SessionGuard)
    async ViewAdminAddress(@Session() session): Promise<any>{
        const seller = await this.adminService.ViewAdminAddress(session.Seller_Email);
        if(seller != null){
            return seller;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Admin Address Not Found"
            });
        }
    }

    @Post('profile/add_address')
    @UseGuards(SessionGuard)
    @UsePipes(new ValidationPipe())
    async AddAddress(@Body() address_info: AdminAddressDTO, @Session() session): Promise<any>{
        const address_saved = await this.adminService.AddAddress(session.Seller_Email,address_info);
        if(address_saved != null){
            return address_saved;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Admin Found to Add Address"
            });
        }
    }

    @Put('profile/update_profile_info/update_address')
    @UseGuards(SessionGuard)
    @UsePipes(new ValidationPipe())
    async UpdateAddress(@Body() updated_data:AdminAddressDTO, @Session() session): Promise<any>{
        const updated_address = await this.adminService.UpdateAddress(session.Seller_Email,updated_data);
        if(updated_address != null){
            return updated_address;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Admin Address has not been updated"
            });
        }
    }

    @Delete('profile/delete_address')
    @UseGuards(SessionGuard)
    async DeleteAddress(@Session() session): Promise<any>{
        const address = await this.adminService.DeleteAddress(session.Seller_Email);
        if(address == null){
            return {"Delete":"Success"};
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Admin Found to Delete Address"
            });
        }
    }

    // ############################ Seller Purpose ############################

    @Post('profile/addseller')
    @UseGuards(SessionGuard)
    async AddSeller(@Body() seller_info: SellerDTO): Promise<any>{

        const seller = await this.adminService.AddSeller(seller_info);
        if(seller != null){
            return seller;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Seller Could Not be Created"
            });
        }
    }

    @Get('viewallsellers')
    @UseGuards(SessionGuard)
    async ViewAllSellers(): Promise<any>{
        const sellers = await this.adminService.ViewAllSellers();
        if(sellers != null){
            return sellers;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Sellers Found"
            });
        }
    }

    @Delete('profile/deleteseller/:id')
    @UseGuards(SessionGuard)
    async DeleteSeller(@Param('id',ParseIntPipe) id:number): Promise<any>{
        const address = await this.adminService.DeleteSeller(id);
        if(address == null){
            return {"Delete":"Success"};
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Seller Found to Delete Address"
            });
        }
    }



    // ############################ Customer Purpose ############################

    @Post('profile/addcustomer')
    @UseGuards(SessionGuard)
    async AddCustomer(@Body() customer_info: CustomerDto): Promise<any>{

        const customer = await this.adminService.AddCustomer(customer_info);
        if(customer != null){
            return customer;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Seller Could Not be Created"
            });
        }
    }

    @Get('viewallcustomers')
    @UseGuards(SessionGuard)
    async ViewAllCustomers(): Promise<any>{
        const sellers = await this.adminService.ViewAllCustomers();
        if(sellers != null){
            return sellers;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Sellers Found"
            });
        }
    }

    @Delete('profile/deletecustomer/:id')
    @UseGuards(SessionGuard)
    async DeleteCustomer(@Param('id',ParseIntPipe) id:number): Promise<any>{
        const address = await this.adminService.DeleteCustomer(id);
        if(address == null){
            return {"Delete":"Success"};
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Seller Found to Delete Address"
            });
        }
    }

    // ############################ Book Purpose ############################
    @Put('/books/update_book_info/:id')
    @UseGuards(SessionGuard)
    @UsePipes(new ValidationPipe())
    async UpdateBookInfo(@Param('id', ParseIntPipe) id:number, @Body() updated_data:BookDTO): Promise<BookEntity>{
        
        if(id == null){
            throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: "Please Enter Book ID"
            });
        }
        
        const updated_book = await this.adminService.UpdateBookInfo(id,updated_data);
        if(updated_book != null){
            return updated_book;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Book Found to Update"
            });
        }
    }

    @Delete('/books/delete_books/:id')
    @UseGuards(SessionGuard)
    async DeleteBookInfo(@Param('id', ParseIntPipe) id:number): Promise<any> {
        
        if(id == null){
            throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: "Please Enter Book ID"
            });
        }
        
        const decision = await this.adminService.DeleteBookInfo(id);
        if(decision != null){
            return {"Delete":"Success"};
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "No Book Found to Delete"
            });
        }
    }

    // ############################ Moderator Purpose ############################

    @Post('profile/addmoderator')
    @UseGuards(SessionGuard)
    async AddModerator(@Body() customer_info: ModeratorDto): Promise<any>{

        const moderator = await this.adminService.AddModerator(customer_info);
        if(moderator != null){
            return moderator;
        }else{
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                message: "Moderator Could Not be Created"
            });
        }
    }

    @Post('profile/sendmail')
    async SendMail(@Body() mail_info: MailDTO): Promise<any>{
        const email = await this.adminService.SendMail(mail_info);
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