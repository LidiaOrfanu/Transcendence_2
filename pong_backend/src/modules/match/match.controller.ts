import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { MatchService } from './match.service';
import { Match } from 'src/models/orm_models/match.entity';
import { MatchDTO } from './matchDTO';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a match' })
  async createMatch(@Body() matchDto: MatchDTO,
  @Param('player1Id') p1Id: number,
  @Param('player2Id') p2Id: number
  ): Promise<Match> {
    return this.matchService.createMatch(matchDto, p1Id, p2Id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all matches' })
  async getAllMatches(): Promise<Match[]> {
    return this.matchService.getAllMatches();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get match by id' })
  async getMatchById(@Param('id') matchId: number): Promise<Match> {
    return this.matchService.getMatchById(matchId);
  }

  // @Get('user/:userId')
  // async getMatchesByUser(@Param('userId') userId: number): Promise<Match[]> {
  //   return this.matchService.getMatchesByUser(userId);
  // }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a match by matchId' })
  async deleteMatch(@Param('id') matchId: number): Promise<void> {
    return this.matchService.deleteMatch(matchId);
  }
}
