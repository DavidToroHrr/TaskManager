import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, VerifyUserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';

@Controller('api/v1/users')
export class UserController {
constructor(private readonly userService: UserService ) {}
@Post() 
@HttpCode(HttpStatus.CREATED)
async create(@Body() createUserDto: CreateUserDto): Promise <User>{
    return await this.userService.create(createUserDto)

} 
@Post('verifyUser') 
@HttpCode(HttpStatus.OK)
async consult(@Body() verifyUserDto:VerifyUserDto):Promise<User>{
    return await this.userService.verifyUser(verifyUserDto)
} 

@Get(':id')
async findById(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);//ENCONTRAR POR ID
}
}
