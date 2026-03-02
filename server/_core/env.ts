export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  
  // Alibaba Cloud / AWS S3 Compatible Storage
  ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID ?? "",
  ossAccessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? "",
  ossRegion: process.env.OSS_REGION ?? "",
  ossBucket: process.env.OSS_BUCKET ?? "",
  ossEndpoint: process.env.OSS_ENDPOINT ?? "",

  // Alibaba Cloud DirectMail / SMTP
  emailSmtpHost: process.env.EMAIL_SMTP_HOST ?? "",
  emailSmtpPort: parseInt(process.env.EMAIL_SMTP_PORT ?? "465", 10),
  emailSmtpUser: process.env.EMAIL_SMTP_USER ?? "",
  emailSmtpPass: process.env.EMAIL_SMTP_PASS ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "no-reply@geahr.com",
  emailAdmin: process.env.EMAIL_ADMIN ?? "admin@geahr.com",

  // Alibaba Cloud DashScope (Qwen)
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY ?? "",
  
  // Legacy / Manus (To be removed)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  appId: process.env.VITE_APP_ID ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
};
