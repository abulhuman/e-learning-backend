import { HttpService } from '@nestjs/axios'
import {
  forwardRef,
  Inject,
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
  map,
  Observable,
  of,
  repeat,
  retry,
  Subscription,
  switchMap,
  tap,
  throwError,
} from 'rxjs'
import { AppService } from 'src/app/app.service'
import { FindConditions, Repository } from 'typeorm'
import { UpdateDispatcher } from './dispatchers/update.dispatcher'
import * as Telegram from './dtos'
import {
  AnswerCallbackParams,
  ChatMember,
  GetChatMemberParams,
  GetUpdatesParams,
  Message,
  SendDocumentParams,
  SendMessageParams,
  SetMenuButtonParams,
  SetMyCommandsParams,
  Update,
} from './dtos'
import { TelegramAccount } from './entities/telegram-account.entity'
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
    @Inject(forwardRef(() => UpdateDispatcher))
    private dispatcher: UpdateDispatcher,
  ) {
    this.apiURL = this.configService
      .get<string>('TELEGRAM_API_URL')
      .concat(this.configService.get('BOT_KEY'))
  }
  onModuleInit() {
    if (this.appService.isInProduction) {
      this.logger.log('Listening on Webhook')
    } else if (this.configService.get<boolean>('ENABLE_POLLING')) {
      this.$updateSubscription = of({})
        .pipe(
          switchMap(() =>
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
          next: updates => this.dispatcher.dispatch(updates),
          error: error => this.logger.error(error.message),
        })
    }
  }

  findOneById(id: string, withUser = false) {
    return this.findOne({ id }, withUser)
  }

  findOneByUserId(userId: string) {
    return this.findOne({
      user: {
        id: userId,
      },
    })
  }

  private findOne(user: FindConditions<TelegramAccount>, withUser = false) {
    return this.telegramAccountRepo.findOne(user, {
      relations: withUser ? ['user'] : undefined,
    })
  }

  createAccount(account: TelegramAccount, chat_id: string) {
    account.chat_id = chat_id
    return this.telegramAccountRepo.save(account)
  }

  getChatMember(params: GetChatMemberParams) {
    return this.telegramApiCall<ChatMember>(this.getChatMember.name, params)
  }

  sendMessage(params: SendMessageParams) {
    return this.telegramApiCall<Message>(this.sendMessage.name, params)
  }

  sendDocument(params: SendDocumentParams) {
    return this.telegramApiCall<Message>(this.sendDocument.name, params)
  }

  setMyCommands(params: SetMyCommandsParams) {
    return this.telegramApiCall<boolean>(this.setMyCommands.name, params)
  }

  answerCallbackQuery(params: AnswerCallbackParams) {
    return this.telegramApiCall<boolean>(this.answerCallbackQuery.name, params)
  }

  setChatMenuButton(params: SetMenuButtonParams) {
    return this.telegramApiCall<boolean>(this.setChatMenuButton.name, params)
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
          if (error?.isAxiosError && error?.response) {
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
