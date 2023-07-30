import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/orm_models/user.entity';
import { In, Repository } from 'typeorm';
import { UserDTO } from './userDTO';
import { PasswordService } from '../password/password.service';
import { createWriteStream } from 'fs';
import * as path from 'path';

export class UserRepository extends Repository<User> {}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
	private readonly passwordService: PasswordService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.userID = :id', { id })
      .getOne();
  }

  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async updatePoints(id: number, points: number): Promise<void> {
    await this.userRepository.update(id, { points: points });
  }

  async updateAvatar(id: number, newAvatar: string): Promise<void> {
	const user = await this.userRepository.findOneBy({ userID: id });
  
	if (!user) {
	  throw new NotFoundException('User not found');
	}
  
	user.avatarPath = newAvatar;
	await this.userRepository.save(user);
  }

  async updateUsername(id: number, newUsername: string): Promise<User> {
    const isUsernameInDb = await this.userRepository.findOneBy({
      username: newUsername,
    });
	const isIntraUsernameInDb = await this.userRepository.findOneBy({
	  intraUsername: newUsername,
	});

    if (isUsernameInDb || isIntraUsernameInDb) {
      throw new HttpException(
        'Username already exists. Please choose a different username.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.userRepository.update(id, { username: newUsername });

	return await this.userRepository.findOneBy({ userID: id });
  }

  async getUsersOrderedByPoints(): Promise<User[]> {
    return this.userRepository.find({
      order: {
        points: 'DESC',
      },
      take: 10,
    });
  }

  async postUserLoggedIn(userDto: UserDTO): Promise<User> {
    const user = new User();
    user.username = userDto.username;
    user.passwordHash = await this.passwordService.hashPassword(userDto.password);
    user.avatarPath = userDto.avatarPath;
    user.points = userDto.points;
    user.status = userDto.status;
    user.achievementsCSV = userDto.achievementsCSV;
    user.intraUsername = userDto.intraUsername;
    return this.userRepository.save(user);
  }

  async confirmUserLoggedIn(
    ftUserName: string,
    password: string,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({
      intraUsername: ftUserName,
    });
    if (this.passwordService.comparePassword(user.passwordHash, password)) {
      return user;
    }
    throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
  }

  async updateUserPassword(userId, password): Promise<User> {
    const user = await this.userRepository.findOneBy({ userID: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
	const psswd = await this.passwordService.hashPassword(password);
    await this.userRepository.update(userId, { passwordHash: psswd });

	return await this.userRepository.findOneBy({ userID: userId });
  }

  async saveAvatar(file: any): Promise<string> {
		const avatarDir = path.join(__dirname, '../public/avatars');
		const avatarPath = path.join(avatarDir, file.filename);
		return new Promise<string>((resolve, reject) => {
		const writeStream = createWriteStream(avatarPath);
		writeStream.on('finish', () => {
			resolve(avatarPath);
		});
		writeStream.on('error', (error) => {
			reject(error);
		});
		writeStream.write(file.buffer);
		writeStream.end();
		});
	}

}
