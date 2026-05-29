<div align="center">

# 📊 InsightFlow — AI-Powered Report Analyzer

**Upload. Analyze. Understand.**  
An intelligent document analysis engine built with Flask and Hugging Face LLMs that transforms raw CSV, Excel, and PDF files into structured insights — complete with auto-generated summaries, interactive visualizations, and natural language Q&A.

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=flat-square&logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.x-black?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![Hugging Face](https://img.shields.io/badge/HuggingFace-Transformers-orange?style=flat-square&logo=huggingface)](https://huggingface.co)
[![Plotly](https://img.shields.io/badge/Plotly-Visualization-blueviolet?style=flat-square&logo=plotly)](https://plotly.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

<img width="1919" height="919" alt="image" src="https://github.com/user-attachments/assets/02504d6e-cbe6-4b2d-8e09-5d76b9d8d0a4" />

<img width="1919" height="889" alt="image" src="https://github.com/user-attachments/assets/d571706f-50d3-42d3-a5f8-83fcf81e6d43" />

<img width="1919" height="915" alt="image" src="https://github.com/user-attachments/assets/9f4f48b2-9e8f-4ae3-9b2d-5967fbc812d0" />

---

## ✨ What is InsightFlow?

InsightFlow is a full-stack AI web application that lets you upload business documents and instantly receive:

- **Automated EDA** — histograms, bar charts, and data previews generated on the fly
- **LLM Summaries** — concise, human-readable summaries of your data or PDF content
- **Natural Language Q&A** — ask questions about your document in plain English and get accurate answers
- **Multi-format Support** — works with CSV, Excel (.xlsx/.xls), and PDF files

Unlike traditional BI tools, InsightFlow requires **zero configuration** — just upload and go.

---

## 🖥️ Demo

> Upload a CSV → get instant EDA charts + AI summary + ask "What is the average revenue by region?" → get an answer.

```
[File Upload] → [Parse & Detect Type] → [EDA / Text Extraction] → [LLM Analysis] → [Results on Web UI]
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Web Framework** | Flask |
| **AI / NLP** | Hugging Face Transformers (PyTorch) |
| **Summarization Model** | `knkarthick/MEETING_SUMMARY` |
| **Table Q&A Model** | `google/tapas-large-finetuned-wtq` |
| **Text Q&A Model** | `google/flan-t5-small` |
| **Data Processing** | Pandas, OpenPyXL |
| **PDF Parsing** | pdfplumber |
| **Visualizations** | Plotly |
| **Config Management** | python-dotenv |

---

## 📁 Project Structure

```
InsightFlow/
│
├── app.py                  # Flask application — routes, request handling, rendering
│
├── utils/
│   ├── file_handler.py     # File upload parsing (CSV / Excel / PDF)
│   ├── eda.py              # Auto EDA — generates Plotly charts from DataFrames
│   └── llm_agent.py        # Hugging Face pipeline logic — summarization & Q&A
│
├── templates/              # Jinja2 HTML templates for Flask views
│
├── static/                 # CSS, JS, chart assets
│
├── requirements.txt        # Python dependencies
├── .env                    # HuggingFace token (NOT committed to git)
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/insightflow.git
cd insightflow
```

### 2. Create a Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
HUGGINGFACE_HUB_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxx
```

Get your free token at 👉 [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### 5. Run the Flask App

```bash
python app.py
```

Visit `http://localhost:5000` in your browser.

---

## 🔬 How It Works

### File Handling (`utils/file_handler.py`)
Detects the uploaded file type and routes it to the appropriate parser:
- **CSV** → `pandas.read_csv()`
- **Excel** → `pandas.read_excel()`
- **PDF** → `pdfplumber` for text extraction

### Exploratory Data Analysis (`utils/eda.py`)
Automatically scans the DataFrame for:
- **Numeric columns** → renders histograms (distribution analysis)
- **Categorical columns** (≤ 20 unique values) → renders top-10 bar charts

All charts are generated with Plotly and returned as JSON-serializable figures.

### LLM Agent (`utils/llm_agent.py`)
Three Hugging Face pipelines handle different tasks:

| Task | Input | Model |
|---|---|---|
| Summarization | First 10 rows (CSV) or first 1000 chars (PDF) | `knkarthick/MEETING_SUMMARY` |
| Table Q&A | DataFrame (top 50 rows) | `google/tapas-large-finetuned-wtq` |
| Text Q&A | Extracted PDF text | `google/flan-t5-small` |

---

## 🤖 Models Used

| Model | Purpose | Source |
|---|---|---|
| `knkarthick/MEETING_SUMMARY` | Summarizes structured/unstructured content | [HuggingFace](https://huggingface.co/knkarthick/MEETING_SUMMARY) |
| `google/tapas-large-finetuned-wtq` | Answers questions over tabular data | [HuggingFace](https://huggingface.co/google/tapas-large-finetuned-wtq) |
| `google/flan-t5-small` | Answers questions from free-form text | [HuggingFace](https://huggingface.co/google/flan-t5-small) |

---

## 🔐 Security & Best Practices

- `.env` file is **never committed** — add it to `.gitignore`
- Hugging Face tokens are loaded at runtime via `python-dotenv`
- All model inference runs **locally** — no external API calls for AI processing

---

## 🗺️ Roadmap

- [ ] Chunked analysis for large files (> 50MB)
- [ ] Multi-file upload & cross-document comparison
- [ ] RAG (Retrieval-Augmented Generation) pipeline for smarter Q&A
- [ ] Export analysis as PDF report
- [ ] Deploy to Render / Railway with Docker

---

## 📄 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

## 🙋 Author

Built with curiosity and too many model downloads.  
Feel free to open issues, fork the repo, or reach out!

> ⭐ If you found this useful, consider giving it a star — it helps a lot!
