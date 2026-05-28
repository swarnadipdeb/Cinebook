return {
  name = "custom-auth",
  fields = {
    { config = {
        type = "record",
        fields = {
          { auth_service_url = { type = "string", required = true, default = "http://authservice.public:9898/auth/ping" } },
        },
      },
    },
  },
}