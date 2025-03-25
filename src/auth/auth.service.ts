import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModel } from 'src/users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/users/user.service';
import { CreateUserDto, VerifyUserDto } from 'src/users/dto/user.dto';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
                private userService: UserService,
                private jwtService: JwtService,
                private configService: ConfigService,

    ){}

    async signIn(loginDto: LoginDto): Promise<any> {
        const user = await this.userService.findByEmail(loginDto.email)
        if (!user) throw new BadRequestException('User does not exist');
        const match= await bcrypt.compare(loginDto.password,user.password)
        if (!match) {
            throw new BadRequestException('Password is incorrect');
        }
        const tokens = await this.getTokens(await user.id,user.email);
        console.log("---->",(await user).id)
        console.log("---->",user)

        await this.updateRefreshToken(await user.id, tokens.refreshToken);
        return tokens;

    }
    async logout(userId: string) {
        return this.userService.update(userId, { refreshToken: null });
    }

    async signUp(createUserDto: CreateUserDto): Promise<any> {
        const newUser = await this.userService.create(createUserDto);

        return newUser;
    }

    hashData(data: string) {
        return argon2.hash(data);
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userService.update(userId, {
        refreshToken: hashedRefreshToken,
    });
    }
    
    async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
        {
            sub: userId,
            username,
        },
        {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
        },
        ),
        this.jwtService.signAsync(
        {
            sub: userId,
            username,
        },
        {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        },
        ),
    ]);

    return {
        accessToken,
        refreshToken,
    };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        console.log("email para refresh",userId)
        const user = await this.userService.findOne(userId);
        console.log("....",user)
        // console.log(user.refreshToken)
        if (!user || !user.refreshToken)
            throw new ForbiddenException('Access Denied');
        const refreshTokenMatches = await argon2.verify(
            user.refreshToken,
            refreshToken,
        );
        if (!refreshTokenMatches) throw new ForbiddenException('Access Denied, token does not match');
        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async verifyUser(verifyUserDto:VerifyUserDto){
        const newUser=await this.userService.verifyUser(verifyUserDto)
        if (!newUser) {
            throw new UnauthorizedException("Something went wrong with the verification...")
        }
        const tokens = await this.getTokens(newUser.id, newUser.email);
        await this.updateRefreshToken(newUser.id, tokens.refreshToken);
        return tokens;
    }
}
