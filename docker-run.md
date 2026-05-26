# 1. Make sure Docker Desktop is running

# 2. Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# 3. To run in background (detached mode)
docker-compose -f docker-compose.dev.yml up -d

# 4. To rebuild images (if you make changes to Dockerfiles)
docker-compose -f docker-compose.dev.yml up --build

# 5. To stop services
docker-compose -f docker-compose.dev.yml down

# 6. To stop and remove volumes (clears database)
docker-compose -f docker-compose.dev.yml down -v

# 7. View logs
docker-compose -f docker-compose.dev.yml logs -f

# 8. Run commands in a specific service
docker-compose -f docker-compose.dev.yml exec backend sh
docker-compose -f docker-compose.dev.yml exec postgres psql -U node_user -d linkvault




rebuilds 
link - note - infra - api-client - snippets
remain = dashboard - prompts - category - tag