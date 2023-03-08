#!/bin/bash
pytest --cov=test_engine_app --cov-branch --html=test-report.html --json=test-report.json
coverage html
coverage json --pretty-print
python ci/createBadges.py