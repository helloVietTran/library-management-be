import Role from '../models/role.model';
import { IRole, UserRole } from '../interfaces/common';
import Logger from '../config/logger';
import { AppError } from '../config/error';

type PickedRole = Pick<IRole, 'name' | 'description'>;

class RoleService {
  private readonly roles: PickedRole[] = [
    { name: UserRole.ADMIN, description: 'Administrator with full access' },
    { name: UserRole.LIBRARIAN, description: 'Librarian with medium access' },
    { name: UserRole.USER, description: 'Regular user with limited access' }
  ];

  async initializeDefaultRoles(): Promise<void> {
    for (const role of this.roles) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) {
        await Role.create(role);
        Logger.info(`Created default role: ${role.name}`);
      }
    }
  }

  async findByName(roleName: UserRole): Promise<IRole> {
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw AppError.from(new Error('Role not found'), 404).withMessage('Không tìm thấy vai trò');
    }
    return role;
  }
}

export const roleService = new RoleService();
