# Project

This repository contains a small "ProNote" inspired gradebook utility. It
provides a Python package with a `ProNote` class to manage students, subjects and
weighted grades as well as a command line interface to interact with the data
stored in a JSON file.

## Installation

The project does not require any external dependency beyond the Python standard
library. Simply clone the repository and run the commands using your preferred
Python interpreter (Python 3.10 or newer is recommended).

## Usage

The CLI lives under the `pronote` package. To see the available commands run:

```bash
python -m pronote.cli --help
```

A typical session could look like this:

```bash
python -m pronote.cli add-student "Alice"
python -m pronote.cli add-subject "Mathematics"
python -m pronote.cli add-grade Alice Mathematics 15 --weight 2 --comment "Exam 1"
python -m pronote.cli report Alice
```

The commands operate on a JSON file named `pronote.json` in the current working
folder by default. You can change the target file with the `--data` option.

Refer to the `ProNote` class in `pronote/core.py` if you prefer using the API
directly from another Python program.
