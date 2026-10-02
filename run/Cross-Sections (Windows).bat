@echo off
rem Cross-Sections on Windows: double-click to open.
where python >nul 2>nul
if %errorlevel%==0 (
  python "%~dp0cross-sections.py"
) else (
  echo Python was not found. Opening the portable dist\cross-sections.html directly.
  start "" "%~dp0..\dist\cross-sections.html"
)
