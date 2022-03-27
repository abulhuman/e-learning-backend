
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

export interface CreateUserInput {
    firstName: string;
    middleName: string;
    lastName: string;
    roleName: RoleName;
}

export interface UpdateUserInput {
    id: string;
    firstName?: Nullable<string>;
    middleName?: Nullable<string>;
    lastName?: Nullable<string>;
    roleName?: Nullable<RoleName>;
}

export interface CreateRoleInput {
    name: RoleName;
}

export interface UpdateRoleInput {
    id: string;
    name?: Nullable<RoleName>;
}

export interface User {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    firstName: string;
    middleName: string;
    lastName: string;
    roles: Nullable<Role>[];
}

export interface IQuery {
    users(): Nullable<User>[] | Promise<Nullable<User>[]>;
    user(id: string): Nullable<User> | Promise<Nullable<User>>;
    roles(): Nullable<Role>[] | Promise<Nullable<Role>[]>;
    role(id: string): Nullable<Role> | Promise<Nullable<Role>>;
}

export interface IMutation {
    createUser(createUserInput: CreateUserInput): User | Promise<User>;
    updateUser(updateUserInput: UpdateUserInput): User | Promise<User>;
    removeUser(id: string): Nullable<User> | Promise<Nullable<User>>;
    createRole(createRoleInput: CreateRoleInput): Role | Promise<Role>;
    revokeUserRole(userId: string, roleName: RoleName): User | Promise<User>;
}

export interface Role {
    id: string;
    created_at: Date;
    updated_at?: Nullable<Date>;
    name: RoleName;
    members: Nullable<User>[];
}

type Nullable<T> = T | null;
