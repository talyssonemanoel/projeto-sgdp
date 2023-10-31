# imagem base do Node.js
FROM node:alpine as builder

# diretório de trabalho no container
WORKDIR '/app'

ENV PATH /app/node_modules/.bin:$PATH
# Copiando o arquivo package.json para o container
COPY package.json ./

RUN npm install

# Copiando o restante dos arquivos do projeto para o container
COPY . ./

# Execute o comando de build do React
RUN npm run build

# Inicie uma nova etapa de construção
FROM nginx:stable-alpine

# Copie os arquivos de build para a pasta correta do Nginx
COPY --from=builder /app/build /usr/share/nginx/html

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]


