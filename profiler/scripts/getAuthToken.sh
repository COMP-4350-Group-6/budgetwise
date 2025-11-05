# Usage: ./scripts/getAuthToken.sh <email> <password>
#

SUPABASE_URL="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL}}"
SUPABASE_PUBLISHABLE_KEY="${SUPABASE_ANON_KEY:-${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}}"

EMAIL="$1"
PASSWORD="$2"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "Error: Missing Supabase credentials"
  echo ""
  echo "Set these environment variables:"
  echo "  SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)"
  echo "  SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
  echo ""
  echo "Or export them:"
  echo "  export SUPABASE_URL='https://your-project.supabase.co'"
  echo "  export SUPABASE_ANON_KEY='your-anon-key'"
  exit 1
fi

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
