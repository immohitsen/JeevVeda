# JeevVeda — AI-Powered Early Stage Cancer Screening

> **JeevVeda** is an integrated AI healthcare suite for early-stage cancer screening, combining a symptom-based medical assistant chatbot, blood report analyser (OCR + Gemini API), MRI image analyser (CNN), and an interactive DICOM viewer.

---

## 🔬 Project Overview

JeevVeda aims to shorten time-to-diagnosis and improve diagnostic accuracy by providing clinicians and patients with a compact, end-to-end screening toolkit:

* **Medical Assistance Chatbot** — NLP-based symptom intake and risk estimation (Low / Medium / High).
* **Blood Report Analyzer** — OCR + parsing pipeline to extract lab values and forward them to **Gemini 2.5 Pro API** for cancer risk analysis.
* **MRI Image Analyzer** — CNN-based (ResNet50) model to highlight suspicious nodules and provide malignancy probabilities.
* **DICOM Viewer** — Browser-based canvas viewer for interactive review of medical images (window/level, zoom, pan, multi-frame navigation).

This repo contains the code and resources for prototype development and research experiments.

---

## 📂 Repository Structure

```
├── public/                # Static assets (icons, svg files)
├── src/
│   ├── app/               # Next.js app router
│   │   ├── api/           # API routes (server actions)
│   │   │   ├── assess-risk/route.ts      # Symptom risk scoring
│   │   │   ├── blood-analyzer/route.ts   # OCR + Gemini blood report analyzer
│   │   │   ├── chat/route.ts             # Chatbot interaction
│   │   │   └── users/                    # User auth (login, signup, etc.)
│   │   ├── dashboard/    # Dashboard pages for different modules
│   │   │   ├── blood-analyzer/page.tsx
│   │   │   ├── chatbot/page.tsx
│   │   │   ├── dicom-viewer/page.tsx
│   │   │   ├── mri-analysis/page.tsx
│   │   │   └── ... (reports, screening tools, etc.)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/       # Reusable UI + custom components
│   ├── dbConfig/         # Database configuration
│   ├── hooks/            # Custom React hooks (auth, mobile state)
│   ├── lib/              # Utility functions (DICOM parser, types, helpers)
│   └── models/           # Mongoose/DB models
├── BLOOD_ANALYZER_WORKFLOW.md   # Workflow documentation for blood analyzer
├── CHAT_WORKFLOW.md             # Workflow documentation for chatbot
├── SETUP_INSTRUCTIONS.md        # Step-by-step setup
├── README.md                    # Project overview (this file)
└── ...
```

---

## ✨ Key Features

* Natural-language symptom intake with feature mapping.
* Tesseract OCR + PDF/image parsing for blood reports.
* Extracted values sent to **Gemini 2.5 Pro API** for risk assessment and insights.
* ResNet50 CNN pipeline (preprocessing → inference → localization overlays) for MRI scans.
* Next.js API routes powering the backend inside `/src/app/api/`.
* Interactive React dashboard with modules for chatbot, analyzer, MRI, and DICOM.

---

## 🏃 Getting Started

### Prerequisites

* Node.js 18+
* npm or yarn

### Installation

```bash
# 1. Clone
git clone https://github.com/immohitsen/JeevVeda.git
cd JeevVeda

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev

# 4. Open browser
http://localhost:3000
```

---

## 🔗 Internal Docs

* [Blood Analyzer Workflow](./BLOOD_ANALYZER_WORKFLOW.md)
* [Chatbot Workflow](./CHAT_WORKFLOW.md)
* [Setup Instructions](./SETUP_INSTRUCTIONS.md)

---

## 📦 Models & Data

* **MRI model:** ResNet50-based CNN trained on annotated MRI/CT slices. Weights stored in `models/mri/` or hosted in cloud storage.
* **Blood analysis:** Relies on **Gemini 2.5 Pro API** for biomarker interpretation and risk scoring.
* **Symptom model:** Small LR/NN trained on symptom→diagnosis mapping.

**Datasets:** Keep sensitive/PHI data out of the repo. Provide synthetic/anonymized samples in `data/sample/` for demos.

---

## 🧪 Evaluation & Explainability

* Use metrics: Accuracy, Precision, Recall, F1, AUC for classifiers.
* For MRI detections: IoU, sensitivity, ROC curves.
* Explainability:

  * **Gemini API structured outputs** for blood analysis.
  * **Grad-CAM / CAM overlays** for MRI model interpretability.

---

## 🧾 Compliance & Ethics

This project is a **research / prototype** tool. It is not a regulated medical device. For any clinical deployment:

* Obtain IRB / ethical approvals.
* Ensure PHI protection (HIPAA / local laws).
* Validate clinically with radiologists.
* Add disclaimers in UI/docs.

---

## 🚀 Future Roadmap

Planned enhancements for JeevVeda include:

- Multi-modal AI fusion combining MRI, pathology, and blood biomarkers.
- Real-time DICOM collaboration and annotation tools.
- Federated learning support for privacy-preserving model training.
- Deployment optimization for edge devices and low-resource hospitals.
- Advanced explainability pipelines using Grad-CAM++ and attention visualization.
- Secure patient report storage with encryption and audit logging.
- Expanded support for additional cancer screening modalities.

We welcome contributions from developers, researchers, and healthcare professionals interested in AI-driven medical diagnostics.

---

## 🙌 How to Contribute

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit and open a PR with description + tests
4. We’ll review and merge

---

## 👨‍💻 Team

* **Mohit Sen** — Fullstack / AI
* **Anurag Pandey** — ML / Prompt engineering
* **Dr. J. Satya Eswari** — Faculty advisor

---

## 📝 License

MIT License — see `LICENSE` file.

---

> *JeevVeda is building an AI-first, accessible cancer diagnostic toolkit. Early detection saves lives.*
