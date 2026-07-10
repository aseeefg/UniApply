# UniApply — Centralized University Admission Portal

CSE470 Software Engineering course project. A platform where universities post
admission circulars and students discover, compare, and apply to them online.

## Team

| Name | ID | GitHub |
|---|---|---|
| Md. Sabit Irfan Ronve | 22201139 | [@sabitirfan100-blip](https://github.com/sabitirfan100-blip) |
| Umme Kulsum Prova | 23101034 | [@umme_kulsum_Prova](https://github.com/umme_kulsum_Prova) |
| Mantaka Mashiyat | 23101098 | [@mankumashiyat](https://github.com/mankumashiyat) |
| Md. Nurul Asif | 23201489 | [@aseeefg](https://github.com/aseeefg) |

## Tech stack

- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (Atlas)
- **Auth:** JWT, role-based access (`student`, `university`, `admin`)

## Project structure

```
uniapply/
├── client/     # React frontend
├── server/     # Express + MongoDB backend
├── docs/       # feature doc, sprint plan, API notes
└── CONTRIBUTING.md
```

## Getting started

### Backend
```bash
cd server
cp .env.example .env   # fill in your own MONGO_URI and JWT_SECRET
npm install
npm run dev             # starts on http://localhost:5000
```

### Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev             # starts on http://localhost:5173
```

## Sprint plan

| Sprint | Focus | Owner | Duration |
|---|---|---|---|
| 1 | Setup & Auth | Sabit Irfan Ronve | 14 days |
| 2 | Core Features | Mantaka Mashiyat | 14 days |
| 3 | Management Features | Umme Kulsum Prova | 14 days |
| 4 | Advanced Features | Md. Nurul Asif | 14 days |

Full feature list and per-sprint breakdown: [`docs/feature-doc.md`](docs/feature-doc.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branching strategy, commit
conventions, and PR process.
