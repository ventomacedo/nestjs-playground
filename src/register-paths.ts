import { register } from 'tsconfig-paths';

register({
    baseUrl: __dirname,
    paths: {
        '@auth': ['modules/auth/index'],
        '@banks': ['modules/banks/index'],
        '@clock': ['modules/clock/index'],
        '@database': ['database/index'],
        '@shared/decorators': ['shared/decorators/index'],
        '@prisma': ['../generated/prisma/client'],
    },
});
