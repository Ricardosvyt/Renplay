# IDs numéricos e três planos VIP

## Estado implementado

- Cada jogo possui `rp_games.public_id`, um número permanente mostrado no site e usado pelo launcher e pelas APIs. `rp_games.id` permanece como chave interna para não romper os relacionamentos e objetos R2 existentes. O catálogo fornece `legacyId` para reconhecer instalações antigas.
- Plus: 50 saves/150 MB; Pro: 150 saves/500 MB; Ultra: 400 saves/1,5 GB. As cotas são por conta, distribuídas entre jogos.
- O cargo VIP histórico não concede upload. Contas antigas com cargo VIP ou saves existentes foram marcadas como `LEGACY_REVIEW`: podem recuperar arquivos, sem prazo de exclusão inventado.
- Apenas um período pago confirmado no banco autoriza upload. A carência de 30 dias começa no fim desse período; nela, download e restauração seguem disponíveis.
- A rota diária `/api/cron/cloud-save-cleanup` exige `Authorization: Bearer <CRON_SECRET>`. Ela registra avisos e tarefas elegíveis, mas a exclusão física do R2 está desativada enquanto não existir integração de pagamento com conciliação de renovações. `CLOUD_SAVE_CLEANUP_ENABLED` sozinho não libera a exclusão.
- O painel administrativo mostra contagens e uma simulação das contas elegíveis. Não expõe chaves R2.

## Implantação

1. Aplicar as migrações `010` a `012` com `node scripts/apply-migrations.mjs` antes de implantar a API.
2. Configurar `CRON_SECRET` na Vercel. Manter `CLOUD_SAVE_CLEANUP_ENABLED=false`.
3. Implantar site e launcher juntos, pois o catálogo passou a publicar o ID numérico. Versões antigas do launcher podem tratar instalações com o ID anterior como outro jogo.
4. Conferir as contas `LEGACY_REVIEW` e seus contratos antes de atribuir um plano ou prazo.

## Dependência pendente

Ainda não há provedor de pagamento. O site exibe preços, mas não oferece checkout nem ativa planos por conta própria. Renovação automática, cobrança e exclusão física segura dependem dessa integração. A exportação ZIP usa gravação em fluxo no Chrome/Edge; em outros navegadores, arquivos acima de 100 MB exigem um navegador com File System Access API. Nenhum save local é excluído por estado VIP.
