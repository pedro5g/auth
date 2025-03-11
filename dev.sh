#!/bin/bash

(cd ./backend && npm run dev) & \
sleep 5
(cd ./frontend && npm run dev) 
