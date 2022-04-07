
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
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
    documentName: string;
    documentURL: string;
    courseId: string;
}

export interface UpdateCourseDocumentInput {
    id: string;
    documentType?: Nullable<string>;
    documentName?: Nullable<string>;
    documentURL?: Nullable<string>;
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

export interface CreateRoleInput {
    name: RoleName;
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
    documentName: string;
    documentURL: string;
    course: Course;
}

export interface IQuery {
    courses(): Nullable<Course>[] | Promise<Nullable<Course>[]>;
    course(id: string): Nullable<Course> | Promise<Nullable<Course>>;
    users(): Nullable<User>[] | Promise<Nullable<User>[]>;
    user(id: string): Nullable<User> | Promise<Nullable<User>>;
    roles(): Nullable<Role>[] | Promise<Nullable<Role>[]>;
    role(id: string): Nullable<Role> | Promise<Nullable<Role>>;
}

export interface IMutation {
    createCourse(createCourseInput: CreateCourseInput): Course | Promise<Course>;
    updateCourse(updateCourseInput: UpdateCourseInput): Course | Promise<Course>;
    removeCourse(id: string): Nullable<Course> | Promise<Nullable<Course>>;
    createChapter(createChapterInput?: Nullable<CreateChapterInput>): Chapter | Promise<Chapter>;
    updateChapter(updateChapterInput?: Nullable<UpdateChapterInput>): Chapter | Promise<Chapter>;
    removeChapter(id: string): Chapter | Promise<Chapter>;
    createSubChapter(createSubChapterInput?: Nullable<CreateSubChapterInput>): SubChapter | Promise<SubChapter>;
    updateSubChapter(updateSubChapterInput?: Nullable<UpdateSubChapterInput>): SubChapter | Promise<SubChapter>;
    removeSubChapter(id: string): SubChapter | Promise<SubChapter>;
    createCourseDocument(createCourseDocumentInput?: Nullable<CreateCourseDocumentInput>): CourseDocument | Promise<CourseDocument>;
    updateCourseDocument(updateCourseDocumentInput?: Nullable<UpdateCourseDocumentInput>): CourseDocument | Promise<CourseDocument>;
    removeCourseDocument(id: string): CourseDocument | Promise<CourseDocument>;
    createUser(createUserInput: CreateUserInput): User | Promise<User>;
    updateUser(updateUserInput: UpdateUserInput): User | Promise<User>;
    removeUser(id: string): Nullable<User> | Promise<Nullable<User>>;
    createRole(createRoleInput: CreateRoleInput): Role | Promise<Role>;
    revokeUserRole(userId: string, roleName: RoleName): User | Promise<User>;
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
    roles: Nullable<Role>[];
    courses?: Nullable<Nullable<Course>[]>;
}

export interface Role {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    name: RoleName;
    members: Nullable<User>[];
}

type Nullable<T> = T | null;
