# Mentorix

Mentorix e um PWA em React + TypeScript + Firebase pensado para professores gerenciarem calendario de aulas, turmas, alunos, materias, chamada rapida, quizzes, atividades e reposicoes.

## Estrutura

```text
src/
  components/
    calendar/
    common/
    feedback/
    layout/
  screens/
    activities/
    attendance/
    calendar/
    classes/
    lessons/
    makeups/
    quizzes/
    student-details/
    students/
    subjects/
  navigation/
  services/
    firebase/
    repositories/
  hooks/
  utils/
  theme/
  types/
  database/
firestore/
```

## Decisoes importantes

- `services/repositories` concentra o acesso ao Firestore para manter a UI sem regras de persistencia.
- `hooks` agregam consultas compostas, como aulas do dia, chamada rapida e painel do aluno.
- `types/entities.ts` centraliza todas as entidades do dominio, mantendo o projeto fortemente tipado.
- `database/firestoreSchema.ts` documenta as colecoes e ajuda a alinhar regras e indexes.
- `vite-plugin-pwa` deixa o app instalavel em desktop e mobile.
- Quando o Firebase ainda nao estiver configurado, os repositories retornam erro explicito para facilitar onboarding.

## Como rodar

1. Instale as dependencias com `npm install`.
2. Copie `.env.example` para `.env` e preencha as chaves do Firebase.
3. No Firebase Console, ative `Authentication > Sign-in method > Email/Password`.
4. Rode `npm run dev`.
5. Para validar o build PWA, rode `npm run build`.
