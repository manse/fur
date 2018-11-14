#!/bin/sh

cd public &&
git init &&
git checkout -b gh-pages &&
git add -A &&
git commit -m "deploy" &&
git push git@github.com:/manse/fur gh-pages -f
