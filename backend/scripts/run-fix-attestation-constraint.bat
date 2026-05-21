@echo off
REM Script to run the attestation constraint fix
REM Usage: run-fix-attestation-constraint.bat

set PGPASSWORD=2007
set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe

REM Try PostgreSQL 15
if exist "%PSQL_PATH%" (
    echo Running with PostgreSQL 15...
    "%PSQL_PATH%" -h localhost -p 5432 -U postgres -d Imtech_SaaS -f fix-attestation-type-constraint.sql
    goto :end
)

REM Try PostgreSQL 16
set PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe
if exist "%PSQL_PATH%" (
    echo Running with PostgreSQL 16...
    "%PSQL_PATH%" -h localhost -p 5432 -U postgres -d Imtech_SaaS -f fix-attestation-type-constraint.sql
    goto :end
)

REM Try PostgreSQL 14
set PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe
if exist "%PSQL_PATH%" (
    echo Running with PostgreSQL 14...
    "%PSQL_PATH%" -h localhost -p 5432 -U postgres -d Imtech_SaaS -f fix-attestation-type-constraint.sql
    goto :end
)

REM Try PostgreSQL 13
set PSQL_PATH=C:\Program Files\PostgreSQL\13\bin\psql.exe
if exist "%PSQL_PATH%" (
    echo Running with PostgreSQL 13...
    "%PSQL_PATH%" -h localhost -p 5432 -U postgres -d Imtech_SaaS -f fix-attestation-type-constraint.sql
    goto :end
)

echo ERROR: PostgreSQL psql.exe not found!
echo Please install PostgreSQL or add it to your PATH
pause
exit /b 1

:end
echo.
echo Script execution completed!
pause

@REM Made with Bob
