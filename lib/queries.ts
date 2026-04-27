export const STRATEGY_FORM_SETTINGS_QUERY = `
*[_type == "strategyFormSettings"][0]{
  title,
  subtitle,
  successMessage,
  recipientEmail,
  services,
  budgetOptions
}
`