import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModel } from 'src/users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
                @InjectModel(UserModel.name) private userModel: Model<UserDocument>,   
                
                private jwtService: JwtService


    ){}

    async signIn(email: string, pass: string): Promise<any> {
        const user = await this.userModel.findOne({email:email}).exec();
    
        const match= await bcrypt.compare(pass,user?.password)
        if (!match) {
            throw new UnauthorizedException();
        }
        const payload={sub: user.id, username: user.name};
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
