### CTIP

# Credits

Authors: Gradualisht & lephorx

## Setup

### Usage with npm

```bash
cd frontend
npm install
npm dev
```

### Usage with pnpm (Recommanded)

```bash
cd frontend
pnpm install
pnpm dev
```

Interface accessible at https://localhost:3000

## Initialization backend

```bash
cd backend
pip install -r requirements.txt
```

Set up the database (run once):

```bash
python setup_db.py
```

Start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

Interface accessible at http://localhost:8000/docs
