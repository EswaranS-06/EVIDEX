# EVIDEX

follow these steps to setup the Backend Python(Django).

1. [`UV setup`](#1-steps-to-setup-via-uv-recommended-for-dev)
2. [`PIP setup`](#2-steps-to-setup-via-pip-venv-packages-recommended-for-normal-view)

## 1. Steps to Setup via UV (Recommended for Dev)

### step 1.1

run this to check do you have `uv` for that type or copy this.

````cmd
uv --version
````

if you see `ERROR` instead of `X.XX.xx` version number click here, [`Normal setup`](#2-steps-to-setup-via-pip-venv-packages-recommended-for-normal-view)

### step 1.2

go to the project `backend/` directory then execute.

```` cmd
uv init
````

### step 1.3

then change your python version to 3.12.

````cmd
uv python install 3.12
uv python pin 3.12
````

then run `python --version` to confirm the Python version as 3.12.xx.

### step 1.4

then install the packages required.

````cmd
uv sync
````

so if you want to add, remove packages in uv do these.

````cmd
uv add <package-name> # to add a package
uv remove <package-name>  # to remove a package
````

after doing these run `uv sync` to lock the packages.

### step 1.5

once doing all these to start the Backend run this.

````cmd
uv run python manage.py runserver
````

then go to the WebBrowser and check the ``http://localhost:8000``

### optional 1.6

to activate the `.venv` run this from the `backend/` directory.

````cmd
source .venv/bin/activate  # Linux

.\.venv\Scripts\activate   # Windows
````

### UV cmd 1.7

to create an app in `uv django` run this.

```cmd
uv run python manage.py startapp core
```

### update the `requirements.txt`

Once add or removing of any packages do `uv sync` then run.

````cmd
uv export --format requirements-txt > requirements.txt
````

---------------

## 2. Steps to Setup via PIP, Venv packages (Recommended for Normal view)

## step 2.1

go to the backend directory in the **EVIDEX**

``` cmd
python -m venv .venv
```

then activate the `.venv` run this from the `backend/` directory.

````cmd
source .venv/bin/activate  # Linux

.\.venv\Scripts\activate   # Windows
````

## step 2.2

make sure you are having the python v3.12 if not install it.

to install the packages required exec this.(**Make sure venv is active**)

````cmd
python3 -m pip install -r requirements.txt # Linux

python -m pip install -r requirements.txt  # Windows
````

## step 2.3

then now startup the backend server.

go to the `backend/` directory.

````cmd
python manage.py runserver
````

### lists the packages installed (PIP or UV)

go the `.venv` directory and activate the `.venv` (*optional for uv*)

````cmd
uv pip list # UV

pip list    # PIP
````
