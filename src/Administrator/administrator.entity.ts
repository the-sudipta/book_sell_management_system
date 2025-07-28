import { ModeratorEntity } from "src/moderator/moderator.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("admin")
export class AdminEntity{

    @PrimaryGeneratedColumn()
    Admin_ID: number;

    @Column()
    Name: string;

    @Column()
    Email: string;

    @Column()
    Password: string;


    // ! This Relationship Creates Database Connection Error
    // Relationships One to Many with Moderator
    @OneToMany(()=>ModeratorEntity, moderator=>moderator.admin)
    moderators: ModeratorEntity[];




}




@Entity("admin_address")
export class AdminAddressEntity{

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

    //  One to One Relationships. One Admin can have only one Address
    @OneToOne(() => AdminEntity)
    @JoinColumn()
    admin: AdminEntity;
    
}