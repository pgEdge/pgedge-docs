# pgEdge Documentation Makefile
# Simplifies common documentation workflow tasks

.PHONY: help install serve build clean venv deps check

# Default target
help:
	@echo "pgEdge Documentation Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install    - Create venv and install all dependencies"
	@echo "  make venv       - Create Python virtual environment only"
	@echo "  make deps       - Install dependencies (requires active venv)"
	@echo ""
	@echo "Development:"
	@echo "  make serve      - Start local dev server at http://127.0.0.1:8000"
	@echo "  make build      - Build static site to site/ directory"
	@echo "  make build-v    - Build with verbose output"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean      - Remove build artifacts (site/ directory)"
	@echo "  make clean-all  - Remove build artifacts and virtual environment"
	@echo "  make check      - Verify MkDocs configuration"
	@echo ""
	@echo "Note: Run 'source pgedge-docs-venv/bin/activate' before using"
	@echo "      serve/build commands, or use 'make install' first."

# Virtual environment name
VENV := pgedge-docs-venv
PYTHON := python3

# Create virtual environment
venv:
	@echo "Creating virtual environment..."
	$(PYTHON) -m venv $(VENV)
	@echo ""
	@echo "Virtual environment created. Activate with:"
	@echo "  source $(VENV)/bin/activate"

# Install dependencies (assumes venv is active)
deps:
	@echo "Installing dependencies..."
	pip install -r requirements.txt

# Full install: create venv and install deps
install: venv
	@echo "Installing dependencies in virtual environment..."
	$(VENV)/bin/pip install --upgrade pip
	$(VENV)/bin/pip install -r requirements.txt
	@echo ""
	@echo "Installation complete! To get started:"
	@echo "  source $(VENV)/bin/activate"
	@echo "  make serve"

# Start local development server
serve:
	mkdocs serve

# Build static site
build:
	mkdocs build

# Build with verbose output
build-v:
	mkdocs build -v

# Verify MkDocs configuration
check:
	mkdocs build --strict --dry-run

# Clean build artifacts
clean:
	@echo "Removing site/ directory..."
	rm -rf site/
	@echo "Clean complete."

# Clean everything including venv
clean-all: clean
	@echo "Removing virtual environment..."
	rm -rf $(VENV)/
	@echo "Full clean complete."
