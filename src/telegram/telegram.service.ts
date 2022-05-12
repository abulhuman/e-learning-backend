import { HttpService } from '@nestjs/axios'
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  catchError,
  from,
  map,
  mergeMap,
  Observable,
  of,
  repeat,
  retry,
  Subscription,
  tap,
  throwError,
} from 'rxjs'
import { AppService } from 'src/app/app.service'
import { Repository } from 'typeorm'
import * as Telegram from './dtos'
import {
  ChatMember,
  GetChatMemberParams,
  GetUpdatesParams,
  MessageEntity,
  MessageUpdate,
  SendMessageParams,
  Update,
} from './dtos'
import { TelegramAccount } from './entities/telegram-account.entity'
import { Command, MessageEntityType } from './telegram.constants'
import { TelegramModule } from './telegram.module'

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramModule.name)
  private apiURL: string
  private offset: number
  private $updateSubscription: Subscription

  constructor(
    private appService: AppService,
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(TelegramAccount)
    private telegramAccountRepo: Repository<TelegramAccount>,
  ) {
    this.apiURL = this.configService
      .get<string>('TELEGRAM_API_URL')
      .concat(this.configService.get('BOT_KEY'))
  }
  onModuleInit() {
    if (this.appService.isInProduction) {
      this.logger.log('Listening on Webhook')
    } else {
      this.$updateSubscription = of({})
        .pipe(
          mergeMap(() =>
            this.getUpdates({
              offset: this.offset,
            }),
          ),
          tap(updates => {
            if (updates.length) {
              const lastUpdateId = updates.at(-1).update_id + 1
              this.offset = lastUpdateId
            }
          }),
          repeat(),
          retry(3),
        )
        .subscribe({
          next: updates => this.dispatcher(updates),
          error: error => this.logger.error(error.message),
        })
    }
  }
  dispatcher(updates: Update[]): void {
    from(updates)
      .pipe(
        map(update => {
          if (update.hasOwnProperty('message')) {
            update.type = 'message'
          }
          return update
        }),
      )
      .subscribe({
        next: update => {
          switch (update.type) {
            case 'message':
              this.messageDispatcher(update as MessageUpdate)
              break
          }
        },
      })
  }
  messageDispatcher(update: MessageUpdate) {
    const { message } = update
    let commandEntity: MessageEntity
    if (
      (commandEntity = update.message.entities.find(
        update => update.type === MessageEntityType.COMMAND,
      ))
    ) {
      const rawCommand = update.message.text.substring(
        commandEntity.offset,
        commandEntity.length,
      )
      const [command, ...payload] = rawCommand.split(' ')

      switch (command) {
        case Command.START:
          const isAuthorized = payload.join('') === update.message.from.id
          if (isAuthorized) {
            return this.sendMessage({
              text: 'Successfully Authorized',
              chat_id: message.chat.id,
            }).subscribe()
          } else {
            from(this.accountExists(update.message.from.id))
              .pipe(
                map(account => {
                  if (account === undefined) {
                    return {
                      text: `Welcome ${update.message.from.first_name}. \n Please authorize your E-Learning account below`,
                      reply_markup: {
                        inline_keyboard: [
                          [
                            {
                              text: 'Authorize 🔒',
                              url: `${this.configService.get(
                                'TELEGRAM_AUTH_URL',
                              )}?userId=${update.message.from.id}&chatId=${
                                update.message.chat.id
                              }&name=${update.message.from.first_name}`,
                            },
                          ],
                        ],
                      },
                    }
                  } else {
                    return {
                      text: `Welcome back ${message.from.first_name}`,
                    }
                  }
                }),
              )
              .subscribe({
                next: message =>
                  this.sendMessage({
                    ...message,
                    chat_id: update.message.chat.id,
                  }).subscribe(),
              })
          }
          break
        default:
          this.sendMessage({
            text: 'Unknown Command',
            chat_id: message.chat.id,
          })
          break
      }
    }
  }

  accountExists(id: string) {
    return this.telegramAccountRepo.findOne({ id })
  }

  createAccount(account: TelegramAccount) {
    return this.telegramAccountRepo.save(account)
  }

  getChatMember(params: GetChatMemberParams) {
    return this.telegramApiCall<ChatMember>(this.getChatMember.name, params)
  }

  sendMessage(params: SendMessageParams) {
    return this.telegramApiCall(this.sendMessage.name, params)
  }

  onModuleDestroy() {
    this.$updateSubscription?.unsubscribe()
  }

  private getUpdates(params?: GetUpdatesParams): Observable<Update[]> {
    return this.telegramApiCall<Update[]>(this.getUpdates.name, params)
  }

  private telegramApiCall<T>(
    endpoint: string,
    data?: any,
    requestConfig?: AxiosRequestConfig,
  ): Observable<T> {
    return this.httpService
      .post(`${this.apiURL}/${endpoint}`, data, requestConfig)
      .pipe(
        map((response: AxiosResponse<Telegram.Response>) => {
          return response.data.result
        }),
        catchError(error => {
          if (error?.isAxiosError) {
            const axiosError = error as AxiosError<Telegram.Response>
            const { data } = axiosError.response
            return throwError(
              () => new Error(`${data.error_code}: ${data.description}`),
            )
          }
          return throwError(() => error)
        }),
      )
  }
}
