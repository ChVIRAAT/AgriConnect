# Fingerprint Blood Group Detection

AI-powered web application that predicts a person's blood group from a fingerprint
image. Built with a React (Vite) frontend and a Flask + TensorFlow backend.

> ⚠️ Educational project — blood group cannot reliably be determined from a
> fingerprint alone. Do not use predictions for medical decisions.

## Project Structure

```
├── backend/                  # Flask API + ML model
│   ├── app.py                # API endpoints: /login, /signup, /predict
│   ├── database.py           # SQLite schema (users, otp_codes, predictions)
│   ├── predict.py            # Model loading + inference
│   ├── train_model.py        # (Re)trains the CNN from the dataset
│   └── blood_group_model.keras  # Trained CNN model (required)
├── src/                      # React frontend
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Auth state (localStorage) + app shell
│   ├── api.js                # Backend base URL + fetch helper
│   └── components/           # Login, Navbar, Hero, UploadCard, ResultCard, …
├── dataset/                  # Training data (not committed — download separately)
└── index.html / vite.config.js / package.json
```

## Backend setup (Python 3.10+)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows   (source venv/bin/activate on Linux/Mac)
pip install flask flask-cors tensorflow numpy
python app.py                # serves http://127.0.0.1:5000
```

The trained model (`blood_group_model.keras`) is included, so no training is
needed. To retrain, place the dataset under
`dataset/fingerprint-bloodgroup-detection-main/dataset/dataset_blood_group/`
(folders `A+`, `A-`, `AB+`, `AB-`, `B+`, `B-`, `O+`, `O-`) and run
`python train_model.py`.

## Frontend setup (Node 18+)

```bash
npm install
npm run dev                  # serves http://localhost:5173
```

The frontend expects the API at `http://127.0.0.1:5000`. To point it elsewhere,
create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:5000
```

## Testing the flows

1. **Sign up / Login** — create an account (min 6-char password), then log in.
   Successful login opens the main dashboard; wrong credentials show an inline
   error and stay on the login page.
2. **Prediction** — upload any fingerprint image (BMP/JPG/PNG) from the dataset
   and click *Predict Blood Group*. The result card shows the predicted group
   and confidence.

## API endpoints

| Method | Path      | Body                                   | Response |
|--------|-----------|----------------------------------------|----------|
| POST   | `/signup` | `{ full_name, email, password }`       | `{ success, message }` |
| POST   | `/login`  | `{ email, password }`                  | `{ success, message, user }` |
| POST   | `/predict`| `multipart/form-data` with `file`      | `{ blood_group, confidence }` |

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint
