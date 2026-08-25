FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    OBSERVATORY_CONTAINER_MODE=1

WORKDIR /opt/observatoire

COPY app ./app
COPY scripts ./scripts

# dashboard-data.js est créé depuis l'Excel monté par la VM à chaque démarrage.
RUN chmod -R a+rX /opt/observatoire \
    && chmod 0777 app/data

EXPOSE 8765

CMD ["python", "scripts/serve_dashboard.py"]
