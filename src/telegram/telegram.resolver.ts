import { BadRequestException } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { switchMap } from 'rxjs'
import { AuthorizeTelegramInput } from 'src/graphql'
import { UsersService } from 'src/users/users.service'
import { TelegramAccount } from './entities/telegram-account.entity'
import { AUTHORIZED_COMMANDS, BotCommandScopeType } from './telegram.constants'
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
      const finalAccount = await this.telegramService.createAccount(newAccount)
      await new Promise((resolve, reject) => {
        this.telegramService
          .sendMessage({
            text: 'Successfully Authorized',
            chat_id: input.chatId,
          })
          .pipe(
            switchMap(sentMessage =>
              this.telegramService.setMyCommands({
                commands: AUTHORIZED_COMMANDS,
                scope: {
                  type: BotCommandScopeType.CHAT,
                  chat_id: sentMessage.chat.id,
                },
              }),
            ),
            switchMap(() =>
              this.telegramService.setChatMenuButton({
                chat_id: input.chatId,
              }),
            ),
          )
          .subscribe({
            next: result => resolve(result),
            error: error => reject(error),
          })
      })
      return finalAccount
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
