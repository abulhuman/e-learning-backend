
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum NotificationType {
    COURSE_ADDITION = "COURSE_ADDITION"
}

export enum NotificationStatus {
    UNREAD = "UNREAD",
    READ = "READ",
    ARCHIVED = "ARCHIVED"
}

export enum RoleName {
    DEV = "DEV",
    ADMINISTRATOR = "ADMINISTRATOR",
    DEPARTMENT_ADMINSTRATOR = "DEPARTMENT_ADMINSTRATOR",
    TEACHER = "TEACHER",
    STUDENT = "STUDENT",
    COURSE_MANAGER = "COURSE_MANAGER",
    COURSE_OWNER = "COURSE_OWNER",
    COURSE_TEACHER = "COURSE_TEACHER"
}

export interface CreateCourseInput {
    code: string;
    name: string;
    description: string;
    overview: string;
    creditHour: number;
}

export interface UpdateCourseInput {
    id: string;
    code?: Nullable<string>;
    name?: Nullable<string>;
    description?: Nullable<string>;
    overview?: Nullable<string>;
    creditHour?: Nullable<number>;
}

export interface CreateChapterInput {
    title: string;
    sequenceNumber: number;
    courseId: string;
}

export interface UpdateChapterInput {
    id: string;
    title?: Nullable<string>;
    sequenceNumber?: Nullable<number>;
}

export interface CreateSubChapterInput {
    title: string;
    sequenceNumber: number;
    chapterId: string;
}

export interface UpdateSubChapterInput {
    id: string;
    title?: Nullable<string>;
    sequenceNumber?: Nullable<number>;
}

export interface CreateCourseDocumentInput {
    documentType: string;
    documentDisplayName: string;
    fileUpload: Upload;
    courseId: string;
}

export interface UpdateCourseDocumentInput {
    id: string;
    documentType?: Nullable<string>;
    documentDisplayName?: Nullable<string>;
    fileUpload?: Nullable<Upload>;
}

export interface CreateNotificationInput {
    data: string;
    type: NotificationType;
    recipientId: string;
}

export interface UpdateNotificationInput {
    id: string;
    text?: Nullable<string>;
    status?: Nullable<NotificationStatus>;
}

export interface UuidArrayDto {
    ids?: Nullable<Nullable<string>[]>;
}

export interface AuthorizeTelegramInput {
    userId: string;
    telegramId: string;
    chatId: string;
}

export interface CreateUserInput {
    firstName: string;
    middleName: string;
    lastName: string;
    roleName: RoleName;
    email: string;
    password: string;
}

export interface UpdateUserInput {
    id: string;
    firstName?: Nullable<string>;
    middleName?: Nullable<string>;
    lastName?: Nullable<string>;
    email?: Nullable<string>;
    password?: Nullable<string>;
    roleName?: Nullable<RoleName>;
}

export interface CreateStudentClassInput {
    year: string;
    section: string;
    departmentId: string;
}

export interface UpdateStudentClassInput {
    id: string;
    year?: Nullable<string>;
    section?: Nullable<string>;
}

export interface CreateRoleInput {
    name: RoleName;
}

export interface CreateAssignmentDefinitionInput {
    submissionDeadline: Date;
    instructionsFileId: string;
    courseId: string;
}

export interface UpdateAssignmentDefinitionInput {
    id: string;
    submissionDeadline?: Nullable<Date>;
    instructionsFileId?: Nullable<string>;
}

export interface CreateAssignmentSubmissionInput {
    submissionDate: Date;
    submissionFileId: string;
    definitionId: string;
    studentId: string;
    replaceFile?: Nullable<boolean>;
}

export interface UpdateAssignmentSubmissionInput {
    id: string;
    submissionDate?: Nullable<Date>;
    submissionFileId?: Nullable<string>;
    replaceFile?: Nullable<boolean>;
}

export interface UUIDArrayDto {
    ids?: Nullable<Nullable<string>[]>;
}

export interface Course {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    code: string;
    name: string;
    description: string;
    overview: string;
    creditHour: number;
    users?: Nullable<Nullable<User>[]>;
    chapters: Nullable<Chapter>[];
    courseDocuments: Nullable<CourseDocument>[];
    assignmentDefinitions?: Nullable<Nullable<AssignmentDefinition>[]>;
}

export interface Chapter {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    title: string;
    sequenceNumber: number;
    course: Course;
    subChapters: Nullable<SubChapter>[];
}

export interface SubChapter {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    title: string;
    sequenceNumber: number;
    chapter: Chapter;
}

export interface CourseDocument {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    documentType: string;
    documentDisplayName: string;
    storedFileName: string;
    course: Course;
    assignmentDefinition?: Nullable<AssignmentDefinition>;
    assignmentSubmission?: Nullable<AssignmentSubmission>;
}

export interface IQuery {
    courses(): Nullable<Course>[] | Promise<Nullable<Course>[]>;
    course(id: string): Nullable<Course> | Promise<Nullable<Course>>;
    notifications(): Nullable<Notification>[] | Promise<Nullable<Notification>[]>;
    notification(id: string): Nullable<Notification> | Promise<Nullable<Notification>>;
    users(): Nullable<User>[] | Promise<Nullable<User>[]>;
    user(id: string): Nullable<User> | Promise<Nullable<User>>;
    roles(): Nullable<Role>[] | Promise<Nullable<Role>[]>;
    role(id: string): Nullable<Role> | Promise<Nullable<Role>>;
    studentClasses(): Nullable<StudentClass>[] | Promise<Nullable<StudentClass>[]>;
    studentClass(id: string): StudentClass | Promise<StudentClass>;
    assignmentDefinitions(courseId: string): Nullable<AssignmentDefinition>[] | Promise<Nullable<AssignmentDefinition>[]>;
    assignmentDefinition(id: string): Nullable<AssignmentDefinition> | Promise<Nullable<AssignmentDefinition>>;
    assignmentSubmissions(assignmentDefinitionId: string): Nullable<AssignmentSubmission>[] | Promise<Nullable<AssignmentSubmission>[]>;
    assignmentSubmission(id: string): Nullable<AssignmentSubmission> | Promise<Nullable<AssignmentSubmission>>;
    getAllStudentsByClassId(classId: string): Nullable<Nullable<User>[]> | Promise<Nullable<Nullable<User>[]>>;
    departments(): Nullable<Department>[] | Promise<Nullable<Department>[]>;
    department(id: string): Department | Promise<Department>;
}

export interface IMutation {
    createCourse(createCourseInput: CreateCourseInput): Course | Promise<Course>;
    updateCourse(updateCourseInput: UpdateCourseInput): Course | Promise<Course>;
    removeCourse(id: string): Nullable<Course> | Promise<Nullable<Course>>;
    assignUserToCourse(courseId: string, userId: string): boolean | Promise<boolean>;
    unassignUserFromCourse(courseId: string, userId: string): boolean | Promise<boolean>;
    createChapter(createChapterInput?: Nullable<CreateChapterInput>): Chapter | Promise<Chapter>;
    updateChapter(updateChapterInput?: Nullable<UpdateChapterInput>): Chapter | Promise<Chapter>;
    removeChapter(id: string): Chapter | Promise<Chapter>;
    createSubChapter(createSubChapterInput?: Nullable<CreateSubChapterInput>): SubChapter | Promise<SubChapter>;
    updateSubChapter(updateSubChapterInput?: Nullable<UpdateSubChapterInput>): SubChapter | Promise<SubChapter>;
    removeSubChapter(id: string): SubChapter | Promise<SubChapter>;
    createCourseDocument(createCourseDocumentInput?: Nullable<CreateCourseDocumentInput>): CourseDocument | Promise<CourseDocument>;
    updateCourseDocument(updateCourseDocumentInput?: Nullable<UpdateCourseDocumentInput>): CourseDocument | Promise<CourseDocument>;
    removeCourseDocument(id: string): CourseDocument | Promise<CourseDocument>;
    createNotification(createNotificationInput: CreateNotificationInput): Notification | Promise<Notification>;
    updateNotification(updateNotificationInput: UpdateNotificationInput): Notification | Promise<Notification>;
    removeNotification(id: string): Nullable<Notification> | Promise<Nullable<Notification>>;
    authorizeTelegram(authorizeTelegramInput: AuthorizeTelegramInput): TelegramAccount | Promise<TelegramAccount>;
    createUser(createUserInput: CreateUserInput): User | Promise<User>;
    updateUser(updateUserInput: UpdateUserInput): User | Promise<User>;
    removeUser(id: string): Nullable<User> | Promise<Nullable<User>>;
    createRole(createRoleInput: CreateRoleInput): Role | Promise<Role>;
    revokeUserRole(userId: string, roleName: RoleName): User | Promise<User>;
    createStudentClass(createStudentClassInput: CreateStudentClassInput): StudentClass | Promise<StudentClass>;
    updateStudentClass(updateStudentClassInput: UpdateStudentClassInput): StudentClass | Promise<StudentClass>;
    removeStudentClass(id: string): StudentClass | Promise<StudentClass>;
    admitStudentToClass(studentId: string, classId: string): boolean | Promise<boolean>;
    admitStudentsToClass(studentIds: UuidArrayDto, classId: string): boolean | Promise<boolean>;
    assignTeacherToClass(teacherId: string, classId: string): boolean | Promise<boolean>;
    promoteStudentFromClass(studentId: string, classId: string): boolean | Promise<boolean>;
    promoteStudentsFromClass(studentIds: UuidArrayDto, classId: string): boolean | Promise<boolean>;
    dismissTeacherFromClass(teacherId: string, classId: string): boolean | Promise<boolean>;
    createAssignmentDefinition(createAssignmentDefinitionInput: CreateAssignmentDefinitionInput): AssignmentDefinition | Promise<AssignmentDefinition>;
    updateAssignmentDefinition(updateAssignmentDefinitionInput: UpdateAssignmentDefinitionInput): AssignmentDefinition | Promise<AssignmentDefinition>;
    removeAssignmentDefinition(id: string): Nullable<boolean> | Promise<Nullable<boolean>>;
    createAssignmentSubmission(createAssignmentSubmissionInput: CreateAssignmentSubmissionInput): AssignmentSubmission | Promise<AssignmentSubmission>;
    updateAssignmentSubmission(updateAssignmentSubmissionInput: UpdateAssignmentSubmissionInput): AssignmentSubmission | Promise<AssignmentSubmission>;
    removeAssignmentSubmission(id: string): boolean | Promise<boolean>;
    createDepartment(name: string): Department | Promise<Department>;
    updateDepartment(id: string, name?: Nullable<string>): Department | Promise<Department>;
    removeDepartment(id: string): Nullable<Department> | Promise<Nullable<Department>>;
    addClassToDepartment(departmentId: string, classId: string): boolean | Promise<boolean>;
    removeClassFromDepartment(departmentId: string, classId: string): boolean | Promise<boolean>;
    appointDepartmentAdministrator(departmentId: string, userId: string): boolean | Promise<boolean>;
    dismissDepartmentAdministrator(departmentId: string, userId: string): boolean | Promise<boolean>;
}

export interface Notification {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    data: string;
    type: NotificationType;
    status?: Nullable<NotificationStatus>;
    recipient: User;
}

export interface ISubscription {
    onSubscribe(recipientId: string): Nullable<Notification>[] | Promise<Nullable<Notification>[]>;
}

export interface TelegramAccount {
    id: string;
    first_name: string;
    user: User;
}

export interface User {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    password: string;
    attendingClass?: Nullable<StudentClass>;
    learningClasses?: Nullable<Nullable<StudentClass>[]>;
    roles: Nullable<Role>[];
    courses?: Nullable<Nullable<Course>[]>;
    notifications?: Nullable<Nullable<Notification>[]>;
    department?: Nullable<Department>;
    assignmentSubmissions?: Nullable<Nullable<AssignmentSubmission>[]>;
}

export interface StudentClass {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    year: string;
    section: string;
    teachers?: Nullable<Nullable<User>[]>;
    students?: Nullable<Nullable<User>[]>;
    department?: Nullable<Department>;
}

export interface Role {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    name: RoleName;
    members: Nullable<User>[];
}

export interface AssignmentDefinition {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    submissionDeadline: Date;
    instructionsFile: CourseDocument;
    submissions?: Nullable<Nullable<AssignmentSubmission>[]>;
    course: Course;
}

export interface AssignmentSubmission {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    submissionDate: Date;
    submissionFile: CourseDocument;
    definition: AssignmentDefinition;
    submittedBy: User;
}

export interface Department {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    name: string;
    classes?: Nullable<Nullable<StudentClass>[]>;
    departmentAdministrator?: Nullable<User>;
}

export type Upload = any;
type Nullable<T> = T | null;
