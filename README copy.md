# EVIDEX

## BACKEND

👉 **Backend documentation is here:**  
➡️ [Go to backend/README.md](backend/README.md)

### Required Techs

- Docker Desktop
- Python 3.12
- UV ➡️ [Offical Link](https://docs.astral.sh/uv/getting-started/installation/)

### Setup the Backend

#### install the UV [**Installation Steps**](#quick-uv-installation-methode)

#### install the Docker

#### Step 1: Clone the repo or dowmload the repo as zip

 > `https://github.com/EswaranS-06/EVIDEX.git`

#### step 2: Start the Docker Compose for DataBase `docker-compose up -d`

> 1. Check the `.env` file and give required creds and info's
> 2. Run the command `docker-compose up -d` to start the DB
> 3. That shows error check both `.env` and `docker-compose.yml` in same directory if not edit the path in `Line 9` in docker file
> 4. Then run this `docker-compose -f <docker-compose_path> up -d`

#### Step 3: Setup the Python Environment

1. Go to `cd backend/` folder
2. Run `uv sync` this will automatically install and setup the python Environment for Backend

> this to download the package and set-up the python and packages

#### step 4: Start the backend

```powershell
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py seed_roles
uv run python manage.py seed_owasp_category
uv run python manage.py seed_owasp_sub
uv run python manage.py seed_owasp_variants
uv run python manage.py seed_testcases
uv run python manage.py runserver
```

#### Step 5: Then Visit the `http://localhost:8000`

---

## Docker

`docker-compose up -d`

---

## Quick UV Installation Methode

Installing the **UV** is recomenned way

### Linux 🐧

Use curl to download the script and execute it with sh:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

If your system doesn't have curl, you can use wget:

```bash
wget -qO- https://astral.sh/uv/install.sh | sh
```

Request a specific version by including it in the URL:

```bash
curl -LsSf https://astral.sh/uv/0.9.20/install.sh | sh
```

---

### Windows 🖥️

Use irm to download the script and execute it with iex:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Changing the execution policy allows running a script from the internet.

Request a specific version by including it in the URL:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/0.9.20/install.ps1 | iex"
```

then run this command

```powershell
uv --version
# output: uv 0.9.18 or uv 0.XX.XX the version you have installed
```

this suppose it show the version [Contiune Setup](#setup-the-backend)
