#!/bin/bash

echo "🚀 Deploying Claims AI Dashboard..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create data directory
mkdir -p data/uploads data/processed

# Set permissions
chmod 755 data
chmod 755 data/uploads
chmod 755 data/processed

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🔍 Checking service health..."
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend health check failed"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔧 API Docs: http://localhost:8000/docs"
echo "❤️  Health Check: http://localhost:8000/api/health"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
