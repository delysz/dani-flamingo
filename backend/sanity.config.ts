import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Dani Flamingo Photography',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'gc9j4tcv',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  basePath: '/studio',
  plugins: [
    deskTool(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})