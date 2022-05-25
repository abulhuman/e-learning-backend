import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CourseService } from 'src/course/course.service'
import { Repository } from 'typeorm'
import { CreateAssignmentDefinitionInput } from '../dto/create-assignment-definition.input'
import { UpdateAssignmentDefinitionInput } from '../dto/update-assignment-definition.input'
import { AssignmentDefinition } from '../entities/assignment-definition.entity'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import * as moment from 'moment'
import { TelegramService } from 'src/telegram/telegram.service'
import { MailService } from 'src/mail/mail.service'
import { FormattingOption } from 'src/telegram/telegram.constants'

@Injectable()
export class AssignmentDefinitionService {
  private logger = new Logger(AssignmentDefinition.name)
  constructor(
    @InjectRepository(AssignmentDefinition)
    private readonly assignmentDefinitionRepository: Repository<AssignmentDefinition>,
    @Inject(CourseService)
    private readonly courseService: CourseService,
    private scheduler: SchedulerRegistry,
    private telegramService: TelegramService,
    private mailService: MailService,
  ) {}
  async createAssignmentDefinition(
    createAssignmentDefinitionInput: CreateAssignmentDefinitionInput,
  ) {
    const { courseId, instructionsFileId } = createAssignmentDefinitionInput
    delete createAssignmentDefinitionInput.courseId
    delete createAssignmentDefinitionInput.instructionsFileId
    const newAssignmentDefinition = this.assignmentDefinitionRepository.create(
      createAssignmentDefinitionInput,
    )
    const course = await this.courseService.findOneCourse(courseId)

    const instructionsFile = await this.courseService.findOneCourseDocument(
      instructionsFileId,
    )

    Object.assign(newAssignmentDefinition, { course, instructionsFile })

    const assignment = await this.assignmentDefinitionRepository.save(
      newAssignmentDefinition,
    )
    await this.scheduleNotification(assignment)
    return assignment
  }

  async scheduleNotification(assignment: AssignmentDefinition) {
    const deadline = moment(assignment.submissionDeadline)
    const notificationTime = deadline.clone().subtract(1, 'day')
    const diffFromNow = notificationTime.diff(moment())
    // if notification time is ahead of current time, schedule notification
    if (diffFromNow) {
      const users = await this.courseService.findUsersWithAccounts(
        assignment.course.id,
      )
      const notificationTimeString = notificationTime
        .format('s m H D MMM')
        .concat(' *')
      const job = new CronJob(notificationTimeString, () => {
        const humanTime = deadline.calendar(moment())
        users.forEach(user => {
          this.mailService.sendAssignmentDeadlineReminder(
            user,
            assignment,
            humanTime,
          )
          this.telegramService.findOneByUserId(user.id).then(account => {
            this.telegramService
              .sendMessage({
                text: `<b>❗Reminder</b>\nAssignmment <b>${
                  assignment.name
                }</b> is due <b>${humanTime.toLowerCase()}</b>`,
                chat_id: account.chat_id,
                parse_mode: FormattingOption.HTML,
              })
              .subscribe({
                error: error => this.logger.error(error),
              })
          })
        })
      })
      this.scheduler.addCronJob(assignment.id, job)
      job.start()
    }
  }

  findAllAssignmentDefinitions(courseId: string) {
    return this.assignmentDefinitionRepository.find({
      relations: ['course', 'instructionsFile', 'submissions'],
      where: {
        course: {
          id: courseId,
        },
      },
    })
  }
  async findOneAssignmentDefinition(id: string) {
    const assignmentDefinition =
      await this.assignmentDefinitionRepository.findOne(id, {
        relations: ['course', 'instructionsFile', 'submissions'],
      })
    if (!assignmentDefinition)
      throw new NotFoundException(
        `Assignment definition with id: ${id} was not found.`,
      )
    return assignmentDefinition
  }
  async updateAssignmentDefinition(
    id: string,
    updateAssignmentDefinitionInput: UpdateAssignmentDefinitionInput,
  ) {
    const assignmentDefinitionToUpdate = await this.findOneAssignmentDefinition(
      id,
    )
    for (const key in updateAssignmentDefinitionInput)
      if (!updateAssignmentDefinitionInput[key])
        delete updateAssignmentDefinitionInput[key]
    const { instructionsFileId } = updateAssignmentDefinitionInput
    delete updateAssignmentDefinitionInput.instructionsFileId

    const instructionsFileToReplace =
      await this.courseService.findOneCourseDocument(instructionsFileId)
    Object.assign(assignmentDefinitionToUpdate, {
      ...updateAssignmentDefinitionInput,
      instructionsFile: instructionsFileToReplace,
    })
    return this.assignmentDefinitionRepository.save(
      assignmentDefinitionToUpdate,
    )
  }

  async removeAssignmentDefinition(id: string) {
    const assignmentDefinitionToRemove = await this.findOneAssignmentDefinition(
      id,
    )
    return (
      this.assignmentDefinitionRepository
        .remove(assignmentDefinitionToRemove)
        .then(res => {
          return !!res
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }
}
