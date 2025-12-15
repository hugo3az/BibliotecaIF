# 📚 Biblioteca IF

Sistema web completo para gerenciar empréstimos, cadastros e buscas de livros em uma biblioteca escolar.

## 🎯 Funcionalidades

- ✅ **Cadastro de Livros**: Cadastre livros com informações completas (título, autor, ISBN, editora, etc.)
- ✅ **Cadastro de Usuários**: Gerencie alunos, professores e funcionários
- ✅ **Busca Inteligente**: Busque livros por título ou autor
- ✅ **Controle de Empréstimos**: Realize empréstimos e devoluções de livros
- ✅ **Sistema de Multas**: Aplicação automática de multas por atraso na devolução
- ✅ **Interface Moderna**: Design responsivo e intuitivo

## 🛠️ Tecnologias

- **Front-end**: HTML5, CSS3, JavaScript (Vanilla)
- **Back-end**: Node.js com Express
- **Banco de Dados**: MySQL

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [MySQL](https://www.mysql.com/) (versão 5.7 ou superior)
- npm (geralmente vem com Node.js)

## 🚀 Instalação

### 1. Clone ou baixe o repositório

```bash
cd BibliotecaIF
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

1. Crie um arquivo `.env` na raiz do projeto (copie do `.env.example`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=biblioteca_if
DB_PORT=3306
PORT=3000
```

2. Execute o script SQL para criar o banco de dados e as tabelas:

```bash
mysql -u root -p < database/schema.sql
```

3. (Opcional) Execute o script de dados de exemplo:

```bash
mysql -u root -p < database/seed.sql
```

### 4. Inicie o servidor

```bash
npm start
```

Para desenvolvimento com auto-reload:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 📖 Como Usar

### Acessando o Sistema

Abra seu navegador e acesse: `http://localhost:3000`

### Gerenciando Livros

1. Clique na aba **"Livros"**
2. Clique em **"+ Novo Livro"** para cadastrar
3. Use a barra de busca para encontrar livros por título ou autor
4. Clique em **"Editar"** para modificar um livro
5. Clique em **"Excluir"** para remover um livro

### Gerenciando Usuários

1. Clique na aba **"Usuários"**
2. Clique em **"+ Novo Usuário"** para cadastrar
3. Preencha os dados (nome, email e tipo são obrigatórios)
4. Edite ou exclua usuários conforme necessário

### Gerenciando Empréstimos

1. Clique na aba **"Empréstimos"**
2. Clique em **"+ Novo Empréstimo"**
3. Selecione o livro e o usuário
4. Defina o prazo de empréstimo (padrão: 7 dias)
5. Para devolver, clique em **"Devolver"** no empréstimo correspondente

### Sistema de Multas

- Multas são calculadas automaticamente ao devolver um livro com atraso
- Valor da multa: **R$ 2,00 por dia de atraso**
- O sistema atualiza automaticamente o status dos empréstimos atrasados

## 📁 Estrutura do Projeto

```
BibliotecaIF/
├── database/
│   ├── schema.sql          # Script de criação do banco de dados
│   └── seed.sql            # Dados de exemplo
├── public/
│   ├── index.html          # Interface principal
│   ├── styles.css          # Estilos CSS
│   └── script.js           # Lógica JavaScript do front-end
├── server.js               # Servidor Node.js e API
├── package.json            # Dependências do projeto
└── README.md               # Este arquivo
```

## 🔌 API Endpoints

### Livros
- `GET /api/livros` - Listar todos os livros
- `GET /api/livros/:id` - Buscar livro por ID
- `GET /api/livros/busca/:termo` - Buscar livros por título ou autor
- `POST /api/livros` - Cadastrar novo livro
- `PUT /api/livros/:id` - Atualizar livro
- `DELETE /api/livros/:id` - Deletar livro

### Usuários
- `GET /api/usuarios` - Listar todos os usuários
- `GET /api/usuarios/:id` - Buscar usuário por ID
- `POST /api/usuarios` - Cadastrar novo usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário

### Empréstimos
- `GET /api/emprestimos` - Listar todos os empréstimos
- `GET /api/emprestimos/:id` - Buscar empréstimo por ID
- `POST /api/emprestimos` - Criar novo empréstimo
- `PUT /api/emprestimos/:id/devolver` - Devolver livro
- `POST /api/emprestimos/atualizar-status` - Atualizar status de empréstimos atrasados

## 🎨 Características da Interface

- Design moderno e responsivo
- Navegação intuitiva entre seções
- Modais para cadastro e edição
- Tabelas organizadas e fáceis de usar
- Feedback visual para ações do usuário
- Busca em tempo real

## 🔒 Segurança

⚠️ **Nota**: Este é um sistema de demonstração. Para uso em produção, considere:

- Implementar autenticação e autorização
- Validar e sanitizar todas as entradas
- Usar HTTPS
- Implementar rate limiting
- Adicionar logs de auditoria
- Fazer backup regular do banco de dados

## 📝 Licença

Este projeto é de código aberto e está disponível para uso educacional.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📧 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

Desenvolvido com ❤️ para a Biblioteca IF
