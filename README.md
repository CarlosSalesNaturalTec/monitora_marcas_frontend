# Documentação do Módulo Frontend

Este documento detalha a arquitetura, funcionalidades e interações do frontend da Plataforma de Social Listening.

## 1. Detalhes Técnicos

O frontend é uma aplicação web moderna construída com as seguintes tecnologias:

- **Framework Principal:** [Next.js](https://nextjs.org/) (v14+) utilizando React e TypeScript.
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) para utilitários de CSS e [shadcn/ui](https://ui.shadcn.com/) para componentes de UI pré-construídos e acessíveis.
- **Gerenciamento de Estado do Servidor:** [TanStack Query (React Query)](https://tanstack.com/query) para fetching, caching, e atualização de dados da API.
- **Comunicação com API:** [Axios](https://axios-http.com/) para realizar requisições HTTP ao backend. Um interceptor está configurado para injetar automaticamente o token de autenticação do Firebase em todas as chamadas.
- **Autenticação:** [Firebase Authentication (Client SDK)](https://firebase.google.com/docs/auth) para gerenciar o login de usuários e a obtenção de ID Tokens.
- **Linting e Formatação:** ESLint e Prettier para garantir a qualidade e consistência do código.

## 2. Instruções de Uso e Implantação

### 2.1. Configuração do Ambiente Local

1.  **Variáveis de Ambiente:**
    -   Copie o arquivo `.env.local.example` para um novo arquivo chamado `.env.local`.
    -   Preencha as variáveis com as credenciais do seu projeto Firebase (apiKey, authDomain, etc.).
    -   A variável `NEXT_PUBLIC_API_URL` deve apontar para a URL do seu backend local (ex: `http://127.0.0.1:8000`).

    ```bash
    # .env.local
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...

    NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
    NEXT_PUBLIC_WHATSAPP_API_URL=http://127.0.0.1:8000 
    # Aponta para o mesmo backend, mas pode ser um serviço separado no futuro
    ```

2.  **Instalação de Dependências:**
    ```bash
    npm install
    ```

3.  **Execução:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:3000`.

### 2.2. Implantação (Deploy) no Google Cloud Run

O deploy é automatizado usando o Google Cloud Build.

1.  **Arquivo de Build (`cloudbuild.yaml`):**
    -   Este arquivo define os passos para o build da imagem Docker. Ele está configurado para aceitar as variáveis de ambiente do Firebase como substituições no momento do build, garantindo que as credenciais não sejam expostas no código.

2.  **Comando de Deploy:**
    -   O comando a seguir envia o código para o Cloud Build, que constrói a imagem e a envia para o Google Container Registry (GCR). Em seguida, ele implanta essa imagem como um novo serviço no Cloud Run.

    ```bash
    # Substitua [PROJECT_ID] e os valores das variáveis do Firebase
    gcloud builds submit ./frontend --config ./frontend/cloudbuild.yaml \
      --substitutions=_NEXT_PUBLIC_FIREBASE_API_KEY="...",_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="...",_NEXT_PUBLIC_API_URL="https://sua-api-backend.run.app",_NEXT_PUBLIC_WHATSAPP_API_URL="https://sua-whatsapp-api.run.app"

    gcloud run deploy social-listening-frontend \
      --image gcr.io/[PROJECT_ID]/social-listening-frontend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

## 3. Relação com Outros Módulos

O frontend é a camada de apresentação e interação do usuário, sendo fortemente acoplado aos seguintes módulos:

### 3.1. Backend (FastAPI)

Toda a lógica de negócio e comunicação com o banco de dados é delegada ao backend. O frontend consome a API RESTful através do cliente Axios configurado em `src/lib/api.ts`.

**Principais Endpoints Consumidos:**

-   **/users/me**: Obtém os dados do perfil do usuário logado.
-   **/admin/\***: Rotas para administração de usuários (criar, alterar senha, deletar), acessíveis apenas por usuários com role `ADM`.
-   **/terms**: CRUD para os termos de pesquisa (Marca e Concorrentes).
-   **/terms/preview**: Executa uma busca de teste com os termos fornecidos para validação.
-   **/monitor/run**: Inicia o processo de coleta de dados (relevante e histórica).
-   **/monitor/summary**: Obtém um resumo geral do estado do monitoramento.
-   **/monitor/historical-status**: Verifica o status da coleta histórica.
-   **/monitor/system-logs**: Busca os logs de execução das tarefas agendadas (scraper, nlp).
-   **/monitor/scraper-stats**: Obtém estatísticas sobre o processo de scraping.
-   **/monitor/nlp-stats**: Obtém estatísticas sobre o processo de análise de NLP.

### 3.2. Firebase

-   **Firebase Authentication**: Utilizado para o fluxo completo de autenticação:
    1.  Usuário faz login via UI.
    2.  O SDK do Firebase retorna um `idToken`.
    3.  Este token é armazenado no estado da aplicação e enviado em cada requisição para o backend no header `Authorization: Bearer <idToken>`.
-   **Firestore**: O frontend **não** acessa o Firestore diretamente. Toda a interação com o banco de dados é intermediada pelo backend, garantindo a segurança e a centralização das regras de negócio.

## 4. Estrutura de Arquivos e Componentes

A estrutura do projeto segue as convenções do Next.js App Router:

-   `src/app/`: Contém as rotas da aplicação. Cada pasta representa um segmento da URL.
    -   `layout.tsx`: Layout principal da aplicação.
    -   `page.tsx`: Página inicial (login).
    -   `dashboard/`: Rota principal após o login.
    -   `monitor/`, `users/`, etc.: Páginas específicas do sistema.
-   `src/components/`: Componentes React reutilizáveis.
    -   `ui/`: Componentes do shadcn/ui.
    -   `AuthenticatedLayout.tsx`: Wrapper que protege as rotas que exigem autenticação.
    -   `Navbar.tsx`: Barra de navegação principal.
-   `src/context/`: Contextos React, como o `AuthContext.tsx` que gerencia o estado do usuário.
-   `src/lib/`: Lógica auxiliar e configuração de bibliotecas.
    -   `api.ts`: Configuração do Axios e todas as funções de chamada à API.
    -   `firebase.ts`: Inicialização do SDK do Firebase.