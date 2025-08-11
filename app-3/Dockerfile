FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY front/package*.json ./

RUN npm ci

COPY front/ ./

RUN npm run build

FROM composer:latest AS deps

WORKDIR /app

RUN --mount=type=bind,source=back/composer.json,target=composer.json \
    --mount=type=bind,source=back/composer.lock,target=composer.lock \
    --mount=type=cache,target=/tmp/cache \
    composer install --no-dev --no-interaction


FROM php:8.4-apache AS backend

ENV TZ="Europe/Moscow"

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

RUN a2enmod rewrite

WORKDIR /var/www/html

COPY back/ /var/www/html/
COPY --from=deps /app/vendor/ /var/www/html/vendor/
COPY --from=frontend-builder /app/frontend/dist /var/www/html/public/app

RUN rm /var/www/html/.env && \
    mv /var/www/html/.env.prod /var/www/html/.env

# Apache configs
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>\n\
\n\
<Directory /var/www/html/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>\n\
\n\
<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    ServerName bobrovartem.ru\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/conf-available/travel.conf \
    && a2enconf travel

RUN echo 'RewriteEngine On\n\
\n\
# API routes - handle with index.php\n\
RewriteRule ^api/(.*)$ index.php [QSA,L]\n\
\n\
# Root path - serve frontend app\n\
RewriteRule ^$ app/index.html [QSA,L]\n\
\n\
# Static assets - try app directory first, then fallback to index.html\n\
RewriteCond %{REQUEST_FILENAME} !-f\n\
RewriteCond %{REQUEST_FILENAME} !-d\n\
RewriteCond %{REQUEST_URI} !^/api/\n\
RewriteCond %{DOCUMENT_ROOT}/app%{REQUEST_URI} -f\n\
RewriteRule ^(.*)$ app/$1 [QSA,L]\n\
\n\
# All other routes (except existing files/directories and API) - serve from app directory\n\
RewriteCond %{REQUEST_FILENAME} !-f\n\
RewriteCond %{REQUEST_FILENAME} !-d\n\
RewriteCond %{REQUEST_URI} !^/api/\n\
RewriteRule ^(.*)$ app/index.html [QSA,L]' > /var/www/html/public/.htaccess

RUN echo 'RewriteEngine On\n\
\n\
# Handle client-side routing\n\
RewriteCond %{REQUEST_FILENAME} !-f\n\
RewriteCond %{REQUEST_FILENAME} !-d\n\
RewriteRule ^(.*)$ index.html [QSA,L]' > /var/www/html/public/app/.htaccess

EXPOSE 80

# Entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["apache2-foreground"]
