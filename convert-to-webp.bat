@echo off
setlocal enabledelayedexpansion

:: Path to your cwebp.exe
set CWEBP="C:\web-tools\libwebp-1.5.0-windows-x64\bin\cwebp.exe"

:: Input root (your public folder)
set INPUT=C:\Users\reece\OneDrive\Documents\NunezDev\meridian-travel\public

:: Output root (for S3 upload)
set OUTPUT=C:\Users\reece\OneDrive\Documents\NunezDev\meridian-travel\webp-output

echo.
echo Converting all images from:
echo %INPUT%
echo Saving to:
echo %OUTPUT%
echo.
echo Skipping logo files...
echo.

:: Convert JPG files
for /R "%INPUT%" %%F in (*.jpg) do (
    set "SOURCE=%%F"
    set "FILENAME=%%~nxF"

    :: Skip logo files
    echo !FILENAME! | findstr /i "logo" >nul
    if errorlevel 1 (
        set "REL=%%F"
        set "REL=!REL:%INPUT%=!"
        set "DEST=%OUTPUT%!REL:.jpg=.webp!"

        for %%D in ("!DEST!") do (
            if not exist "%%~dpD" mkdir "%%~dpD"
        )

        echo Converting: %%~nxF
        %CWEBP% -q 90 -resize 1600 0 "%%F" -o "!DEST!"
    ) else (
        echo Skipping logo: %%~nxF
    )
)

:: Convert JPEG files
for /R "%INPUT%" %%F in (*.jpeg) do (
    set "SOURCE=%%F"
    set "FILENAME=%%~nxF"

    :: Skip logo files
    echo !FILENAME! | findstr /i "logo" >nul
    if errorlevel 1 (
        set "REL=%%F"
        set "REL=!REL:%INPUT%=!"
        set "DEST=%OUTPUT%!REL:.jpeg=.webp!"

        for %%D in ("!DEST!") do (
            if not exist "%%~dpD" mkdir "%%~dpD"
        )

        echo Converting: %%~nxF
        %CWEBP% -q 90 -resize 1600 0 "%%F" -o "!DEST!"
    ) else (
        echo Skipping logo: %%~nxF
    )
)

:: Convert PNG files (except logos)
for /R "%INPUT%" %%F in (*.png) do (
    set "SOURCE=%%F"
    set "FILENAME=%%~nxF"

    :: Skip logo files
    echo !FILENAME! | findstr /i "logo" >nul
    if errorlevel 1 (
        set "REL=%%F"
        set "REL=!REL:%INPUT%=!"
        set "DEST=%OUTPUT%!REL:.png=.webp!"

        for %%D in ("!DEST!") do (
            if not exist "%%~dpD" mkdir "%%~dpD"
        )

        echo Converting: %%~nxF
        %CWEBP% -q 90 -resize 1600 0 "%%F" -o "!DEST!"
    ) else (
        echo Skipping logo: %%~nxF
    )
)

echo.
echo DONE! All converted images are saved to:
echo %OUTPUT%
echo.
echo You can now upload these to your S3 bucket.
pause
