export type UserRole = '管理员' | '内训师' | '学员';

export type UserStatus = '启用' | '停用';

export type SystemUser = {
  id: string;
  name: string;
  account: string;
  phone: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  createdAt: string;
};

export const mockUsers: SystemUser[] = [
  {
    id: '1',
    name: '刘楚涵',
    account: 'liuchuhan',
    phone: '138****0001',
    role: '内训师',
    department: '省公司人力资源部',
    status: '启用',
    createdAt: '2025-06-12',
  },
  {
    id: '2',
    name: '王建明',
    account: 'wangjm',
    phone: '139****0002',
    role: '管理员',
    department: '信息技术部',
    status: '启用',
    createdAt: '2025-04-01',
  },
  {
    id: '3',
    name: '李晓云',
    account: 'lixy',
    phone: '137****0003',
    role: '内训师',
    department: '市场部',
    status: '启用',
    createdAt: '2025-08-20',
  },
  {
    id: '4',
    name: '陈志远',
    account: 'chenzy',
    phone: '136****0004',
    role: '学员',
    department: '地市分公司',
    status: '停用',
    createdAt: '2024-11-05',
  },
];

export const roleOptions: UserRole[] = ['管理员', '内训师', '学员'];
