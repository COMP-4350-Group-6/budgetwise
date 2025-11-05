# Usage: ./scripts/getAuthToken.sh <email> <password>
#

# Get script directory and determine project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Try to load from apps/frontend/.env.local first (local development)
ENV_LOCAL="$PROJECT_ROOT/apps/frontend/.env.local"
if [ -f "$ENV_LOCAL" ]; then
  echo "Loading local Supabase config from apps/frontend/.env.local"
  export $(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' "$ENV_LOCAL" | xargs)
  export $(grep -E '^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=' "$ENV_LOCAL" | xargs)
fi

# Use environment variables with fallbacks
SUPABASE_URL="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL}}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}}"

EMAIL="$1"
PASSWORD="$2"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "Error: Missing Supabase credentials"
  echo ""
  echo "Make sure apps/frontend/.env.local exists with:"
  echo "  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321"
  echo "  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>"
  echo ""
  echo "Or export them manually:"
  echo "  export SUPABASE_URL='http://127.0.0.1:54321'"
  echo "  export SUPABASE_ANON_KEY='your-anon-key'"
  exit 1
fi

echo "Using Supabase URL: $SUPABASE_URL"
echo ""

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "Usage: $0 <email> <password>"
  echo ""
  echo "Example:"
  echo "  $0 user@example.com MyPassword123!"
  echo ""
  echo "Or set environment variables:"
  echo "  SUPABASE_URL='https://your-project.supabase.co' $0 <email> <password>"
  exit 1
fi

# Call Supabase auth API
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Login failed"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | head -20
  echo ""
  echo "Check your email/password and Supabase credentials"
  exit 1
fi

echo "Login successful"
echo ""
echo "Auth Token:"
echo "$ACCESS_TOKEN"
echo ""
echo "Use this token with the profiler:"
echo "  bash scripts/profilerApi.sh \"$ACCESS_TOKEN\""
echo ""
