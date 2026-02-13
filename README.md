# Pogessi-usa-Frontend

## Run with Docker

Build the image:

```bash
docker build -t pogessi-usa-frontend:latest .
```

Run locally or on EC2:

```bash
docker run -d \
  --name pogessi-usa-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  pogessi-usa-frontend:latest
```

The app will be available on port `3000`.

## EC2 quick setup

1. Install Docker on the instance.
2. Clone this repository on the instance.
3. Add your runtime values to `.env`.
4. Build and run with the commands above.
5. Ensure your EC2 security group allows inbound traffic to port `3000` (or put it behind Nginx/ALB on `80/443`).
