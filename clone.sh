#!/bin/bash 
(cd ./frontend && npm i) & \
(cd ./backend && npm i && docker compose up -d)