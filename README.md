# eHacks

```
eHacks-2026/
├─ .gitignore
├─ .idea/
├─ COMMITS.md
├─ README.md
├─ ai/
│  ├─ __init__.py
│  └─ app/
│     ├─ __init__.py
│     ├─ config.py
│     ├─ github_ingestor.py
│     ├─ ingest.py
│     ├─ models.py
│     ├─ pdf_ingestor.py
│     ├─ requirements.txt
│     ├─ utils.py
│     └─ data/
│        └─ __init__.py
├─ client/
│  ├─ .gitignore
│  ├─ README.md
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ vite.config.ts
│  ├─ public/
│  │  └─ vite.svg
│  └─ src/
│     ├─ App.tsx
│     ├─ index.css
│     ├─ main.tsx
│     ├─ pages/
│     │  ├─ Messages.tsx
│     │  └─ Upload.tsx
│     └─ services/
│        ├─ api.ts
│        ├─ messages.ts
│        └─ upload.ts
├─ data/
│  ├─ processed/
│  │  └─ phase1_documents.jsonl
│  └─ raw/
│     └─ pdfs/
│        ├─ attention.pdf
│        └─ paper.pdf
└─ server/
   ├─ package-lock.json
   ├─ package.json
   └─ src/
      ├─ index.js
      ├─ middlewares/
      │  └─ upload.js
      ├─ routes/
      │  ├─ message.js
      │  └─ upload.js
      └─ utils/
         └─ http-exception.js
```