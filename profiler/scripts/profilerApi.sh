API_URL="${API_URL:-http://localhost:8787}"
AUTH_TOKEN="$1"

if [ -z "$AUTH_TOKEN" ]; then
  echo "Usage: $0 <auth-token>"
  echo ""
  echo "To get auth token, choose one method:"
  echo ""
  echo "METHOD 1: Browser DevTools (Easiest)"
  echo "  1. Login to Budgetwise in your browser"
  echo "  2. Open DevTools (F12)"
  echo "  3. Application tab -> Local Storage -> your site URL"
  echo "  4. Find key: sb-<project-id>-auth-token"
  echo "  5. Copy the entire token value"
  echo ""
  echo "METHOD 2: Browser Console"
  echo "  Run: node scripts/get-auth-token.js"
  echo "  Follow the instructions shown"
  echo ""
  echo "METHOD 3: Login Script (requires @supabase/supabase-js)"
  echo "  node scripts/get-auth-token.js <email> <password>"
  echo ""
  exit 1
fi

# Get script directory and determine profiler directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get profiler directory (one level up from scripts/)
PROFILER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

RESULTS_FILE="$PROFILER_DIR/profiler-results/output-$(date +%Y%m%d-%H%M%S).txt"
mkdir -p "$PROFILER_DIR/profiler-results"

echo "API Profiler - Using curl" >> "$RESULTS_FILE"
echo "API URL: $API_URL" >> "$RESULTS_FILE"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

measure_endpoint() {
  local method=$1
  local path=$2
  local data=$3
  local requires_auth=${4:-true}
  
  local temp_output=$(mktemp)
  
  # Build curl command with proper header handling
  local curl_args=()
  curl_args+=(-s)
  curl_args+=(-w "\n%{time_total}\n%{http_code}")
  curl_args+=(-X "$method")
  
  # Add auth header if required
  if [ "$requires_auth" = "true" ]; then
    curl_args+=(-H "Authorization: Bearer $AUTH_TOKEN")
  fi
  
  # Add data if provided
  if [ -n "$data" ]; then
    curl_args+=(-H "Content-Type: application/json")
    curl_args+=(-d "$data")
  fi
  
  # Add URL
  curl_args+=("$API_URL$path")
  
  # Execute curl
  curl "${curl_args[@]}" > "$temp_output" 2>&1
  
  # Extract time and status code
  local total_lines=$(wc -l < "$temp_output" | tr -d ' ')
  local time_total="0"
  local http_code="000"
  
  if [ "$total_lines" -ge 2 ]; then
    time_total=$(tail -n 2 "$temp_output" | head -n 1)
    http_code=$(tail -n 1 "$temp_output")
  fi
  
  # Validate we got numeric values
  if ! echo "$time_total" | grep -qE '^[0-9]+\.?[0-9]*$'; then
    time_total="0"
  fi
  if ! echo "$http_code" | grep -qE '^[0-9]+$'; then
    http_code="000"
  fi
  
  # Convert time to milliseconds
  local time_ms=$(awk "BEGIN {printf \"%.0f\", $time_total * 1000}")
  
  local status_icon="✓"
  if [ "$http_code" -ge 400 ]; then
    status_icon="✗"
  elif [ "$http_code" -ge 300 ]; then
    status_icon="⚠"
  fi
  
  echo "$status_icon $method $path - ${time_ms}ms - Status: $http_code"
  echo "$method|$path|$time_ms|$http_code" >> "$RESULTS_FILE"
  
  rm -f "$temp_output"
  
  # Small delay
  sleep 0.1
}

echo "Starting API profiling..."
echo ""

# Health endpoints
echo "Health & Info Endpoints:"
measure_endpoint "GET" "/health" "" false
measure_endpoint "GET" "/auth" "" false
echo ""

# Auth endpoints (no auth)
echo "Auth Endpoints (No Auth Required):"
measure_endpoint "POST" "/auth/signup" "{\"email\":\"test$(date +%s)@example.com\",\"password\":\"TestPassword123!\",\"name\":\"Test User\",\"defaultCurrency\":\"CAD\"}" false
measure_endpoint "POST" "/auth/login" '{"email":"test@example.com","password":"TestPassword123!"}' false
measure_endpoint "POST" "/auth/forgot-password" '{"email":"test@example.com"}' false
measure_endpoint "POST" "/auth/reset-password" '{"token":"test-token","password":"NewPassword123!"}' false
echo ""

# Auth endpoints (require auth)
echo "Auth Endpoints (Requires Auth):"
measure_endpoint "GET" "/auth/me" "" true
measure_endpoint "POST" "/auth/logout" "" true
measure_endpoint "POST" "/auth/refresh" '{"refreshToken":"test-token"}' false
echo ""

# Categories
echo "Category Endpoints:"
measure_endpoint "GET" "/categories" "" true
measure_endpoint "GET" "/categories?active=true" "" true
measure_endpoint "POST" "/categories/seed" "" true
measure_endpoint "POST" "/categories" '{"name":"Test Category","description":"Test","icon":"💰"}' true
measure_endpoint "PUT" "/categories/01TEST12345678901234567890" '{"name":"Updated"}' true
measure_endpoint "DELETE" "/categories/01TEST12345678901234567890" "" true
echo ""

# Budgets
echo "Budget Endpoints:"
measure_endpoint "GET" "/budgets" "" true
measure_endpoint "GET" "/budgets?active=true" "" true
measure_endpoint "GET" "/budgets/dashboard" "" true
measure_endpoint "GET" "/budgets/01TEST12345678901234567890/status" "" true
measure_endpoint "POST" "/budgets" "{\"categoryId\":\"01TEST12345678901234567890\",\"name\":\"Test Budget\",\"amountCents\":100000,\"currency\":\"CAD\",\"period\":\"MONTHLY\",\"startDate\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"alertThreshold\":80}" true
measure_endpoint "PUT" "/budgets/01TEST12345678901234567890" '{"name":"Updated Budget"}' true
measure_endpoint "DELETE" "/budgets/01TEST12345678901234567890" "" true
echo ""

# Transactions
echo "Transaction Endpoints:"
measure_endpoint "GET" "/transactions" "" true
measure_endpoint "GET" "/transactions?days=30&limit=50" "" true
measure_endpoint "POST" "/transactions" "{\"amountCents\":-5000,\"note\":\"Test transaction\",\"occurredAt\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" true
measure_endpoint "POST" "/transactions/bulk-import" "{\"transactions\":[{\"amountCents\":-1000,\"note\":\"Test import\",\"occurredAt\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}]}" true
measure_endpoint "PATCH" "/transactions/01TEST12345678901234567890" '{"note":"Updated note"}' true
measure_endpoint "POST" "/transactions/01TEST12345678901234567890/categorize" "" true
measure_endpoint "DELETE" "/transactions/01TEST12345678901234567890" "" true
measure_endpoint "POST" "/transactions/parse-invoice" '{"imageBase64":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}' true
echo ""


echo ""
echo "Profiling Results Summary"
echo ""

# Parse results and sort by time
# Filter out header lines and only process endpoint lines (format: METHOD|PATH|TIME|STATUS)
grep -E "^[A-Z]+\|" "$RESULTS_FILE" | sort -t'|' -k3 -rn > "$RESULTS_FILE.tmp"

echo "Slowest Endpoints:"
echo "────────────────────────────────────────────────────────────────────────────────────────────────────"
awk -F'|' 'NR<=10 {printf "%2d. %-6s %-50s %6sms  Status: %s\n", NR, $1, $2, $3, $4}' "$RESULTS_FILE.tmp"

echo ""
echo "Statistics:"
echo "────────────────────────────────────────────────────────────────────────────────────────────────────"
if [ ! -s "$RESULTS_FILE.tmp" ]; then
  echo "No valid endpoint data found in results"
else
  total=$(awk -F'|' '{sum+=$3; count++} END {print sum, count}' "$RESULTS_FILE.tmp")
  total_time=$(echo "$total" | cut -d' ' -f1)
  count=$(echo "$total" | cut -d' ' -f2)
  
  if [ "$count" -gt 0 ]; then
    avg_time=$(awk "BEGIN {printf \"%.2f\", $total_time / $count}")
    slowest=$(head -n 1 "$RESULTS_FILE.tmp" | cut -d'|' -f1,2,3)
    fastest=$(tail -n 1 "$RESULTS_FILE.tmp" | cut -d'|' -f1,2,3)
    
    echo "Total Endpoints Tested: $count"
    echo "Total Time: ${total_time}ms"
    echo "Average Response Time: ${avg_time}ms"
    echo "Slowest: $(echo "$slowest" | cut -d'|' -f1) $(echo "$slowest" | cut -d'|' -f2) - $(echo "$slowest" | cut -d'|' -f3)ms"
    echo "Fastest: $(echo "$fastest" | cut -d'|' -f1) $(echo "$fastest" | cut -d'|' -f2) - $(echo "$fastest" | cut -d'|' -f3)ms"
  else
    echo "No valid endpoint data found"
  fi
fi

echo ""
echo "Results saved to: $RESULTS_FILE"
echo ""

# Cleanup
rm -f "$RESULTS_FILE.tmp"
