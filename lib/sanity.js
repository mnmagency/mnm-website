import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'q7p7mofd',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})