@echo off
title Push Pembaruan SWC-SIDP ke GitHub
echo ========================================================
echo       PROSES PUSH PERUBAHAN KE GITHUB REPOSITORY
echo ========================================================
echo.

git status
echo.
set /p commit_msg="Masukkan pesan commit (tekan Enter untuk pesan default): "
if "%commit_msg%"=="" (
    set commit_msg=Pembaruan hierarki SPK dan koreksi panjang parent-child form 3B-PROD
)

echo.
echo [1/3] Menambahkan file yang berubah (git add .)...
git add .

echo.
echo [2/3] Melakukan commit (%commit_msg%)...
git commit -m "%commit_msg%"

echo.
echo [3/3] Melakukan push ke GitHub...
git push

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo       BERHASIL PUSH KE GITHUB DENGAN SUKSES!
    echo ========================================================
) else (
    echo ========================================================
    echo       TERDAPAT KENDALA SAAT PUSH KE GITHUB!
    echo       Silakan periksa koneksi atau jalankan git pull.
    echo ========================================================
)
echo.
pause
