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
import { ReadStream } from 'fs'
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
import { AssignmentDefinition } from 'src/assignment/entities/assignment-definition.entity'
import { FindConditions, Repository } from 'typeorm'
import { UpdateDispatcher } from './dispatchers/update.dispatcher'
import * as Telegram from './dtos'
import {
  AnswerCallbackParams,
  ChatMember,
  EditMessageParams,
  File,
  GetChatMemberParams,
  GetUpdatesParams,
  SendDocumentParams,
  SendMessageParams,
  SetMenuButtonParams,
  SetMyCommandsParams,
  TextMessage,
  Update,
} from './dtos'
import { TelegramAccount } from './entities/telegram-account.entity'
import { TelegramModule } from './telegram.module'

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramModule.name)
  private apiURL: string
  private downloadURL: string
  private offset: number
  private $updateSubscription: Subscription

  constructor(
    private appService: AppService,
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(TelegramAccount)
    private telegramAccountRepo: Repository<TelegramAccount>,
    @InjectRepository(AssignmentDefinition)
    private assignmentDefinitionRepo: Repository<AssignmentDefinition>,
    @Inject(forwardRef(() => UpdateDispatcher))
    private dispatcher: UpdateDispatcher,
  ) {
    this.apiURL = `${this.configService.get(
      'TELEGRAM_API_URL',
    )}/bot${this.configService.get('BOT_KEY')}`
    this.downloadURL = `${this.configService.get(
      'TELEGRAM_API_URL',
    )}/file/bot${this.configService.get('BOT_KEY')}`
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

  findAssignmentsForUser(userId: string) {
    return this.assignmentDefinitionRepo
      .createQueryBuilder('assignment')
      .leftJoin('assignment.course', 'course')
      .leftJoin('course.users', 'user')
      .where('user.id = :id', { id: userId })
      .getMany()
  }

  findOneByUserId(userId: string) {
    return this.findOne({
      user: {
        id: userId,
      },
    })
  }

  async setAsSubmitting(userId: string, assignmentId: string) {
    const account = await this.findOne({ id: userId })
    const assignment = await this.assignmentDefinitionRepo.findOne({
      id: assignmentId,
    })
    account.pendingSubmission = assignment
    return this.telegramAccountRepo.save(account)
  }

  async cancelSubmission(userId: string) {
    return this.findOne({ id: userId }).then(account => {
      account.pendingSubmission = null
      return this.telegramAccountRepo.save(account)
    })
  }

  private findOne(user: FindConditions<TelegramAccount>, withUser = false) {
    return this.telegramAccountRepo.findOne(user, {
      relations: withUser ? ['user'] : undefined,
    })
  }

  editMessageText(params: EditMessageParams) {
    return this.telegramApiCall<TextMessage>(this.editMessageText.name, params)
  }

  createAccount(account: TelegramAccount, chat_id: string) {
    account.chat_id = chat_id
    return this.telegramAccountRepo.save(account)
  }

  getChatMember(params: GetChatMemberParams) {
    return this.telegramApiCall<ChatMember>(this.getChatMember.name, params)
  }

  sendMessage(params: SendMessageParams) {
    return this.telegramApiCall<TextMessage>(this.sendMessage.name, params)
  }

  sendDocument(params: SendDocumentParams) {
    return this.telegramApiCall<TextMessage>(this.sendDocument.name, params)
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

  getFile(file_id: string) {
    return this.telegramApiCall<File>(this.getFile.name, { file_id })
  }

  onModuleDestroy() {
    this.$updateSubscription?.unsubscribe()
  }

  private getUpdates(params?: GetUpdatesParams): Observable<Update[]> {
    return this.telegramApiCall<Update[]>(this.getUpdates.name, params)
  }

  downloadFile(file_path): Observable<ReadStream> {
    return this.httpService
      .get(`${this.downloadURL}/${file_path}`, { responseType: 'blob' })
      .pipe(map((response: AxiosResponse<ReadStream>) => response.data))
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
