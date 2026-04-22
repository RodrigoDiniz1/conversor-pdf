# Conversor PDF ↔ JPG

Aplicacao web em Node.js para converter:

- PDF em JPG, exportando todas as paginas em um arquivo ZIP
- JPG/JPEG em PDF, reunindo uma ou varias imagens em um unico documento

## Stack

- Node.js
- Express
- Multer
- pdfjs-dist
- @napi-rs/canvas
- pdf-lib
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
- Download automatico do arquivo final
- Limite de 10MB por arquivo
- Limpeza de arquivos temporarios apos a resposta

## Pre-requisitos

Para rodar localmente ou publicar na web, basta um ambiente Node.js compativel com as dependencias npm do projeto.

O fluxo PDF para JPG agora usa PDF.js com canvas em Node, sem depender de Ghostscript, ImageMagick ou GraphicsMagick.

## Rodar na web

### Deploy em servidor web

O projeto esta pronto para plataformas Node.js como Render, Railway e Fly.io sem precisar de container.

- A aplicacao ja usa a variavel `PORT`
- O frontend estatico ja e servido pelo Express
- A conversao PDF para JPG nao depende mais de binarios externos do sistema

Fluxo tipico de deploy:

```bash
npm install
npm start
```

Se a plataforma pedir comandos separados:

- Build command: `npm install`
- Start command: `npm start`

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