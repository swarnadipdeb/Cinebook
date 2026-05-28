local kong = kong
local http = require "resty.http"
local cjson = require "cjson"

local CustomAuthHandler = {
  PRIORITY = 1000,
  VERSION = "1.0",
}

local CACHE_TTL = 1800

local function base64url_decode(str)
  str = str:gsub("-", "+"):gsub("_", "/")
  while #str % 4 ~= 0 do
    str = str .. "="
  end
  return ngx.decode_base64(str)
end

local function parse_jwt_payload(token)
  local parts = {}
  for part in token:gmatch("[^.]+") do
    table.insert(parts, part)
  end

  if #parts < 2 then
    return false, "invalid jwt string"
  end

  local payload_json = base64url_decode(parts[2])
  if not payload_json then
    return false, "invalid jwt string"
  end

  local payload = cjson.decode(payload_json)

  if payload.exp and payload.exp < os.time() then
    return false, "expired"
  end

  return true, payload
end

function CustomAuthHandler:access(config)
  local auth_header = kong.request.get_header("Authorization")
  if not auth_header then
    kong.log.err("Missing Authorization header")
    return kong.response.exit(401, { message = "Unauthorized" })
  end

  -- Extract Bearer token
  local token = auth_header:match("Bearer%s+(.+)")
  if not token then
    kong.log.err("Malformed Authorization header")
    return kong.response.exit(401, { message = "Unauthorized" })
  end

  -- Parse JWT payload and check expiry
  local ok, result = parse_jwt_payload(token)
  if not ok then
    kong.log.err("JWT validation failed: ", result)
    return kong.response.exit(401, { message = "Unauthorized" })
  end
  local payload = result

  local username = payload.sub
  if not username or type(username) ~= "string" or username == "" then
    kong.log.err("JWT missing or invalid 'sub' (username) claim")
    return kong.response.exit(401, { message = "Unauthorized" })
  end

  -- Check Kong cache for user info (userId + roles)
  local cached_user_info = kong.cache:get(username, nil, function()
    -- Cache miss: call auth service to resolve username -> userId + roles
    local auth_service_url = config.auth_service_url
    local httpc = http.new()
    httpc:set_timeouts(10000, 10000, 10000)

    local res, err = httpc:request_uri(auth_service_url, {
      method = "GET",
      headers = {
        ["Authorization"] = auth_header,
        ["X-Username"] = username,
      }
    })

    if not res then
      kong.log.err("Failed to call auth service: ", err)
      return nil, "Failed to call auth service"
    end

    if res.status ~= 200 then
      kong.log.err("Auth service returned status: ", res.status)
      return nil, "Auth service error"
    end

    local body = cjson.decode(res.body or "{}")
    local user_id = body.userId
    local roles = body.roles

    if not user_id or not roles or type(roles) ~= "table" or #roles == 0 then
      kong.log.err("Auth service response missing userId or roles")
      return nil, "Invalid auth service response"
    end

    -- Extract role names into a comma-separated string
    local role_names = {}
    for _, role in ipairs(roles) do
      if role.name then
        table.insert(role_names, role.name)
      end
    end

    if #role_names == 0 then
      kong.log.err("No valid role names in auth service response")
      return nil, "Invalid auth service response"
    end

    return { user_id = user_id, roles = table.concat(role_names, ",") }
  end, CACHE_TTL)

  if not cached_user_info or not cached_user_info.user_id then
    kong.log.err("Failed to resolve user info for username: ", username)
    return kong.response.exit(500, { message = "Internal Server Error" })
  end

  kong.service.request.set_header("X-User-ID", cached_user_info.user_id)
  kong.service.request.set_header("X-User-Name", username)
  kong.service.request.set_header("X-User-Roles", cached_user_info.roles)
end

return CustomAuthHandler

