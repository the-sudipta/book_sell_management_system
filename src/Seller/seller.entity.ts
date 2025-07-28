import { CustomerEntity } from "src/moderator/moderator.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";

@Entity("seller")
export class SellerEntity{
    @PrimaryGeneratedColumn()
    Seller_ID: number;

    @Column()
    Name: string;

    @Column()
    Email: string;

    @Column()
    Password: string;

    @Column()
    Phone: string;

    @Column()
    Profile_Picture : string;

    // One to Many Relationships. One Seller Can have many Books
    @OneToMany(()=>BookEntity, book=>book.seller)
    books: BookEntity[];

    // One to Many Relationships. One Seller Can have many Books
    @OneToMany(()=>OrderEntity, order=>order.seller)
    orders: OrderEntity[];

    @OneToMany(()=>SellerCustomerBookEntity, sell_cust_book=>sell_cust_book.seller)
    sell_cust_book: SellerCustomerBookEntity[];

}



@Entity("address")
export class AddressEntity{

    // Address_ID
    @PrimaryGeneratedColumn()
    Address_ID : number;


    // Street
    @Column()
    Street : string;

    // Building
    @Column()
    Building : string;

    // City
    @Column()
    City : string;

    // Country
    @Column()
    Country : string;

    // ZIP
    @Column()
    ZIP : string;

    //  One to One Relationships. One Seller can have only one Address
    @OneToOne(() => SellerEntity)
    @JoinColumn()
    seller: SellerEntity;
    
}



@Entity("book")
export class BookEntity{

    @PrimaryGeneratedColumn()
    Book_ID: number;

    @Column()
    Title: string;

    @Column()
    Author: string;

    @Column()
    ISBN: string;

    @Column()
    Condition: string;

    @Column()
    Price: string;

    @Column()
    Book_Image: string;

    @ManyToOne(()=> SellerEntity)
    seller: SellerEntity;

    @OneToMany(()=>SellerCustomerBookEntity, sell_cust_book=>sell_cust_book.seller)
    sell_cust_book: SellerCustomerBookEntity[];
}

@Entity("feedback")
export class FeedbackEntity{


    @PrimaryGeneratedColumn()
    Feedback_ID : number;

    @Column()
    Comment : string;

    @Column()
    Date : string;

    @Column()
    Sender_ID : number;

    // Can be Null if Receiver is Admin and sender is Seller
    @Column()
    Receiver_ID : number;

    @Column()
    Receiver_Type : string;

}

@Entity("pincode")
export class PinCodeEntity{
    
    @PrimaryGeneratedColumn()
    Pin_ID : number;

    @Column()
    Pin_Code : string;

    //  One to One Relationships. One Seller can have only one Pin
    @OneToOne(() => SellerEntity)
    @JoinColumn()
    seller: SellerEntity;

}



@Entity("order")
export class OrderEntity{

    @PrimaryGeneratedColumn()
    Order_ID : number;

    @Column()
    Order_Date : string;

    @Column()
    Order_Status : string;

    @Column()
    Book_Name : string;

    @Column()
    Book_Price : string;

    // Relationships 

    @ManyToOne(()=> SellerEntity)
    seller: SellerEntity;
    
    @OneToMany(()=>SellerCustomerBookEntity, sell_cust_book=>sell_cust_book.seller)
    sell_cust_book: SellerCustomerBookEntity[];


}


@Entity("sell_cust_book")
export class SellerCustomerBookEntity{

    @PrimaryGeneratedColumn()
    scb_ID : number;

    //  Relationships
    @ManyToOne(()=> SellerEntity)
    seller: SellerEntity;

    @ManyToOne(()=> CustomerEntity)
    customer: CustomerEntity;

    @ManyToOne(()=> BookEntity)
    book: BookEntity;

    @ManyToOne(()=> OrderEntity)
    order: OrderEntity;

}

