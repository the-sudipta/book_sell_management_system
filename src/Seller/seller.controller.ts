/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  Session,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import {
  AddressDTO,
  BookDTO,
  FeedbackDTO,
  MailDTO,
  OrderDTO,
  PinCodeDTO,
  SellerDTO,
  UpdatePasswordDTO,
} from './seller.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';
import { SessionGuard, TempSessionGuard } from './session.gaurd';
import { BookEntity, SellerEntity } from './seller.entity';
// import multer from 'multer';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {
    // Empty Constructor
  }

  @Get('/index')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  getIndex(): any {
    return 'Relax! Seller is Alive.';
  }

  // ######################################### BOOKS ######################################################

  // * Feature 1 : Add Books
  @Post('/add_books')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('myfile', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: { fileSize: 5000000 }, // 5 MB
      storage: diskStorage({
        destination: './assets/book_images',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  AddBooks(
    @Body() book_info: BookDTO,
    @UploadedFile() myfileobj: Express.Multer.File,
    @Session() session,
  ): object {
    console.log('Book Image = ' + myfileobj.filename);
    console.log('Seller mail session = ' + session.Seller_Email);
    book_info.Book_Image = myfileobj.filename; // Adding Book Image name to DTO to store in database

    if (myfileobj == null) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Please Upload Image',
      });
    }

    try {
      return this.sellerService.AddBooks(session.Seller_Email, book_info);
    } catch (err) {
      return { Error: err };
    }
  }

  // * Feature 2 : View All Books by Logged in Seller
  @Get('/books')
  @UseGuards(SessionGuard)
  async ViewAllBooks(@Session() session): Promise<SellerEntity[]> {
    const books = await this.sellerService.ViewAllBooks(session.Seller_Email);
    if (books != null) {
      return books;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Books Found',
      });
    }
  }

  // * Feature 3 : View Single Book (Used While Books info needs to be edited)
  @Get('/books/search_books/:id')
  @UseGuards(SessionGuard)
  async ViewSingleBook(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BookEntity> {
    const book = await this.sellerService.ViewSingleBook(id);
    console.log('Book = ' + book);
    if (id == null) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Please Enter Book ID',
      });
    }
    if (book != null) {
      return book;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Book not found',
      });
    }
  }

  // * Feature 4 : Update Book Info
  @Put('/books/update_book_info/:id')
  //  TODO : Un comment this
  // @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  async UpdateBookInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updated_data: BookDTO,
  ): Promise<BookEntity> {
    if (id == null) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Please Enter Book ID',
      });
    }

    const updated_book = await this.sellerService.UpdateBookInfo(
      id,
      updated_data,
    );
    if (updated_book != null) {
      console.log('Updated Book Data = ' + updated_book);
      return updated_book;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Book Found to Update',
      });
    }
  }

  // * Feature 5 : Delete Book Info
  @Delete('/books/delete_books/:id')
  // TODO: Uncomment This Line
  // @UseGuards(SessionGuard)
  async DeleteBookInfo(@Param('id', ParseIntPipe) id: number): Promise<any> {
    if (id == null) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Please Enter Book ID',
      });
    }

    const decision = await this.sellerService.DeleteBookInfo(id);
    if (decision != null) {
      return { Delete: 'Success' };
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Book Found to Delete',
      });
    }
  }

  // ! Not Useable
  // * Feature 6 : Upload & Update Book Image
  @Post('/books/update_book_info/upload_book_image')
  @UseGuards(SessionGuard)
  @UseInterceptors(
    FileInterceptor('myfile', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: { fileSize: 5000000 }, // 5 MB
      storage: diskStorage({
        destination: './assets/book_images',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  async UploadBookImage(
    @UploadedFile() myfileobj: Express.Multer.File,
  ): Promise<any> {
    console.log(myfileobj); // We can find the file name here
    if (myfileobj == null) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Please Upload Image',
      });
    } else {
      const book = await this.sellerService.UploadBookImage(myfileobj.filename);
      if (book != null) {
        return book;
      } else {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          message: 'No Book Found to Upload Book Image',
        });
      }
    }
  }

  // * Feature 7 : View Book Images
  @Get('/book/book_image/:id')
  @UseGuards(SessionGuard)
  async getBookImages(
    @Param('id', ParseIntPipe) id: number,
    @Res() res,
  ): Promise<any> {
    return this.sellerService.getBookImages(id, res);
  }

  // * Feature 30 : Search books
  @Get('/book/search')
  @UseGuards(SessionGuard)
  async searchBooks(
    @Query('criteria') criteria: string,
    @Query('value') value: string,
    @Session() session,
  ): Promise<BookEntity[]> {
    if (!criteria || !value) {
      throw new BadRequestException('Invalid search parameters');
    }

    // console.log("Session Email = "+session.Seller_Email)
    return this.sellerService.getBookData(
      session.Seller_Email,
      criteria,
      value,
    );
  }

  //  ################################### SELLER ########################################################

  // * Feature 8 : Send Feedback to Admin
  @Post('/feedbacks/send_feedback')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  SendFeedback(@Body() feedback_info: FeedbackDTO, @Session() session): object {
    return this.sellerService.SendFeedback(session.Seller_Email, feedback_info);
  }

  // * Feature 9 : View Customer Feedback
  @Get('/feedbacks')
  @UseGuards(SessionGuard) // We can show the customer feedbacks to the Main Website
  ViewCustomerFeedback(@Session() session): any {
    // ! Not Implemented
    return this.sellerService.ViewCustomerFeedback(session.Seller_Email);
  }

  // * Feature 10 : Logout
  @Post('/logout')
  Logout(@Session() session): object {
    if (session.destroy()) {
      return { Logout: 'Success' };
    } else {
      return { Logout: 'Failed' };
    }
  }

  // * Feature 11 : Seller Signup
  @Post('/signup')
  @UsePipes(new ValidationPipe())
  async Signup(@Body() seller_info: SellerDTO): Promise<any> {
    const seller = await this.sellerService.Signup(seller_info);
    if (seller != null) {
      return seller;
    } else {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Email Already Exists',
      });
    }
  }

  // * Feature 12 : Delete Seller Account
  @Delete('/profile/delete_profile')
  @UseGuards(SessionGuard)
  async DeleteAccount(@Session() session): Promise<any> {
    const seller = await this.sellerService.DeleteAccount(session.Seller_Email);
    if (seller == null) {
      return { Delete: 'Success' };
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Seller Found to Delete',
      });
    }
  }

  // * Feature 13 : View Seller Profile
  @Get('/profile')
  @UseGuards(SessionGuard)
  async ViewSellerProfile(@Session() session): Promise<any> {
    const seller = await this.sellerService.ViewSellerProfile(
      session.Seller_Email,
    );
    if (seller != null) {
      return seller;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Seller Found to View Profile',
      });
    }
  }

  // * Feature 14 : Update Seller Profile
  @Put('/profile/update_profile_info')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  async UpdateProfileInfo(
    @Body() updated_data: SellerDTO,
    @Session() session,
  ): Promise<any> {
    const seller = await this.sellerService.UpdateProfileInfo(
      session.Seller_Email,
      updated_data,
    );
    if (seller != null) {
      return seller;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Seller Found to Update Profile',
      });
    }
  }

  // * Feature 15 : Login
  @Post('/login')
  async Login(
    @Body() seller_info: SellerDTO,
    @Session() session,
  ): Promise<any> {
    const decision = await this.sellerService.Login(seller_info);
    if (decision != null) {
      session.Seller_Email = seller_info.Email;
      return { Login: 'Success' };
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Email or Password is Incorrect',
      });
    }
  }

  // * Feature 16 : Upload & Update Seller Image
  @Put('/profile/update_profile_info/upload_profile_image')
  @UseGuards(SessionGuard)
  @UseInterceptors(
    FileInterceptor('myfile', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: { fileSize: 5000000 }, // 5 MB
      storage: diskStorage({
        destination: './assets/profile_images',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  async UploadSellerImage(
    @Session() session,
    @UploadedFile() myfileobj: Express.Multer.File,
  ): Promise<any> {
    console.log(myfileobj); // We can find the file name here
    if (myfileobj == null) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Please Upload Image',
      });
    }
    const seller = await this.sellerService.UploadSellerImage(
      session.Seller_Email,
      myfileobj.filename,
    );
    if (seller != null) {
      return seller;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Seller Found to Upload Seller Image',
      });
    }
  }

  // * Feature 17 : View Seller Images
  @Get('/profile/profile_image')
  @UseGuards(SessionGuard)
  async getSellerImages(@Session() session, @Res() res): Promise<any> {
    return this.sellerService.getSellerImages(session.Seller_Email, res);
  }

  // * Feature 18 : Forget Password
  @Post('/forget_password')
  ForgetPassword(@Body() seller_info: SellerDTO, @Session() session) {
    session.tempMail = seller_info.Email;
    return this.sellerService.ForgetPassword(seller_info.Email);
  }

  // * Feature 19 : Forget Password
  @Post('/forget_password/send_pin')
  async SendPin(@Body() pin_code: PinCodeDTO) {
    const pin_matched = await this.sellerService.SendPin(pin_code.Pin_Code);
    if (pin_matched != null) {
      return { pin_matched: 'Success' };
    } else {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Pin Code Not Matched',
      });
    }
  }

  // * Feature 20 : Update Password

  @Put('/forget_password/update_password')
  @UseGuards(TempSessionGuard)
  @UsePipes(new ValidationPipe())
  async UpdatePassword(
    @Body() updated_Data: UpdatePasswordDTO,
    @Session() session,
  ): Promise<any> {
    console.log('Forgot mail : ' + session.tempMail);
    const seller = await this.sellerService.UpdatePassword(
      session.tempMail,
      updated_Data,
    );
    if (seller != null) {
      return seller;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Password Can not be Updated',
      });
    }
  }

  //  ################################################ Address #############################################

  // * Feature 21 : Add Address
  @Post('profile/add_address')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  async AddAddress(
    @Body() address_info: AddressDTO,
    @Session() session,
  ): Promise<any> {
    const address_saved = await this.sellerService.AddAddress(
      session.Seller_Email,
      address_info,
    );
    if (address_saved != null) {
      return address_saved;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Seller Found to Add Address',
      });
    }
  }

  // * Feature 22 : View Address

  @Get('profile/address')
  @UseGuards(SessionGuard)
  async ViewSellerAddress(@Session() session): Promise<any> {
    const seller = await this.sellerService.ViewSellerAddress(
      session.Seller_Email,
    );
    if (seller != null) {
      return seller;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Seller Address Not Found',
      });
    }
  }

  // * Feature 23 : Update Address

  @Put('profile/update_profile_info/update_address')
  //  TODO: Uncomment This
  // @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  async UpdateAddress(
    @Body() updated_data: AddressDTO,
    @Session() session,
  ): Promise<any> {
    const updated_address = await this.sellerService.UpdateAddress(
      session.Seller_Email,
      updated_data,
    );
    if (updated_address != null) {
      return updated_address;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Seller Found to Update Address',
      });
    }
  }

  // * Feature 24 : Delete Address
  @Delete('profile/delete_address')
  @UseGuards(SessionGuard)
  async DeleteAddress(@Session() session): Promise<any> {
    const address = await this.sellerService.DeleteAddress(
      session.Seller_Email,
    );
    if (address == null) {
      return { Delete: 'Success' };
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Seller Found to Delete Address',
      });
    }
  }

  //  ################################################ Orders #############################################

  // * Feature 25 : View All Orders
  @Get('orders/view_all_orders')
  // @UseGuards(SessionGuard)
  async ViewAllOrders(@Session() session): Promise<any> {
    const orders = await this.sellerService.ViewAllOrders(session.Seller_Email);
    if (orders != null) {
      return orders;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Orders Found',
      });
    }
  }

  // * Feature 26 : View Single Order

  @Get('orders/view_single_order/:id')
  @UseGuards(SessionGuard)
  async ViewSingleOrder(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const order = await this.sellerService.ViewSingleOrder(id);
    if (order != null) {
      return order;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Order Found',
      });
    }
  }

  // * Feature 27 : Update Order Status

  @Put('orders/update_order_status/:id')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  async UpdateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updated_data: OrderDTO,
  ): Promise<any> {
    const updated_order = await this.sellerService.UpdateOrderStatus(
      id,
      updated_data,
    );
    if (updated_order != null) {
      return updated_order;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Order Found to Update',
      });
    }
  }

  // * Feature 28 : Show Total Cost
  @Post('/order/total_cost')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  async ShowTotalCost(@Session() session): Promise<any> {
    const total_cost = await this.sellerService.ShowTotalCost(
      session.Seller_Email,
    );
    if (total_cost != null) {
      return total_cost;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Cost can not be calculated due to unavailability',
      });
    }
  }

  // * Feature 29 : Set Delivered Status
  @Get('orders/deliver/:id')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  async UpdateDeliverStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    console.warn('ID = ' + id);
    const updated_order = await this.sellerService.Update_Order_Status(
      id,
      'Delivered',
    );
    if (updated_order) {
      return updated_order;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Order Found to Update',
      });
    }
  }

  // * Feature 29 : Set Cancel Status
  @Get('orders/cancel/:id')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  async UpdateCancelStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    console.warn('ID = ' + id);
    const updated_order = await this.sellerService.Update_Order_Status(
      id,
      'Cancelled',
    );
    if (updated_order) {
      return updated_order;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'No Order Found to Update',
      });
    }
  }

  // * Feature 31 :
  @Post('profile/send_mail')
  @UseGuards(SessionGuard)
  async SendMail(@Body() mail_info: MailDTO): Promise<any> {
    const email = await this.sellerService.SendMail(mail_info);
    if (email != null) {
      return email;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Email Could Not be Sent',
      });
    }
  }

  // * Feature 32 : Get Monthly Income Amount
  @Get('monthly_income')
  @UseGuards(SessionGuard)
  async GetMonthlyIncome(@Session() session): Promise<any> {
    const data = await this.sellerService.calculateMonthlyIncome(
      session.Seller_Email,
    );
    if (data != null) {
      return data;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Data Not Found',
      });
    }
  }

  // * Feature 33 : Number of Orders pending in Current Month
  @Get('monthly_pending_orders')
  @UseGuards(SessionGuard)
  async GetTotalNumberOfPendingOrderCurrentMonth(
    @Session() session,
  ): Promise<number> {
    const data =
      await this.sellerService.GetTotalNumberOfPendingOrderCurrentMonth(
        session.Seller_Email,
      );
    if (data != null) {
      return data;
    } else {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Data Not Found',
      });
    }
  }

  //  Feature 34 : Order Statistics
  @Get('orders_stats')
  @UseGuards(SessionGuard)
  async getOrderCountsByMonth(): Promise<any> {
    const data = await this.sellerService.getOrderCountsByMonth();
    if (data != null) {
      return data;
    } else {
      throw new NotFoundException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Backend Calculation Error',
      });
    }
  }

  // calculateMonthlyRevenues
  //  Feature 35 : Order Statistics
  @Get('income_stats')
  @UseGuards(SessionGuard)
  async calculateMonthlyRevenues(@Session() session): Promise<any> {
    const data = await this.sellerService.calculateMonthlyRevenues(
      session.Seller_Email,
    );
    if (data != null) {
      return data;
    } else {
      throw new NotFoundException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Backend Calculation Error',
      });
    }
  }
}
