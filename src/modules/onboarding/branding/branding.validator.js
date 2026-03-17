const { z } = require('zod');

const urlField = z
  .string()
  .transform((v) => (v === '' ? null : v))
  .pipe(z.string().url().nullable())
  .optional()
  .nullable();

const upsertBrandingSchema = {
  body: z.object({
    logoUrl:           urlField,
    faviconUrl:        urlField,
    primaryColor:      z.string().optional().nullable(),
    secondaryColor:    z.string().optional().nullable(),
    accentColor:       z.string().optional().nullable(),
    fontFamily:        z.string().optional().nullable(),
    emailTemplates:    z.record(z.any()).optional().default({}),
    smsTemplates:      z.record(z.any()).optional().default({}),
    whatsappTemplates: z.record(z.any()).optional().default({}),
    widgetTheme:       z.record(z.any()).optional().default({}),
    customCSSUrl:      urlField,
    isWhiteLabel:      z.boolean().optional().default(false),
    customDomain:      z.string().optional().nullable(),
  }),
};

module.exports = { upsertBrandingSchema };
