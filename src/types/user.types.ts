export type UserRole = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
export type IsActive = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  picture?: string;
  age?: number;
  address?: string;
  isActive: IsActive;
  isVerified: boolean;
  role: UserRole;
  auths: Array<{ provider: string; providerId: string }>;
  createdAt: string;
  updatedAt: string;
}
