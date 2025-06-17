# Nginx server block for finsolvz.adviz.id

# Server block for HTTP (port 80) - redirects to HTTPS
server {
    listen 80;
    listen [::]:80;

    server_name www.finsolvz.adviz.id finsolvz.adviz.id;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$host$request_uri;
}

# Server block for HTTPS (port 443)
server {
    listen 443 ssl http2; # Listen on port 443, enable SSL/TLS and HTTP/2
    listen [::]:443 ssl http2;

    server_name www.finsolvz.adviz.id finsolvz.adviz.id;

    # --- SSL/TLS Configuration ---
    # IMPORTANT: Replace these paths with the actual paths to your SSL certificate and key.
    # You typically obtain these from a Certificate Authority (e.g., Let's Encrypt).
    ssl_certificate /etc/letsencrypt/live/finsolvz.adviz.id/fullchain.pem; # Path to your full chain certificate
    ssl_certificate_key /etc/letsencrypt/live/finsolvz.adviz.id/privkey.pem; # Path to your private key

    # Recommended SSL settings for better security
    ssl_protocols TLSv1.2 TLSv1.3; # Use strong protocols only
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH"; # Strong cipher suites
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on; # OCSP Stapling
    ssl_stapling_verify on;
    # resolver 8.8.8.8 8.8.4.4 valid=300s; # Google DNS resolvers, adjust if needed
    # resolver_timeout 5s;

    # HSTS (HTTP Strict Transport Security)
    # This header tells browsers to only interact with your site using HTTPS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # --- Web Root and Index Files ---
    # The root directive might not be strictly necessary if you are primarily proxying,
    # but it's good to keep if you might serve static files directly in other locations.
    root /var/www/finsolvz.adviz.id/html;
    index index.html index.htm index.nginx-debian.html;

    # --- Logging ---
    access_log /var/log/nginx/finsolvz.adviz.id_access.log;
    error_log /var/log/nginx/finsolvz.adviz.id_error.log warn;

    # --- Location Block for Proxy Pass ---
    # This block now proxies all requests to http://localhost:8787
    location / {
        proxy_pass http://localhost:8787; # Proxy requests to the application running on port 8787

        # Optional: Add proxy headers to pass client information to the backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- Optional: Error pages ---
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        internal;
    }

    # --- Optional: Add common security headers for better practice ---
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "no-referrer-when-downgrade";
}
