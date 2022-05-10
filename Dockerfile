FROM python:3.10-slim

RUN mkdir /app
COPY requirements.txt /app/

RUN pip install -r /app/requirements.txt

COPY merge.py /app

CMD ["/app/merge.py"]