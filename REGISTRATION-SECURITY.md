# Cadastro público do launcher

- Endpoint: `POST /api/v1/auth/register`, JSON até 4096 bytes.
- Usuário: 3–32 caracteres ASCII alfanuméricos, normalizado para minúsculas. E-mail em campo separado, normalizado e validado antes de qualquer gravação.
- Novas senhas: mínimo 15 caracteres, máximo 72 bytes UTF-8 para impedir truncamento do bcrypt; custo 12. Senhas existentes não foram modificadas.
- Apenas username, email, password e displayName são aceitos. Campos de cargo ou privilégios são rejeitados. O servidor fixa o cargo USER (membro).
- Índices UNIQUE existentes em rp_users.username/email são a autoridade contra duplicidade, inclusive em concorrência. Resposta 409 conjunta não informa qual dos dois dados conflitou; não elimina toda possibilidade de enumeração.
- Rate limit persistente existente: 3 tentativas por e-mail e 9 por IP em 15 minutos, antes do bcrypt. IP encaminhado só é confiável atrás de proxy configurado (Vercel); deployments próprios precisam garantir que clientes não forjem x-forwarded-for.
- Conta, cargo e sessão são criados na mesma transação; falhas revertem tudo. Tokens não aparecem em logs; sessões continuam usando tokens aleatórios com hash no banco e safeStorage no launcher.
- JSON inválido, tipos incorretos e privilégios enviados pelo cliente recebem 400, sem detalhes internos.

## Validação

`node --test scripts/test-registration.cjs` testa validação e handler com banco/sessões simulados. Não cria contas reais. `npx tsc --noEmit` verifica os tipos.

## Limites e publicação

Não há promessa de segurança absoluta. E-mail duplicado não é confirmação de propriedade: email_verified continua false. Confirmação por e-mail, recuperação de senha, MFA, CAPTCHA adaptativo e auditoria completa não estão implementados por esta alteração. Precisam de desenho e, para envio de e-mail, configuração de provedor.

As regras novas só valem no site publicado depois do deploy desta versão. Não é necessário apagar dados nem recriar tabelas.
