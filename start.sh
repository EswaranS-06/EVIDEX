#!/bin/bash

echo "========================================"
echo "Starting EVIDEX Application"
echo "========================================"

SILENT=0
if [ "$1" = "-s" ]; then
    SILENT=1
fi

# Function to check if a command exists
command_exists () {
    type "$1" &> /dev/null ;
}

# Determine which terminal emulator to use
if [ $SILENT -eq 1 ]; then
    TERM_CMD=""
elif command_exists gnome-terminal; then
    TERM_CMD="gnome-terminal --"
elif command_exists xterm; then
    TERM_CMD="xterm -e"
elif command_exists konsole; then
    TERM_CMD="konsole -e"
elif command_exists xfce4-terminal; then
    TERM_CMD="xfce4-terminal -x"
else
    # Fallback to background processes if no known terminal
    echo "No supported terminal found. Starting in background..."
    TERM_CMD=""
fi

# Get the script's directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "[1/2] Starting Django Backend..."
cd "$DIR/backend" || exit 1
if [ -z "$TERM_CMD" ]; then
    if [ $SILENT -eq 1 ]; then
        uv run python manage.py runserver > /dev/null 2>&1 &
    else
        uv run python manage.py runserver &
    fi
    BACKEND_PID=$!
else
    $TERM_CMD bash -c "echo 'EVIDEX Backend'; uv run python manage.py runserver; exec bash" &
fi

echo ""
echo "[2/2] Starting React Frontend..."
cd "$DIR/frontend" || exit 1
if [ -z "$TERM_CMD" ]; then
    if [ $SILENT -eq 1 ]; then
        npm run dev > /dev/null 2>&1 &
    else
        npm run dev &
    fi
    FRONTEND_PID=$!
else
    $TERM_CMD bash -c "echo 'EVIDEX Frontend'; npm run dev; exec bash" &
fi

echo ""
echo "========================================"
echo "Servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173 (default)"
echo "========================================"

echo ""
echo "Waiting 5 seconds for front-end server to initialize before opening browser..."
sleep 5
if command_exists xdg-open; then
    xdg-open http://localhost:5173 &> /dev/null
elif command_exists open; then
    open http://localhost:5173 &> /dev/null
else
    echo "Could not detect web browser command. Please open http://localhost:5173 manually."
fi

echo ""
if [ -z "$TERM_CMD" ]; then
    echo "Press Ctrl+C to stop both servers."
    trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
    wait
else
    echo "You can close this window now."
fi
