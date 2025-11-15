# Contributing to LogStudy

Obrigado por considerar contribuir com o LogStudy! 🎉

## 📋 Código de Conduta

Ao participar deste projeto, você concorda em seguir nosso código de conduta. Seja respeitoso e colaborativo.

## 🚀 Como Contribuir

### 1. Fork e Clone
```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/logstudy.git
cd logstudy

# Adicione o repositório original como upstream
git remote add upstream https://github.com/matheusassuncaoo/logstudy.git
```

### 2. Configurar Ambiente
```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Rodar em modo desenvolvimento
npm start
```

### 3. Criar Branch
```bash
# Sempre crie uma branch a partir da main atualizada
git checkout main
git pull upstream main
git checkout -b feature/nome-da-feature
```

**Convenção de nomes de branches:**
- `feature/descricao` - Nova funcionalidade
- `fix/descricao` - Correção de bug
- `docs/descricao` - Documentação
- `refactor/descricao` - Refatoração
- `test/descricao` - Testes
- `chore/descricao` - Manutenção

### 4. Fazer Mudanças

#### Padrões de Código
- Use TypeScript tipado
- Siga os padrões do ESLint
- Use nomes descritivos para variáveis e funções
- Comente código complexo
- Mantenha funções pequenas e focadas

#### Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>(<escopo>): <descrição>

# Exemplos
feat(auth): adicionar login com Google
fix(timer): corrigir contagem de tempo
docs(readme): atualizar instruções de instalação
style(ui): ajustar espaçamento do header
refactor(api): simplificar serviço de usuários
test(auth): adicionar testes de login
chore(deps): atualizar dependências
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, UI/UX
- `refactor`: Refatoração de código
- `test`: Testes
- `chore`: Manutenção, configs

### 5. Testar
```bash
# Rodar testes
npm test

# Rodar lint
npm run lint

# Build de produção
npm run build
```

### 6. Commit e Push
```bash
git add .
git commit -m "feat(timer): adicionar som de notificação"
git push origin feature/nome-da-feature
```

### 7. Criar Pull Request

1. Vá para o GitHub
2. Clique em "New Pull Request"
3. Selecione sua branch
4. Preencha o template de PR
5. Aguarde revisão

## 🐛 Reportar Bugs

Use o template de [Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml):
1. Vá em "Issues"
2. "New Issue"
3. Selecione "Bug Report"
4. Preencha todas as informações

## ✨ Sugerir Features

Use o template de [Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml):
1. Vá em "Issues"
2. "New Issue"
3. Selecione "Feature Request"
4. Descreva sua ideia

## 📁 Estrutura do Projeto

```
logstudy/
├── src/
│   ├── app/
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── services/       # Serviços (API, Auth, etc)
│   │   ├── models/         # Interfaces e tipos
│   │   └── guards/         # Guards de roteamento
│   ├── assets/             # Imagens, ícones, etc
│   ├── environments/       # Configs de ambiente
│   └── theme/              # Estilos globais
├── android/                # Projeto Android (Capacitor)
└── www/                    # Build de produção
```

## 🎨 Guia de Estilo

### TypeScript/Angular
- Use strict mode
- Evite `any`, prefira tipos específicos
- Use async/await ao invés de Promises encadeadas
- Componentes standalone quando possível
- Services injetáveis com `providedIn: 'root'`

### CSS/SCSS
- Use variáveis CSS do Ionic
- Mobile-first responsivo
- BEM ou naming semantic
- Evite `!important`

### HTML
- Componentes Ionic quando possível
- Acessibilidade (ARIA labels)
- SEO friendly

## 🔍 Code Review

Todas as PRs passam por code review. Esperamos:
- Código limpo e legível
- Testes adequados
- Documentação atualizada
- CI/CD passando

## 📦 Releases

Versões seguem [Semantic Versioning](https://semver.org/):
- MAJOR: Mudanças incompatíveis
- MINOR: Novas funcionalidades compatíveis
- PATCH: Correções de bugs

## 🆘 Precisa de Ajuda?

- 📧 Email: contato@logstudy.com
- 💬 Discussions: Use GitHub Discussions
- 🐛 Issues: Para bugs e features

## 🎉 Reconhecimento

Contribuidores serão listados no README e releases notes!

---

**Obrigado por contribuir! 🚀**
