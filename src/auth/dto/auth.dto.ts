import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional,
} from 'class-validator';
export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class RefreshTokenDto {
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}