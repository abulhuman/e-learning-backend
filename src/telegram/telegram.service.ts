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
  map,
  mergeMap,
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
import { Repository } from 'typeorm'
import { UpdateDispatcher } from './dispatchers/update.dispatcher'
import * as Telegram from './dtos'
import {
  ChatMember,
  GetChatMemberParams,
  GetUpdatesParams,
  SendMessageParams,
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
