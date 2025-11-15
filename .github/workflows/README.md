# GitHub Actions - LogStudy

Este diretório contém os workflows do GitHub Actions para CI/CD do projeto LogStudy.

## 📋 Workflows Disponíveis

### 1. **CI/CD Pipeline** (`ci-cd.yml`)
Executado em push e pull requests nas branches `main` e `develop`.

**Jobs:**
- ✅ **Lint**: Validação de código com ESLint
- 🧪 **Test**: Execução de testes unitários
- 🏗️ **Build Web**: Build da aplicação web
- 🤖 **Build Android**: Build do APK Android (somente na main)
- 🚀 **Deploy Pages**: Deploy automático no GitHub Pages
- 🔒 **Security**: Scan de segurança (somente em PRs)

### 2. **Release** (`release.yml`)
Executado quando uma tag `v*` é criada ou manualmente via workflow_dispatch.

**Jobs:**
- 📝 **Create Release**: Cria release no GitHub
- 🤖 **Build Android Release**: Build do APK de produção
- 🚀 **Deploy Web Release**: Deploy da versão de produção

### 3. **PR Checks** (`pr-checks.yml`)
Executado em pull requests para validação rápida.

**Jobs:**
- ✅ **PR Validation**: Validações básicas
- 📦 **Size Check**: Análise do tamanho do bundle

## 🚀 Como Usar

### Executar CI/CD
Simplesmente faça push para `main` ou `develop`:
```bash
git push origin main
```

### Criar uma Release
Crie uma tag e faça push:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Ou execute manualmente no GitHub:
1. Acesse "Actions" no GitHub
2. Selecione "Build Release"
3. Clique em "Run workflow"
4. Informe a versão desejada

### Configurar Deploy para GitHub Pages
1. Vá em Settings → Pages
2. Source: GitHub Actions
3. O deploy será automático após push na main

## 🔐 Secrets Necessários

Para funcionamento completo, configure os seguintes secrets no GitHub:

### Para Build Android Assinado (Release)
```
ANDROID_SIGNING_KEY      # Base64 do keystore
ANDROID_KEY_ALIAS        # Alias da chave
ANDROID_KEYSTORE_PASSWORD # Senha do keystore
ANDROID_KEY_PASSWORD     # Senha da chave
```

### Como gerar o keystore:
```bash
keytool -genkey -v -keystore logstudy.keystore -alias logstudy -keyalg RSA -keysize 2048 -validity 10000
```

### Como converter para Base64:
```bash
base64 logstudy.keystore | tr -d '\n' > keystore.base64
```

## 📦 Artifacts

Os workflows geram os seguintes artifacts:

- **web-build**: Build da aplicação web (7 dias)
- **android-apk**: APK debug (14 dias)
- **android-release-apk**: APK release (90 dias)

## 🔄 Cache

Os workflows utilizam cache para:
- Node modules (npm)
- Gradle dependencies
- Build outputs

Isso acelera significativamente as execuções subsequentes.

## 📊 Status Badges

Adicione ao README.md:

```markdown
![CI/CD](https://github.com/matheusassuncaoo/logstudy/workflows/CI/CD%20Pipeline/badge.svg)
![Release](https://github.com/matheusassuncaoo/logstudy/workflows/Build%20Release/badge.svg)
```

## 🐛 Troubleshooting

### Build falha com "out of memory"
Já configurado: `NODE_OPTIONS: --max_old_space_size=4096`

### Testes falham
Os testes continuam mesmo com falha (`continue-on-error: true`) para não bloquear o pipeline. Revise os logs.

### Deploy no Pages não funciona
1. Verifique permissões em Settings → Actions → General → Workflow permissions
2. Marque "Read and write permissions"
3. Marque "Allow GitHub Actions to create and approve pull requests"

## 🎯 Próximos Passos

- [ ] Configurar notificações (Slack, Discord, etc.)
- [ ] Adicionar testes E2E
- [ ] Configurar deploy em múltiplos ambientes
- [ ] Adicionar análise de performance
- [ ] Configurar dependabot
