import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/models/orm_models/friend.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/models/orm_models/user.entity';
import { UserService } from '../user/userservice';

export class FriendRepository extends Repository<Friend> {}

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
	private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Friend[]> {
    return this.friendRepository.find();
  }

  async findOne(id: number): Promise<Friend> {
    return this.friendRepository.findOneBy({ FId: id });
  }

  async remove(id: number): Promise<void> {
    await this.friendRepository.delete(id);
  }


async findUserFriends(userId: number): Promise<Friend[]> {
	const result = await this.friendRepository
	  .createQueryBuilder('friend')
	  .leftJoinAndSelect('friend.friendUser', 'friendUser')
	  .where('friend.user.userID = :userId', { userId })
	  .getMany();

	return result;
  }
  

  async findFriendById(userId: number, friendId: number): Promise<User> {
	const result = await this.friendRepository
		.createQueryBuilder('friend')
		.leftJoinAndSelect('friend.friendUser', 'friendUser')
		.where('friend.user.userID = :userId', { userId })
		.andWhere('friendUser.userID = :friendId', { friendId })
		.getMany();

	return result[0].friendUser;
  }

  async getFriendStatus(userId: number, friendId: number): Promise<string> {
	const result = (await this.findFriendById(userId, friendId)).status;
	return result;
  }

  async getFriendsStatuses(userId: number): Promise<string[]> {
	const result = [];
	const friends = await this.findUserFriends(userId);

	for (const friend of friends) {
		result.push(friend.friendUser.status);
	}

	return result;
  }
}
