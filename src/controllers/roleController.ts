import Role from '../models/role.model';

class RoleController {
  // Tạo role mặc định khi chạy ứng dụng
  async initializeDefaultRoles(): Promise<void> {
    const defaultRoles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'librarian', description: 'Librarian with medium access' },
      { name: 'user', description: 'Regular user with limited access' }
    ];

    for (const role of defaultRoles) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) {
        await Role.create(role);
        console.log(`Created default role: ${role.name}`);
      }
    }
  }
}

export default new RoleController();
