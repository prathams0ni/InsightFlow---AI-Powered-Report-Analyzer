# utils/file_handler.py

import pandas as pd
import pdfplumber
import io


def load_file(uploaded_file):
    # Flask uses .filename; Streamlit uses .name
    filename = getattr(uploaded_file, 'filename', None) or getattr(uploaded_file, 'name', '')
    file_type = filename.rsplit('.', 1)[-1].lower()

    if file_type == 'csv':
        df = pd.read_csv(uploaded_file)
        return df, None

    elif file_type in ('xlsx', 'xls'):
        df = pd.read_excel(uploaded_file)
        return df, None

    elif file_type == 'pdf':
        stream = getattr(uploaded_file, 'stream', uploaded_file)
        raw_text = _extract_pdf_text(stream)
        return None, raw_text

    return None, 'Unsupported file type.'


def _extract_pdf_text(stream):
    text = ''
    with pdfplumber.open(stream) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ''
    return text.strip()
