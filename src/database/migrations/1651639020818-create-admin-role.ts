import { Role } from 'src/users/entities/role.entity'
import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'
import { ADMIN_ROLE_SEED } from '../seeds/role.seed'

export class createAdminRole1651639020818 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = getRepository(Role)
    let adminRole = await roleRepository.findOne(ADMIN_ROLE_SEED)
    if (adminRole === undefined) {
      adminRole = roleRepository.create(ADMIN_ROLE_SEED)
      await roleRepository.save(adminRole)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = getRepository(Role)
    await roleRepository.delete(ADMIN_ROLE_SEED)
  }
}
