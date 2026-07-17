# Stadium Stan

> AI-Powered Autonomous Stadium Operations Platform

Stadium Stan is an intelligent multi-agent stadium management platform built for modern sporting events. It combines Generative AI, Digital Twin simulation, real-time incident management, and intelligent crowd routing into a unified command system for stadium operators, volunteers, and fans.

Designed with scalability in mind, Stadium Stan demonstrates how AI agents can coordinate large venue operations while maintaining safety, operational awareness, and an improved visitor experience.

---

## Problem Statement

Managing tens of thousands of spectators inside a large stadium is an operational challenge.

Venue operators must simultaneously monitor crowd congestion, respond to emergencies, coordinate volunteers, guide visitors, and make rapid operational decisions while minimizing human delay.

Traditional systems are fragmented across multiple dashboards and require constant manual intervention.

Stadium Stan provides a unified AI-assisted platform that enables intelligent decision making through autonomous agents and a Digital Twin representation of the venue.

---

## Solution Overview

Stadium Stan provides three dedicated operational experiences:

### Public Fan Portal

Designed for stadium visitors.

Features include:

- Interactive stadium navigation
- Multiple routing strategies
  - Shortest
  - Safest
  - Accessible
- Crowd-aware route generation
- Live gate telemetry
- Venue information
- Match information

---

### Volunteer Operations Portal

Built for on-ground volunteers.

Capabilities include:

- Live assignment tracking
- Incident reporting
- Location updates
- Operational status management
- Real-time synchronization with command center

---

### Manager Command Center

The operational brain of Stadium Stan.

Provides:

- Live Digital Twin visualization
- AI incident analysis
- Decision support
- Operational dashboards
- Incident monitoring
- Crowd health analytics
- Historical audit timeline
- Simulation preview

---

## Core Features

### Multi-Agent AI

The platform uses autonomous AI workflows to:

- Analyze incidents
- Recommend response strategies
- Estimate operational impact
- Generate routing recommendations
- Coordinate emergency actions

---

### Digital Twin

The Digital Twin continuously represents stadium state through:

- Stadium node graph
- Crowd density
- Incident propagation
- Operational health
- Risk estimation

---

### Real-Time Communication

Uses WebSockets for instant synchronization across:

- Manager dashboard
- Volunteer portal
- Incident lifecycle
- Operational updates

---

### Intelligent Routing

Route generation considers:

- Distance
- Safety
- Accessibility
- Dynamic node risk
- Congestion

---

### Incident Management

Supports multiple incident types including:

- Medical emergencies
- Security incidents
- Fire hazards
- Infrastructure failures
- Crowd congestion

---

## System Architecture

```
                        Fans
                          │
                  Navigation Portal
                          │
                          ▼
                   FastAPI Backend
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
 AI Agent Layer     Digital Twin      PostgreSQL
        │                 │
        └─────────WebSockets──────────┐
                                      ▼
                           Manager Dashboard
                                      │
                                      ▼
                           Volunteer Operations
```

---

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios
- Zustand

---

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Redis
- WebSockets

---

### AI Stack

- LangGraph
- LiteLLM
- Groq
- Llama 3.3 70B
- Custom Agent Workflows

---

### Infrastructure

- Railway
- Vercel
- Docker
- GitHub

---

## Repository Structure

```
apps/
├── api/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── workers/
│   └── main.py
│
└── web/
    ├── src/
    ├── app/
    ├── components/
    └── services/

packages/
├── agents/
└── digital_twin/
```

---

## AI Workflow

1. Incident detected
2. Backend validates request
3. AI workflow begins
4. Digital Twin updated
5. Risk evaluated
6. Recommended action generated
7. Volunteers notified
8. Manager dashboard synchronized
9. Audit trail recorded

---

## Routing Workflow

User selects:

- Start location
- Destination
- Routing preference

Backend:

- Loads stadium graph
- Applies routing algorithm
- Calculates safest path
- Returns navigation instructions

---

## Digital Twin

The Digital Twin maintains:

- Venue topology
- Connected nodes
- Active incidents
- Crowd flow
- Risk levels
- Operational state

Managers can preview the impact of operational decisions before execution.

---

## Deployment

### Frontend

Hosted on Vercel.

### Backend

Hosted on Railway.

### Database

PostgreSQL

### Cache

Redis

---

## Environment Variables

Backend

```
DATABASE_URL=

REDIS_URL=

GROQ_API_KEY=

LLM_PROVIDER=groq

LLM_MODEL=llama-3.3-70b-versatile

JWT_SECRET=
```

Frontend

```
NEXT_PUBLIC_API_URL=
```

---

## Local Development

Clone the repository

```bash
git clone https://github.com/KrishSandhu/Stadium-Stan.git
```

Install frontend

```bash
cd apps/web
npm install
npm run dev
```

Install backend

```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Future Improvements

- Computer Vision crowd estimation
- Live CCTV integration
- Predictive congestion forecasting
- Push notifications
- Voice-based incident reporting
- Multi-language support
- Weather-aware routing
- Emergency evacuation simulation
- IoT sensor integration

---

## What I Learned

This project provided hands-on experience in designing and deploying production-oriented AI systems.

Key learning outcomes include:

- Multi-agent orchestration using LangGraph
- Production LLM integration through LiteLLM
- Designing Digital Twin architectures
- Real-time synchronization with WebSockets
- Cloud deployment using Railway and Vercel
- PostgreSQL and Redis integration
- Full-stack monorepo architecture
- Environment management across deployments
- Authentication and protected routing
- Operational dashboard design
- UI modernization and design systems
- Production debugging and deployment troubleshooting
- API design using FastAPI
- Building maintainable modular software

---

## Acknowledgements

Built as part of the Google for Developers Hackathon.

Special thanks to:

- Google for Developers
- Groq
- LangGraph
- FastAPI
- Next.js
- Railway
- Vercel

---

## Author

**Krish Sandhu**

B.Tech CSE (AI)

Passionate about Artificial Intelligence, Machine Learning, Digital Twins, Multi-Agent Systems, and Full Stack Development.

[GitHub](https://github.com/GIT-KrishSandhu)

[LinkedIn](https://www.linkedin.com/in/krish-sandhu-6778a2229/)
