import type { components } from './openapi';

export type ProjectCreate = components['schemas']['ProjectCreate'];
export type ProjectRead = components['schemas']['ProjectRead'];
export type ProjectUpdate = components['schemas']['ProjectUpdate'];
export type ProjectMemberCreate = components['schemas']['ProjectMemberCreate'];
export type ProjectMemberRead = components['schemas']['ProjectMemberRead'];
export type ProjectMemberUpdate = components['schemas']['ProjectMemberUpdate'];
export type ProjectRepositoryLinkCreate = components['schemas']['ProjectRepositoryLinkCreate'];
export type PinCreate = components['schemas']['PinCreate'];
export type PinRead = components['schemas']['PinRead'];
export type PinReorder = components['schemas']['PinReorder'];

export interface Planet {
  id: string;
  name: string;
}
