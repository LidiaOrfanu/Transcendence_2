import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/orm_models/user.entity';
import { Repository } from 'typeorm';
import { PasswordService } from '../password/password.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthProtector {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async protectorCheck(hash: string, id: number): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ userID: id });
    if (!user) {
      return false;
    }

    const passwordIsMatching = await this.passwordService.compareToken(
      hash,
      user.passwordHash,
    );
    if (passwordIsMatching) {
      return true;
    }

    return false;
  }

  async protectorCheckAuthorization(intraName: string): Promise<boolean> {
    // Implement your authorization logic here.
    // Check if the user with the provided intraName is authorized.

    // You can perform additional authorization checks here, if needed.
    // For now, we assume that if the user exists, they are authorized.

    const user = await this.userRepository.findOne({
      where: { intraUsername: intraName },
    });

    if (user && user.isLoggedIn) {
      return true; // Authorized and logged in
    }

    return false; // Not authorized
  }
}

export class UserAuthDTO {
  @ApiProperty({
    example: 'vdragomi',
    description: 'intra username',
  })
  @IsString()
  @IsNotEmpty()
  intraUsername: string;
  @ApiProperty({
    example:
      '$2b$10$iXumFm6KoyN6J3.M03j7OO3454548G64OLJcgy7dG3Wf9Zhg/SyJKabmY.',
    description: 'PasswordHash',
  })
  @IsString()
  @IsNotEmpty()
  passwordHash: string;
}
