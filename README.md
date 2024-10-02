# Extrator de dados de Notas Fiscais de Serviço

> Serviço que lê os PDFs de notas fiscais de serviço extraindo informações pertinentes e convertendo para um arquivo XML. Consumido pelo frontend em [rhanielmx/nfse-data-extractor](https://github.com/rhanielmx/nfse-data-extractor).

### Ajustes e melhorias

O desenvolvimento do projeto ainda não foi finalizado e os próximos passos planejados são:
- [ ] Criar uma imagem Docker encapsulando toda o ambiente do projeto para tornar mais fácil o compartilhamento e execução do projeto.
- [ ] Adicionar novos formatos de arquivos aceitos (Atualmente apenas PDF é aceito).

## 💻 Tecnologias

Essas foram as principais tecnologias utilizadas no desenvolvimento do projeto.

| Tecnologia | Versão        |
| :--------- | :------------ |
| Python     | 3.10.12       |
| Node       | 20.14.0       |
| Fastify    | 4.28.1        |
| Prisma     | 5.19.0        |
| RabbitMQ   | 3.13          |
| AWS        | S3 e Textract |

## 💻 Pré-requisitos

Antes de começar, verifique se você atendeu aos seguintes requisitos:

- Ter instalado [Docker](https://www.docker.com/) e [RabbitMQ](https://www.rabbitmq.com/) em versões compatíveis com as utilizadas pelo projeto. 
- Ter instalado o [poppler](https://github.com/Belval/pdf2image). Requisito da biblioteca pdf2image.

## 🚀 Instalando

Para instalar o nfse-extractor-backend, siga estas etapas:

Para instalar o nfse-data-extractor-backend, execute os comandos abaixo:
```
git clone https://github.com/rhanielmx/nfse-data-extractor-backend
cd nfse-data-extractor-backend
npm install
pip install boto3==1.35.30 pdf2image==1.17.0
```

## ☕ Usando

Para usar o nfse-data-extractor-backend, inicie o serviços do docker e, em seguida, o servidor node como demonstrado abaixo:

```
docker compose up -d
npm run dev
```

