import { Role } from 'src/users/entities/role.entity'
import { User } from 'src/users/entities/user.entity'
import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'
import { ADMIN_USER_SEED } from '../seeds/user.seed'
import * as bcrypt from 'bcrypt'
import { ADMIN_ROLE_SEED } from '../seeds/role.seed'

export class seedAdminUser1651639354326 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = getRepository(Role)
    const userRepository = getRepository(User)

    let admin = await userRepository.findOne(ADMIN_USER_SEED)
    if (admin === undefined) {
      admin = userRepository.create(ADMIN_USER_SEED)
      admin.password = await bcrypt.hash('12345678', 10)
      admin.roles = [await roleRepository.findOne(ADMIN_ROLE_SEED)]
      await userRepository.save(admin)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {
    const userRepository = getRepository(User)
    await userRepository.delete(ADMIN_USER_SEED)
  }
}
