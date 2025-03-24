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
import { ChangePasswordDto, CreateUserDto, UpdateUserDto, VerifyUserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import { EmailController } from 'src/email/email.controller';
import { promises } from 'dns';

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

@Get()
async findAllUsers(): Promise<User[]>{
    return this.userService.findAll()
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async remove(@Param('id') id: string){
    return this.userService.remove(id);

}

@Put(':id')
async updatePassword(
    @Param('id') id:string,
    @Body() changePasswordDto:ChangePasswordDto
): Promise<void>{
    this.userService.changePassword(id, changePasswordDto)
}

@Put('update-user/:id')
async updateUser(
    @Param('id') id:string, 
    @Body() updateUserDto:UpdateUserDto
    ):Promise <User>{
    return this.userService.update(id,updateUserDto)
}

//   @Put(':id')
//   async update(
//     @Param('id') id: string,
//     @Body() updateTaskDto: UpdateTaskDTO,
//   ): Promise<Task> {
//     return this.taskService.update(id, updateTaskDto);
//   }
}
