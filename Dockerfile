FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /opt/observatoire

COPY app ./app
COPY scripts ./scripts

# dashboard-data.js est recréé depuis l'Excel à chaque démarrage.
# Le dossier reste inscriptible quel que soit l'UID choisi dans compose.yaml.
RUN rm -f app/data/dashboard-data.js \
    && chmod -R a+rX /opt/observatoire \
    && chmod 0777 app/data

EXPOSE 8765

CMD ["python", "scripts/serve_dashboard.py", "--no-browser"]
