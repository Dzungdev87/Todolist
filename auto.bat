@echo off
title Khoi chay Todo List Local
echo Dang khoi chay ung dung Todo List...

:: Di chuyen vao o dia va thu muc du an
d:
cd "d:\4. Study\4. Study Code\15todolist"

:: Tu dong mo trinh duyet sau 3 giay
timeout /t 3 /nobreak >nul
start http://localhost:3000

:: Chay dev server bang npm
npm run dev
