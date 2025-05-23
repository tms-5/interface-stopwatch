# AgileDaily 🕒

AgileDaily é um facilitador de reuniões diárias (dailies) ágeis, desenvolvido em Vue.js, com foco em simplicidade, visual limpo e uso totalmente local via `localStorage`. Ele permite que times gerenciem suas dailies sem dependência de backend ou autenticação.

---

## 🧠 Funcionalidades

- Cadastro de times com nomes personalizados
- Campo único de input para membros (separados por `;`)
- Persistência automática com `localStorage`
- Edição e exclusão de times
- Interface de daily com cronômetro por participante
- Botões para pular ou avançar participantes
- Pode ser usado em tela cheia ou compartilhado no Google Meet

---

## 💡 Tecnologias

- [Vue 3](https://vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- `localStorage` para persistência offline
- 100% frontend — sem necessidade de backend

---

## 🚀 Como rodar localmente

```bash
git clone https://github.com/seu-usuario/agile-daily.git
cd agile-daily
npm install
npm run dev
