import { AllRoles } from '@/logic';
import { roleEnum, user } from '@/server/db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { User } from 'next-auth';
import { z, ZodEnum } from 'zod';

const roleEnumZod = createSelectSchema(roleEnum) as unknown as ZodEnum<
    [User['role']]>;


export const userZod = createSelectSchema(user)
    .omit({
        role: true,
    })
    .merge(
        z.object({
            role: roleEnumZod,
        })
    );
export const userAccessZod = userZod.omit({
    id: true,
    email: true,
    emailVerified: true,
    role: true,
    createdAt: true,
    updatedAt: true,
});
export const userRegisterZod = userZod.omit({
    firstName:true,
    lastName:true,
    email:true,
    phone:true,
    user_cc:true, 
    role: true,
    password: true,
    type: true
})

export type UserZodType = z.infer<typeof userZod>;

export const userDataFillZod = userAccessZod.refine(
    (user) => {
          if (user.phone === null) {
            return false;
          }

        if (user.firstName === '' || user.lastName === '') {
            return false;
        }

        if (user.username === '') {
          return false;
        }
        return true;
    },
    {
        message: 'fields cannot be null',
    }
);

export const isValidUserDetails = (
    user: User | undefined | null | z.infer<typeof userZod>
) => userDataFillZod.safeParse(user).success;


export const isAdminEmail = (email:string) => {
    if(email.includes('@admin.bibliya.in')){
        return true;
    }
    return false
}