<div align="center">
  <img src="https://img.shields.io/badge/📚-LogStudy-4CAF50?style=for-the-badge" alt="" width="450"/>
  <h1>⏱️ LogStudy</h1>
  <p>
    <strong>Aplicativo de estudos com técnica Pomodoro para Android, desenvolvido com Ionic Framework e JDK 25.</strong>
  </p>
  <p>
    <a href="#-sobre-o-projeto">Sobre</a> •
    <a href="#-roadmap-de-funcionalidades">Roadmap</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-como-executar">Como Executar</a> •
    <a href="#-contribuidores">Contribuidores</a>
  </p>

  ![Ionic](https://img.shields.io/badge/Ionic-7.0-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
  ![Android](https://img.shields.io/badge/Android-Studio-3DDC84?style=for-the-badge&logo=android&logoColor=white)
  ![Java](https://img.shields.io/badge/JDK-25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

  <p>
    <img src="https://img.shields.io/github/license/seuusuario/logstudy?style=for-the-badge" alt="Licença">
    <img src="https://img.shields.io/github/last-commit/seuusuario/logstudy?style=for-the-badge" alt="Último Commit">
    <img src="https://img.shields.io/github/issues/seuusuario/logstudy?style=for-the-badge" alt="Issues">
  </p>
</div>

## 🎯 Sobre o Projeto

O **LogStudy** é um aplicativo móvel de produtividade voltado para estudantes que desejam otimizar seu tempo e melhorar o foco nos estudos. Utilizando a consagrada **Técnica Pomodoro**, o app divide o tempo de estudo em blocos de 25 minutos intercalados com pausas estratégicas, promovendo alta concentração e evitando fadiga mental.

Com interface intuitiva e recursos de organização, o LogStudy permite criar metas de estudo, acompanhar o progresso através de relatórios detalhados e manter um histórico completo das sessões realizadas. Ideal para quem busca disciplina e resultados consistentes nos estudos.

---

## 🗺️ Roadmap de Funcionalidades

Este é o planejamento de entregas do projeto. Conforme as funcionalidades forem implementadas, os itens serão marcados.

-   [ ] **Timer Pomodoro:** Cronômetro configurável com intervalos de 25/5/15 minutos.
-   [ ] **Gerenciamento de Tarefas:** CRUD completo para criar, editar e deletar tarefas de estudo.
-   [ ] **Categorias de Estudo:** Organização por matérias ou disciplinas.
-   [ ] **Histórico de Sessões:** Registro completo de todas as sessões Pomodoro realizadas.
-   [ ] **Relatórios e Estatísticas:** Gráficos de produtividade diária, semanal e mensal.
-   [ ] **Notificações Push:** Alertas para início/fim de sessões e pausas.
-   [ ] **Modo Noturno:** Interface dark mode para estudos noturnos.
-   [ ] **Sincronização em Nuvem:** Backup e sincronização de dados entre dispositivos.
-   [ ] **Gamificação:** Sistema de conquistas e recompensas por metas atingidas.
-   [ ] **Exportação de Dados:** Relatórios em PDF ou CSV.

---

## 🚀 Tecnologias

As seguintes ferramentas e tecnologias foram utilizadas na construção do projeto:

<div align="center" style="display: flex; justify-content: center; gap: 15px;">
  <img src="https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white" alt="Ionic"/>
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor"/>
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android"/>
  <img src="https://img.shields.io/badge/JDK_25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="JDK"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="NPM"/>
  <img src="https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="VSCode"/>
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git"/>
</div>

---

## 🛠️ Como Executar

Siga os passos abaixo para configurar e executar o projeto localmente.

### **Pré-requisitos**

Antes de começar, você vai precisar ter instalado em sua máquina:
-   [Node.js](https://nodejs.org/) (versão LTS recomendada)
-   [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
-   [Ionic CLI](https://ionicframework.com/docs/cli) instalado globalmente:
    ```
    npm install -g @ionic/cli
    ```
-   [Java JDK 25](https://www.oracle.com/java/technologies/downloads/)
-   [Android Studio](https://developer.android.com/studio) com SDK configurado
-   [Git](https://git-scm.com/downloads)

### **Passo a Passo**

1.  **Clone o repositório:**
    ```
    git clone https://github.com/seuusuario/logstudy.git
    cd logstudy
    ```

2.  **Instale as dependências:**
    ```
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Crie um arquivo `.env` na raiz do projeto (se necessário).
    - Configure as variáveis conforme o arquivo `.env.example`.

4.  **Execute o app no navegador (modo de desenvolvimento):**
    ```
    ionic serve
    ```
    - O app será aberto em `http://localhost:8100`.

5.  **Compile e sincronize para Android:**
    ```
    ionic capacitor build android
    ionic capacitor sync android
    ```

6.  **Abra o projeto no Android Studio:**
    ```
    ionic capacitor open android
    ```
    - Configure o JDK 25 nas configurações do projeto (File → Project Structure → SDK Location).
    - Conecte um dispositivo físico ou inicie um emulador.

7.  **Execute o app no dispositivo/emulador:**
    - No Android Studio, clique em **Run** ou use:
    ```
    ionic capacitor run android
    ```

---

## 📱 Funcionalidades Principais

### ⏱️ Timer Pomodoro Inteligente
- Sessões de 25 minutos com pausas de 5 minutos
- Pausa longa de 15 minutos a cada 4 ciclos
- Configurações personalizáveis de tempo

### 📊 Relatórios Detalhados
- Visualização de horas estudadas por dia/semana/mês
- Gráficos de produtividade e desempenho
- Histórico completo de sessões

### 🎯 Gestão de Tarefas
- Criação de tarefas com prioridades
- Organização por categorias/matérias
- Acompanhamento de progresso

### 🔔 Notificações
- Lembretes de início de sessão
- Alertas de pausa e retomada
- Notificações de metas alcançadas

---

## 📂 Estrutura do Projeto

logstudy/
├── android/ # Projeto nativo Android
├── src/
│ ├── app/
│ │ ├── pages/ # Páginas do aplicativo
│ │ ├── components/ # Componentes reutilizáveis
│ │ ├── services/ # Serviços e lógica de negócio
│ │ └── models/ # Modelos de dados
│ ├── assets/ # Imagens, ícones e recursos
│ └── theme/ # Estilos e temas
├── capacitor.config.ts # Configurações do Capacitor
├── ionic.config.json # Configurações do Ionic
└── package.json # Dependências do projeto

---
## 🤝 Como Contribuir

Contribuições são sempre bem-vindas! Para contribuir com o LogStudy:

1.  **Fork o repositório**
2.  **Crie uma branch para sua feature:**
    ```
    git checkout -b feature/minha-nova-feature
    ```
3.  **Faça commit das suas alterações:**
    ```
    git commit -m 'feat: Adiciona nova funcionalidade X'
    ```
4.  **Faça push para a branch:**
    ```
    git push origin feature/minha-nova-feature
    ```
5.  **Abra um Pull Request**

### Padrão de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Tarefas gerais

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## ✨ Contribuidores

Agradecemos a todos que contribuíram para este projeto!

<a href="https://github.com/seuusuario/logstudy/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=seuusuario/logstudy" alt="Contribuidores" title="Contribuidores do LogStudy"/>
</a>

---

<div align="center">
  <p>Desenvolvido com ❤️ para estudantes que buscam excelência</p>
  <p>
    <a href="https://github.com/seuusuario/logstudy/issues">Reportar Bug</a> •
    <a href="https://github.com/seuusuario/logstudy/issues">Solicitar Feature</a>
  </p>
</div>
