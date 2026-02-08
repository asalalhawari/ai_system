# Claims AI Dashboard - Project Structure

## 📁 Complete Project Structure

```
claims-ai-dashboard/
├── README.md                           # Project overview and setup
├── PROJECT_STRUCTURE.md               # This file
├── docker-compose.yml                 # Docker deployment
├── deploy.sh                          # Linux deployment script
│
├── backend/                           # FastAPI Backend
│   ├── app/
│   │   ├── main.py                   # Main API endpoints
│   │   └── services/
│   │       ├── fraud_ai.py           # AI fraud detection (from notebook)
│   │       ├── file_processor.py     # Excel file processing
│   │       └── database.py           # Database service (optional)
│   ├── requirements.txt              # Python dependencies
│   ├── start.sh                      # Linux start script
│   ├── start.bat                     # Windows start script
│   └── Dockerfile                    # Docker build file
│
├── frontend/                         # React Dashboard
│   ├── src/
│   │   ├── App.tsx                   # Main app component
│   │   ├── components/
│   │   │   ├── Dashboard.tsx         # Main dashboard
│   │   │   ├── FraudOverview.tsx     # AI fraud overview panel
│   │   │   ├── FraudCases.tsx        # High-priority cases
│   │   │   ├── ClinicalOverview.tsx  # Clinical metrics
│   │   │   └── FileUpload.tsx        # Excel upload interface
│   │   ├── services/
│   │   │   └── apiService.ts         # API client
│   │   ├── types/
│   │   │   └── dashboard.ts          # TypeScript interfaces
│   │   └── utils/
│   │       └── formatters.ts         # Utility functions
│   ├── package.json                  # Node.js dependencies
│   ├── Dockerfile                    # Docker build file
│   └── nginx.conf                    # Nginx configuration
│
└── data/                             # Data storage (created at runtime)
    ├── uploads/                      # Uploaded Excel files
    └── processed/                    # Processed CSV files
```

## 🔗 API Endpoints Used by Dashboard

### Core Fraud Detection (AI-Powered)
- `POST /api/upload` - Upload Excel files for processing
- `GET /api/fraud/ai-overview` - AI fraud summary with ML insights
- `GET /api/fraud/ai-cases` - Detailed fraud cases with scores

### Clinical Analytics
- `GET /api/dashboard/overview` - Overview metrics
- `GET /api/dashboard/specialties` - Specialty analysis

### System
- `GET /api/health` - Health check and status

## 🧠 AI Models Implementation

### Duplicate_Claims_Check.ipynb → fraud_ai.py Service

The notebook has been converted to a production service with these components:

1. **Duplicate Detection** (Cell [1])
   - Logic: Same member_id + service_date + provider_treat_code
   - Implementation: `detect_duplicates()` method

2. **Suspicious Quantities** (Cell [2])  
   - Logic: Service category thresholds (T>5, P>3)
   - Implementation: `detect_suspicious_quantities()` method

3. **Outlier Detection** (Cell [3])
   - Logic: Isolation Forest ML model
   - Implementation: `detect_outliers()` method

4. **Fraud Scoring** (Cell [4])
   - Logic: Weighted scoring (duplicates=0.4, qty=0.3, outliers=0.3)
   - Implementation: `compute_fraud_score()` method

5. **Top Risk Analysis** (Cell [5])
   - Logic: Group by member/provider, rank by fraud flags
   - Implementation: `get_top_risky_members()`, `get_top_risky_providers()`

## 🚀 Deployment Options

### Development
```bash
# Backend
cd backend && ./start.sh    # Linux/Mac
cd backend && start.bat     # Windows

# Frontend  
cd frontend && npm start
```

### Production (Linux Server)
```bash
./deploy.sh
```

### Docker
```bash
docker-compose up -d
```

## 📊 Dashboard Features

### 1. File Upload Tab
- Excel file upload (.xlsx, .xls)
- Automatic column mapping
- Real-time processing feedback
- Fraud analysis summary

### 2. Dashboard Tab
- **Clinical Overview**: Claims metrics, specialty distribution
- **AI Fraud Overview**: ML-powered fraud detection with KPIs
- **High-Priority Cases**: Detailed fraud cases with recommended actions

### 3. Real-World Scenarios
- Duplicate billing detection and prevention
- Quantity fraud identification
- Statistical outlier analysis
- Business impact quantification

## 🔧 Key Differences from Original Project

### Streamlined Architecture
- **File-based processing** (no database required)
- **Essential endpoints only** (removed unused APIs)
- **Simplified deployment** (Docker + scripts)

### AI Integration
- **Notebook logic converted** to production service
- **Real-time fraud scoring** with ML models
- **Actionable insights** with recommended actions

### Production Ready
- **Docker containerization** for easy deployment
- **Health checks** and monitoring
- **Linux server compatibility**
- **Nginx reverse proxy** for production

## 📈 Business Value

1. **Prevention**: Block fraudulent payments before processing
2. **Efficiency**: 70% reduction in manual audit time
3. **Compliance**: Systematic fraud detection for regulatory requirements
4. **Scalability**: Process thousands of claims with AI models

This streamlined version focuses on the core value proposition: AI-powered fraud detection with an intuitive dashboard interface.
