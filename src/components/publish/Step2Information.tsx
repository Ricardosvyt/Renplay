import React from "react";
import { Field, TextArea, SectionTitle, panelClass } from "./FormControls";

interface Step2InformationProps {
  developer: string;
  publisher: string;
  genre: string;
  category: string;
  version: string;
  originalReleaseDate: string;
  shortDescription: string;
  fullDescription: string;
  onUpdate: (field: string, value: string) => void;
}

export function Step2Information({
  developer,
  publisher,
  genre,
  category,
  version,
  originalReleaseDate,
  shortDescription,
  fullDescription,
  onUpdate
}: Step2InformationProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Categoria 2: Informações & Sinopse"
        description="Apresente quem criou o jogo, em qual gênero ele se encaixa e a história que vai encantar os jogadores."
      />

      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Desenvolvedor(a) ou Estúdio *"
            required
            value={developer}
            onChange={(e) => onUpdate("developer", e.target.value)}
            placeholder="Ex.: Moonlight Studio, Sakura Devs..."
          />
          <Field
            label="Publicadora (Publisher)"
            value={publisher}
            onChange={(e) => onUpdate("publisher", e.target.value)}
            placeholder="Opcional (se diferente do desenvolvedor)"
          />
          <Field
            label="Gênero Principal *"
            required
            value={genre}
            onChange={(e) => onUpdate("genre", e.target.value)}
            placeholder="Visual Novel, Romance, Mistério, Ficção..."
          />
          <Field
            label="Categoria / Subgênero"
            value={category}
            onChange={(e) => onUpdate("category", e.target.value)}
            placeholder="Ex.: Sobrenatural / Drama / Fantasia"
          />
          <Field
            label="Versão Atual do Jogo"
            value={version}
            onChange={(e) => onUpdate("version", e.target.value)}
            placeholder="1.0.0"
          />
          <Field
            label="Data de Lançamento Original"
            type="date"
            value={originalReleaseDate}
            onChange={(e) => onUpdate("originalReleaseDate", e.target.value)}
          />
          <TextArea
            label="Descrição Curta (Resumo da Vitrine) *"
            required
            rows={3}
            value={shortDescription}
            onChange={(e) => onUpdate("shortDescription", e.target.value)}
            placeholder="Breve resumo (1 a 3 frases) exibido nos cards do catálogo, buscas e carrossel."
            wide
          />
          <TextArea
            label="Descrição Completa / Sinopse Detalhada"
            rows={7}
            value={fullDescription}
            onChange={(e) => onUpdate("fullDescription", e.target.value)}
            placeholder="Conte a história, os personagens, as rotas disponíveis e os diferenciais da sua obra."
            wide
          />
        </div>
      </div>
    </section>
  );
}
