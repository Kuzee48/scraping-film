FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY . /usr/share/nginx/html

RUN rm /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
