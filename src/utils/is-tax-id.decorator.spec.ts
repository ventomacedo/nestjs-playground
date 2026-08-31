import { IsTaxIdConstraint } from './is-tax-id.decorator';

describe('IsTaxIdConstraint', () => {
    let constraint: IsTaxIdConstraint;

    beforeEach(() => {
        constraint = new IsTaxIdConstraint();
    });

    describe('validate', () => {
        it('aceita um CNPJ numérico válido', () => {
            expect(constraint.validate('11222333000181', {} as never)).toBe(
                true,
            );
        });

        it('aceita um CNPJ numérico válido formatado', () => {
            expect(constraint.validate('11.222.333/0001-81', {} as never)).toBe(
                true,
            );
        });

        it('aceita um CNPJ alfanumérico válido', () => {
            expect(constraint.validate('AB123456BBBB42', {} as never)).toBe(
                true,
            );
        });

        it('rejeita quando o valor não é uma string', () => {
            expect(
                constraint.validate(11222333000181 as never, {} as never),
            ).toBe(false);
        });

        it('rejeita quando o comprimento é inválido', () => {
            expect(constraint.validate('1122233300018', {} as never)).toBe(
                false,
            );
        });

        it('rejeita quando todos os caracteres são iguais', () => {
            expect(constraint.validate('11111111111111', {} as never)).toBe(
                false,
            );
        });

        it('rejeita quando o primeiro dígito verificador está incorreto', () => {
            expect(constraint.validate('11222333000191', {} as never)).toBe(
                false,
            );
        });

        it('rejeita quando o segundo dígito verificador está incorreto', () => {
            expect(constraint.validate('11222333000180', {} as never)).toBe(
                false,
            );
        });
    });

    describe('defaultMessage', () => {
        it('retorna a mensagem padrão de CNPJ inválido', () => {
            expect(constraint.defaultMessage({} as never)).toBe(
                'CNPJ inválido (aceita formato numérico tradicional ou alfanumérico).',
            );
        });
    });
});
