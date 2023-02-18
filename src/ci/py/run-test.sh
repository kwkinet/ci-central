#!/bin/bash
pytest --cov=. --cov=tests --cov-branch --html=test-report.html --json=test-report.json
coverage html
coverage json --pretty-print
python ci/createBadges.py