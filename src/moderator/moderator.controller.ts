import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Session, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ModeratorService } from "./moderator.service";
import { CustomerDto, ModeratorDto, ModeratorLoginDto } from "./moderator.dto";
import { SellerDTO } from "src/Seller/seller.dto";
import session = require("express-session") ;
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterError, diskStorage } from "multer";
import { CustomerEntity, ModeratorEntity } from "./moderator.entity";
import { BookEntity, FeedbackEntity, SellerEntity } from "src/Seller/seller.entity";
import { SessionGuard } from "./session.gaurd";

@Controller('moderator')
export class ModeratorController {
    constructor(private readonly moderatorService: ModeratorService) {}

    @Get()
    getHello(): string {
        return this.moderatorService.getHello();
    }

    @Get("/customerById/:id")
    @UseGuards(SessionGuard)
    async getCustomerById(@Param('id', ParseIntPipe) id: number): Promise<CustomerEntity> {
        const customer = await this.moderatorService.getCustomerById(id);
        console.log(customer);
        if (customer== null) {
            throw new NotFoundException({
                message: "Customer not found"
            });
        }
        else {
        return this.moderatorService.getCustomerById(id);
        }
    }

    @Get("/sellerById/:id")
    @UseGuards(SessionGuard)
    async getSellerById(@Param('id', ParseIntPipe) id: number): Promise<SellerEntity> {
        const seller = await this.moderatorService.getSellerById(id);
        console.log(seller);
        if (seller== null) {
            throw new NotFoundException({
                message: "Seller not found"
            });
        }
        else {
            return this.moderatorService.getSellerById(id);
        }
    }

    @Get("/customerFeedback/:id")
    @UseGuards(SessionGuard)
    async getCustomerFeedback(): Promise<FeedbackEntity[]> {
        const feedback= await this.moderatorService.getCustomerFeedback();
        console.log(feedback);
        if (feedback== null) {
            throw new NotFoundException({
                message: "Feedback not found"
            });
        }
        else {
            return this.moderatorService.getCustomerFeedback();
        }
    }

    @Get("/sellerFeedback/:id")
    @UseGuards(SessionGuard)
    async getSellerFeedback(): Promise<FeedbackEntity[]> {
        const feedbackSell= await this.moderatorService.getSellerFeedback();
        console.log(feedbackSell);
        if (feedbackSell== null) {
            throw new NotFoundException({
                message: "Feedback not found"
            });
        }
        else {
            return this.moderatorService.getSellerFeedback();
        }
    }

    @Get("/books/")
    @UseGuards(SessionGuard)
    async getAllBooks(): Promise<BookEntity[]> {
        const books= await this.moderatorService.getAllBooks();
        console.log(books);
        if (books== null) {
            throw new NotFoundException({
                message: "Books not found"
            });
        }
        else {
            return this.moderatorService.getAllBooks();
        }
    }

    //@Get("/login/:email/:password")
    //login(@Param() email:string, @Param() password:string,@Body() data:ModeratorDto): any {
    //    return this.moderatorService.login(email, password, data);
    //}
    @Post("/register/")
    @UsePipes(new ValidationPipe())
    async register(@Body() data:ModeratorDto): Promise<ModeratorEntity> {
        const mod= await this.moderatorService.register(data);
        console.log(mod);
        if (mod== null) {
            throw new NotFoundException({
                message: "Moderator not found"
            });
        }
        else {
            return this.moderatorService.register(data);
        }
    }

    @Post("/login/")
    async login(@Body() data:ModeratorLoginDto, @Session() session): Promise<any>{

        const decision = await this.moderatorService.login(data);
        console.log(decision);
        if(decision != null){
            //console.log(data);
            session.email = data.email;
            console.log(session.email)
            return this.moderatorService.login(data);
        }
        else{
            return false;
        }
    }

    @Get("/logout/")
    @UseGuards(SessionGuard)
    logout(@Session() session): any {
        if (session.user) {
            session.destroy();
            return {
                message: "Logout successful"
            }
        }
        else {
            return {
                message: "No user to logout"
            }
        }
    }

    @Put("/updateCustomer/:id")
    updateCustomer(@Param("id", ParseIntPipe) id: number, @Body() data:CustomerDto): object {
        console.log(data);
        return this.moderatorService.updateCustomer(id, data);
    }

    @Put("/updateSeller/:id")
    updateSeller(@Param("id", ParseIntPipe) id: number,  @Body() data:SellerDTO): object {
        return this.moderatorService.updateSeller(id, data);
    }

    @Put('/updateProfile/')
    @UseInterceptors(FileInterceptor('image',
    {
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
                cb(null, true);
            else {
                cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
            }
        },
        limits: { fileSize: 30000 },
        storage: diskStorage({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname)
            },
        })
    }
    ))
    @UsePipes(new ValidationPipe())
    updateProfile(@Body() data:ModeratorDto, @Session() session, @UploadedFile() imageObj: Express.Multer.File): object {
        console.log(data);
        //data.image = imageObj.filename;
        return this.moderatorService.updateProfile(session.email, data);
    }

    @Post("/removeBook/:id")
    removeBook(@Param('id', ParseIntPipe) id: number): any {
        return this.moderatorService.removeBook(id);
    }

    @Post("/deleteAccount/:id")
    deleteAccount(@Param('id', ParseIntPipe) id: number): any {
        return this.moderatorService.deleteAccount(id);
    }
}

