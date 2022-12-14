FROM node:16.17.1 as builder
WORKDIR /app
COPY package*.json /app/

ENV REACT_APP_HOST_IP_ADDRESS=20.218.202.217

RUN npm install
COPY ./ /app/
RUN npm run build

FROM nginx:1.20-alpine
RUN apk --no-cache add curl
RUN curl -L https://github.com/a8m/envsubst/releases/download/v1.2.0/envsubst-`uname -s`-`uname -m` -o envsubst && \
    chmod +x envsubst && \
    mv envsubst /usr/local/bin
	

COPY --from=builder /app/nginx.conf /etc/nginx/nginx.template
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/nginx.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
COPY --from=builder /app/build/ /usr/share/nginx/html
