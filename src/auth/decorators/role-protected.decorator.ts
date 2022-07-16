import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';

export const META_ROLES = 'roles';


export const RoleProtected = (...args: ValidRoles[] ) => {


    return SetMetadata( META_ROLES , args);
}
