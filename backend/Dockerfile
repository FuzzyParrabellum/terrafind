FROM python:3.12-slim-trixie
# cf https://docs.astral.sh/uv/guides/integration/docker/#available-images

# set environment variables
# Prevents Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
#  Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1
# directly installs dependancies inside the container's python system (no venv folder) 
# recommended by uv docs for docker, cf https://docs.astral.sh/uv/guides/integration/docker/#available-images
ENV UV_SYSTEM_PYTHON=1

# The WORKDIR instruction sets the working directory for any RUN, CMD, ENTRYPOINT, COPY and ADD instructions
# that follow it in the Dockerfile. If the WORKDIR doesn't exist, it will be created even if it's not 
# used in any subsequent Dockerfile instruction.
# The WORKDIR instruction can be used multiple times in a Dockerfile. If a relative path is provided, it
# will be relative to the path of the previous WORKDIR instruction.
WORKDIR /app

RUN apt-get update && apt-get install -y curl postgresql-client

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml .

RUN uv sync 

COPY . .

EXPOSE 8000

# if don't add 0.0.0.0, django will only be accessible from within the container and not from the host machine, cf https://docs.djangoproject.com/en/4.2/ref/django-admin/#runserver
CMD ["uv", "run","manage.py", "runserver", "0.0.0.0:8000"]