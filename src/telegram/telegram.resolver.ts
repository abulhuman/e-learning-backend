import { BadRequestException } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { AuthorizeTelegramInput } from 'src/graphql'
import { UsersService } from 'src/users/users.service'
import { TelegramAccount } from './entities/telegram-account.entity'
import { TelegramService } from './telegram.service'

@Resolver('TelegramAccount')
export class TelegramResolver {
  constructor(
    private telegramService: TelegramService,
    private usersService: UsersService,
  ) {}

  @Mutation('authorizeTelegram')
  async authorizeTelegram(
    @Args('authorizeTelegramInput') input: AuthorizeTelegramInput,
  ) {
    const telegramAccount = await this.telegramService.findOneById(
      input.telegramId,
    )
    if (telegramAccount !== undefined) {
      throw new BadRequestException('Account already authorized')
    }
    try {
      const newAccount = await new Promise<TelegramAccount>((resolve, reject) =>
        this.telegramService
          .getChatMember({
            chat_id: input.chatId,
            user_id: input.telegramId,
          })
          .subscribe({
            next: member => resolve(member.user),
            error: error => reject(error),
          }),
      )
      newAccount.user = await this.usersService.findOneUserById(input.userId)
      return this.telegramService.createAccount(newAccount)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
