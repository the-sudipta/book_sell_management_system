import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class AdminDTO{


    @IsNotEmpty({ message: 'Admin ID cannot be empty or null' })
    Admin_ID: number;

    @IsString({ message: 'Seller Name should be a string' })
    @MinLength(3, { message: 'Seller Name should be at least 3 characters long' })
    @MaxLength(50, { message: 'Seller Name should not be more than 50 characters long' })
    Name: string;

    @IsNotEmpty({ message: 'Seller Name cannot be empty or null' })
    @IsEmail({}, { message: 'Please enter a valid email address' })
    @MaxLength(100, { message: 'Email should not be more than 100 characters long' })
    Email: string;


    @IsNotEmpty({ message: 'Seller Password cannot be empty or null' })
    @IsString({ message: 'Password should be a string' })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]{8,}$/, { message: 'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character, and is at least 8 characters long.' })
    Password: string;

}

export class AdminAddressDTO{

    // Address_ID
    @IsNotEmpty({ message: 'Address ID cannot be empty or null' })
    Address_ID : number;


    // Street
    @IsNotEmpty({ message: 'Seller Street Address cannot be empty or null' })
    @IsString({ message: 'Street should be a string' })
    Street : string;

    // Building
    @IsString({ message: 'Building should be a string' })
    Building : string;

    // City
    @IsNotEmpty({ message: 'Seller City Address cannot be empty or null' })
    @IsString({ message: 'City should be a string' })
    City : string;

    // Country
    @IsNotEmpty({ message: 'Seller Country Address cannot be empty or null' })
    @IsString({ message: 'Country should be a string' })
    Country : string;

    // ZIP
    @IsNotEmpty({ message: 'Seller ZIP Address cannot be empty or null' })
    ZIP : string;

}

export class MailDTO{
    Email : string;
    Subject : string;
    Message : string;
}