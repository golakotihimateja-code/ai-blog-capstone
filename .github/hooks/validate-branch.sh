#!/bin/bash

CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "ERROR: Direct work on main is not allowed."
    exit 1
fi

echo "Branch validation successful."