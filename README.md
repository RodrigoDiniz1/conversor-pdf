# Conversor PDF ↔ JPG

Aplicacao web em Node.js para converter:

- PDF em JPG, exportando todas as paginas em um arquivo ZIP
- JPG/JPEG em PDF, reunindo uma ou varias imagens em um unico documento
- DOC e DOCX em PDF, com conversao real via LibreOffice no backend
- PPT e PPTX em PDF, com conversao real via LibreOffice no backend

## Stack

- Node.js
- Express
- Multer
- pdfjs-dist
- @napi-rs/canvas
- pdf-lib
- officeparser
- HTML, CSS e JavaScript puro

## Estrutura

```text
frontend/
  public/
  images/
backend/
  src/
    controllers/
    middlewares/
    routes/
    services/
    utils/
  tmp/
    uploads/
    output/
```

## Funcionalidades

- Upload com validacao de tipo
- Drag and drop no frontend
- Conversao de PDF para JPG com todas as paginas
- Compactacao das imagens em ZIP para download
- Conversao de uma ou varias imagens JPG em um unico PDF
- Conversao de um arquivo DOCX em um novo PDF textual
- Conversao de um arquivo PPTX em um novo PDF textual
- Download automatico do arquivo final
- Limite de 10MB por arquivo
- Limpeza de arquivos temporarios apos a resposta

## Pre-requisitos

Para rodar localmente ou publicar na web, basta um ambiente Node.js compativel com as dependencias npm do projeto.

O fluxo PDF para JPG agora usa PDF.js com canvas em Node, sem depender de Ghostscript, ImageMagick ou GraphicsMagick.

Para fidelidade real em Word e PowerPoint, o backend agora pode usar LibreOffice headless. Quando esse binario nao estiver disponivel, DOCX e PPTX ainda podem usar um fallback textual, mas DOC e PPT exigem LibreOffice.

## Rodar na web

### Deploy em servidor web

O projeto continua simples para PDF/JPG. Para Word e PowerPoint com fidelidade real, publique o backend em um ambiente com LibreOffice ou use o Dockerfile da raiz, que instala o binario e define `LIBREOFFICE_PATH=/usr/bin/soffice`.

- A aplicacao ja usa a variavel `PORT`
- O frontend estatico ja e servido pelo Express
- A conversao PDF para JPG nao depende mais de binarios externos do sistema
- A conversao Word/PowerPoint com fidelidade real depende do binario `soffice`

Fluxo tipico de deploy:

```bash
npm install
npm start
```

Se a plataforma pedir comandos separados:

- Build command: `npm install`
- Start command: `npm start`
- Healthcheck path: `/health`

### Deploy na Hostinger

Para subir pela area Node.js da Hostinger, publique a raiz do projeto como um unico app Node.js.

- Root directory: raiz do projeto
- Node.js: `22.x`
- Build command: `npm install`
- Start command: `npm start`
- Porta: use a variavel `PORT` fornecida pela Hostinger

O frontend nao precisa ser publicado separadamente na Hostinger se voce usar esse fluxo, porque o Express ja serve os arquivos em `frontend/public`.

Se a Hostinger pedir variaveis de ambiente, a principal para frontend/backend no mesmo dominio e:

- `CORS_ALLOWED_ORIGINS=https://seudominio.com`

Se voce usar subdominios diferentes, por exemplo frontend e API separados, use uma lista separada por virgula:

- `CORS_ALLOWED_ORIGINS=https://app.seudominio.com,https://api.seudominio.com`

Observacao importante: este projeto esta validado localmente com Node `22.x`, e uma dependencia instalada no lockfile exige `node >=22`.

Se o projeto for publicado sem o Dockerfile ou sem LibreOffice no ambiente, DOCX e PPTX ainda podem cair no fallback textual, mas DOC e PPT nao serao convertidos.

Variavel de ambiente para o frontend publicado:

- `CORS_ALLOWED_ORIGINS=https://frontend.seudominio.com`

Se quiser liberar mais de uma origem, use uma lista separada por virgula:

- `CORS_ALLOWED_ORIGINS=https://frontend.seudominio.com,https://www.seudominio.com`

O backend continua aceitando origens locais para desenvolvimento e tambem aceita origens configuradas por ambiente para o frontend publicado.

### Frontend estatico separado

Se preferir publicar o frontend separadamente, use a pasta `frontend`:

- Build command: `npm run build`
- Output directory: `dist`

Variavel de ambiente opcional no build:

- `APP_API_BASE_URL=https://api.seudominio.com`

O build gera um arquivo `config.js` com essa URL e o frontend passa a enviar uploads diretamente para o backend publicado.

Para desenvolvimento local, `frontend/public/config.js` fica vazio por padrao e o frontend continua tentando a origem atual e o fallback local em `http://localhost:3000`.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000 no navegador.

## Endpoints

### POST /upload/pdf-to-jpg

Recebe um arquivo no campo `file` e retorna um ZIP com as imagens JPG.

### POST /upload/jpg-to-pdf

Recebe um ou varios arquivos no campo `files` e retorna um PDF unico.

### POST /upload/merge-pdf

Recebe dois ou mais arquivos no campo `files` e retorna um PDF unico com todos os documentos unidos.

### POST /upload/split-pdf

Recebe um arquivo no campo `file` e retorna um ZIP com um PDF por pagina.

### POST /upload/word-to-pdf

Recebe um arquivo DOC ou DOCX no campo `file` e retorna um PDF unico. Com LibreOffice no backend, a conversao e real; sem ele, apenas DOCX pode usar fallback textual.

### POST /upload/powerpoint-to-pdf

Recebe um arquivo PPT ou PPTX no campo `file` e retorna um PDF unico. Com LibreOffice no backend, a conversao e real; sem ele, apenas PPTX pode usar fallback textual.