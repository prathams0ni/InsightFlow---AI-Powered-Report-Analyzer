# app.py

from flask import Flask, render_template, request, jsonify
import os
import pandas as pd
from dotenv import load_dotenv
from utils.file_handler import load_file
from utils.eda import generate_eda_report
from utils.llm_agent import summarize_report, ask_question

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))

# Single-user in-memory store (local tool)
_store = {'df': None, 'text': None, 'type': None}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    try:
        df, raw_text = load_file(file)
    except Exception as e:
        return jsonify({'error': f'Failed to read file: {str(e)}'}), 500

    if df is not None:
        _store.update({'df': df, 'type': 'dataframe', 'text': None})

        eda_figs = generate_eda_report(df)
        charts = [fig.to_json() for fig in eda_figs]
        summary = summarize_report(df)

        return jsonify({
            'type': 'dataframe',
            'preview': df.head(10).to_html(classes='data-table', index=False, border=0),
            'charts': charts,
            'summary': summary,
            'rows': len(df),
            'cols': len(df.columns),
        })

    elif raw_text:
        _store.update({'text': raw_text, 'type': 'text', 'df': None})
        summary = summarize_report(raw_text)

        return jsonify({
            'type': 'text',
            'preview': raw_text[:2000],
            'summary': summary,
        })

    return jsonify({'error': 'Could not process the file.'}), 400


@app.route('/ask', methods=['POST'])
def ask():
    body = request.get_json(silent=True) or {}
    question = body.get('question', '').strip()
    if not question:
        return jsonify({'answer': 'Please enter a question.'}), 400

    if _store['type'] == 'dataframe' and _store['df'] is not None:
        answer = ask_question(_store['df'], question)
    elif _store['type'] == 'text' and _store['text']:
        answer = ask_question(_store['text'], question)
    else:
        answer = 'No data loaded. Please upload a file first.'

    return jsonify({'answer': answer})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
