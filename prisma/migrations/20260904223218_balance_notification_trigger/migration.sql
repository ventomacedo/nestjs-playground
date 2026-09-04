-- Cria a função de notificação no Postgres
CREATE OR REPLACE FUNCTION balance_changed_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('balance_updates', row_to_json(NEW)::text);
  RAISE NOTICE 'A TRIGGER FOI DISPARADA! ID do registro: %', NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vincula a trigger à tabela desejada
CREATE TRIGGER balance_changed_trigger
AFTER INSERT OR UPDATE ON "balance"

FOR EACH ROW
EXECUTE FUNCTION balance_changed_trigger();