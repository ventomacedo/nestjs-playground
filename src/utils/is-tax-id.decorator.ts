import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isTaxId', async: false })
export class IsTaxIdConstraint implements ValidatorConstraintInterface {
    validate(taxId: string, args: ValidationArguments) {
        if (typeof taxId !== 'string') return false;

        const cleaned = taxId.replace(/[^0-9A-Za-z]/g, '').toUpperCase();

        if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(cleaned)) return false;
        if (/^(\d)\1+$/.test(cleaned)) return false;

        const getCharacterValue = (char: string): number => {
            return char.charCodeAt(0) - 48;
        };

        let weight = 5;
        let sum = 0;

        for (let i = 0; i < 12; i++) {
            sum += getCharacterValue(cleaned[i]) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }

        let mod = sum % 11;
        const dv1 = mod < 2 ? 0 : 11 - mod;
        if (parseInt(cleaned[12]) !== dv1) return false;

        weight = 6;
        sum = 0;

        for (let i = 0; i < 13; i++) {
            sum += getCharacterValue(cleaned[i]) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }

        mod = sum % 11;
        const dv2 = mod < 2 ? 0 : 11 - mod;
        return parseInt(cleaned[13]) === dv2;
    }

    defaultMessage(args: ValidationArguments) {
        return 'CNPJ inválido (aceita formato numérico tradicional ou alfanumérico).';
    }
}

export function IsTaxId(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsTaxIdConstraint,
        });
    };
}
