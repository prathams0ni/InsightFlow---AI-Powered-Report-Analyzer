# utils/llm_agent.py

import os
import pandas as pd
from dotenv import load_dotenv
from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    pipeline,
)
import torch

load_dotenv()

# --- Summarization model (BART-based) ---
_sum_tokenizer = AutoTokenizer.from_pretrained("knkarthick/MEETING_SUMMARY")
_sum_model = AutoModelForSeq2SeqLM.from_pretrained("knkarthick/MEETING_SUMMARY")
_sum_model.eval()

# --- Table QA pipeline (still supported in transformers v5) ---
table_qa = pipeline(
    "table-question-answering",
    model="google/tapas-large-finetuned-wtq",
    tokenizer="google/tapas-large-finetuned-wtq",
    device=-1,
)

# --- Text QA model (flan-t5, seq2seq) ---
_qa_tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-small")
_qa_model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-small")
_qa_model.eval()


def _summarize_text(text: str) -> str:
    inputs = _sum_tokenizer(
        text, return_tensors="pt", max_length=512, truncation=True
    )
    with torch.no_grad():
        outputs = _sum_model.generate(
            **inputs, max_new_tokens=120, min_new_tokens=30, do_sample=False
        )
    return _sum_tokenizer.decode(outputs[0], skip_special_tokens=True)


def _qa_text(prompt: str) -> str:
    inputs = _qa_tokenizer(
        prompt, return_tensors="pt", max_length=512, truncation=True
    )
    with torch.no_grad():
        outputs = _qa_model.generate(**inputs, max_new_tokens=150)
    return _qa_tokenizer.decode(outputs[0], skip_special_tokens=True)


# ----------- SUMMARY FUNCTION ------------
def summarize_report(data):
    if isinstance(data, pd.DataFrame):
        text = data.head(10).to_csv(index=False)
    elif isinstance(data, str):
        text = data[:1000]
    else:
        return "Invalid data format."

    try:
        return _summarize_text(text)
    except Exception as e:
        return f"Summarization failed: {str(e)}"


# ----------- QUESTION-ANSWER FUNCTION ------------
def ask_question(data, user_question):
    if isinstance(data, pd.DataFrame):
        try:
            safe_df = data.head(50).fillna("").astype(str)
            result = table_qa(table=safe_df, query=user_question)
            return result["answer"]
        except Exception as e:
            return f"Table QA error: {str(e)}"

    elif isinstance(data, str):
        try:
            prompt = (
                f"You are a helpful business analyst.\n\n"
                f"Here is part of the report:\n{data[:800]}\n\n"
                f"Answer the following question clearly:\n{user_question}"
            )
            return _qa_text(prompt)
        except Exception as e:
            return f"Text QA error: {str(e)}"

    else:
        return "Invalid data format."
