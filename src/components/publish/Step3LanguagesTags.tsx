import React from "react";
import { Field, ChipEditor, SectionTitle, panelClass } from "./FormControls";

interface Step3LanguagesTagsProps {
  languages: string[];
  setLanguages: (languages: string[]) => void;
  languageInput: string;
  setLanguageInput: (val: string) => void;
  onAddLanguage: () => void;
  translatedBy: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  onAddTag: () => void;
  onUpdate: (field: string, value: string) => void;
}

export function Step3LanguagesTags({
  languages,
  setLanguages,
  languageInput,
  setLanguageInput,
  onAddLanguage,
  translatedBy,
  tags,
  setTags,
  tagInput,
  setTagInput,
  onAddTag,
  onUpdate
}: Step3LanguagesTagsProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Categoria 3: Idiomas e Localização"
        description="Informe em quais línguas a visual novel pode ser lida e adicione tags temáticas para ajudar na descoberta."
      />
      <div className="space-y-6">
        <ChipEditor
          title="Idiomas disponíveis"
          values={languages}
          setValues={setLanguages}
          input={languageInput}
          setInput={setLanguageInput}
          add={onAddLanguage}
          placeholder="Ex.: Inglês, Japonês, Espanhol..."
        />
        <Field
          label="Responsável pelas traduções"
          value={translatedBy}
          onChange={(e) => onUpdate("translatedBy", e.target.value)}
          placeholder="Ex.: Equipe Oficial RenPlay PT-BR"
        />
        <ChipEditor
          title="Tags do jogo"
          values={tags}
          setValues={setTags}
          input={tagInput}
          setInput={setTagInput}
          add={onAddTag}
          placeholder="Ex.: Múltiplos finais, Escolhas importam, Dublado..."
        />
      </div>
    </section>
  );
}
